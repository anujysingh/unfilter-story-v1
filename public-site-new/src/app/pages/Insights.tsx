import { ArrowRight, BookOpen, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Insights() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Founder Lessons",
    "Growth",
    "Mistakes",
    "Playbooks",
  ];

  const featuredInsight = {
    title: "The Hidden Patterns in 100 Failed Indian Startups",
    description: "We analyzed every shutdown announcement from 2024-2026. The data revealed shocking patterns that every founder needs to know.",
    category: "Mistakes",
    readTime: "25 min",
    author: "Research Team",
    dataPoints: "127 startups analyzed",
  };

  const insights = [
    {
      title: "10 Mistakes Every First-Time Founder Makes",
      description: "Learn from the most common pitfalls that derail early-stage startups and how to avoid them.",
      category: "Mistakes",
      readTime: "8 min",
      icon: AlertTriangle,
    },
    {
      title: "The Real Cost of Rapid Growth",
      description: "Why growing too fast can kill your startup faster than growing too slow—backed by 50 case studies.",
      category: "Growth",
      readTime: "10 min",
      icon: TrendingUp,
    },
    {
      title: "Why Most Startups Fail at Hiring",
      description: "The hiring mistakes that cost us 6 months and $200K in wasted runway.",
      category: "Mistakes",
      readTime: "12 min",
      icon: AlertTriangle,
    },
    {
      title: "Building in Public: A 2-Year Retrospective",
      description: "What we learned from sharing our journey transparently with 50,000 followers. The good, bad, and ugly.",
      category: "Founder Lessons",
      readTime: "15 min",
      icon: Lightbulb,
    },
    {
      title: "The Fundraising Playbook for Indian Startups",
      description: "A step-by-step guide to raising your first institutional round in India's ecosystem.",
      category: "Playbooks",
      readTime: "20 min",
      icon: BookOpen,
    },
    {
      title: "How to Survive Your First Funding Winter",
      description: "Strategies that helped us extend runway from 6 months to 18 months without raising.",
      category: "Growth",
      readTime: "11 min",
      icon: TrendingUp,
    },
    {
      title: "The Hidden Costs of Free Users",
      description: "When freemium becomes a drain instead of a growth engine—a financial breakdown.",
      category: "Mistakes",
      readTime: "9 min",
      icon: AlertTriangle,
    },
    {
      title: "Product-Market Fit: What It Actually Feels Like",
      description: "Beyond the metrics—the qualitative signals that told us we'd found PMF.",
      category: "Founder Lessons",
      readTime: "14 min",
      icon: Lightbulb,
    },
    {
      title: "The Complete Guide to Startup Metrics",
      description: "Which KPIs actually matter at each stage of your startup journey. No vanity metrics.",
      category: "Playbooks",
      readTime: "18 min",
      icon: BookOpen,
    },
    {
      title: "Delegation: The Hardest Lesson for Founders",
      description: "How learning to let go helped us scale from 5 to 50 people in 8 months.",
      category: "Founder Lessons",
      readTime: "10 min",
      icon: Lightbulb,
    },
    {
      title: "Why We Stopped Chasing Vanity Metrics",
      description: "The moment we realized downloads meant nothing without retention—and what we did instead.",
      category: "Growth",
      readTime: "7 min",
      icon: TrendingUp,
    },
    {
      title: "The Startup Pricing Playbook",
      description: "How to price your product when you have zero data to work with. Framework included.",
      category: "Playbooks",
      readTime: "16 min",
      icon: BookOpen,
    },
    {
      title: "Common Cap Table Mistakes That Haunt You Later",
      description: "The equity decisions we made in year 1 that came back to bite us in year 3.",
      category: "Mistakes",
      readTime: "13 min",
      icon: AlertTriangle,
    },
    {
      title: "From Zero to First Paying Customer",
      description: "The exact process we used to land our first 10 customers—with scripts and templates.",
      category: "Playbooks",
      readTime: "12 min",
      icon: BookOpen,
    },
    {
      title: "Burnout: The Silent Startup Killer",
      description: "How we rebuilt our culture after losing 3 key team members to exhaustion.",
      category: "Founder Lessons",
      readTime: "11 min",
      icon: Lightbulb,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Mistakes":
        return "bg-red-50 text-red-600 border-red-200";
      case "Growth":
        return "bg-green-50 text-green-600 border-green-200";
      case "Playbooks":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-purple-50 text-purple-600 border-purple-200";
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#FF4D8D] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#FF7A18] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4">Insights</h1>
            <p className="text-2xl text-gray-300">
              Data-driven lessons and playbooks from founders who've been there
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-[#111111] to-[#2A2A2A] text-white rounded-3xl p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4D8D]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF7A18]/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                Featured Research
              </span>
              <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm">
                {featuredInsight.dataPoints}
              </span>
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight max-w-3xl">
              {featuredInsight.title}
            </h2>
            <p className="text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl">
              {featuredInsight.description}
            </p>
            <div className="flex items-center gap-6 mb-8 text-gray-400">
              <span className="font-medium text-white">{featuredInsight.author}</span>
              <span>{featuredInsight.readTime} read</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(featuredInsight.category)}`}>
                {featuredInsight.category}
              </span>
            </div>
            <button className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-10 py-4 rounded-full hover:shadow-2xl hover:shadow-pink-500/50 transition-all flex items-center gap-2 group text-lg font-medium">
              Read Full Analysis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent" />
            <span className="text-[#6B6B6B] font-medium">Filter by category</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent" />
          </div>
          <div className="flex gap-3 justify-center overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white shadow-lg"
                    : "bg-[#FAFAFA] text-[#6B6B6B] hover:bg-[#EAEAEA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <article
                key={i}
                className="bg-white p-8 rounded-2xl border-2 border-[#EAEAEA] hover:border-[#FF4D8D] hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(insight.category)}`}>
                    {insight.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-3 group-hover:text-[#FF4D8D] transition-colors leading-tight">
                  {insight.title}
                </h3>
                <p className="text-[#6B6B6B] mb-4 leading-relaxed">
                  {insight.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[#EAEAEA]">
                  <span className="text-sm text-[#6B6B6B]">{insight.readTime} read</span>
                  <ArrowRight className="w-5 h-5 text-[#FF4D8D] group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <section className="bg-gradient-to-br from-[#FFFBF0] to-white border-y-2 border-[#FFD84D] py-20 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-[#111111] mb-4">
            Want insights delivered to your inbox?
          </h2>
          <p className="text-[#6B6B6B] mb-8 text-lg leading-relaxed">
            Get our best lessons, playbooks, and research every week—no fluff, just actionable insights
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full border-2 border-[#EAEAEA] focus:outline-none focus:border-[#FF4D8D] transition-colors"
            />
            <button className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-pink-500/30 transition-all whitespace-nowrap font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
