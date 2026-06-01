import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import Parser from 'rss-parser'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Bytez from 'bytez.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
  }
})

const fastify = Fastify({
  logger: true,
  bodyLimit: 52428800 // 50MB
})

const prisma = new PrismaClient()

// AI Initialization
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null
const bytez = process.env.BYTEZ_API_KEY ? new Bytez(process.env.BYTEZ_API_KEY) : null

// Register CORS.
// In production, set ALLOWED_ORIGINS to a comma-separated list of frontend
// origins (e.g. "https://unfilter-story-v1.vercel.app,https://admin.example.com").
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : null
if (!allowedOrigins && process.env.NODE_ENV === 'production') {
  // Never silently fall back to allow-all in production.
  throw new Error('ALLOWED_ORIGINS must be set in production')
}
fastify.register(cors, {
  // Dev (no env var): reflect any origin. Prod: strict allowlist.
  origin: allowedOrigins ?? true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

// === AUTH ===
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  // Fail fast: the auth layer is useless (and insecure) without a secret.
  throw new Error('JWT_SECRET environment variable is required')
}
const JWT_EXPIRES_IN = '12h'
const JWT_ALG = 'HS256'

// CMS routes that must remain reachable WITHOUT a token.
// These are read-only endpoints consumed by the public site, plus login itself.
const PUBLIC_CMS_ROUTES = [
  { method: 'POST', path: '/cms/v1/auth/login' },
  { method: 'GET', path: '/cms/v1/settings' },
  { method: 'GET', path: '/cms/v1/rss/fetch' }
]

// Lightweight in-memory brute-force throttle for the login route. Keyed by
// email+IP, resets after the window. Single-instance only (fine for this app).
const LOGIN_MAX_ATTEMPTS = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const loginAttempts = new Map()
function isLoginRateLimited(key) {
  const now = Date.now()
  const rec = loginAttempts.get(key)
  if (!rec || now - rec.first > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, first: now })
    return false
  }
  rec.count += 1
  return rec.count > LOGIN_MAX_ATTEMPTS
}

// Role guard factory for routes that require elevated privileges.
function requireRole(...roles) {
  return async (request, reply) => {
    if (!roles.includes(request.user?.role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' })
    }
  }
}

// Auth guard: require a valid Bearer JWT for every /cms/v1 route except the
// allowlist above. Public /v1 routes and CORS preflight pass through untouched.
fastify.addHook('preHandler', async (request, reply) => {
  if (request.method === 'OPTIONS') return

  // Normalise trailing slashes before matching the allowlist.
  const path = request.url.split('?')[0].replace(/\/+$/, '') || '/'
  if (!path.startsWith('/cms/v1')) return

  const isPublic = PUBLIC_CMS_ROUTES.some(
    (r) => r.method === request.method && r.path === path
  )
  if (isPublic) return

  const header = request.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return reply.code(401).send({ error: 'Authentication required' })
  }

  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALG] })
  } catch {
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }

  // Re-validate against the DB so deactivated accounts lose access immediately
  // and the role used for authorization is always current (not the stale token).
  const account = await prisma.cmsUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, isActive: true }
  })
  if (!account || !account.isActive) {
    return reply.code(401).send({ error: 'Account is inactive' })
  }
  request.user = account
})

// POST /cms/v1/auth/login — verify credentials, issue a JWT.
fastify.post('/cms/v1/auth/login', async (request, reply) => {
  try {
    const { email, password } = request.body || {}
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' })
    }

    const attemptKey = `${String(email).toLowerCase()}|${request.ip}`
    if (isLoginRateLimited(attemptKey)) {
      return reply.code(429).send({ error: 'Too many login attempts. Try again later.' })
    }

    const user = await prisma.cmsUser.findUnique({ where: { email } })
    // Always run a bcrypt comparison (even for unknown/inactive accounts) so the
    // response time does not reveal whether the email exists or is active.
    const DUMMY_HASH = '$2a$12$0000000000000000000000000000000000000000000000000000u'
    const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH)
    if (!user || !user.isActive || !ok) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    // Successful login — reset the throttle for this key.
    loginAttempts.delete(attemptKey)

    await prisma.cmsUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN, algorithm: JWT_ALG }
    )

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Login failed' })
  }
})

// GET /cms/v1/auth/me — return the current authenticated user (token validated
// by the preHandler hook above).
fastify.get('/cms/v1/auth/me', async (request, reply) => {
  try {
    // request.user (id, email, role, isActive) is set + validated by the
    // preHandler guard; fetch the fuller profile for the client.
    const user = await prisma.cmsUser.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    })
    if (!user || !user.isActive) {
      return reply.code(401).send({ error: 'Account is inactive' })
    }
    return user
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to load profile' })
  }
})

// === PUBLIC API ROUTES ===
fastify.get('/v1/articles', async (request, reply) => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 20
    })
    return articles
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch articles' })
  }
})

fastify.get('/v1/articles/:slug', async (request, reply) => {
  try {
    const { slug } = request.params
    const article = await prisma.article.findFirst({
      where: { slug: slug } // allow either draft or published to be fetched by slug if it exists
    })
    if (!article) return reply.code(404).send({ error: 'Article not found' })

    // Update view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    })

    return article
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch article' })
  }
})

// === CMS API ROUTES ===
fastify.post('/cms/v1/articles', async (request, reply) => {
  const { headline, body, categoryId, category, tags, status, publishedAt, featuredImageUrl } = request.body
  try {
    // Slugify the headline. Fallback to generic if empty.
    const slugBasis = headline || 'untitled'
    const slug = slugBasis.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // Resolve categoryId if a name was sent
    let finalCategoryId = categoryId
    if (!finalCategoryId && category) {
      const cat = await prisma.category.findFirst({
        where: { name: { equals: category } }
      })
      if (cat) finalCategoryId = cat.id
    }

    // Process Tags: find existing or create new ones
    let finalTagIds = []
    if (tags && Array.isArray(tags)) {
      for (const t of tags) {
        let tag = await prisma.tag.findFirst({
          where: {
            OR: [
              { id: t },
              { name: { equals: t } },
              { slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
            ]
          }
        })
        if (!tag && typeof t === 'string' && t.trim()) {
          const tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
          tag = await prisma.tag.create({ data: { name: t.trim(), slug: tagSlug } })
        }
        if (tag) finalTagIds.push(tag.id)
      }
    }

    const article = await prisma.article.create({
      data: {
        headline: headline || 'Untitled',
        slug,
        body: body || '',
        status: status || 'draft',
        categoryId: finalCategoryId || null,
        featuredImageUrl: featuredImageUrl || null,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : null),
        readingTimeMins: Math.ceil((body || '').split(' ').length / 200) || 1,
        articleTags: finalTagIds.length > 0 ? {
          create: finalTagIds.map(tagId => ({ tagId }))
        } : undefined
      }
    })
    return article
  } catch (error) {
    fastify.log.error(error)
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return reply.code(400).send({ error: `An article with the headline "${headline}" already exists. Please choose a unique headline.` })
    }
    reply.code(500).send({ error: 'Failed to create article: ' + error.message })
  }
})

// === AI AI STUDIO ROUTES ===
fastify.post('/cms/v1/ai/transform', async (request, reply) => {
  const { text, model, action } = request.body

  if (!text) return reply.code(400).send({ error: 'Text is required' })

  try {
    let result = ''

    // Default action to Rewrite if none provided
    const aiAction = action || 'Rewrite professionally'
    const systemPrompt = `You are a professional editorial assistant for Unfilter Story, a high-end startup news platform. 
    Your tone is technical, precise, and sophisticated. 
    Perform the following action on the provided text: "${aiAction}". 
    Return ONLY the transformed text. Do not include any intros, outros, or conversational filler.`

    if (model === 'gemini') {
      if (!bytez) throw new Error('Bytez API Key missing')
      // Falling back to Google Gemma via Bytez.com to bypass Google's strict strict rate limits on free-tier Gemini SDK
      const geminiFallback = bytez.model("google/gemma-2-27b-it")
      const prompt = `${systemPrompt}\n\nTEXT TO TRANSFORM:\n${text}`
      const resp = await geminiFallback.run([
        { role: "user", content: prompt }
      ])

      if (resp.error) throw new Error(resp.error)
      result = resp.output && resp.output.content ? resp.output.content : resp.output
    } else if (model === 'gpt') {
      if (!bytez) throw new Error('Bytez API Key missing')
      const gptModel = bytez.model("openai/gpt-4o-mini")
      const prompt = `${systemPrompt}\n\nTEXT TO TRANSFORM:\n${text}`
      const resp = await gptModel.run([
        { role: "user", content: prompt }
      ])

      if (resp.error) throw new Error(resp.error)

      // Fix: Bytez returns an object { role: 'assistant', content: '...' }
      result = resp.output && resp.output.content ? resp.output.content : resp.output
    } else {
      return reply.code(400).send({ error: 'Invalid model selected' })
    }

    // Ensure we return a string and trim it
    const finalResult = (typeof result === 'string' ? result : JSON.stringify(result)) || ''
    return reply.code(200).send({ result: finalResult.trim() })
  } catch (error) {
    fastify.log.error(error)

    let userMessage = error.message || 'AI Transformation failed'
    const modelName = model === 'gemini' ? 'Gemini/Gemma' : 'GPT-4o mini'

    return reply.code(500).send({
      error: userMessage
    })
  }
})

fastify.get('/cms/v1/articles', async (request, reply) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        articleTags: {
          include: {
            tag: true
          }
        }
      }
    })
    // Flatten category and tags for easier frontend use
    return articles.map(a => ({
      ...a,
      category: a.category?.name || null,
      tags: a.articleTags?.map(at => at.tag.name) || []
    }))
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch cms articles' })
  }
})

fastify.get('/cms/v1/articles/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        articleTags: true
      }
    })
    if (!article) return reply.code(404).send({ error: 'Article not found' })
    return article
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch article' })
  }
})

fastify.put('/cms/v1/articles/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const { headline, body, status, categoryId, category, tags, publishedAt, featuredImageUrl } = request.body

    // Slugify the headline
    const slug = headline ? headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined

    // Resolve category
    let finalCategoryId = categoryId
    if (!finalCategoryId && category) {
      const cat = await prisma.category.findFirst({ where: { name: category } })
      if (cat) finalCategoryId = cat.id
    }

    const updateData = {
      headline,
      body,
      status: status || undefined,
      categoryId: finalCategoryId !== undefined ? finalCategoryId : undefined,
      featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl : undefined,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      readingTimeMins: body ? (Math.ceil(body.split(' ').length / 200) || 1) : undefined
    }
    if (slug) updateData.slug = slug

    const article = await prisma.article.update({
      where: { id },
      data: updateData
    })

    if (tags !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } })
      if (tags && Array.isArray(tags) && tags.length > 0) {
        let finalTagIds = []
        for (const t of tags) {
          let tag = await prisma.tag.findFirst({
            where: {
              OR: [
                { id: t },
                { name: { equals: t } },
                { slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
              ]
            }
          })
          if (!tag && typeof t === 'string' && t.trim()) {
            const tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            tag = await prisma.tag.create({ data: { name: t.trim(), slug: tagSlug } })
          }
          if (tag) finalTagIds.push(tag.id)
        }
        if (finalTagIds.length > 0) {
          await prisma.articleTag.createMany({
            data: finalTagIds.map(tagId => ({ articleId: id, tagId }))
          })
        }
      }
    }

    return article
  } catch (error) {
    fastify.log.error(error)
    if (error.code === 'P2002') {
      return reply.code(400).send({ error: `An article with the headline "${request.body.headline}" already exists.` })
    }
    reply.code(500).send({ error: 'Failed to update article: ' + error.message })
  }
})

