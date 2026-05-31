export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  timestamp: string;
  category: string;
  thumbnail: string;
}

export interface StoryItem {
  id: string;
  title: string;
  hook: string;
  content: string;
  author: string;
  duration: string;
  category: string;
  type: 'video' | 'podcast' | 'article';
  views: string;
  image: string;
}

export interface CompanyFunding {
  id: string;
  name: string;
  logo: string;
  founded: string;
  stage: string;
  amount: string;
  industry: string;
  description: string;
  fundingHistory: { year: string; amount: number }[];
}

export const mockNews: NewsItem[] = [
  {
    id: "news-1",
    title: "Zepto raises $350M Series E at $5B valuation in India's biggest quick-commerce round",
    excerpt: "Quick commerce unicorn Zepto has secured $350M in Series E funding at a $5B valuation, making it one of the largest funding rounds in India's startup ecosystem this year.",
    content: "Zepto, the quick-commerce startup founded by Kaivalya Vohra and Aadit Palicha, has raised $350 million in its Series E funding round. The investment was led by StepStone Group, with participation from Goodwater Capital and existing investors like Nexus Venture Partners and Glade Brook Capital. This round values the company at $5 billion, a significant jump from its previous valuation of $1.4 billion. The funds will be used to expand its dark store network across major Indian cities and invest in its logistics infrastructure. Zepto continues to challenge incumbents like Swiggy Instamart and Zomato's Blinkit in the competitive quick-commerce space.",
    timestamp: "15 min ago",
    category: "Funding",
    thumbnail: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=400&fit=crop",
  },
  {
    id: "news-2",
    title: "Dream11 lays off 150 employees as fantasy sports market cools down",
    excerpt: "The fantasy sports platform is streamlining operations as it faces increased competition and regulatory challenges.",
    content: "Fantasy sports giant Dream11 has announced a workforce reduction of 150 employees. The company cited a strategic shift towards operational efficiency and a cooling fantasy sports market in India as the primary reasons for the layoffs. Affected employees are across engineering, product, and marketing teams. The startup has assured a comprehensive severance package for those impacted.",
    timestamp: "4 hours ago",
    category: "Layoffs",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop",
  },
  {
    id: "news-3",
    title: "Swiggy launches AI-powered delivery routing to cut delivery times by 15%",
    excerpt: "New machine learning algorithm optimizes delivery routes in real-time across 500+ cities.",
    content: "Swiggy has rolled out a new AI-driven logistics engine that optimizes delivery routes in real-time. By analyzing traffic patterns, weather conditions, and delivery executive locations, the system aims to reduce delivery times by 15% and improve overall efficiency.",
    timestamp: "6 hours ago",
    category: "Product Launches",
    thumbnail: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=300&fit=crop",
  },
  {
    id: "news-4",
    title: "PhonePe acquires ZestMoney for $50M in strategic all-stock deal",
    excerpt: "The acquisition strengthens PhonePe's credit and lending capabilities ahead of its much-anticipated IPO.",
    content: "PhonePe has completed the acquisition of buy-now-pay-later (BNPL) startup ZestMoney in an all-stock transaction valued at $50 million. This move is seen as a strategic play to bolster PhonePe's presence in the digital lending space, integrating ZestMoney's technology and user base into its fintech ecosystem.",
    timestamp: "8 hours ago",
    category: "Acquisitions",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  },
];

export const mockStories: StoryItem[] = [
  {
    id: "story-1",
    title: "We Burned $5M Before We Learned This One Truth",
    hook: "A brutally honest video documentary of how we almost destroyed everything—and the pivot that saved us.",
    content: "Building a startup is never a straight line. Vikram Shah shares the painful journey of spending $5 million in venture capital on a product that had no market fit. It was only after a near-total collapse that the team discovered the 'one truth' that saved them: solving a problem customers actually care about, not just building cool tech.",
    author: "Vikram Shah",
    duration: "32 min",
    category: "Failure",
    type: "video",
    views: "127K",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=600&fit=crop",
  },
  {
    id: "story-2",
    title: "From 10 Employees to Zero: Our Shutdown Story",
    hook: "The hardest decision we ever made, and what we learned from letting everyone go.",
    content: "Ananya Reddy recounts the heartbreaking day she had to close her startup's doors and lay off her entire team. This story explores the emotional toll of founder failure and the lessons learned about timing and market dynamics.",
    author: "Ananya Reddy",
    duration: "18 min",
    category: "Failure",
    type: "video",
    views: "89K",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop",
  },
  {
    id: "story-3",
    title: "We Pivoted 7 Times in 2 Years",
    hook: "Each pivot felt like starting over. Hear the full journey on our podcast.",
    content: "Rohan Gupta discusses the relentless cycle of experimentation and pivoting that eventually led his team to success. A masterclass in resilience and the importance of data-driven decision making.",
    author: "Rohan Gupta",
    duration: "52 min",
    category: "Pivot",
    type: "podcast",
    views: "45K",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop",
  },
];

export const mockCompanies: CompanyFunding[] = [
  {
    id: "comp-1",
    name: "FlashCommerce",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop",
    founded: "2022",
    stage: "Series A",
    amount: "$15M",
    industry: "E-commerce",
    description: "FlashCommerce is redefining quick-commerce with a 5-minute delivery promise using hyper-local robotic dark stores.",
    fundingHistory: [
      { year: "2022", amount: 1 },
      { year: "2023", amount: 5 },
      { year: "2024", amount: 15 },
    ]
  },
  {
    id: "comp-2",
    name: "HealthTech AI",
    logo: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop",
    founded: "2021",
    stage: "Series B",
    amount: "$42M",
    industry: "HealthTech",
    description: "Predictive analytics for early diagnosis of chronic diseases using proprietary machine learning models.",
    fundingHistory: [
      { year: "2021", amount: 2 },
      { year: "2022", amount: 10 },
      { year: "2023", amount: 42 },
    ]
  },
  {
    id: "comp-3",
    name: "FinFlow",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
    founded: "2023",
    stage: "Seed",
    amount: "$3.2M",
    industry: "Fintech",
    description: "Automated treasury management for Web3 startups and decentralized autonomous organizations.",
    fundingHistory: [
      { year: "2023", amount: 3.2 },
    ]
  },
];
