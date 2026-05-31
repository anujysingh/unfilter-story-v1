import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const prisma = new PrismaClient();
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

async function main() {
  try {
    const recentSignals = await prisma.discoveryCache.findMany({
      orderBy: { pubDate: 'desc' },
      take: 50
    });

    const signalsText = recentSignals.map(s => `- [${s.source}] ${s.title}: ${s.content?.substring(0, 100)}`).join('\n');

    const systemPrompt = `You are a Trend Detection AI specialized in identifying viral and trending news topics in India.
Your job is to analyze the provided news signals and identify 3-5 trending topics.

Since you don't have live API access to Twitter/Google Trends, you must ESTIMATE the virality and scores based on the nature of the news (e.g., controversies, big funding, major launches usually trend on Twitter/News).

EVALUATION CRITERIA:
A topic is TRENDING if:
- It shows a sudden spike in search volume OR
- It is being discussed rapidly on social media OR
- It appears across multiple platforms within a short time OR
- It involves high emotional engagement (controversy, celebrity, shock, humor)

SCORING SYSTEM:
- Google Trends spike: +3
- Twitter/X trending hashtag: +2
- Instagram virality: +2
- YouTube trending: +2
- News coverage: +3

If score >= 5 → Mark as "TRENDING"
If score >= 8 → Mark as "HIGHLY TRENDING"

Analyze these recent signals and output a JSON array of trending topics in this exact format:
[
  {
    "topic": "Topic Name",
    "score": 8,
    "status": "HIGHLY TRENDING",
    "reasons": ["Reason 1", "Reason 2"],
    "platforms": {
      "googleTrends": true,
      "twitter": true,
      "instagram": false,
      "youtube": false,
      "news": true
    },
    "momentum": "Rising",
    "angles": {
      "pr": "PR Angle text",
      "content": "Content Angle text",
      "hook": "Hook text"
    }
  }
]

ONLY output the raw JSON array. No markdown blocks, no intro, no outro.`;

    if (!genAI) throw new Error('GEMINI API Key missing');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: systemPrompt });
    
    const result = await model.generateContent(`Recent Signals:\n${signalsText}`);
    const response = await result.response;
    let resultText = response.text();

    console.log("Response Text:", resultText);
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    const trendingTopics = JSON.parse(resultText);
    console.log(JSON.stringify(trendingTopics, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