fastify.delete('/cms/v1/articles/:id', async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.article.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete article' })
  }
})

fastify.post('/cms/v1/categories', async (request, reply) => {
  try {
    const { name, slug, description } = request.body
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const category = await prisma.category.create({
      data: { name, slug: categorySlug, description }
    })
    return category
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to create category' })
  }
})

fastify.get('/cms/v1/categories', async (request, reply) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
    return categories
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch categories' })
  }
})

fastify.post('/cms/v1/tags', async (request, reply) => {
  try {
    const { name, slug } = request.body
    const tagSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const tag = await prisma.tag.create({
      data: { name, slug: tagSlug }
    })
    return tag
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to create tag' })
  }
})

fastify.get('/cms/v1/tags', async (request, reply) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { createdAt: 'desc' } })
    return tags
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch tags' })
  }
})

fastify.put('/cms/v1/categories/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const { name, slug, description } = request.body
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug: categorySlug, description }
    })
    return category
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to update category' })
  }
})

fastify.delete('/cms/v1/categories/:id', async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.category.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete category' })
  }
})

fastify.put('/cms/v1/tags/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const { name, slug } = request.body
    const tagSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const tag = await prisma.tag.update({
      where: { id },
      data: { name, slug: tagSlug }
    })
    return tag
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to update tag' })
  }
})

fastify.delete('/cms/v1/tags/:id', async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.tag.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete tag' })
  }
})

// === MEDIA API ROUTES ===
fastify.get('/cms/v1/media', async (request, reply) => {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return media
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch media' })
  }
})

fastify.post('/cms/v1/media', async (request, reply) => {
  try {
    const { filename, url, mimeType, sizeBytes } = request.body
    const media = await prisma.media.create({
      data: {
        filename: filename || 'Upload',
        url,
        mimeType: mimeType || 'image/jpeg',
        sizeBytes: sizeBytes || 0
      }
    })
    return media
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to upload media' })
  }
})

fastify.delete('/cms/v1/media/:id', async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.media.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete media' })
  }
})

// === NAVIGATION API ROUTES ===
fastify.get('/cms/v1/navigation', async (request, reply) => {
  try {
    const nav = await prisma.navigation.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { children: { orderBy: { displayOrder: 'asc' } } }
    })
    // Filter out children from the top level since they are included in parents
    return nav.filter(item => !item.parentId)
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch navigation' })
  }
})

fastify.post('/cms/v1/navigation', async (request, reply) => {
  try {
    const { label, href, displayOrder, parentId, type } = request.body
    const nav = await prisma.navigation.create({
      data: {
        label,
        href,
        displayOrder: displayOrder || 0,
        parentId,
        type: type || 'link'
      }
    })
    return nav
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to create navigation item' })
  }
})

fastify.put('/cms/v1/navigation/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const { label, href, displayOrder, parentId, type, isActive } = request.body
    const nav = await prisma.navigation.update({
      where: { id },
      data: {
        label,
        href,
        displayOrder,
        parentId,
        type,
        isActive
      }
    })
    return nav
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to update navigation item' })
  }
})

fastify.delete('/cms/v1/navigation/:id', async (request, reply) => {
  try {
    const { id } = request.params
    // Also delete children? Let's keep it simple for now or use cascade if defined in schema.
    // Prisma relation handles it if configured, but here we'll just delete the item.
    await prisma.navigation.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete navigation item' })
  }
})

fastify.post('/cms/v1/navigation/reorder', async (request, reply) => {
  try {
    const { items } = request.body // Array of { id, displayOrder }
    const updates = items.map(item =>
      prisma.navigation.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder }
      })
    )
    await prisma.$transaction(updates)
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to reorder navigation items' })
  }
})

// === USER API ROUTES ===
fastify.get('/cms/v1/users', async (request, reply) => {
  try {
    const users = await prisma.cmsUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        designation: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return users
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch users' })
  }
})

fastify.post('/cms/v1/users', { preHandler: requireRole('Admin') }, async (request, reply) => {
  try {
    const { email, firstName, lastName, role, designation, password } = request.body

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' })
    }
    if (password.length < 8) {
      return reply.code(400).send({ error: 'Password must be at least 8 characters' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.cmsUser.create({
      data: {
        email,
        firstName,
        lastName,
        role: role || 'Editor',
        designation,
        passwordHash,
        isActive: true
      }
    })
    // Never return the password hash to the client.
    const { passwordHash: _omit, ...safeUser } = user
    return safeUser
  } catch (error) {
    fastify.log.error(error)
    if (error.code === 'P2002') {
      return reply.code(400).send({ error: 'A user with this email already exists' })
    }
    reply.code(500).send({ error: 'Failed to create user' })
  }
})

fastify.put('/cms/v1/users/:id', { preHandler: requireRole('Admin') }, async (request, reply) => {
  try {
    const { id } = request.params
    const { role, isActive, designation } = request.body
    const user = await prisma.cmsUser.update({
      where: { id },
      data: { role, isActive, designation },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        designation: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return user
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to update user' })
  }
})

fastify.delete('/cms/v1/users/:id', { preHandler: requireRole('Admin') }, async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.cmsUser.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete user' })
  }
})

// === PUBLIC CONTACT API ===
fastify.post('/v1/contact', async (request, reply) => {
  try {
    const { name, email, subject, message } = request.body
    if (!name || !email || !message) {
      return reply.code(400).send({ error: 'Name, email, and message are required' })
    }
    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message }
    })
    return { success: true, id: contact.id }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to submit contact message' })
  }
})

// === CMS CONTACT API ===
fastify.get('/cms/v1/contact', async (request, reply) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return messages;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to fetch messages' });
  }
});

fastify.put('/cms/v1/contact/:id/status', async (request, reply) => {
  try {
    const { id } = request.params
    const { status } = request.body
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    })
    return message
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to update message status' })
  }
})

fastify.delete('/cms/v1/contact/:id', async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.contactMessage.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete message' })
  }
})

// === SITE SETTINGS API ROUTES ===
fastify.get('/cms/v1/settings', async (request, reply) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    // Reduce array into key-value object
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    return result;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to fetch settings' });
  }
});

fastify.put('/cms/v1/settings', { preHandler: requireRole('Admin') }, async (request, reply) => {
  try {
    const updates = request.body; // e.g. { "siteLogo": "...", "twitterUrl": "..." }
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        const setting = await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), label: key }
        });
        results.push(setting);
      }
    }
    return { success: true, count: results.length };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to update settings' });
  }
});

// === RSS NEWS ENGINE ===
fastify.get('/cms/v1/rss/sources', async (request, reply) => {
  try {
    const sources = await prisma.rssSource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return sources;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to fetch RSS sources' });
  }
});

fastify.post('/cms/v1/rss/sources', async (request, reply) => {
  try {
    const { name, url } = request.body;
    const source = await prisma.rssSource.create({
      data: { name, url }
    });
    return source;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to add RSS source' });
  }
});

fastify.delete('/cms/v1/rss/sources/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    await prisma.rssSource.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to delete RSS source' });
  }
});

