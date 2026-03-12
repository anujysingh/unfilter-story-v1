import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const fastify = Fastify({
  logger: true
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
    const { headline, body, categoryId, tags, status } = request.body
    
    // Slugify the headline. Fallback to generic if empty.
    const slugBasis = headline || 'untitled'
    const slug = slugBasis.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const article = await prisma.article.create({
      data: {
        headline: headline || 'Untitled',
        slug,
        body: body || '',
        status: status || 'draft',
        categoryId: categoryId || null,
        publishedAt: status === 'published' ? new Date() : null,
        // Just hardcoding some mock data for the un-implemented relational fields
        readingTimeMins: Math.ceil((body || '').split(' ').length / 200) || 1,
        articleTags: tags && tags.length > 0 ? {
          create: tags.map(tagId => ({ tagId }))
        } : undefined
      }
    })
    return article
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to create article' })
  }
})

fastify.get('/cms/v1/articles', async (request, reply) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return articles
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
    const { headline, body, status, categoryId, tags } = request.body
    
    // Slugify the headline
    const slug = headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const article = await prisma.article.update({
      where: { id },
      data: {
        headline,
        slug,
        body,
        status: status || 'draft',
        categoryId: categoryId || null,
        // Optional: reading time
        readingTimeMins: Math.ceil(body.split(' ').length / 200) || 1
      }
    })
    
    if (tags !== undefined) {
       await prisma.articleTag.deleteMany({ where: { articleId: id } })
       if (tags && tags.length > 0) {
          await prisma.articleTag.createMany({
             data: tags.map(tagId => ({ articleId: id, tagId }))
          })
       }
    }
    
    return article
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to update article' })
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
