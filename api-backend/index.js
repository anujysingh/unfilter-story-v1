import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import Parser from 'rss-parser'

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

// === USER API ROUTES ===
fastify.get('/cms/v1/users', async (request, reply) => {
  try {
    const users = await prisma.cmsUser.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return users
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch users' })
  }
})

fastify.post('/cms/v1/users', async (request, reply) => {
  try {
    const { email, firstName, lastName, role, designation } = request.body
    
    // In a real app, we'd send an invite email and hash a temporary password
    // For this build, we'll create a placeholder user
    const user = await prisma.cmsUser.create({
      data: {
        email,
        firstName,
        lastName,
        role: role || 'Editor',
        designation,
        passwordHash: 'placeholder', // Required by schema
        isActive: true
      }
    })
    return user
  } catch (error) {
    fastify.log.error(error)
    if (error.code === 'P2002') {
      return reply.code(400).send({ error: 'A user with this email already exists' })
    }
    reply.code(500).send({ error: 'Failed to create user' })
  }
})

fastify.put('/cms/v1/users/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const { role, isActive, designation } = request.body
    const user = await prisma.cmsUser.update({
      where: { id },
      data: { role, isActive, designation }
    })
    return user
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to update user' })
  }
})

fastify.delete('/cms/v1/users/:id', async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.cmsUser.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to delete user' })
  }
})

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
      dateFilter = 'all'
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

    // 3. Category Filter
    if (categories) {
      const catList = categories.split(',');
      where.OR = catList.map(cat => ({
        categories: { contains: cat }
      }));
    }

    // 4. Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === '7d') {
        where.pubDate = { gte: new Date(now.setDate(now.getDate() - 7)) };
      } else if (dateFilter === '15d') {
        where.pubDate = { gte: new Date(now.setDate(now.getDate() - 15)) };
      } else if (dateFilter === '30d') {
        where.pubDate = { gte: new Date(now.setDate(now.getDate() - 30)) };
      }
    }

    // Initial source check
    const sourcesCount = await prisma.rssSource.count();
    if (sourcesCount === 0) {
      const initialSources = [
        { name: 'Inc42 Funding', url: 'https://inc42.com/tag/funding/feed/' },
        { name: 'YourStory', url: 'https://yourstory.com/feed' },
        { name: 'Entrackr', url: 'https://entrackr.com/rss' },
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/small-biz/startups/rssfeeds/11959139.cms' },
        { name: 'StartupNews.fyi', url: 'https://startupnews.fyi/feed/' },
        { name: 'Trak.in Startups', url: 'https://trak.in/feed' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/home_page_top_stories.rss' },
        { name: 'VCCircle Alternative', url: 'https://www.livemint.com/rss/companies' },
        { name: 'StartupTalky', url: 'https://startuptalky.com/rss' },
        { name: 'IndianStartupTimes', url: 'https://www.indianstartuptimes.com/feed' },
        { name: 'TOI Business', url: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms' }
      ];
      for (const s of initialSources) {
        await prisma.rssSource.create({ data: s }).catch(() => {});
      }
    }

    const cacheCount = await prisma.discoveryCache.count();
    const shouldSync = sync === 'true' || sync === true || cacheCount === 0;

    if (shouldSync) {
      const activeSources = await prisma.rssSource.findMany({ where: { isActive: true } });
      const majorSources = [
        { name: 'Inc42', keys: ['inc42'] },
        { name: 'YourStory', keys: ['yourstory'] },
        { name: 'Entrackr', keys: ['entrackr', 'entracker'] },
        { name: 'Economic Times', keys: ['economic times', 'et auto', 'et tech'] },
        { name: 'Business Standard', keys: ['business standard'] },
        { name: 'VCCircle', keys: ['vccircle'] },
        { name: 'Trak.in', keys: ['trak.in', 'trakin'] },
        { name: 'LiveMint', keys: ['livemint', 'mint'] },
        { name: 'StartupTalky', keys: ['startuptalky'] },
        { name: 'IndianStartupTimes', keys: ['indianstartuptimes', 'indian startup times'] },
        { name: 'Times of India', keys: ['times of india', 'toi'] },
        { name: 'PNN', keys: ['pnn', 'press note network'] },
        { name: 'PTI', keys: ['pti', 'press trust of india'] },
        { name: 'ANI', keys: ['ani news'] },
        { name: 'Search Engine Journal', keys: ['search engine journal', 'sej'] }
      ];

      for (const source of activeSources) {
        try {
          console.log(`Deep Sync: Starting scan for ${source.name}...`);
          // Archive Recovery: Fetch up to 10 pages of historical data
          const pagesToFetch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
          for (const pageNum of pagesToFetch) {
            let fetchUrl = source.url;
            if (pageNum > 1) {
               // Support multiple pagination styles
               const separator = fetchUrl.includes('?') ? '&' : '?';
               // Add both common pagination params to be safe, or try sequentially
               fetchUrl += `${separator}paged=${pageNum}&page=${pageNum}`;
            }

            console.log(`  Scanning Depth ${pageNum}: ${fetchUrl}`);
            const feed = await parser.parseURL(fetchUrl);
            
            if (!feed.items || feed.items.length === 0) {
              console.log(`  Depth ${pageNum} empty. Stopping scan.`);
              break;
            }

            for (const item of feed.items) {
              const authorRaw = item.creator || item.author || 'Editorial Team';
              const authorLower = authorRaw.toLowerCase();
              const titleLower = (item.title || '').toLowerCase();
              
              let detectedSource = source.name; 
              const match = majorSources.find(ms => 
                ms.keys.some(k => authorLower.includes(k) || titleLower.includes(k))
              );
              
              if (match) detectedSource = match.name;

              var dateObj = item.pubDate ? new Date(item.pubDate) : new Date();
              var validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

              await prisma.discoveryCache.upsert({
                where: { link: item.link },
                update: {}, 
                create: {
                  title: item.title || 'Untitled Signal',
                  link: item.link,
                  pubDate: validDate,
                  content: (item.contentSnippet || item.content || item.description || item.summary || '').substring(0, 5000),
                  author: authorRaw,
                  source: detectedSource,
                  categories: JSON.stringify(item.categories || [])
                }
              }).catch(() => {});
            }
          }
        } catch (err) {
          console.error(`Deep Sync failed for ${source.name}: ${err.message}`);
        }
      }
    }

    const total = await prisma.discoveryCache.count({ where });
    const items = await prisma.discoveryCache.findMany({
      where,
      orderBy: { pubDate: 'desc' },
      skip,
      take
    });

    return {
      items: items.map(i => ({
        ...i,
        categories: JSON.parse(i.categories || '[]')
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to process discovery stream' });
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