fastify.get('/cms/v1/rss/fetch', async (request, reply) => {
  try {
    const {
      page = 1,
      limit = 10,
      sync = false,
      bookmarkedOnly = false,
      sources = '',
      categories = '',
      dateFilter = 'all',
      startDate = '',
      endDate = ''
    } = request.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50);

    const where = {};

    // 1. Bookmark Filter
    if (bookmarkedOnly === 'true' || bookmarkedOnly === true) {
      where.isBookmarked = true;
    }

    // 2. Source Filter
    if (sources) {
      where.source = { in: sources.split(',') };
    }

    // 3. Category Filter — if a specific category is requested use it,
    //    otherwise DEFAULT to excluding 'Other / Unclassified' items so
    //    only properly classified Startup Category signals are surfaced.
    if (categories) {
      const catList = categories.split(',');
      where.OR = catList.map(cat => ({
        categories: { contains: cat }
      }));
    } else {
      // Exclude items that are ONLY tagged as 'Other / Unclassified'
      where.NOT = { categories: JSON.stringify(['Other / Unclassified']) };
    }

    // 4. Date Filter + Dynamic 6-Month 'Lifecycle' Threshold
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    let gteDate = sixMonthsAgo;
    let lteDate = null;

    if (dateFilter === 'custom' && startDate) {
      gteDate = new Date(startDate);
      gteDate.setHours(0, 0, 0, 0); // Precision start of day

      if (endDate) {
        lteDate = new Date(endDate);
        lteDate.setHours(23, 59, 59, 999);
      } else {
        // If single date provided, fetch for that day only
        lteDate = new Date(startDate);
        lteDate.setHours(23, 59, 59, 999);
      }
    }
    else if (dateFilter !== 'all' && dateFilter !== '') {
      let filterDate;
      if (dateFilter === '24h') filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      else if (dateFilter === '48h') filterDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      else if (dateFilter === '7d') filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (dateFilter === '15d') filterDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      else if (dateFilter === '3m') filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      if (filterDate && filterDate > sixMonthsAgo) gteDate = filterDate;
    }

    where.pubDate = { gte: gteDate };
    if (lteDate) where.pubDate.lte = lteDate;

    // Initial source check + Logo Integrity Verification
    const sourcesCount = await prisma.rssSource.count();
    const missingLogos = await prisma.rssSource.count({ where: { logoUrl: null } });
    if (sourcesCount === 0 || missingLogos > 0) {
      const initialSources = [
        { name: 'YourStory', url: 'https://yourstory.com/feed', logoUrl: 'https://www.google.com/s2/favicons?domain=yourstory.com&sz=128' },
        { name: 'Inc42', url: 'https://inc42.com/feed/', logoUrl: 'https://www.google.com/s2/favicons?domain=inc42.com&sz=128' },
        { name: 'Entrackr', url: 'https://entrackr.com/rss', logoUrl: 'https://www.google.com/s2/favicons?domain=entrackr.com&sz=128' },
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/small-biz/startups/rssfeeds/11959139.cms', logoUrl: 'https://www.google.com/s2/favicons?domain=economictimes.indiatimes.com&sz=128' },
        { name: 'VCCircle', url: 'https://news.google.com/rss/search?q=site:vccircle.com&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=vccircle.com&sz=128' },
        { name: 'LiveMint', url: 'https://www.livemint.com/rss/companies', logoUrl: 'https://www.google.com/s2/favicons?domain=livemint.com&sz=128' },
        { name: 'Moneycontrol', url: 'https://news.google.com/rss/search?q=site:moneycontrol.com+startup&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=moneycontrol.com&sz=128' },
        { name: 'StartupTalky', url: 'https://startuptalky.com/rss/', logoUrl: 'https://www.google.com/s2/favicons?domain=startuptalky.com&sz=128' },
        { name: 'Entrepreneur India', url: 'https://india.entrepreneur.com/feed/', logoUrl: 'https://www.google.com/s2/favicons?domain=entrepreneur.com&sz=128' },
        { name: 'The Ken', url: 'https://the-ken.com/feed/', logoUrl: 'https://www.google.com/s2/favicons?domain=the-ken.com&sz=128' },
        { name: 'Morning Context', url: 'https://themorningcontext.com/feed/', logoUrl: 'https://www.google.com/s2/favicons?domain=themorningcontext.com&sz=128' },
        { name: 'Finshots', url: 'https://finshots.in/rss/', logoUrl: 'https://www.google.com/s2/favicons?domain=finshots.in&sz=128' },
        { name: 'IndianStartupNews', url: 'https://indianstartupnews.com/rss', logoUrl: 'https://www.google.com/s2/favicons?domain=indianstartupnews.com&sz=128' },
        { name: 'TICE News', url: 'https://www.tice.news/rss', logoUrl: 'https://www.google.com/s2/favicons?domain=tice.news&sz=128' },
        { name: 'StartupNews.fyi', url: 'https://startupnews.fyi/feed/', logoUrl: 'https://play-lh.googleusercontent.com/SI26dmhoYzDnpUoEm1pQpRECb8o6GKkUV8wOOnKWRSLVWdA6ln6Wshw1jHH-DNt0yg' },
        { name: 'Google News', url: 'https://news.google.com/rss/search?q=Indian+Startup+News&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=news.google.com&sz=128' },
        { name: 'Google News - Funding', url: 'https://news.google.com/rss/search?q=Indian+startup+funding+raised&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=news.google.com&sz=128' },
        { name: 'Google News - Tech India', url: 'https://news.google.com/rss/search?q=India+technology+startup+launch&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=news.google.com&sz=128' },
        { name: 'Google News - Unicorn', url: 'https://news.google.com/rss/search?q=India+unicorn+startup+valuation&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=news.google.com&sz=128' },
        { name: 'TechCrunch India', url: 'https://news.google.com/rss/search?q=site:techcrunch.com+India&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=128' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/companies-start-ups-10307.rss', logoUrl: 'https://www.google.com/s2/favicons?domain=business-standard.com&sz=128' },
        { name: 'NDTV Profit', url: 'https://news.google.com/rss/search?q=site:ndtvprofit.com+startup&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=ndtvprofit.com&sz=128' }
      ];
      for (const s of initialSources) {
        await prisma.rssSource.upsert({
          where: { url: s.url },
          update: { name: s.name, logoUrl: s.logoUrl },
          create: { ...s, isActive: true }
        }).catch(() => { });
      }
    }

    const cacheCount = await prisma.discoveryCache.count();
    const shouldSync = sync === 'true' || sync === true || cacheCount === 0;

    if (shouldSync) {
      // Trigger background sync but don't wait for all of it to finish for the response
      // unless it's a small fetch. To keep responsive, we'll run it in background.
      runDeepSync().catch(err => fastify.log.error(`Background Sync Error: ${err.message}`));
    }

    const total = await prisma.discoveryCache.count({ where });
    const items = await prisma.discoveryCache.findMany({
      where,
      orderBy: { pubDate: 'desc' },
      skip,
      take
    });

    // Strategy: Real-time Visual Attribution Sync
    // Fetch current source identity mapping to ensure visual consistency
    const activeSources = await prisma.rssSource.findMany();
    const logoMap = {};
    activeSources.forEach(s => {
      logoMap[s.name.toLowerCase()] = s.logoUrl;
    });

    const populatedItems = items.map(i => {
      let logoUrl = i.logoUrl;
      // Hot-lookup: If cache is stale or missing logo, cross-reference with active perimeter
      if (!logoUrl && i.source) {
        logoUrl = logoMap[i.source.toLowerCase()];
      }

      return {
        ...i,
        logoUrl,
        categories: JSON.parse(i.categories || '[]')
      };
    });

    return {
      items: populatedItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / take)
      }
    };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to process discovery stream' });
  }
});

// === AI TREND DETECTION ROUTE ===
fastify.get('/cms/v1/rss/trending', async (request, reply) => {
  try {
    const { days = 7 } = request.query;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - parseInt(days));

    const recentSignals = await prisma.discoveryCache.findMany({
      where: {
        pubDate: { gte: pastDate.toISOString() }
      },
      orderBy: { pubDate: 'desc' },
      take: 1000
    });

    const topics = [];
    for (const item of recentSignals) {
       const lowerTitle = item.title.toLowerCase();
       // Try to extract a cleaner startup name by splitting common connectors
       const cleanTopic = item.title.split(/ - | \| |: /)[0];
       const brandMatch = cleanTopic.split(' ').slice(0, 3).join(' ');

       let existingTopic = topics.find(t => t.topic.toLowerCase().includes(brandMatch.toLowerCase()) || (t.brandMatch && t.brandMatch.toLowerCase() === brandMatch.toLowerCase()));

       if (existingTopic) {
           if (!existingTopic.relatedSignals.some(s => s.link === item.link)) {
               existingTopic.relatedSignals.push({
                   source: item.source,
                   link: item.link,
                   title: item.title,
                   pubDate: item.pubDate
               });
               // Each unique reporting source increases the momentum and score
               existingTopic.score = Math.min(12, existingTopic.score + 1.5);
               if (existingTopic.score >= 8) {
                   existingTopic.status = "HIGHLY TRENDING";
                   existingTopic.momentum = "Rising";
               }
           }
           continue;
       }

       let score = 3; // Base News Coverage
       let reasons = ["Extensive coverage across business news outlets."];
       const platforms = { googleTrends: false, twitter: false, instagram: false, youtube: false, news: true };
       
       if (lowerTitle.includes('scandal') || lowerTitle.includes('controversy') || lowerTitle.includes('arrest') || lowerTitle.includes('lawsuit') || lowerTitle.includes('sued')) {
           score += 2;
           platforms.twitter = true;
           reasons.push("High social momentum on Twitter/X.");
       }
       if (lowerTitle.includes('viral') || lowerTitle.includes('influencer') || lowerTitle.includes('trending')) {
           score += 2;
           platforms.instagram = true;
           reasons.push("Significant social engagement detected.");
       }
       if (lowerTitle.includes('raises') || lowerTitle.includes('funding') || lowerTitle.includes('crore') || lowerTitle.includes('million') || lowerTitle.includes('ipo') || lowerTitle.includes('acquires')) {
           score += 4; // Increased weight for business milestones
           platforms.googleTrends = true;
           reasons.push("Major business milestone with high search velocity.");
       }

       topics.push({
           id: item.id,
           topic: cleanTopic,
           brandMatch: brandMatch,
           score: score,
           status: score >= 8 ? "HIGHLY TRENDING" : "TRENDING",
           reasons: reasons,
           platforms: platforms,
           momentum: score >= 8 ? "Rising" : "Steady",
           angles: {
               pr: "Leverage this momentum to position the brand as a market leader in " + brandMatch + ".",
               content: "Analyze the strategic impact of this move on the sector.",
               hook: "Why " + brandMatch + " is dominating the headlines today."
           },
           source: item.source,
           pubDate: item.pubDate,
           link: item.link,
           relatedSignals: [{
               source: item.source,
               link: item.link,
               title: item.title,
               pubDate: item.pubDate
           }]
       });
    }

    // Sort by Score (Primary) and Date (Secondary) to ensure the most important news surfaces
    return topics
       .filter(t => t.score >= 5)
       .sort((a, b) => {
           if (Math.floor(b.score) !== Math.floor(a.score)) return b.score - a.score;
           return new Date(b.pubDate) - new Date(a.pubDate);
       })
       .slice(0, 12);
  } catch(e) {
    fastify.log.error(e);
    reply.code(500).send({ error: 'Failed to generate trending topics' });
  }
});


fastify.post('/cms/v1/rss/bookmark/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const item = await prisma.discoveryCache.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'Item not found' });

    const updated = await prisma.discoveryCache.update({
      where: { id },
      data: { isBookmarked: !item.isBookmarked }
    });
    return updated;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to toggle bookmark' });
  }
});

// === SYNC STATE TRACKER ===
const syncState = {
  isSyncing: false,
  syncType: null, // 'incremental' | 'deep'
  startedAt: null,
  completedAt: null,
  totalSources: 0,
  completedSources: 0,
  currentSource: null,
  newSignalsAdded: 0,
  lastDeepSyncAt: null,   // persisted in-memory; survives 30-min intervals
  lastIncrementalSyncAt: null,
};

fastify.get('/cms/v1/rss/sync-status', async (request, reply) => {
  const totalSignals = await prisma.discoveryCache.count();
  return {
    isSyncing: syncState.isSyncing,
    syncType: syncState.syncType,
    startedAt: syncState.startedAt,
    completedAt: syncState.completedAt,
    totalSources: syncState.totalSources,
    completedSources: syncState.completedSources,
    currentSource: syncState.currentSource,
    newSignalsAdded: syncState.newSignalsAdded,
    lastDeepSyncAt: syncState.lastDeepSyncAt,
    lastIncrementalSyncAt: syncState.lastIncrementalSyncAt,
    totalSignalsInDB: totalSignals,
    progressPercent: syncState.totalSources > 0
      ? Math.round((syncState.completedSources / syncState.totalSources) * 100)
      : 0,
    elapsedSeconds: syncState.startedAt
      ? Math.round((Date.now() - new Date(syncState.startedAt).getTime()) / 1000)
      : 0,
  };
});

// Manual sync trigger endpoint
fastify.post('/cms/v1/rss/trigger-sync', async (request, reply) => {
  if (syncState.isSyncing) {
    return reply.code(409).send({ error: 'A sync is already in progress', syncType: syncState.syncType });
  }
  const { type = 'incremental' } = request.body || {};
  if (type === 'deep') {
    runDeepSync().catch(err => fastify.log.error(`Manual Deep Sync Error: ${err.message}`));
  } else {
    runIncrementalSync().catch(err => fastify.log.error(`Manual Incremental Sync Error: ${err.message}`));
  }
  return { started: true, type };
});

