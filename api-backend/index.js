import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const fastify = Fastify({
  logger: true,
  bodyLimit: 52428800 // 50MB
})

const prisma = new PrismaClient()

// Register CORS
fastify.register(cors, {
  origin: '*', // For local dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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

// === CMS API ROUTES ===
fastify.post('/cms/v1/articles', async (request, reply) => {
  try {
    const { headline, body, categoryId, category, tags, status, publishedAt, featuredImageUrl } = request.body
    
    // Slugify the headline. Fallback to generic if empty.
    const slugBasis = headline || 'untitled'
    const slug = slugBasis.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // Resolve categoryId if a name was sent
    let finalCategoryId = categoryId
    if (!finalCategoryId && category) {
      const cat = await prisma.category.findFirst({ 
        where: { name: { equals: category } } // SQLite is case-insensitive for some operations, but Prisma helps here
      })
      if (cat) finalCategoryId = cat.id
    }

    // Process Tags: find existing or create new ones
    let finalTagIds = []
    if (tags && Array.isArray(tags)) {
      for (const t of tags) {
        let tag = await prisma.tag.findFirst({ 
          where: { OR: [
            { id: t }, 
            { name: { equals: t } }, 
            { slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          ] } 
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
              where: { OR: [
                { id: t }, 
                { name: { equals: t } }, 
                { slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
              ] } 
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

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`Server listening on port ${port}`)
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
