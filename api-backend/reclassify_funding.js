// Targeted reclassification: Fix only the specific headline patterns the classifier missed.
// Strategy: Only process 'Other / Unclassified' items where the title clearly indicates
// a startup funding event using very specific multi-word compound patterns.
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

// Very specific patterns that ONLY appear in funding contexts
// These are compound phrases — no single broad words like 'million' or 'crore' alone
const TARGETED_STRONG_PATTERNS = [
  // "X leads $N million round" pattern
  /\blead(s)?\s+\$?\d+\s*(million|mn|crore|cr|lakh|billion|bn)\b/i,
  /\blead(s|ing)?\s+.{0,30}\s+round\b/i,
  // "$N million round" pattern (must have round)
  /\$\d+[\.,]?\d*\s*(million|mn|billion|bn)\s+round\b/i,
  /\b\d+[\.,]?\d*\s*(million|mn|billion|bn)\s+round\b/i,
  // "raises/raised $N million" — dollar sign broke the old regex
  /\braise[sd]?\s+\$\d+/i,
  /\braise[sd]?\s+\d+[\.,]?\d*\s*(million|mn|billion|bn|crore|cr|lakh)\b/i,
  // "pocket early-stage cheques" / "bags early-stage funding"  
  /\bpocket(s|ed)?\s+(early.stage|funding|seed)\b/i,
  /\bbag(s|ged)?\s+(early.stage|funding|seed)\b/i,
  // "X invests $N million in Y" — "invests in" was too broad, but "invests $X" is specific
  /\binvest(s|ed)?\s+\$\d+/i,
  /\binvest(s|ed)?\s+\d+[\.,]?\d*\s*(million|mn|billion|bn|crore|cr|lakh)\b/i,
  // "target corpus of $X million"
  /\btarget\s+corpus\b/i,
  /\btarget(s|ed|ing)?\s+\$?\d+[\.,]?\d*\s*(million|mn|billion|bn)\s+(fund|corpus|raise)\b/i,
  // "anchor investment"
  /\banchor\s+investment\b/i,
  // "pre-IPO round" at N valuation
  /\bpre.ipo\s+(round|funding|raise)\b/i,
  // "secures Rs/INR X crore"
  /\bsecures?\s+(rs|inr|₹)\s*[\d,]+/i,
  // "mops up Rs/INR X crore"
  /\bmops?\s+up\s+(rs|inr|₹)\s*[\d,]+/i,
  // "closes $X million"  
  /\bclose[sd]?\s+\$\d+/i,
  /\bclose[sd]?\s+a\s+.{0,20}(round|funding)\b/i,
]

// Items that look like funding but are NOT (financial results, commodity prices etc.)
const FALSE_POSITIVE_PATTERNS = [
  /\bnet profit\b/i, /\brevenue jumps\b/i, /\brevenue up\b/i, /\brevenue rises\b/i,
  /\bevenue declines\b/i, /\bq[1-4] results\b/i, /\bquarterly results\b/i,
  /\bquarterly profit\b/i, /\beat estimate\b/i, /\bbelow estimate\b/i,
  /\bdiesel price\b/i, /\bpetrol price\b/i, /\bgold price\b/i, /\bcrude oil\b/i,
  /\bsensex\b/i, /\bnifty\b/i, /\bstock market\b/i, /\bshare price\b/i,
  /\bdividend\b/i, /\bwheat output\b/i, /\bgdp growth\b/i,
]

function isClearFundingTitle(title) {
  if (FALSE_POSITIVE_PATTERNS.some(p => p.test(title))) return false
  return TARGETED_STRONG_PATTERNS.some(p => p.test(title))
}

async function reclassify() {
  // Revert the large batch from first run: items that are ONLY tagged ["Funding"]
  // but that didn't have the strong compound signals in their title
  console.log('Phase 1: Reverting items with weak Funding tags...')
  const soloFunding = await prisma.discoveryCache.findMany({
    where: { categories: JSON.stringify(['Funding']) },
    select: { id: true, title: true }
  })
  console.log(`  Found ${soloFunding.length} solo-Funding items to check`)
  
  let reverted = 0
  for (const item of soloFunding) {
    if (!isClearFundingTitle(item.title)) {
      await prisma.discoveryCache.update({
        where: { id: item.id },
        data: { categories: JSON.stringify(['Other / Unclassified']) }
      })
      reverted++
    }
  }
  console.log(`  Reverted ${reverted} weak items back to 'Other / Unclassified'\n`)

  // Phase 2: Re-check unclassified with strong compound patterns
  console.log('Phase 2: Reclassifying with targeted strong patterns...')
  const unclassified = await prisma.discoveryCache.findMany({
    where: { categories: { contains: 'Other / Unclassified' } },
    select: { id: true, title: true, categories: true }
  })
  console.log(`  Found ${unclassified.length} unclassified items`)

  let reclassified = 0
  for (const item of unclassified) {
    if (!isClearFundingTitle(item.title)) continue
    
    let existingCats = []
    try { existingCats = JSON.parse(item.categories || '[]') } catch (e) {}
    const newCats = ['Funding', ...existingCats.filter(c => c !== 'Other / Unclassified' && c !== 'Funding')]
    
    await prisma.discoveryCache.update({
      where: { id: item.id },
      data: { categories: JSON.stringify(newCats) }
    })
    reclassified++
    console.log(`  ✅ ${item.title.slice(0, 90)}`)
  }
  console.log(`\nPhase 2: Tagged ${reclassified} items as Funding.`)
  await prisma.$disconnect()
}

reclassify().catch(e => { console.error(e); process.exit(1) })