// Historical Archival Engine: Deep Sync Core
async function runDeepSync() {
  if (syncState.isSyncing) return; // Never double-run
  const activeSources = await prisma.rssSource.findMany({ where: { isActive: true } });
  syncState.isSyncing = true;
  syncState.syncType = 'deep';
  syncState.startedAt = new Date().toISOString();
  syncState.completedAt = null;
  syncState.totalSources = activeSources.length;
  syncState.completedSources = 0;
  syncState.currentSource = null;
  syncState.newSignalsAdded = 0;

  const industryVerticals = [
    { name: 'Fintech', keys: ['payments', 'lending', 'insurtech', 'wealthtech', 'regtech', 'fintech', 'banking', 'upi', 'neobank', 'wealth management', 'insurance', 'stock brokerage', 'rbi', 'bank of india', 'finance', 'trading'] },
    { name: 'EdTech', keys: ['k-12', 'higher education', 'upskilling', 'test prep', 'edtech', 'learning', 'classroom', 'skill development', 'tutoring', 'academy', 'education', 'books', 'reading', 'school'] },
    { name: 'HealthTech', keys: ['digital health', 'medtech', 'pharmatech', 'mental health', 'healthtech', 'medical', 'healthcare', 'clinics', 'diagnostics', 'telemedicine', 'biotech', 'pharma', 'fda', 'drugs', 'medicine'] },
    { name: 'MobilityTech', keys: ['mobilitytech', 'ride-hailing', 'electric mobility', 'autonomous vehicles', 'ride sharing', 'scooters', 'micro-mobility', 'urban transport', 'car sharing', 'aviation', 'airlines', 'indigo', 'air-tickets', 'flight', 'automotive', 'cars', 'vehicles', 'self-driving', 'tesla', 'uber', 'ola', 'rapido', 'driver', 'taxi', 'cab'] },
    { name: 'FoodTech', keys: ['foodtech', 'cloud kitchen', 'food delivery', 'grocery delivery', 'restaurant tech', 'agrifoodtech', 'food subscription', 'beverages', 'cooking', 'nutrition'] },
    { name: 'TravelTech', keys: ['traveltech', 'hotel booking', 'tourism', 'travel agency', 'airline tech', 'staycation', 'hospitality tech', 'resort', 'vacation'] },
    { name: 'AI / ML', keys: ['generative ai', 'computer vision', 'nlp', 'ai infrastructure', 'ai/ml', 'artificial intelligence', 'machine learning', 'llm', 'deep learning', 'automation', 'data governance', 'algorithmic', 'chatgpt', 'openai', 'gemini ai', 'claude', 'copilot', 'ai model', 'neural network', 'gpt', 'agentic ai', 'ai agent', 'ai coding'] },
    { name: 'Cybersecurity', keys: ['cybersecurity', 'encryption', 'firewall', 'data protection', 'hacking', 'threat detection', 'security software', 'identity management', 'zero trust', 'privacy', 'data breach', 'vpn', 'passkey', 'password', 'malware', 'ransomware', 'phishing', 'antivirus', 'security vulnerability', 'exploit', 'authentication', 'two-factor', 'biometric'] },
    { name: 'Web3 / Blockchain', keys: ['web3', 'blockchain', 'crypto', 'nft', 'decentralized', 'metaverse', 'defi', 'ethereum', 'bitcoin', 'smart contracts', 'dao', 'token'] },
    { name: 'ClimateTech / Sustainability', keys: ['climatetech', 'sustainability', 'carbon credit', 'circular economy', 'waste management', 'esg', 'environmental', 'green tech', 'renewable energy', 'ecology'] },
    { name: 'AgriTech', keys: ['precision farming', 'supply chain', 'agrifinance', 'agritech', 'farming', 'agriculture', 'harvest', 'farmer', 'agrifood', 'grains', 'pulses', 'organic'] },
    { name: 'CleanTech / EV', keys: ['electric', 'cleantech', 'ev', 'battery', 'solar', 'wind', 'charging', 'hypercharger', 'green energy', 'photovoltaic'] },
    { name: 'Future of Work / HRTech', keys: ['hrtech', 'remote work', 'talent acquisition', 'hiring', 'payroll', 'workforce management', 'recruitment', 'future of work', 'employee engagement', 'productivity'] },
    { name: 'Developer Infrastructure / Cloud', keys: ['devops', 'cloud infrastructure', 'backend', 'cloud native', 'api', 'serverless', 'kubernetes', 'aws', 'azure', 'dev tools', 'infrastructure-as-code', 'computing', 'github', 'gitlab', 'docker', 'ci/cd', 'data center', 'data centre', 'cloud computing', 'database', 'sql', 'server', 'hosting', 'oracle cloud', 'ibm cloud'] },
    { name: 'Social / Community Platforms', keys: ['social media', 'community platform', 'networking', 'social network', 'dating app', 'content platform', 'short video', 'creator economy', 'creativity'] },
    { name: 'SaaS / B2B', keys: ['enterprise software', 'martech', 'saas', 'b2b', 'software-as-a-service', 'crm', 'workflow', 'clouddays', 'digital transformation'] },
    { name: 'D2C / E-Commerce', keys: ['consumer brands', 'quick commerce', 'fashion', 'd2c', 'e-commerce', 'omnichannel', 'retail', 'marketplace', 'wellness', 'beauty', 'direct-to-consumer', 'personal care', 'jewellery', 'apparel', 'direct to consumer', 'cosmetics', 'handmade', 'artisan', 'lifestyle', 'personal growth'] },
    { name: 'LogisTech', keys: ['supply chain', 'warehousing', 'last-mile delivery', 'logistech', 'logistics', 'delivery', 'fleet', 'shipping', 'freight', 'trucking', 'warehouse'] },
    { name: 'SpaceTech / DeepTech', keys: ['semiconductors', 'spacetech', 'deeptech', 'satellite', 'rocketry', 'isro', 'robotics', 'space exploration', 'space startup', 'agnikul', 'skyroot', 'quantum', 'physics', 'iss', 'international space station', 'space station', 'orbit', 'chip', 'chipset', 'semiconductor', 'memory', 'ram', 'processor', 'cpu', 'gpu', 'nvidia', 'amd', 'intel', 'micron', 'qualcomm', 'mediatek', 'snapdragon', 'foundry', 'wafer', 'fab', 'tsmc'] },
    { name: 'Gaming / Media', keys: ['gaming', 'media', 'esports', 'publisher', 'content creation', 'streaming', 'entertainment', 'influencer economy', 'ott', 'movies', 'music', 'tv series', 'original series', 'premiere', 'playstation', 'xbox', 'nintendo', 'steam', 'game pass', 'battlefield', 'emulation', 'handheld', 'console', 'video game'] },
    { name: 'Real Estate Tech', keys: ['proptech', 'construction tech', 'real estate', 'property', 'real estate tech', 'homebuying', 'coworking', 'architecture', 'housing'] },
    { name: 'Government / Policy', keys: ['regulatory', 'government', 'ministry', 'policy', 'framework', 'guidelines', 'statutory', 'law', 'legal', 'compliance', 'taxation', 'gst', 'central gov', 'cabinet', 'rbi', 'sebi', 'regulator'] },
    { name: 'Manufacturing / Industrial', keys: ['manufacturing', 'factory', 'industrial', 'hardware', 'assembly', 'production', 'raw materials', 'machinery', 'leather', 'textile', 'processing', 'electronics', 'components', 'supply chain disruption', 'make in india', 'pli scheme', 'capacity expansion', 'plant', 'unit', 'craft', 'artisan', 'handmade', 'furniture'] },
    { name: 'Big Tech / Consumer Software', keys: ['microsoft', 'apple', 'google', 'meta', 'amazon', 'firefox', 'windows', 'browser', 'operating system', 'software update', 'technical support', 'big tech', 'consumer tech', 'adobe', 'iphone', 'ipad', 'macbook', 'pixel', 'samsung', 'android', 'ios', 'app store', 'play store', 'chrome', 'safari', 'edge', 'smartphone', 'tablet', 'wearable', 'smartwatch', 'airpods', 'galaxy', 'oneplus', 'nothing phone', 'linkedin', 'whatsapp', 'instagram', 'twitter', 'reddit', 'youtube', 'netflix', 'spotify'] },
    { name: 'Telecom / Infrastructure', keys: ['telecom', 'fiber', '5g', '6g', 'network', 'broadband', 'infrastructure', 'connectivity', 'operator', 'openreach', 'internet provider', 'vibrations', 'underground', 'jio', 'airtel', 'vodafone', 'bsnl', 'spectrum', 'tower', 'satellite internet', 'starlink', 'wifi', 'wi-fi'] }
  ];

  const signalCategories = [
    {
      name: 'Funding',
      priority: 1,
      strong: ['funding round', 'raises funding', 'raises capital', 'raises inr', 'raises usd', 'raises rs', 'raised funding', 'raised capital', 'raised inr', 'raised usd', 'raised rs', 'series a', 'series b', 'series c', 'series d', 'series e', 'series f', 'pre-seed', 'seed round', 'closes funding', 'valuation hits', 'valuation of', 'secures funding', 'bags funding', 'capital infusion', 'infuses capital', 'investment round', 'strategic investment', 'qip', 'capital raise', 'fundraising', 'funding from', 'investment from', 'leads round', 'lead the round', 'lead round', 'anchor investment', 'million round', 'crore round', 'pocket early-stage', 'pocket funding', 'early-stage cheques', 'pours into', 'pumps into', 'bets on', 'backs startup', 'early stage cheques', 'million funding', 'crore funding', 'million investment', 'crore investment', 'mn funding', 'mn investment', 'lakh funding'],
      supporting: ['raises', 'raised', 'capital', 'investment', 'venture capital', 'vcs', 'investors', 'funding round', 'capital injection', 'equity', 'convertible note', 'debt funding', 'angel funding', 'bridge round', 'funding news', 'fund raise', 'checks into', 'capital raise', 'investment in', 'startup funding', 'equity financing', 'participation', 'led by', 'shares sold', 'secondary sale', 'round', 'million', 'crore', 'mn', 'lakh', 'anchor', 'backed', 'cheques', 'bet']
    },
    {
      name: 'Startup Launch',
      priority: 8,
      strong: ['launches startup', 'founded in', 'new startup', 'debuts', 'coming out of stealth', 'stealth mode', 'founders start', 'unveils startup', 'enters the market', 'operational in', 'incorporated', 'starts up'],
      supporting: ['co-founded', 'venture launched', 'bootstrapped', 'early-stage', 'incorporated', 'new venture', 'spin-off', 'fresh off', 'starting up', 'new player', 'enters sector', 'commences ops', 'kickstarts', 'startup', 'new company']
    },
    {
      name: 'Acquisition',
      priority: 4,
      strong: ['acquires', 'acquired', 'acquiring', 'acquisition of', 'takeover', 'acqui-hire', 'merger with', '100% stake purchase', 'buys startup', 'purchase of', 'in talks to acquire', 'proposed acquisition', 'stake acquisition', 'majority stake in'],
      supporting: ['strategic acquisition', 'all-stock deal', 'asset purchase', 'takes over', 'absorbed by', 'majority stake', 'buyout', 'controlling interest', 'merger talk', 'valuation in acquisition', 'acqui-hire deal', 'share swap', 'term sheet for acquisition']
    },
    {
      name: 'Shutdown',
      priority: 2,
      strong: ['shuts down', 'ceases operations', 'closure of', 'bankruptcy', 'winding up', 'stops operations', 'halting operations'],
      supporting: ['insolvency', 'nclt filing', 'no longer operational', 'suspends services', 'folds', 'winding down', 'end of operations', 'failure', 'out of business']
    },
    {
      name: 'Layoffs',
      priority: 3,
      strong: ['layoffs', 'lays off', 'job cuts', 'retrenchment', 'downsizing', 'workforce reduction', 'mass layoff', 'slashes jobs', 'cuts workforce', 'restructuring'],
      supporting: ['pink slips', 'let go', 'rightsizing', 'headcount reduction', 'employees fired', 'mass termination', 'cost cutting', 'redundancies', 'job losses', 'cutting jobs']
    },
    {
      name: 'Product News / Launch',
      priority: 9,
      strong: ['launches product', 'new feature', 'releases feature', 'unveils new', 'rolls out feature', 'rolls out', 'goes live', 'announces launch', 'beta launch', 'general availability', 'debuts new', 'expansion into', 'enters market', 'launches expansion', 'end support', 'technical support', 'updates', 'v2.0', 'software update', 'premiered', 'premieres', 'premiere', 'brand new', 'announced', 'leak', 'revealed', 'shadowdropped', 'remastered'],
      supporting: ['releases', 'unveils', 'introduces', 'now available', 'v2.0', 'new offering', 'app update', 'platform expansion', 'new vertical', 'product reveal', 'expansion', 'debuts', 'compatibility', 'maintenance', 'feature', 'update', 'original series', 'series launch', 'new show', 'announced that', 'can detect', 'teaser']
    },
    {
      name: 'Founder Story / Profile',
      priority: 10,
      strong: ['founder op-ed', 'founder profile', 'in conversation with', 'interview with founder', 'exclusive interview', 'founder exclusive', 'interview with ceo', 'founder speaks', 'co-founder says', 'q&a with', 'story of', 'how it started'],
      supporting: ['opinion', 'thought leadership', 'vision', 'roadmap', 'op-ed by', "founder's take", 'startup journey', 'lessons from', 'we sat down with', 'in their own words', 'built', 'started by', 'founder story']
    },
    {
      name: 'Pivot',
      priority: 5,
      strong: ['pivots', 'shifts focus to', 'new direction', 'pivoting to', 'pivoting from', 'business model change', 'strategic overhaul'],
      supporting: ['restructures', 'reinvents', 'overhauls strategy', 'moves away from', 'no longer focuses on', 'transition to', 'rebrands as', 'sunsets', 'change of direction', 'new strategy']
    },
    {
      name: 'Funding Ask',
      priority: 6,
      strong: ['in talks to raise', 'seeking investment', 'discussions with investors', 'looking to close', 'eyeing fundraise', 'plans to raise', 'seeking capital'],
      supporting: ['approaching vcs', 'expected to close', 'term sheet', 'due diligence ongoing', 'roadshow', 'scouting investors', 'fundraising round planned', 'investor meetings', 'pitching to investors']
    },
    {
      name: 'Revenue Milestone',
      priority: 7,
      strong: ['turns profitable', 'achieves breakeven', 'crosses arr', 'revenue milestone', 'ebitda positive', 'pat positive', 'clocks revenue', 'gross profit', 'profitable'],
      supporting: ['first profitable quarter', 'operating profit', 'mrr crosses', 'gmv milestone', 'revenue hits', 'clocks inr cr', 'gross profit positive', 'profitability achieved', 'revenue growth', 'revenue clocks']
    },
    {
      name: 'Partnership',
      priority: 11,
      strong: ['partners with', 'partnership', 'collaboration', 'tie-up', 'signs mou', 'strategic alliance', 'joins hands with', 'teams up'],
      supporting: ['joint venture', 'collaboration with', 'agreement', 'mou', 'strategic partnership', 'synergy', 'cooperation']
    },
    {
      name: 'Expansion',
      priority: 12,
      strong: ['expands to', 'enters new market', 'new city', 'global footprint', 'opens office', 'expansion plan', 'geographical expansion', 'launches in', 'sets up base', 'opens its first'],
      supporting: ['new region', 'scaling up', 'international market', 'domestic expansion', 'wider reach', 'new territory', 'expansion', 'scaling', 'growth', 'expanding', 'presence in', 'new base']
    },
    {
      name: 'Regulatory / Policy',
      priority: 13,
      strong: ['regulatory update', 'complies with', 'government policy', 'new guidelines', 'rbi directive', 'sebi order', 'gdpr', 'compliance', 'framework', 'guidelines', 'privacy fine', 'gdpr fine', 'data protection law'],
      supporting: ['regulation', 'statutory', 'legal framework', 'government mandate', 'notification', 'official order', 'central government', 'privacy policy', 'penalty', 'fine imposed']
    },
    {
      name: 'Leadership / People',
      priority: 14,
      strong: ['appoints', 'new ceo', 'new cto', 'hires', 'leadership change', 'board of directors', 'joins as', 'stepping down', 'exit of', 'leaves role', 'resigns', 'transition from', 'new role', 'promoted'],
      supporting: ['hr news', 'executive hire', 'appointment', 'promoted', 'people news', 'hiring talent', 'veteran joins', 'industry veteran', 'career move']
    },
    {
      name: 'Legal / Litigation',
      priority: 15,
      strong: ['files suit', 'legal battle', 'court order', 'litigation', 'lawsuit', 'arbitration', 'dispute', 'notice from', 'legal action', 'court scraps', 'won appeal', 'legal win'],
      supporting: ['court stay', 'appeals court', 'petition', 'complaint', 'legal case', 'hearing', 'judgment', 'appeal', 'scraps', 'fine', 'won its appeal']
    },
    {
      name: 'Ecosystem News',
      priority: 16,
      strong: ['daily roundup', 'startup news', 'mid-day news', 'news updates', 'roundup', 'daily digest', 'weekly news', 'bulletin', 'discovery', 'captured', 'scientific', 'mission', 'accelerator', 'applications open'],
      supporting: ['latest updates', 'top stories', 'happening today', 'morning briefing', 'startup updates', 'scientific breakthrough', 'orbit', 'observations', 'cohort', 'program', 'applications for']
    },
    {
      name: 'Market Insights / Reports',
      priority: 17,
      strong: ['best of', 'top 10', 'review', 'comparison', 'market report', 'industry insights', 'best vpn', 'best books', 'top tools', 'product review', 'commodity prices', 'gold price', 'energy shock'],
      supporting: ['ranking', 'curated list', 'analysis', 'research', 'landscape', 'market analysis', 'buying guide', 'recommendations', 'top gainers', 'losers', 'nifty', 'sensex', 'stocks market']
    },
    {
      name: 'Tech Guides / Tutorials',
      priority: 18,
      strong: ['how to', 'tutorial', 'guide', 'how-to', 'step by step', 'setup', 'unblock', 'access', 'watch', 'configuring'],
      supporting: ['walkthrough', 'instructions', 'tips', 'tricks', 'manual', 'help', 'troubleshoot', 'setup guide']
    },
    {
      name: 'Trends / Future Tech',
      priority: 19,
      strong: ['future of', 'will ai', 'impact of', 'the end of', 'state of', 'trends in', 'outlook', 'prediction', 'predicts', 'visionary', 'paradigm shift', 'could revolutionize', 'will transform', 'will reshape', 'will disrupt'],
      supporting: ['analysis', 'forecast', 'landscape', 'potential', 'opportunity', 'transforming', 'shaping', 'evolution', 'thinker', 'long-term', 'innovation', 'vision', 'transformation', 'long-term growth', 'will need', 'will require', 'could create', 'may impact']
    },
    {
      name: 'Product Review / Opinion',
      priority: 20,
      strong: ['meet the', 'review', 'opinion', 'hands-on', 'verdict', 'awful', 'brilliant', 'critique', 'comparison', 'vs', 'rebranding', 'unveiled'],
      supporting: ['feedback', 'rating', 'user experience', 'performance', 'testing', 'quality', 'benchmark', 'editor choice', 'first look']
    },
    {
      name: 'Innovation / Breakthrough',
      priority: 21,
      strong: ['breakthrough', 'innovation', 'unveils tech', 'pioneers', 'first ever', 'new technique', 'advanced technology', 'isolates the source', 'detect leaks'],
      supporting: ['showcases', 'demonstrates', 'case study', 'experimental', 'r&d', 'scientific advancement', 'technological leap']
    }
  ];

  const majorSources = [
    { name: 'Inc42', keys: ['inc42'], logoUrl: 'https://www.google.com/s2/favicons?domain=inc42.com&sz=128' },
    { name: 'YourStory', keys: ['yourstory'], logoUrl: 'https://www.google.com/s2/favicons?domain=yourstory.com&sz=128' },
    { name: 'Entrackr', keys: ['entrackr', 'entracker'], logoUrl: 'https://www.google.com/s2/favicons?domain=entrackr.com&sz=128' },
    { name: 'Economic Times', keys: ['economic times', 'et auto', 'et tech'], logoUrl: 'https://www.google.com/s2/favicons?domain=economictimes.indiatimes.com&sz=128' },
    { name: 'Moneycontrol', keys: ['moneycontrol'], logoUrl: 'https://www.google.com/s2/favicons?domain=moneycontrol.com&sz=128' },
    { name: 'VCCircle', keys: ['vccircle'], logoUrl: 'https://www.google.com/s2/favicons?domain=vccircle.com&sz=128' },
    { name: 'LiveMint', keys: ['livemint', 'mint'], logoUrl: 'https://www.google.com/s2/favicons?domain=livemint.com&sz=128' },
    { name: 'StartupTalky', keys: ['startuptalky'], logoUrl: 'https://www.google.com/s2/favicons?domain=startuptalky.com&sz=128' },
    { name: 'Entrepreneur India', keys: ['entrepreneur'], logoUrl: 'https://www.google.com/s2/favicons?domain=entrepreneur.com&sz=128' },
    { name: 'The Ken', keys: ['the ken'], logoUrl: 'https://www.google.com/s2/favicons?domain=the-ken.com&sz=128' },
    { name: 'Morning Context', keys: ['morning context'], logoUrl: 'https://www.google.com/s2/favicons?domain=themorningcontext.com&sz=128' },
    { name: 'Finshots', keys: ['finshots'], logoUrl: 'https://www.google.com/s2/favicons?domain=finshots.in&sz=128' },
    { name: 'IndianStartupNews', keys: ['indianstartupnews', 'indian startup news'], logoUrl: 'https://www.google.com/s2/favicons?domain=indianstartupnews.com&sz=128' },
    { name: 'TICE News', keys: ['tice news', 'tice'], logoUrl: 'https://www.google.com/s2/favicons?domain=tice.news&sz=128' },
    { name: 'StartupNews.fyi', keys: ['startupnews.fyi', 'startupnews'], logoUrl: 'https://play-lh.googleusercontent.com/SI26dmhoYzDnpUoEm1pQpRECb8o6GKkUV8wOOnKWRSLVWdA6ln6Wshw1jHH-DNt0yg' }
  ];

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  console.log(`[Historical Bridge]: Starting deep archival scan for ${activeSources.length} sources...`);

  for (let i = 0; i < activeSources.length; i += 3) {
    const batch = activeSources.slice(i, i + 3);
    await Promise.all(batch.map(async (source) => {
      try {
        console.log(`  Bridge Sync: Processing ${source.name}...`);
        syncState.currentSource = source.name;
        const pagesToFetch = Array.from({ length: 100 }, (_, i) => i + 1);
        let lastFirstItemLink = '';

        for (const pageNum of pagesToFetch) {
          let fetchUrl = source.url;
          if (pageNum > 1) {
            const separator = fetchUrl.includes('?') ? '&' : '?';
            fetchUrl += `${separator}paged=${pageNum}&page=${pageNum}`;
          }

          const feed = await parser.parseURL(fetchUrl).catch(() => null);
          if (!feed || !feed.items || feed.items.length === 0 || feed.items[0].link === lastFirstItemLink) break;
          lastFirstItemLink = feed.items[0].link;

          const firstItemDate = feed.items[0].pubDate ? new Date(feed.items[0].pubDate) : null;
          if (firstItemDate && firstItemDate < sixMonthsAgo && pageNum > 1) break;

          for (const item of feed.items) {
            const rawDate = item.isoDate || item.pubDate || item.date;
            const validDate = rawDate ? new Date(rawDate) : null;
            if (!validDate || isNaN(validDate.getTime()) || validDate < sixMonthsAgo) continue;

            const creatorRaw = item.creator || item.author || 'Editorial Team';
            const contentBuffer = (item.title + ' ' + (item.contentSnippet || item.content || '')).toLowerCase();

            // Enhanced Thematic Routing Engine (Priority + Multi-Tag + Headline Tiebreaking)
            const signalMatches = [];

            const titleBuffer = (item.title || '').toLowerCase();
            const descBuffer = (item.contentSnippet || item.content || '').toLowerCase();
            const fullBuffer = (titleBuffer + ' ' + descBuffer);

            // High-Precision Matching Engine (Regex Word Boundaries for absolute accuracy)
            const matchKeywords = (text, keys) => {
              return keys.some(key => {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
                return regex.test(text);
              });
            };

            const countMatches = (text, keys) => {
              return keys.filter(key => {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
                return regex.test(text);
              }).length;
            };

            // Vector 1: Industry Verticals (Multi-Tag Enabled)
            const industryTags = industryVerticals
              .filter(v => matchKeywords(fullBuffer, v.keys))
              .map(v => v.name);

            // Vector 2: Strategic Signal Acquisition (Rules 1, 2, 3)
            signalCategories.forEach(sc => {
              // Rule 3: Headline weighting
              const inHeadline = matchKeywords(titleBuffer, sc.strong) ||
                countMatches(titleBuffer, sc.supporting) >= 2;

              const titleStrong = countMatches(titleBuffer, sc.strong);
              const titleSupport = countMatches(titleBuffer, sc.supporting);
              const bodyStrong = countMatches(descBuffer, sc.strong);
              const bodySupport = countMatches(descBuffer, sc.supporting);

              // Rule 2: Minimum Confidence threshold
              if ((titleStrong + bodyStrong) >= 1 || (titleSupport + bodySupport) >= 2) {
                signalMatches.push({
                  name: sc.name,
                  priority: sc.priority,
                  isHeadlineSignal: inHeadline
                });
              }
            });

            // Anti-Noise Guard (The Purified Signal Doctrine Rule 5) - Optimized for High Priority Overrides
            const isNoise = [
              'sensex', 'nifty', 'bse', 'nse', 'dalal street', 'stock market', 'share price', 'rupee vs', 'rupee falls',
              'l&t', 'larsen', 'reliance industries', 'mukesh ambani', 'adani', 'tata steel', 'tata motors',
              'bajaj finance', 'hdfc bank', 'icici bank', 'state bank of india', 'sbi', 'infosys',
              'tcs', 'wipro', 'itc', 'hindustan unilever', 'dividend', 'mutual fund', 'petrol price',
              'diesel price', 'gold price', 'silver price', 'bond yield', 'nifty 50', 'nifty bank', 'press note 3', 'sensex crashes',
              'lpg', 'crude oil', 'gulf supplies', 'west asia conflict', 'geopolitics', 'inflation', 'repo rate', 'gdp growth', 'export data',
              'ukraine', 'russia', 'argentina', 'commodity', 'natural gas', 'opec', 'oil prices'
            ].some(key => {
              const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              return regex.test(titleBuffer);
            });

            // Supplemental Regex Funding Detector — catches dollar-amount patterns the keyword system misses
            // (The '$' sign is a regex metacharacter and breaks word-boundary matching in keyword lists)
            const FUNDING_REGEX_PATTERNS = [
              /\braise[sd]?\s+\$[\d,.]+/i,
              /\braise[sd]?\s+[\d,.]+\s*(million|mn|billion|bn|crore|cr|lakh)\b/i,
              /\$[\d,.]+\s*(million|mn|billion|bn)\s+(round|fund|corpus)\b/i,
              /\b(lead[s]?|led)\s+.{0,30}\$[\d,.]+/i,
              /\b(lead[s]?|led)\s+.{0,40}\s+round\b/i,
              /\bpocket[s]?\s+(early.stage|funding|seed)\b/i,
              /\btarget\s+corpus\b/i,
              /\banchor\s+investment\b/i,
              /\binvest[s]?\s+\$[\d,.]+/i,
              /\bsecures?\s+(rs|inr|₹)\s*[\d,]+/i,
              /\bmops?\s+up\s+(rs|inr|₹)/i,
              /\bclose[sd]?\s+\$[\d,.]+/i,
              /\bpre.ipo\s+(round|funding|raise)\b/i,
            ];
            const NOISE_FINANCIAL_RESULT = /\b(net profit|revenue jumps|revenue up|revenue rises|q[1-4] results|quarterly results|ebitda jumps|ebitda up)\b/i;
            if (!signalMatches.some(m => m.name === 'Funding') && !isNoise && !NOISE_FINANCIAL_RESULT.test(titleBuffer)) {
              if (FUNDING_REGEX_PATTERNS.some(p => p.test(titleBuffer))) {
                signalMatches.push({ name: 'Funding', priority: 1, isHeadlineSignal: true });
              }
            }

            const isHighPriority = signalMatches.some(m => m.priority <= 4);
            if (isNoise && !isHighPriority) continue; // Discard noise unless it's a major event (Funding, Acquisition, Layoffs)

            // Rule 1 & 2 Execution: Sort by Priority & Headline weight, then Cap at 2
            const topSignals = signalMatches
              .sort((a, b) => {
                if (a.isHeadlineSignal && !b.isHeadlineSignal) return -1;
                if (!a.isHeadlineSignal && b.isHeadlineSignal) return 1;
                return a.priority - b.priority;
              })
              .slice(0, 1)
              .map(s => s.name);

            const finalCategories = [...topSignals, ...industryTags];
            if (finalCategories.length === 0) finalCategories.push('Other / Unclassified');

            let detectedSource = source.name;
            let logoUrl = source.logoUrl;
            const match = majorSources.find(ms => ms.keys.some(k => creatorRaw.toLowerCase().includes(k) || titleBuffer.includes(k)));
            if (match) {
              detectedSource = match.name;
              logoUrl = match.logoUrl;
            }

            await prisma.discoveryCache.upsert({
              where: { link: item.link },
              update: {
                categories: JSON.stringify(finalCategories),
                logoUrl
              },
              create: {
                title: item.title || 'Untitled Signal',
                link: item.link,
                pubDate: validDate,
                content: descBuffer.substring(0, 5000),
                author: creatorRaw,
                source: detectedSource,
                logoUrl,
                categories: JSON.stringify(finalCategories)
              }
            }).then(result => {
              // Prisma upsert doesn't distinguish create vs update, track via a workaround
            }).catch(() => { });
            syncState.newSignalsAdded++;
          }
          await new Promise(r => setTimeout(r, 200));
        }
        console.log(`  Bridge Sync: ${source.name} completed.`);
        syncState.completedSources++;
      } catch (err) {
        console.error(`  Bridge Sync Error [${source.name}]: ${err.message}`);
      }
    }));
  }
  console.log(`[Historical Bridge]: Archival cycle completed.`);
  syncState.isSyncing = false;
  syncState.syncType = null;
  syncState.completedAt = new Date().toISOString();
  syncState.lastDeepSyncAt = syncState.completedAt;
  syncState.currentSource = null;
}

