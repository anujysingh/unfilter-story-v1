import { Clock, TrendingUp, Zap } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { Link } from "react-router";

export default function News() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Funding",
    "Layoffs",
    "Product Launches",
    "Acquisitions",
    "Policy",
  ];

  const breakingNews = {
    title: "Zepto raises $350M Series E at $5B valuation in India's biggest quick-commerce round",
    excerpt: "Quick commerce unicorn Zepto has secured $350M in Series E funding at a $5B valuation, making it one of the largest funding rounds in India's startup ecosystem this year.",
    timestamp: "Breaking • 15 min ago",
    category: "Funding",
    thumbnail: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=400&fit=crop",
  };

  const newsItems = [
    {
      id: "news-2",
      title: "Dream11 lays off 150 employees as fantasy sports market cools down",
      timestamp: "4 hours ago",
      category: "Layoffs",
      thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop",
      excerpt: "The fantasy sports platform is streamlining operations as it faces increased competition and regulatory challenges.",
    },
    {
      id: "news-3",
      title: "Swiggy launches AI-powered delivery routing to cut delivery times by 15%",
      timestamp: "6 hours ago",
      category: "Product Launches",
      thumbnail: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=300&fit=crop",
      excerpt: "New machine learning algorithm optimizes delivery routes in real-time across 500+ cities.",
    },
    {
      id: "news-4",
      title: "PhonePe acquires ZestMoney for $50M in strategic all-stock deal",
      timestamp: "8 hours ago",
      category: "Acquisitions",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      excerpt: "The acquisition strengthens PhonePe's credit and lending capabilities ahead of its much-anticipated IPO.",
    },
    {
      id: "news-5",
      title: "New startup policy requires minimum capital threshold for foreign investors",
      timestamp: "12 hours ago",
      category: "Policy",
      thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
      excerpt: "Government introduces stricter regulations on foreign investments in Indian startups to protect domestic interests.",
    },
    {
      id: "news-6",
      title: "Razorpay valued at $7.5B in latest funding round, eyes Southeast Asia expansion",
      timestamp: "1 day ago",
      category: "Funding",
      thumbnail: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=400&h=300&fit=crop",
      excerpt: "Payment gateway giant closes $150M Series F with plans for aggressive regional expansion.",
    },
  ];

  const trending = [
    { title: "Zepto's $5B valuation sparks debate", impact: "high" },
    { title: "Dream11 layoffs signal market shift", impact: "medium" },
    { title: "PhonePe-ZestMoney consolidation", impact: "high" },
    { title: "New FDI regulations impact", impact: "high" },
    { title: "Quick commerce profitability wars", impact: "medium" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#FF4D8D] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#FF7A18] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 relative">
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Startup News</h1>
            <p className="text-lg text-gray-300">
              Real-time updates from India's startup ecosystem
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-40 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] border-b-4 border-[#FFD84D]">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center gap-3 text-white overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 font-bold whitespace-nowrap">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
              BREAKING
            </div>
            <div className="border-l-2 border-white/30 pl-3 py-1">
              <p className="font-medium whitespace-nowrap">{breakingNews.title}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent" />
            <span className="text-[#6B6B6B] font-medium">Filter by category</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent" />
          </div>
          <div className="flex gap-3 justify-center overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${activeCategory === cat
                    ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white shadow-lg"
                    : "bg-[#FAFAFA] text-[#6B6B6B] hover:bg-[#EAEAEA]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-10 gap-8">
          <div className="md:col-span-7 space-y-6">
            <Link to="/news/news-1" className="block bg-gradient-to-br from-[#111111] to-[#2A2A2A] text-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-pink-500/20 transition-all border-2 border-transparent hover:border-[#FF4D8D]">
              <div className="md:flex">
                <div className="md:w-2/5 relative">
                  <ImageWithFallback
                    src={breakingNews.thumbnail}
                    alt={breakingNews.title}
                    className="w-full h-full object-cover min-h-[300px]"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                    <Zap className="w-4 h-4 fill-current" />
                    BREAKING
                  </div>
                </div>
                <div className="md:w-3/5 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#FFD84D] text-[#111111] px-3 py-1 rounded-full text-xs font-medium">
                      {breakingNews.category}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {breakingNews.timestamp}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 leading-tight">
                    {breakingNews.title}
                  </h2>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {breakingNews.excerpt}
                  </p>
                </div>
              </div>
            </Link>

            {newsItems.map((news, i) => (
              <Link
                key={i}
                to={`/news/${news.id}`}
                className="block bg-white rounded-2xl border-2 border-[#EAEAEA] overflow-hidden hover:border-[#FF4D8D] hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="md:flex gap-6">
                  <div className="md:w-48 relative overflow-hidden">
                    <ImageWithFallback
                      src={news.thumbnail}
                      alt={news.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-[#FFD84D] text-[#111111] px-3 py-1 rounded-full text-xs font-medium">
                        {news.category}
                      </span>
                      <span className="flex items-center gap-1 text-[#6B6B6B] text-sm">
                        <Clock className="w-4 h-4" />
                        {news.timestamp}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-[#111111] mb-3 group-hover:text-[#FF4D8D] transition-colors">
                      {news.title}
                    </h2>
                    <p className="text-[#6B6B6B] leading-relaxed line-clamp-2">{news.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <aside className="md:col-span-3">
            <div className="sticky top-32 space-y-6">
              <div className="bg-gradient-to-br from-[#FFFBF0] to-white rounded-2xl p-6 border-2 border-[#FFD84D]">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-[#FF4D8D]" />
                  <h3 className="text-xl font-bold text-[#111111]">Trending</h3>
                </div>
                <div className="space-y-4">
                  {trending.map((item, i) => (
                    <div
                      key={i}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white transition-all">
                        <span className="text-3xl font-bold bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] bg-clip-text text-transparent min-w-[3rem]">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-[#111111] font-semibold group-hover:text-[#FF4D8D] transition-colors leading-tight mb-2">
                            {item.title}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${item.impact === "high"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                              }`}
                          >
                            {item.impact === "high" ? "High Impact" : "Medium Impact"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111111] text-white rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold text-lg mb-3">Never Miss an Update</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Get breaking news delivered to your inbox
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF4D8D] transition-colors"
                  />
                  <button className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] px-4 py-2.5 rounded-lg hover:shadow-lg transition-all font-bold">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
