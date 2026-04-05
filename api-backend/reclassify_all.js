
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function reclassify() {
  console.log('--- Starting Global Signal Re-classification (v13.0) ---');
  
  const industryVerticals = [
    { name: 'Fintech', keys: ['payments', 'lending', 'insurtech', 'wealthtech', 'regtech', 'fintech', 'banking', 'upi', 'neobank', 'wealth management', 'insurance', 'stock brokerage', 'rbi', 'bank of india', 'finance', 'trading'] },
    { name: 'EdTech', keys: ['k-12', 'higher education', 'upskilling', 'test prep', 'edtech', 'learning', 'classroom', 'skill development', 'tutoring', 'academy', 'education', 'books', 'reading', 'school'] },
    { name: 'HealthTech', keys: ['digital health', 'medtech', 'pharmatech', 'mental health', 'healthtech', 'medical', 'healthcare', 'clinics', 'diagnostics', 'telemedicine', 'biotech', 'pharma', 'fda', 'drugs', 'medicine'] },
    { name: 'MobilityTech', keys: ['mobilitytech', 'ride-hailing', 'electric mobility', 'autonomous vehicles', 'ride sharing', 'scooters', 'micro-mobility', 'urban transport', 'car sharing', 'aviation', 'airlines', 'indigo', 'air-tickets', 'flight'] },
    { name: 'FoodTech', keys: ['foodtech', 'cloud kitchen', 'food delivery', 'grocery delivery', 'restaurant tech', 'agrifoodtech', 'food subscription', 'beverages', 'cooking', 'nutrition'] },
    { name: 'TravelTech', keys: ['traveltech', 'hotel booking', 'tourism', 'travel agency', 'airline tech', 'staycation', 'hospitality tech', 'resort', 'vacation'] },
    { name: 'AI / ML', keys: ['generative ai', 'computer vision', 'nlp', 'ai infrastructure', 'ai/ml', 'artificial intelligence', 'machine learning', 'llm', 'deep learning', 'automation', 'data governance', 'algorithmic'] },
    { name: 'Cybersecurity', keys: ['cybersecurity', 'encryption', 'firewall', 'data protection', 'hacking', 'threat detection', 'security software', 'identity management', 'zero trust', 'privacy', 'data breach'] },
    { name: 'Web3 / Blockchain', keys: ['web3', 'blockchain', 'crypto', 'nft', 'decentralized', 'metaverse', 'defi', 'ethereum', 'bitcoin', 'smart contracts', 'dao', 'token'] },
    { name: 'ClimateTech / Sustainability', keys: ['climatetech', 'sustainability', 'carbon credit', 'circular economy', 'waste management', 'esg', 'environmental', 'green tech', 'renewable energy', 'ecology'] },
    { name: 'AgriTech', keys: ['precision farming', 'supply chain', 'agrifinance', 'agritech', 'farming', 'agriculture', 'harvest', 'farmer', 'agrifood', 'grains', 'pulses', 'organic'] },
    { name: 'CleanTech / EV', keys: ['electric', 'cleantech', 'ev', 'battery', 'solar', 'wind', 'charging', 'hypercharger', 'green energy', 'photovoltaic'] },
    { name: 'Future of Work / HRTech', keys: ['hrtech', 'remote work', 'talent acquisition', 'hiring', 'payroll', 'workforce management', 'recruitment', 'future of work', 'employee engagement', 'productivity'] },
    { name: 'Developer Infrastructure / Cloud', keys: ['devops', 'cloud infrastructure', 'backend', 'cloud native', 'api', 'serverless', 'kubernetes', 'aws', 'azure', 'dev tools', 'infrastructure-as-code', 'computing'] },
    { name: 'Social / Community Platforms', keys: ['social media', 'community platform', 'networking', 'social network', 'dating app', 'content platform', 'short video', 'creator economy', 'creativity'] },
    { name: 'SaaS / B2B', keys: ['enterprise software', 'martech', 'saas', 'b2b', 'software-as-a-service', 'crm', 'workflow', 'clouddays', 'digital transformation'] },
    { name: 'D2C / E-Commerce', keys: ['consumer brands', 'quick commerce', 'fashion', 'd2c', 'e-commerce', 'omnichannel', 'retail', 'marketplace', 'wellness', 'beauty', 'direct-to-consumer', 'personal care', 'jewellery', 'apparel', 'direct to consumer', 'cosmetics', 'handmade', 'artisan', 'lifestyle', 'personal growth', 'fmcg', 'spice', 'consumer goods'] },
    { name: 'LogisTech', keys: ['supply chain', 'warehousing', 'last-mile delivery', 'logistech', 'logistics', 'delivery', 'fleet', 'shipping', 'freight', 'trucking', 'warehouse'] },
    { name: 'SpaceTech / DeepTech', keys: ['semiconductors', 'spacetech', 'deeptech', 'satellite', 'rocketry', 'isro', 'robotics', 'space exploration', 'space startup', 'agnikul', 'skyroot', 'quantum', 'physics', 'iss', 'international space station', 'space station', 'orbit'] },
    { name: 'Gaming / Media', keys: ['gaming', 'media', 'esports', 'publisher', 'content creation', 'streaming', 'entertainment', 'influencer economy', 'ott', 'movies', 'music', 'tv series', 'original series', 'premiere'] },
    { name: 'Real Estate Tech', keys: ['proptech', 'construction tech', 'real estate', 'property', 'real estate tech', 'homebuying', 'coworking', 'architecture', 'housing'] },
    { name: 'Government / Policy', keys: ['regulatory', 'government', 'ministry', 'policy', 'framework', 'guidelines', 'statutory', 'law', 'legal', 'compliance', 'taxation', 'gst', 'central gov', 'cabinet', 'rbi', 'sebi', 'regulator'] },
    { name: 'Manufacturing / Industrial', keys: ['manufacturing', 'factory', 'industrial', 'hardware', 'assembly', 'production', 'raw materials', 'machinery', 'leather', 'textile', 'processing', 'electronics'] },
    { name: 'Big Tech / Consumer Software', keys: ['microsoft', 'apple', 'google', 'meta', 'amazon', 'firefox', 'windows', 'browser', 'operating system', 'software update', 'technical support', 'big tech', 'consumer tech', 'adobe'] },
    { name: 'Telecom / Infrastructure', keys: ['telecom', 'fiber', '5g', '6g', 'network', 'broadband', 'infrastructure', 'connectivity', 'operator', 'openreach', 'internet provider', 'vibrations', 'underground'] }
  ];

  const signalCategories = [
    { name: 'Funding', priority: 1, strong: ['raises', 'funding', 'fundraise', 'series a', 'series b', 'series c', 'pre-seed', 'seed round', 'raised', 'closes funding', 'investment from', 'valuation hits', 'valuation of', 'funding from', 'secures funding', 'bags funding', 'capital infusion', 'mops up', 'infuses capital', 'investment round', 'strategic investment', 'invests', 'investment', 'infusion', 'capital', 'backed by', 'qip', 'capital raise', 'fundraising'], supporting: ['venture capital', 'vcs', 'investors', 'funding round', 'capital injection', 'equity', 'convertible note', 'debt funding', 'angel funding', 'bridge round', 'funding news', 'fund raise', 'checks into', 'capital raise', 'investment in', 'startup funding', 'equity financing', 'participation', 'led by', 'shares sold', 'secondary sale'] },
    { name: 'Startup Launch', priority: 8, strong: ['launches startup', 'founded in', 'new startup', 'debuts', 'coming out of stealth', 'stealth mode', 'founders start', 'unveils startup', 'enters the market', 'operational in', 'incorporated', 'starts up'], supporting: ['co-founded', 'venture launched', 'bootstrapped', 'early-stage', 'incorporated', 'new venture', 'spin-off', 'fresh off', 'starting up', 'new player', 'enters sector', 'commences ops', 'kickstarts', 'startup', 'new company'] },
    { name: 'Acquisition', priority: 4, strong: ['acquires', 'acquisition of', 'takeover', 'acqui-hire', 'merger with', '100% stake purchase', 'buys startup', 'purchase of'], supporting: ['strategic acquisition', 'all-stock deal', 'asset purchase', 'takes over', 'absorbed by', 'majority stake', 'buyout', 'controlling interest', 'merger talk', 'valuation in acquisition'] },
    { name: 'Shutdown', priority: 2, strong: ['shuts down', 'ceases operations', 'closure of', 'bankruptcy', 'winding up', 'stops operations', 'halting operations'], supporting: ['insolvency', 'nclt filing', 'no longer operational', 'suspends services', 'folds', 'winding down', 'end of operations', 'failure', 'out of business'] },
    { name: 'Layoffs', priority: 3, strong: ['layoffs', 'lays off', 'job cuts', 'retrenchment', 'downsizing', 'workforce reduction', 'mass layoff', 'slashes jobs', 'cuts workforce', 'restructuring'], supporting: ['pink slips', 'let go', 'rightsizing', 'headcount reduction', 'employees fired', 'mass termination', 'cost cutting', 'redundancies', 'job losses', 'cutting jobs'] },
    { name: 'Product News / Launch', priority: 9, strong: ['launches product', 'new feature', 'releases feature', 'unveils new', 'rolls out feature', 'rolls out', 'goes live', 'announces launch', 'beta launch', 'general availability', 'debuts new', 'expansion into', 'enters market', 'launches expansion', 'end support', 'technical support', 'updates', 'v2.0', 'software update', 'premiered', 'premieres', 'premiere', 'brand new', 'announced', 'leak', 'revealed', 'shadowdropped', 'remastered'], supporting: ['releases', 'unveils', 'introduces', 'now available', 'v2.0', 'new offering', 'app update', 'platform expansion', 'new vertical', 'product reveal', 'expansion', 'debuts', 'compatibility', 'maintenance', 'feature', 'update', 'original series', 'series launch', 'new show', 'announced that', 'can detect', 'teaser'] },
    { name: 'Founder Story / Profile', priority: 10, strong: ['founder op-ed', 'founder profile', 'in conversation with', 'interview with founder', 'exclusive interview', 'founder exclusive', 'interview with ceo', 'founder speaks', 'co-founder says', 'q&a with', 'story of', 'how it started'], supporting: ['opinion', 'thought leadership', 'vision', 'roadmap', 'op-ed by', "founder's take", 'startup journey', 'lessons from', 'we sat down with', 'in their own words', 'built', 'started by', 'founder story'] },
    { name: 'Pivot', priority: 5, strong: ['pivots', 'shifts focus to', 'new direction', 'pivoting to', 'pivoting from', 'business model change', 'strategic overhaul'], supporting: ['restructures', 'reinvents', 'overhauls strategy', 'moves away from', 'no longer focuses on', 'transition to', 'rebrands as', 'sunsets', 'change of direction', 'new strategy'] },
    { name: 'Funding Ask', priority: 6, strong: ['in talks to raise', 'seeking investment', 'discussions with investors', 'looking to close', 'eyeing fundraise', 'plans to raise', 'seeking capital'], supporting: ['approaching vcs', 'expected to close', 'term sheet', 'due diligence ongoing', 'roadshow', 'scouting investors', 'fundraising round planned', 'investor meetings', 'pitching to investors'] },
    { name: 'Revenue Milestone', priority: 7, strong: ['turns profitable', 'achieves breakeven', 'crosses arr', 'revenue milestone', 'ebitda positive', 'pat positive', 'clocks revenue', 'gross profit', 'profitable'], supporting: ['first profitable quarter', 'operating profit', 'mrr crosses', 'gmv milestone', 'revenue hits', 'clocks inr cr', 'gross profit positive', 'profitability achieved', 'revenue growth', 'revenue clocks'] },
    { name: 'Partnership', priority: 11, strong: ['partners with', 'partnership', 'collaboration', 'tie-up', 'signs mou', 'strategic alliance', 'joins hands with', 'teams up'], supporting: ['joint venture', 'collaboration with', 'agreement', 'mou', 'strategic partnership', 'synergy', 'cooperation'] },
    { name: 'Expansion', priority: 12, strong: ['expands to', 'enters new market', 'new city', 'global footprint', 'opens office', 'expansion plan', 'geographical expansion', 'launches in', 'sets up base', 'opens its first'], supporting: ['new region', 'scaling up', 'international market', 'domestic expansion', 'wider reach', 'new territory', 'expansion', 'scaling', 'growth', 'expanding', 'presence in', 'new base'] },
    { name: 'Regulatory / Policy', priority: 13, strong: ['regulatory update', 'complies with', 'government policy', 'new guidelines', 'rbi directive', 'sebi order', 'gdpr', 'compliance', 'framework', 'guidelines', 'privacy fine', 'gdpr fine', 'data protection law'], supporting: ['regulation', 'statutory', 'legal framework', 'government mandate', 'notification', 'official order', 'central government', 'privacy policy', 'penalty', 'fine imposed'] },
    { name: 'Leadership / People', priority: 14, strong: ['appoints', 'new ceo', 'new cto', 'hires', 'leadership change', 'board of directors', 'joins as', 'stepping down', 'exit of', 'leaves role', 'resigns', 'transition from', 'new role', 'promoted'], supporting: ['hr news', 'executive hire', 'appointment', 'promoted', 'people news', 'hiring talent', 'veteran joins', 'industry veteran', 'career move'] },
    { name: 'Legal / Litigation', priority: 15, strong: ['files suit', 'legal battle', 'court order', 'litigation', 'lawsuit', 'arbitration', 'dispute', 'notice from', 'legal action', 'court scraps', 'won appeal', 'legal win'], supporting: ['court stay', 'appeals court', 'petition', 'complaint', 'legal case', 'hearing', 'judgment', 'appeal', 'scraps', 'fine', 'won its appeal'] },
    { name: 'Ecosystem News', priority: 16, strong: ['daily roundup', 'startup news', 'mid-day news', 'news updates', 'roundup', 'daily digest', 'weekly news', 'bulletin', 'discovery', 'captured', 'scientific', 'mission', 'accelerator', 'applications open'], supporting: ['latest updates', 'top stories', 'happening today', 'morning briefing', 'startup updates', 'scientific breakthrough', 'orbit', 'observations', 'cohort', 'program', 'applications for'] },
    { name: 'Market Insights / Reports', priority: 17, strong: ['best of', 'top 10', 'review', 'comparison', 'market report', 'industry insights', 'best vpn', 'best books', 'top tools', 'product review', 'commodity prices', 'gold price', 'energy shock'], supporting: ['ranking', 'curated list', 'analysis', 'research', 'landscape', 'market analysis', 'buying guide', 'recommendations', 'top gainers', 'losers', 'nifty', 'sensex', 'stocks market'] },
    { name: 'Tech Guides / Tutorials', priority: 18, strong: ['how to', 'tutorial', 'guide', 'how-to', 'step by step', 'setup', 'unblock', 'access', 'watch', 'configuring'], supporting: ['walkthrough', 'instructions', 'tips', 'tricks', 'manual', 'help', 'troubleshoot', 'setup guide'] },
    { name: 'Trends / Future Tech', priority: 19, strong: ['future of', 'will ai', 'impact of', 'the end of', 'state of', 'trends in', 'outlook', 'prediction', 'visionary', 'paradigm shift'], supporting: ['analysis', 'forecast', 'landscape', 'potential', 'opportunity', 'transforming', 'shaping', 'evolution', 'thinker', 'long-term', 'innovation', 'vision', 'transformation'] },
    { name: 'Product Review / Opinion', priority: 20, strong: ['meet the', 'review', 'opinion', 'hands-on', 'verdict', 'awful', 'brilliant', 'critique', 'comparison', 'vs', 'rebranding', 'unveiled'], supporting: ['feedback', 'rating', 'user experience', 'performance', 'testing', 'quality', 'benchmark', 'editor choice', 'first look'] },
    { name: 'Innovation / Breakthrough', priority: 21, strong: ['breakthrough', 'innovation', 'unveils tech', 'pioneers', 'first ever', 'new technique', 'advanced technology', 'isolates the source', 'detect leaks'], supporting: ['showcases', 'demonstrates', 'case study', 'experimental', 'r&d', 'scientific advancement', 'technological leap'] }
  ];

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

  const allItems = await prisma.discoveryCache.findMany();
  console.log(`Processing ${allItems.length} records...`);

  let updatedCount = 0;

  for (const item of allItems) {
    const titleBuffer = (item.title || '').toLowerCase();
    const descBuffer = (item.content || '').toLowerCase();
    const fullBuffer = (titleBuffer + ' ' + descBuffer);

    const industryTags = industryVerticals
      .filter(v => matchKeywords(fullBuffer, v.keys))
      .map(v => v.name);

    const signalMatches = [];
    signalCategories.forEach(sc => {
      const inHeadline = matchKeywords(titleBuffer, sc.strong) || 
                       countMatches(titleBuffer, sc.supporting) >= 2;
      
      const titleStrong = countMatches(titleBuffer, sc.strong);
      const titleSupport = countMatches(titleBuffer, sc.supporting);
      const bodyStrong = countMatches(descBuffer, sc.strong);
      const bodySupport = countMatches(descBuffer, sc.supporting);

      if ((titleStrong + bodyStrong) >= 1 || (titleSupport + bodySupport) >= 2) {
        signalMatches.push({ name: sc.name, priority: sc.priority, isHeadlineSignal: inHeadline });
      }
    });

    const topSignals = signalMatches
      .sort((a, b) => {
        if (a.isHeadlineSignal && !b.isHeadlineSignal) return -1;
        if (!a.isHeadlineSignal && b.isHeadlineSignal) return 1;
        return a.priority - b.priority;
      })
      .slice(0, 1)
      .map(s => s.name);

    const finalTags = [...new Set([...topSignals, ...industryTags])];
    const filteredTags = finalTags.filter(t => {
      if (t === 'EdTech') {
        const mlMatch = matchKeywords(fullBuffer, ['machine learning', 'deep learning', 'ai/ml']);
        const eduMatch = matchKeywords(fullBuffer, ['k-12', 'higher education', 'test prep', 'classroom', 'skill development', 'tutoring', 'academy', 'education', 'books', 'reading', 'school']);
        if (mlMatch && !eduMatch) return false;
      }
      return true;
    });

    if (filteredTags.length === 0) filteredTags.push('Other / Unclassified');

    await prisma.discoveryCache.update({
      where: { id: item.id },
      data: { categories: JSON.stringify(filteredTags) }
    }).catch(() => {});

    updatedCount++;
    if (updatedCount % 500 === 0) console.log(`  Processed ${updatedCount} items...`);
  }

  console.log('--- GLOBAL RE-CLASSIFICATION COMPLETE ---');
  console.log(`Updated ${updatedCount} items in the intelligence buffer.`);
}

reclassify().catch(console.error).finally(() => prisma.$disconnect());