// ============================================================
// INCREMENTAL SYNC: Fast top-of-feed scan (page 1 per source)
// Runs automatically every 30 min and on non-empty boot.
// Stops early per source if first item already exists in DB.
// ============================================================
async function runIncrementalSync() {
  if (syncState.isSyncing) return; // Never double-run
  const activeSources = await prisma.rssSource.findMany({ where: { isActive: true } });
  syncState.isSyncing = true;
  syncState.syncType = 'incremental';
  syncState.startedAt = new Date().toISOString();
  syncState.completedAt = null;
  syncState.totalSources = activeSources.length;
  syncState.completedSources = 0;
  syncState.currentSource = null;
  syncState.newSignalsAdded = 0;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  // Full classification engine — same logic as runDeepSync so every new article is properly tagged on ingestion
  const _incSignals = [
    { name: 'Funding', priority: 1, strong: ['raises', 'funding', 'fundraise', 'series a', 'series b', 'series c', 'pre-seed', 'seed round', 'raised', 'closes funding', 'investment from', 'valuation hits', 'valuation of', 'funding from', 'secures funding', 'bags funding', 'capital infusion', 'mops up', 'infuses capital', 'investment round', 'strategic investment', 'invests', 'investment', 'infusion', 'capital', 'backed by', 'qip', 'capital raise', 'fundraising', 'leads round', 'lead the round', 'lead round', 'anchor investment', 'million round', 'crore round', 'pocket early-stage', 'pocket funding', 'early-stage cheques', 'pours into', 'pumps into', 'bets on', 'backs startup', 'early stage cheques', 'million funding', 'crore funding', 'million investment', 'crore investment', 'mn funding', 'mn investment', 'lakh funding'], supporting: ['venture capital', 'vcs', 'investors', 'funding round', 'capital injection', 'equity', 'convertible note', 'debt funding', 'angel funding', 'bridge round', 'funding news', 'fund raise', 'capital raise', 'investment in', 'startup funding', 'equity financing', 'participation', 'led by', 'shares sold', 'secondary sale', 'round', 'million', 'crore', 'mn', 'lakh', 'anchor', 'backed', 'cheques', 'bet'] },
    { name: 'Shutdown', priority: 2, strong: ['shuts down', 'ceases operations', 'closure of', 'bankruptcy', 'winding up', 'stops operations', 'halting operations'], supporting: ['insolvency', 'nclt filing', 'no longer operational', 'suspends services', 'folds', 'winding down', 'end of operations', 'failure', 'out of business'] },
    { name: 'Layoffs', priority: 3, strong: ['layoffs', 'lays off', 'job cuts', 'retrenchment', 'downsizing', 'workforce reduction', 'mass layoff', 'slashes jobs', 'cuts workforce', 'restructuring'], supporting: ['pink slips', 'let go', 'rightsizing', 'headcount reduction', 'employees fired', 'mass termination', 'cost cutting', 'redundancies', 'job losses', 'cutting jobs'] },
    { name: 'Acquisition', priority: 4, strong: ['acquires', 'acquired', 'acquiring', 'acquisition of', 'takeover', 'acqui-hire', 'merger with', '100% stake purchase', 'buys startup', 'purchase of', 'in talks to acquire', 'proposed acquisition', 'stake acquisition', 'majority stake in'], supporting: ['strategic acquisition', 'all-stock deal', 'asset purchase', 'takes over', 'absorbed by', 'majority stake', 'buyout', 'controlling interest', 'merger talk', 'acqui-hire deal', 'share swap', 'term sheet for acquisition'] },
    { name: 'Pivot', priority: 5, strong: ['pivots', 'shifts focus to', 'new direction', 'pivoting to', 'pivoting from', 'business model change', 'strategic overhaul'], supporting: ['restructures', 'reinvents', 'overhauls strategy', 'moves away from', 'no longer focuses on', 'transition to', 'rebrands as', 'sunsets', 'change of direction', 'new strategy'] },
    { name: 'Funding Ask', priority: 6, strong: ['in talks to raise', 'seeking investment', 'discussions with investors', 'looking to close', 'eyeing fundraise', 'plans to raise', 'seeking capital'], supporting: ['approaching vcs', 'expected to close', 'term sheet', 'due diligence ongoing', 'roadshow', 'scouting investors', 'fundraising round planned', 'investor meetings', 'pitching to investors'] },
    { name: 'Revenue Milestone', priority: 7, strong: ['turns profitable', 'achieves breakeven', 'crosses arr', 'revenue milestone', 'ebitda positive', 'pat positive', 'clocks revenue', 'gross profit', 'profitable'], supporting: ['first profitable quarter', 'operating profit', 'mrr crosses', 'gmv milestone', 'revenue hits', 'gross profit positive', 'profitability achieved', 'revenue growth', 'revenue clocks'] },
    { name: 'Startup Launch', priority: 8, strong: ['launches startup', 'founded in', 'new startup', 'debuts', 'coming out of stealth', 'stealth mode', 'founders start', 'unveils startup', 'enters the market', 'incorporated', 'starts up'], supporting: ['co-founded', 'venture launched', 'bootstrapped', 'early-stage', 'new venture', 'spin-off', 'fresh off', 'starting up', 'new player', 'enters sector', 'commences ops', 'kickstarts', 'startup', 'new company'] },
    { name: 'Product News / Launch', priority: 9, strong: ['launches product', 'new feature', 'releases feature', 'unveils new', 'rolls out feature', 'rolls out', 'goes live', 'announces launch', 'beta launch', 'general availability', 'debuts new', 'expansion into', 'enters market', 'launches expansion'], supporting: ['releases', 'unveils', 'introduces', 'now available', 'new offering', 'app update', 'platform expansion', 'new vertical', 'product reveal', 'expansion', 'debuts', 'feature', 'update'] },
    { name: 'Founder Story / Profile', priority: 10, strong: ['founder op-ed', 'founder profile', 'in conversation with', 'interview with founder', 'exclusive interview', 'founder exclusive', 'interview with ceo', 'founder speaks', 'co-founder says', 'story of', 'how it started'], supporting: ['opinion', 'thought leadership', 'vision', 'roadmap', 'op-ed by', 'startup journey', 'lessons from', 'in their own words', 'built', 'started by', 'founder story'] },
    { name: 'Partnership', priority: 11, strong: ['partners with', 'partnership', 'collaboration', 'tie-up', 'signs mou', 'strategic alliance', 'joins hands with', 'teams up'], supporting: ['joint venture', 'collaboration with', 'agreement', 'mou', 'strategic partnership', 'synergy', 'cooperation'] },
    { name: 'Expansion', priority: 12, strong: ['expands to', 'enters new market', 'new city', 'global footprint', 'opens office', 'expansion plan', 'geographical expansion', 'launches in', 'sets up base', 'opens its first'], supporting: ['new region', 'scaling up', 'international market', 'domestic expansion', 'wider reach', 'new territory', 'expansion', 'scaling', 'growth', 'expanding', 'presence in', 'new base'] },
    { name: 'Regulatory / Policy', priority: 13, strong: ['regulatory update', 'complies with', 'government policy', 'new guidelines', 'rbi directive', 'sebi order', 'gdpr', 'compliance', 'framework', 'guidelines', 'privacy fine', 'gdpr fine', 'data protection law'], supporting: ['regulation', 'statutory', 'legal framework', 'government mandate', 'notification', 'official order', 'central government', 'privacy policy', 'penalty', 'fine imposed'] },
    { name: 'Leadership / People', priority: 14, strong: ['appoints', 'new ceo', 'new cto', 'hires', 'leadership change', 'board of directors', 'joins as', 'stepping down', 'exit of', 'leaves role', 'resigns', 'transition from', 'new role', 'promoted'], supporting: ['hr news', 'executive hire', 'appointment', 'promoted', 'people news', 'hiring talent', 'veteran joins', 'industry veteran', 'career move'] },
    { name: 'Legal / Litigation', priority: 15, strong: ['files suit', 'legal battle', 'court order', 'litigation', 'lawsuit', 'arbitration', 'dispute', 'notice from', 'legal action', 'court scraps', 'won appeal', 'legal win'], supporting: ['court stay', 'appeals court', 'petition', 'complaint', 'legal case', 'hearing', 'judgment', 'appeal', 'fine', 'won its appeal'] },
    { name: 'Ecosystem News', priority: 16, strong: ['daily roundup', 'startup news', 'mid-day news', 'news updates', 'roundup', 'daily digest', 'weekly news', 'bulletin', 'accelerator', 'applications open'], supporting: ['latest updates', 'top stories', 'happening today', 'morning briefing', 'startup updates', 'cohort', 'program', 'applications for'] },
    { name: 'Market Insights / Reports', priority: 17, strong: ['best of', 'top 10', 'review', 'comparison', 'market report', 'industry insights', 'top tools', 'product review'], supporting: ['ranking', 'curated list', 'analysis', 'research', 'landscape', 'market analysis', 'buying guide', 'recommendations'] },
    { name: 'Tech Guides / Tutorials', priority: 18, strong: ['how to', 'tutorial', 'guide', 'how-to', 'step by step', 'setup', 'unblock', 'access', 'watch', 'configuring'], supporting: ['walkthrough', 'instructions', 'tips', 'tricks', 'manual', 'help', 'troubleshoot', 'setup guide'] },
    { name: 'Trends / Future Tech', priority: 19, strong: ['future of', 'will ai', 'impact of', 'the end of', 'state of', 'trends in', 'outlook', 'prediction', 'predicts', 'visionary', 'paradigm shift', 'could revolutionize', 'will transform', 'will reshape', 'will disrupt'], supporting: ['analysis', 'forecast', 'landscape', 'potential', 'opportunity', 'transforming', 'shaping', 'evolution', 'long-term', 'innovation', 'vision', 'transformation'] },
    { name: 'Product Review / Opinion', priority: 20, strong: ['meet the', 'review', 'opinion', 'hands-on', 'verdict', 'awful', 'brilliant', 'critique', 'comparison', 'vs', 'rebranding', 'unveiled'], supporting: ['feedback', 'rating', 'user experience', 'performance', 'testing', 'quality', 'benchmark', 'editor choice', 'first look'] },
    { name: 'Innovation / Breakthrough', priority: 21, strong: ['breakthrough', 'innovation', 'unveils tech', 'pioneers', 'first ever', 'new technique', 'advanced technology'], supporting: ['showcases', 'demonstrates', 'case study', 'experimental', 'scientific advancement', 'technological leap'] }
  ];
  const _incIndustry = [
    { name: 'Fintech', keys: ['payments', 'lending', 'insurtech', 'wealthtech', 'fintech', 'banking', 'upi', 'neobank', 'wealth management', 'insurance', 'finance', 'trading'] },
    { name: 'EdTech', keys: ['edtech', 'learning', 'classroom', 'skill development', 'tutoring', 'academy', 'education', 'school'] },
    { name: 'HealthTech', keys: ['digital health', 'medtech', 'healthtech', 'medical', 'healthcare', 'clinics', 'diagnostics', 'telemedicine', 'biotech', 'pharma', 'drugs', 'medicine', 'pharmacy', 'e-pharmacy'] },
    { name: 'MobilityTech', keys: ['ride-hailing', 'electric mobility', 'autonomous vehicles', 'ride sharing', 'scooters', 'aviation', 'flight', 'automotive', 'cars', 'vehicles', 'uber', 'ola', 'rapido', 'taxi', 'cab'] },
    { name: 'FoodTech', keys: ['foodtech', 'cloud kitchen', 'food delivery', 'grocery delivery', 'restaurant tech', 'food subscription', 'beverages', 'cooking', 'nutrition'] },
    { name: 'TravelTech', keys: ['traveltech', 'hotel booking', 'tourism', 'travel agency', 'hospitality tech', 'resort', 'vacation'] },
    { name: 'AI / ML', keys: ['generative ai', 'computer vision', 'nlp', 'artificial intelligence', 'machine learning', 'llm', 'deep learning', 'automation', 'chatgpt', 'openai', 'gemini ai', 'claude', 'ai model', 'neural network', 'gpt', 'ai agent', 'ai coding'] },
    { name: 'Cybersecurity', keys: ['cybersecurity', 'encryption', 'firewall', 'data protection', 'hacking', 'threat detection', 'data breach', 'vpn', 'malware', 'ransomware', 'phishing', 'antivirus', 'security vulnerability'] },
    { name: 'Web3 / Blockchain', keys: ['web3', 'blockchain', 'crypto', 'nft', 'decentralized', 'defi', 'ethereum', 'bitcoin', 'smart contracts', 'token'] },
    { name: 'ClimateTech / Sustainability', keys: ['climatetech', 'sustainability', 'carbon credit', 'waste management', 'esg', 'green tech', 'renewable energy'] },
    { name: 'AgriTech', keys: ['agritech', 'farming', 'agriculture', 'harvest', 'farmer', 'grains', 'organic'] },
    { name: 'CleanTech / EV', keys: ['electric', 'cleantech', 'ev', 'battery', 'solar', 'wind', 'charging', 'green energy'] },
    { name: 'Future of Work / HRTech', keys: ['hrtech', 'remote work', 'talent acquisition', 'hiring', 'payroll', 'workforce management', 'recruitment', 'future of work'] },
    { name: 'Developer Infrastructure / Cloud', keys: ['devops', 'cloud infrastructure', 'cloud native', 'api', 'serverless', 'kubernetes', 'aws', 'azure', 'github', 'docker', 'ci/cd', 'data center', 'cloud computing', 'database'] },
    { name: 'Social / Community Platforms', keys: ['social media', 'community platform', 'networking', 'social network', 'dating app', 'content platform', 'short video', 'creator economy'] },
    { name: 'SaaS / B2B', keys: ['enterprise software', 'martech', 'saas', 'b2b', 'software-as-a-service', 'crm', 'workflow', 'digital transformation'] },
    { name: 'D2C / E-Commerce', keys: ['consumer brands', 'quick commerce', 'fashion', 'd2c', 'e-commerce', 'omnichannel', 'retail', 'marketplace', 'wellness', 'beauty', 'direct-to-consumer', 'personal care', 'jewellery', 'apparel'] },
    { name: 'LogisTech', keys: ['warehousing', 'last-mile delivery', 'logistics', 'delivery', 'fleet', 'shipping', 'freight', 'trucking'] },
    { name: 'SpaceTech / DeepTech', keys: ['semiconductors', 'spacetech', 'deeptech', 'satellite', 'isro', 'robotics', 'space exploration', 'quantum', 'chip', 'chipset', 'semiconductor', 'nvidia', 'amd', 'intel', 'qualcomm'] },
    { name: 'Gaming / Media', keys: ['gaming', 'esports', 'streaming', 'entertainment', 'ott', 'movies', 'music', 'tv series', 'video game'] },
    { name: 'Real Estate Tech', keys: ['proptech', 'real estate', 'property', 'homebuying', 'coworking', 'housing'] },
    { name: 'Government / Policy', keys: ['regulatory', 'government', 'ministry', 'policy', 'framework', 'guidelines', 'law', 'compliance', 'taxation', 'gst', 'cabinet', 'sebi', 'regulator'] },
    { name: 'Manufacturing / Industrial', keys: ['manufacturing', 'factory', 'industrial', 'hardware', 'assembly', 'production', 'raw materials', 'machinery', 'make in india', 'pli scheme', 'capacity expansion'] },
    { name: 'Big Tech / Consumer Software', keys: ['microsoft', 'apple', 'google', 'meta', 'amazon', 'firefox', 'windows', 'browser', 'operating system', 'software update', 'big tech', 'consumer tech', 'adobe', 'iphone', 'ipad', 'macbook', 'pixel', 'samsung', 'android', 'ios', 'app store', 'play store', 'chrome', 'safari', 'smartphone', 'linkedin', 'whatsapp', 'instagram', 'twitter', 'reddit', 'youtube', 'netflix', 'spotify'] },
    { name: 'Telecom / Infrastructure', keys: ['telecom', 'fiber', '5g', '6g', 'network', 'broadband', 'infrastructure', 'connectivity', 'jio', 'airtel', 'vodafone', 'bsnl', 'spectrum', 'tower', 'starlink', 'wifi'] }
  ];
  const _incMatch = (text, keys) => keys.some(k => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));
  const _incCount = (text, keys) => keys.filter(k => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)).length;

  console.log(`[Incremental Sync]: Starting classified top-of-feed scan for ${activeSources.length} sources...`);

  for (let i = 0; i < activeSources.length; i += 5) {
    const batch = activeSources.slice(i, i + 5);
    await Promise.all(batch.map(async (source) => {
      try {
        syncState.currentSource = source.name;
        const feed = await parser.parseURL(source.url).catch(() => null);
        if (!feed || !feed.items || feed.items.length === 0) {
          syncState.completedSources++;
          return;
        }

        let newItems = 0;
        for (const item of feed.items) {
          if (!item.link) continue;
          const rawDate = item.isoDate || item.pubDate || item.date;
          const validDate = rawDate ? new Date(rawDate) : null;
          if (!validDate || isNaN(validDate.getTime()) || validDate < sixMonthsAgo) continue;

          // Check if this item is already in DB — if so, this source is up-to-date, skip rest
          const exists = await prisma.discoveryCache.findUnique({ where: { link: item.link }, select: { id: true } });
          if (exists) continue; // Item already indexed, try next item in case order differs

          const creatorRaw = item.creator || item.author || 'Editorial Team';
          const titleBuffer = (item.title || '').toLowerCase();
          const descBuffer = (item.contentSnippet || item.content || '').toLowerCase();

          // Quick noise check
          const isNoise = ['sensex', 'nifty', 'bse', 'nse', 'dalal street', 'stock market', 'share price',
            'rupee vs', 'rupee falls', 'reliance industries', 'mukesh ambani', 'adani',
            'bajaj finance', 'hdfc bank', 'icici bank', 'state bank of india', 'sbi',
            'dividend', 'mutual fund', 'petrol price', 'diesel price', 'gold price', 'silver price',
            'bond yield', 'crude oil', 'opec', 'oil prices', 'ukraine', 'russia', 'inflation'
          ].some(key => new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(titleBuffer));
          if (isNoise) continue;

          const _sm = [];
          const fullBuffer = titleBuffer + ' ' + descBuffer;
          _incSignals.forEach(sc => {
            const inH = _incMatch(titleBuffer, sc.strong) || _incCount(titleBuffer, sc.supporting) >= 2;
            const tS = _incCount(titleBuffer, sc.strong); const tSup = _incCount(titleBuffer, sc.supporting);
            const bS = _incCount(descBuffer, sc.strong); const bSup = _incCount(descBuffer, sc.supporting);
            if ((tS + bS) >= 1 || (tSup + bSup) >= 2) _sm.push({ name: sc.name, priority: sc.priority, isHeadlineSignal: inH });
          });
          // Supplemental regex Funding detection (dollar amounts break word-boundary keyword matching)
          const INC_FUNDING_REGEX = [
            /\braise[sd]?\s+\$[\d,.]+/i,
            /\braise[sd]?\s+[\d,.]+\s*(million|mn|billion|bn|crore|cr|lakh)\b/i,
            /\$[\d,.]+\s*(million|mn|billion|bn)\s+(round|fund|corpus)\b/i,
            /\b(lead[s]?|led)\s+.{0,40}\s+round\b/i,
            /\bpocket[s]?\s+(early.stage|funding|seed)\b/i,
            /\btarget\s+corpus\b/i, /\banchor\s+investment\b/i,
            /\binvest[s]?\s+\$[\d,.]+/i,
            /\bsecures?\s+(rs|inr|₹)\s*[\d,]+/i,
            /\bpre.ipo\s+(round|funding|raise)\b/i,
          ];
          const INC_NOISE_RESULT = /\b(net profit|revenue jumps|revenue up|q[1-4] results|quarterly results|ebitda jumps)\b/i;
          if (!_sm.some(m => m.name === 'Funding') && !INC_NOISE_RESULT.test(titleBuffer)) {
            if (INC_FUNDING_REGEX.some(p => p.test(titleBuffer))) {
              _sm.push({ name: 'Funding', priority: 1, isHeadlineSignal: true });
            }
          }
          const topSignals = _sm.sort((a, b) => {
            if (a.isHeadlineSignal && !b.isHeadlineSignal) return -1;
            if (!a.isHeadlineSignal && b.isHeadlineSignal) return 1;
            return a.priority - b.priority;
          }).slice(0, 1).map(s => s.name);
          const industryTags = _incIndustry.filter(v => _incMatch(fullBuffer, v.keys)).map(v => v.name);
          const finalCategories = [...topSignals, ...industryTags];
          if (finalCategories.length === 0) finalCategories.push('Other / Unclassified');

          await prisma.discoveryCache.create({
            data: {
              title: item.title || 'Untitled Signal',
              link: item.link,
              pubDate: validDate,
              content: descBuffer.substring(0, 5000),
              author: creatorRaw,
              source: source.name,
              logoUrl: source.logoUrl,
              categories: JSON.stringify(finalCategories)
            }
          }).catch(() => { }); // Ignore duplicate key errors
          newItems++;
          syncState.newSignalsAdded++;
        }
        console.log(`  Incremental: ${source.name} → +${newItems} new signals`);
        syncState.completedSources++;
      } catch (err) {
        console.error(`  Incremental Sync Error [${source.name}]: ${err.message}`);
        syncState.completedSources++;
      }
    }));
  }

  syncState.isSyncing = false;
  syncState.syncType = null;
  syncState.completedAt = new Date().toISOString();
  syncState.lastIncrementalSyncAt = syncState.completedAt;
  syncState.currentSource = null;
  console.log(`[Incremental Sync]: Done. ${syncState.newSignalsAdded} new signals added.`);
}

