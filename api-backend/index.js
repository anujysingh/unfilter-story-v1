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

    // 3. Category Filter
    if (categories) {
      const catList = categories.split(',');
      where.OR = catList.map(cat => ({
        categories: { contains: cat }
      }));
    }

    // 4. Date Filter + Dynamic 1-Year 'Lifecycle' Threshold
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    let gteDate = oneYearAgo; 
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
      const filterDate = new Date();
      if (dateFilter === '24h') filterDate.setHours(now.getHours() - 24);
      else if (dateFilter === '48h') filterDate.setHours(now.getHours() - 48);
      else if (dateFilter === '7d') filterDate.setDate(now.getDate() - 7);
      else if (dateFilter === '15d') filterDate.setDate(now.getDate() - 15);
      else if (dateFilter === '3m') filterDate.setMonth(now.getMonth() - 3);
      
      if (filterDate > oneYearAgo) gteDate = filterDate;
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
        { name: 'Entrackr', url: 'https://entrackr.com/feed/', logoUrl: 'https://www.google.com/s2/favicons?domain=entrackr.com&sz=128' },
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
        { name: 'TICE News', url: 'https://www.tice.news/category/startup-story/feed/', logoUrl: 'https://www.google.com/s2/favicons?domain=tice.news&sz=128' },
        { name: 'StartupNews.fyi', url: 'https://startupnews.fyi/feed/', logoUrl: 'https://play-lh.googleusercontent.com/SI26dmhoYzDnpUoEm1pQpRECb8o6GKkUV8wOOnKWRSLVWdA6ln6Wshw1jHH-DNt0yg' },
        { name: 'Google News', url: 'https://news.google.com/rss/search?q=Indian+Startup+News&hl=en-IN&gl=IN&ceid=IN:en', logoUrl: 'https://www.google.com/s2/favicons?domain=news.google.com&sz=128' }
      ];
      for (const s of initialSources) {
        await prisma.rssSource.upsert({ 
          where: { url: s.url },
          update: { name: s.name, logoUrl: s.logoUrl },
          create: { ...s, isActive: true } 
        }).catch(() => {});
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

// Historical Archival Engine: Deep Sync Core
async function runDeepSync() {
  const activeSources = await prisma.rssSource.findMany({ where: { isActive: true } });
  
    const industryVerticals = [
      { name: 'Fintech', keys: ['payments', 'lending', 'insurtech', 'wealthtech', 'regtech', 'fintech', 'banking', 'upi', 'neobank', 'wealth management', 'insurance', 'stock brokerage'] },
      { name: 'EdTech', keys: ['k-12', 'higher education', 'upskilling', 'test prep', 'edtech', 'learning', 'classroom', 'skill development', 'tutoring', 'academy'] },
      { name: 'HealthTech', keys: ['digital health', 'medtech', 'pharmatech', 'mental health', 'healthtech', 'medical', 'healthcare', 'clinics', 'diagnostics', 'telemedicine'] },
      { name: 'MobilityTech', keys: ['mobilitytech', 'ride-hailing', 'electric mobility', 'autonomous vehicles', 'ride sharing', 'scooters', 'micro-mobility', 'urban transport', 'car sharing'] },
      { name: 'FoodTech', keys: ['foodtech', 'cloud kitchen', 'food delivery', 'grocery delivery', 'restaurant tech', 'agrifoodtech', 'food subscription'] },
      { name: 'TravelTech', keys: ['traveltech', 'hotel booking', 'tourism', 'travel agency', 'airline tech', 'staycation', 'hospitality tech'] },
      { name: 'AI / ML', keys: ['generative ai', 'computer vision', 'nlp', 'ai infrastructure', 'ai/ml', 'artificial intelligence', 'machine learning', 'llm', 'deep learning', 'automation'] },
      { name: 'Cybersecurity', keys: ['cybersecurity', 'encryption', 'firewall', 'data protection', 'hacking', 'threat detection', 'security software', 'identity management', 'zero trust'] },
      { name: 'Web3 / Blockchain', keys: ['web3', 'blockchain', 'crypto', 'nft', 'decentralized', 'metaverse', 'defi', 'ethereum', 'bitcoin', 'smart contracts', 'dao'] },
      { name: 'ClimateTech / Sustainability', keys: ['climatetech', 'sustainability', 'carbon credit', 'circular economy', 'waste management', 'esg', 'environmental', 'green tech', 'renewable energy'] },
      { name: 'AgriTech', keys: ['precision farming', 'supply chain', 'agrifinance', 'agritech', 'farming', 'agriculture', 'harvest', 'farmer', 'agrifood'] },
      { name: 'CleanTech / EV', keys: ['electric vehicles', 'cleantech', 'ev', 'battery', 'solar', 'wind', 'charging infrastructure'] },
      { name: 'Future of Work / HRTech', keys: ['hrtech', 'remote work', 'talent acquisition', 'hiring', 'payroll', 'workforce management', 'recruitment', 'future of work', 'employee engagement'] },
      { name: 'Developer Infrastructure / Cloud', keys: ['devops', 'cloud infrastructure', 'backend', 'cloud native', 'api', 'serverless', 'kubernetes', 'aws', 'azure', 'dev tools', 'infrastructure-as-code'] },
      { name: 'Social / Community Platforms', keys: ['social media', 'community platform', 'networking', 'social network', 'dating app', 'content platform', 'short video', 'creator economy'] },
      { name: 'SaaS / B2B', keys: ['enterprise software', 'martech', 'saas', 'b2b', 'software-as-a-service', 'crm', 'workflow', 'clouddays'] },
      { name: 'D2C / E-Commerce', keys: ['consumer brands', 'quick commerce', 'fashion', 'd2c', 'e-commerce', 'omnichannel', 'retail', 'marketplace', 'wellness', 'beauty', 'direct-to-consumer', 'personal care', 'jewellery', 'apparel', 'direct to consumer'] },
      { name: 'LogisTech', keys: ['supply chain', 'warehousing', 'last-mile delivery', 'logistech', 'logistics', 'delivery', 'fleet', 'shipping', 'freight'] },
      { name: 'SpaceTech / DeepTech', keys: ['semiconductors', 'space', 'quantum', 'spacetech', 'deeptech', 'satellite', 'rocketry', 'isro', 'robotics'] },
      { name: 'Gaming / Media', keys: ['gaming', 'media', 'esports', 'publisher', 'content creation', 'streaming', 'entertainment', 'influencer economy'] },
      { name: 'Real Estate Tech', keys: ['proptech', 'construction tech', 'real estate', 'property', 'real estate tech', 'homebuying', 'coworking'] }
    ];

    const signalCategories = [
      { 
        name: 'Funding',
        priority: 1,
        strong: ['raises', 'funding', 'fundraise', 'series a', 'series b', 'series c', 'pre-seed', 'seed round', 'raised', 'closes funding', 'investment from', 'valuation hits', 'valuation of', 'funding from', 'secures funding', 'bags funding', 'capital infusion', 'mops up', 'infuses capital', 'investment round', 'strategic investment'],
        supporting: ['venture capital', 'vcs', 'investors', 'funding round', 'capital injection', 'equity', 'convertible note', 'debt funding', 'angel funding', 'bridge round', 'funding news', 'fund raise', 'checks into', 'capital raise', 'investment in', 'startup funding', 'equity financing']
      },
      { 
        name: 'Startup Launch',
        priority: 8,
        strong: ['launches startup', 'founded in', 'new startup', 'debuts', 'coming out of stealth', 'stealth mode', 'founders start', 'unveils startup', 'enters the market', 'operational in'],
        supporting: ['co-founded', 'venture launched', 'bootstrapped', 'early-stage', 'incorporated', 'new venture', 'spin-off', 'fresh off', 'starting up', 'new player', 'enters sector', 'commences ops']
      },
      {
        name: 'Acquisition',
        priority: 4,
        strong: ['acquires', 'acquisition of', 'takeover', 'acqui-hire', 'merger with', '100% stake purchase', 'buys startup', 'purchase of'],
        supporting: ['strategic acquisition', 'all-stock deal', 'asset purchase', 'takes over', 'absorbed by', 'majority stake', 'buyout', 'controlling interest', 'merger talk', 'valuation in acquisition']
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
        strong: ['layoffs', 'lays off', 'job cuts', 'retrenchment', 'downsizing', 'workforce reduction', 'mass layoff', 'slashes jobs'],
        supporting: ['pink slips', 'let go', 'rightsizing', 'headcount reduction', 'employees fired', 'mass termination', 'cost cutting', 'redundancies', 'job losses']
      },
      {
        name: 'Product Launch',
        priority: 9,
        strong: ['launches product', 'new feature', 'releases feature', 'unveils new', 'rolls out feature', 'rolls out', 'goes live', 'announces launch', 'beta launch', 'general availability', 'debuts new'],
        supporting: ['releases', 'unveils', 'introduces', 'now available', 'v2.0', 'new offering', 'app update', 'platform expansion', 'new vertical', 'product reveal']
      },
      {
        name: 'Founder Interview',
        priority: 10,
        strong: ['founder op-ed', 'founder profile', 'in conversation with', 'interview with founder', 'exclusive interview', 'founder exclusive', 'interview with ceo', 'founder speaks', 'co-founder says', 'q&a with'],
        supporting: ['opinion', 'thought leadership', 'vision', 'roadmap', 'op-ed by', "founder's take", 'startup journey', 'lessons from', 'we sat down with', 'in their own words']
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
        strong: ['turns profitable', 'achieves breakeven', 'crosses arr', 'revenue milestone', 'ebitda positive', 'pat positive', 'clocks revenue'],
        supporting: ['first profitable quarter', 'operating profit', 'mrr crosses', 'gmv milestone', 'revenue hits', 'clocks inr cr', 'gross profit positive', 'profitability achieved', 'revenue growth']
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
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  console.log(`[Historical Bridge]: Starting deep archival scan for ${activeSources.length} sources...`);

  for (let i = 0; i < activeSources.length; i += 3) {
    const batch = activeSources.slice(i, i + 3);
    await Promise.all(batch.map(async (source) => {
      try {
        console.log(`  Bridge Sync: Processing ${source.name}...`);
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
          if (firstItemDate && firstItemDate < oneYearAgo && pageNum > 1) break;

          for (const item of feed.items) {
            const rawDate = item.isoDate || item.pubDate || item.date;
            const validDate = rawDate ? new Date(rawDate) : null;
            if (!validDate || isNaN(validDate.getTime()) || validDate < oneYearAgo) continue;

            const creatorRaw = item.creator || item.author || 'Editorial Team';
            const contentBuffer = (item.title + ' ' + (item.contentSnippet || item.content || '')).toLowerCase();
            
            // Enhanced Thematic Routing Engine (Priority + Multi-Tag + Headline Tiebreaking)
            const industryTags = [];
            const signalMatches = [];
            
            const titleBuffer = (item.title || '').toLowerCase();
            const descBuffer = (item.contentSnippet || item.content || '').toLowerCase();
            const fullBuffer = (titleBuffer + ' ' + descBuffer);

            // Vector 1: Industry Verticals (Priority Match)
            const industryMatch = industryVerticals.find(v => v.keys.some(k => fullBuffer.includes(k)));
            if (industryMatch) industryTags.push(industryMatch.name);

            // Vector 2: Strategic Signal Acquisition (Rules 1, 2, 3)
            signalCategories.forEach(sc => {
              // Rule 3: Headline weighting - Does the trigger appear in the headline?
              const inHeadline = sc.strong.some(k => titleBuffer.includes(k)) || 
                               sc.supporting.filter(k => titleBuffer.includes(k)).length >= 2;
              
              const titleStrong = sc.strong.filter(k => titleBuffer.includes(k)).length;
              const titleSupport = sc.supporting.filter(k => titleBuffer.includes(k)).length;
              const bodyStrong = sc.strong.filter(k => descBuffer.includes(k)).length;
              const bodySupport = sc.supporting.filter(k => descBuffer.includes(k)).length;

              // Rule 2: Minimum Confidence threshold
              if ((titleStrong + bodyStrong) >= 1 || (titleSupport + bodySupport) >= 2) {
                signalMatches.push({
                  name: sc.name,
                  priority: sc.priority,
                  isHeadlineSignal: inHeadline
                });
              }
            });

            // Rule 1 & 2 Execution: Sort by Priority & Headline weight, then Cap at 2
            const topSignals = signalMatches
              .sort((a, b) => {
                if (a.isHeadlineSignal && !b.isHeadlineSignal) return -1;
                if (!a.isHeadlineSignal && b.isHeadlineSignal) return 1;
                return a.priority - b.priority;
              })
              .slice(0, 2)
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
            }).catch(() => {});
          }
          await new Promise(r => setTimeout(r, 200));
        }
        console.log(`  Bridge Sync: ${source.name} completed.`);
      } catch (err) {
        console.error(`  Bridge Sync Error [${source.name}]: ${err.message}`);
      }
    }));
  }
  console.log(`[Historical Bridge]: Archival cycle completed.`);
}

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`Server listening on port ${port}`)

    // Permanent Fix: Run the Archival bridge every 4 hours automatically
    setInterval(() => {
      runDeepSync().catch(err => console.error('Historical Worker Failed:', err));
    }, 4 * 60 * 60 * 1000);

    // Initial fill on boot if cache is light
    const cacheCount = await prisma.discoveryCache.count();
    if (cacheCount < 100) {
      runDeepSync().catch(err => console.error('Initial Historical Fill Failed:', err));
    }

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