// ============================================================
// DATA RETENTION: Auto-Cleanup Job
// Deletes signals older than 1 year (unless they are bookmarked)
// Keeps database lean and fast to query.
// ============================================================
async function runDataRetentionCleanup() {
  console.log('[Data Retention]: Running historical cache cleanup...');
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  try {
    const { count } = await prisma.discoveryCache.deleteMany({
      where: {
        pubDate: { lt: sixMonthsAgo },
        isBookmarked: false // Crucial: Never delete signals the admin saved
      }
    });

    if (count > 0) {
      console.log(`[Data Retention]: Pruned ${count} old, unbookmarked signals from database.`);
    } else {
      console.log('[Data Retention]: Database is fully optimized. No old records to prune.');
    }
  } catch (err) {
    console.error('[Data Retention Cleanup Error]:', err.message);
  }
}


// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`Server listening on port ${port}`)

    // Smart Boot Strategy:
    // • DB is empty → Full deep scan (first-time setup)
    // • DB has data → Only incremental scan (fast, non-destructive)
    const totalCached = await prisma.discoveryCache.count();

    if (totalCached === 0) {
      console.log('[Boot]: DB is empty. Running full historical Deep Sync (one-time setup)...');
      runDeepSync().catch(err => console.error('Initial Deep Sync Failed:', err));
    } else {
      console.log(`[Boot]: DB has ${totalCached} signals. Running lightweight Incremental Sync...`);
      runIncrementalSync().catch(err => console.error('Boot Incremental Sync Failed:', err));
    }

    // Periodic Incremental Sync every 30 minutes (lightweight — page 1 per source only)
    setInterval(() => {
      if (!syncState.isSyncing) {
        console.log('[Scheduler]: Triggering periodic incremental sync...');
        runIncrementalSync().catch(err => console.error('Periodic Incremental Sync Failed:', err));
      } else {
        console.log('[Scheduler]: Skipped — sync already in progress.');
      }
    }, 30 * 60 * 1000);

    // Boot trigger for Data Retention 
    runDataRetentionCleanup();

    // Periodic Data Retention Clean-up (runs once every 24 hours)
    setInterval(() => {
      runDataRetentionCleanup();
    }, 24 * 60 * 60 * 1000);

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

start()
