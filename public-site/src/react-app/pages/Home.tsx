import { useState, useRef } from "react";
import { Play, Clock, Calendar, TrendingUp, ArrowRight, ChevronLeft, ChevronRight, FileText, Headphones, Sparkles, ExternalLink, User, Send, CheckCircle2 } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import SliderImport from "react-slick";
// react-slick is CommonJS; under Astro SSR the default import is wrapped as
// { default: Slider }, while the client build unwraps it. Normalize for both.
const Slider = ((SliderImport as any).default ?? SliderImport) as typeof SliderImport;
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Link = ({ to, children, ...props }: { to: string; children: any; [key: string]: any }) => {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
};

export default function Home({ articles = [] }: { articles?: any[] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const sliderRef = useRef<any>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubscribeStatus('error');
      return;
    }
    setSubscribeStatus('success');
    setEmail('');
    setTimeout(() => setSubscribeStatus('idle'), 3000);
  };

  // Hero Section Data (Dynamic fallback to mock data)
  const featuredDbStory = articles.length > 0 ? articles[0] : null;
  const featuredStory = {
    id: featuredDbStory?.slug || "story-1",
    title: featuredDbStory?.headline || "The Day We Lost Everything: A $5M Startup Goes to Zero",
    description: featuredDbStory?.summary || featuredDbStory?.body?.replace(/<[^>]*>/g, '').substring(0, 160) + "..." || "How poor unit economics, rapid expansion, and investor pressure led to a complete shutdown in 90 days.",
    industry: featuredDbStory?.category || "SaaS",
    author: featuredDbStory?.author || "Priya Sharma",
    date: featuredDbStory?.publishedAt ? new Date(featuredDbStory.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Apr 24, 2026",
    readTime: featuredDbStory?.readingTimeMins ? `${featuredDbStory.readingTimeMins} min` : "15 min",
    image: featuredDbStory?.featuredImageUrl || "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=800&fit=crop",
    type: "video"
  };

  const quickFeed = articles.length > 1 ? articles.slice(1, 4).map((art) => ({
    id: art.slug,
    title: art.headline,
    author: art.author || "Editorial Team",
    time: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "2h ago",
    image: art.featuredImageUrl || "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
  })) : [
    {
      id: "news-2",
      title: "Why We Pivoted After Series A: Investors Hated It",
      author: "Rahul M.",
      time: "2h ago",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
    },
    {
      id: "news-3",
      title: "Firing My Co-founder: The Hardest Decision I Made",
      author: "Anjali K.",
      time: "5h ago",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
    },
    {
      id: "news-4",
      title: "How We Burned $2M in 6 Months and Survived",
      author: "Vikram S.",
      time: "8h ago",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    },
  ];

  // Live News Ticker Data
  const liveNews = articles.length > 0 ? articles.slice(0, 5).map((art) => ({
    id: art.slug,
    title: art.headline,
    time: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "2h ago"
  })) : [
    { id: "news-1", title: "Zepto raises $350M at $5B valuation from Nexus, Glade Brook", time: "2h ago" },
    { id: "news-2", title: "Dream11 lays off 150 employees amid cost optimization", time: "4h ago" },
    { id: "news-3", title: "Swiggy launches AI-powered delivery routing in 12 cities", time: "6h ago" },
    { id: "news-4", title: "PhonePe acquires ZestMoney for $50M in all-cash deal", time: "8h ago" },
    { id: "news-5", title: "Meesho crosses 1B monthly active users milestone", time: "10h ago" },
  ];

  // Latest Funding Rounds
  const fundingRounds = [
    { id: "comp-1", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop", name: "FlashCommerce", founded: "2022", stage: "Series A", amount: "$15M", industry: "E-commerce" },
    { id: "comp-2", logo: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop", name: "HealthTech AI", founded: "2021", stage: "Series B", amount: "$42M", industry: "HealthTech" },
    { id: "comp-3", logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop", name: "FinFlow", founded: "2023", stage: "Seed", amount: "$3.2M", industry: "Fintech" },
    { id: "comp-4", logo: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=100&h=100&fit=crop", name: "LogiChain", founded: "2020", stage: "Series C", amount: "$85M", industry: "Logistics" },
    { id: "comp-5", logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop", name: "EduNext", founded: "2022", stage: "Series A", amount: "$22M", industry: "EdTech" },
  ];

  const industries = ["All", "SaaS", "Fintech", "AI/ML", "HealthTech", "E-commerce"];

  const allStories = articles.length > 4 ? articles.slice(4).map((art) => ({
    id: art.slug,
    title: art.headline,
    description: art.summary || art.body?.replace(/<[^>]*>/g, '').substring(0, 120) + "...",
    industry: art.category || "Startups",
    author: art.author || "Editorial Team",
    date: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Apr 26, 2026",
    readTime: art.readingTimeMins ? `${art.readingTimeMins} min read` : "10 min read",
    image: art.featuredImageUrl || "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop"
  })) : [
    { id: "story-2", title: "We Celebrated Series A. Three Months Later, We Shut Down.", description: "How we misread our metrics, spent too fast, and learned the hard way that revenue != profit.", industry: "SaaS", author: "Arjun Mehta", date: "Apr 26, 2026", readTime: "10 min read", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop" },
    { id: "story-3", title: "Scaling from 10 to 100: What Nobody Tells You", description: "The brutal truth about hiring, culture dilution, and maintaining velocity at scale.", industry: "Fintech", author: "Neha Gupta", date: "Apr 25, 2026", readTime: "12 min read", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop" },
    { id: "story-4", title: "We Pivoted 7 Times Before Finding Product-Market Fit", description: "From B2B SaaS to D2C marketplace: the survival story of constant reinvention.", industry: "E-commerce", author: "Karan Singh", date: "Apr 24, 2026", readTime: "14 min read", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop" },
  ];

  const filteredStories = activeFilter === "All" ? allStories : allStories.filter(story => story.industry === activeFilter);

  // Guest Stories for Community Section
  const communityStories = [
    { title: "Building a Global Brand from a Small Town", contributor: "Anshul J.", tag: "Guest Story", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop" },
    { title: "Why Unit Economics Matter More Than Hype", contributor: "Anjali M.", tag: "Guest Story", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" },
    { title: "My Journey as a Solo Founder", contributor: "Elena R.", tag: "Guest Story", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop" }
  ];

  return (
    <div className="bg-white">
      {/* Live News Ticker */}
      <section className="border-b-2 border-[#F4C542] bg-[#FFFBF0] overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center h-14">
          <div className="bg-[#FFFBF0] px-6 h-full flex items-center gap-3 z-10 border-r border-[#EAEAEA]">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-bold text-[#111111] tracking-wider text-sm">LIVE</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee flex items-center whitespace-nowrap">
              {[...liveNews, ...liveNews].map((news, i) => (
                <Link 
                  key={i} 
                  to={`/article/${news.id}`} 
                  className="inline-flex items-center gap-2 px-8 text-[#111111] hover:text-[#FF7A18] transition-colors border-r border-gray-300 last:border-0"
                >
                  <span className="font-bold text-[15px]">{news.title}</span>
                  <span className="text-gray-400 text-sm">• {news.time}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-10 gap-8">
          <Link to={`/article/${featuredStory.id}`} className="md:col-span-7 group cursor-pointer rounded-2xl overflow-hidden border border-[#EAEAEA] hover:border-[#FF7A18] transition-all h-full">
            <div className="relative h-[600px]">
              <ImageWithFallback src={featuredStory.image} alt={featuredStory.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-1.5 rounded-xl text-sm mb-4 inline-block font-bold">{featuredStory.industry}</span>
                <h2 className="text-4xl font-bold text-white mb-3 leading-tight group-hover:text-[#FFD84D] transition-colors">{featuredStory.title}</h2>
                <p className="text-lg text-white/90 mb-4 max-w-2xl line-clamp-2">{featuredStory.description}</p>
                <div className="flex items-center gap-4 text-white/70 text-sm font-medium">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{featuredStory.author}</span></div>
                  <span>•</span><span>{featuredStory.date}</span><span>•</span>
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{featuredStory.readTime}</span></div>
                </div>
              </div>
            </div>
          </Link>
          <div className="md:col-span-3">
            <div className="sticky top-24 space-y-4">
              <h3 className="text-sm tracking-wider uppercase font-bold text-[#111111] mb-4">Quick Feed</h3>
              {quickFeed.map((item, i) => (
                <Link key={i} to={`/article/${item.id}`} className="flex gap-3 group cursor-pointer border-b border-[#F9F9F9] pb-4 last:border-0">
                  <ImageWithFallback src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0 border border-[#EAEAEA] group-hover:border-[#FF7A18] transition-all" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#111111] mb-1 line-clamp-2 group-hover:text-[#FF7A18] transition-colors">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-medium"><span>{item.author}</span><span>•</span><span>{item.time}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Funding Rounds */}
      <section className="bg-[#F9F9F9] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="text-3xl font-bold text-[#111111] mb-2">Latest Funding Rounds</h2><p className="text-[#6B6B6B]">Fresh capital and new milestones in the startup ecosystem</p></div>
            <div className="flex gap-2">
              <button onClick={() => sliderRef.current?.slickPrev()} className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center hover:border-[#FF7A18] hover:text-[#FF7A18] transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => sliderRef.current?.slickNext()} className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center hover:border-[#FF7A18] hover:text-[#FF7A18] transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <Slider ref={sliderRef} {...{ dots: false, infinite: true, speed: 500, slidesToShow: 4, slidesToScroll: 1, arrows: false, responsive: [{ breakpoint: 1024, settings: { slidesToShow: 3 } }, { breakpoint: 768, settings: { slidesToShow: 2 } }, { breakpoint: 480, settings: { slidesToShow: 1 } }] }}>
            {fundingRounds.map((round, i) => (
              <div key={i} className="px-3">
                <Link to={`/funding/${round.id}`} className="bg-white rounded-2xl p-6 border border-[#EAEAEA] hover:border-[#FF7A18] hover:shadow-lg transition-all cursor-pointer block">
                  <ImageWithFallback src={round.logo} alt={round.name} className="w-16 h-16 object-cover rounded-xl mb-4 border border-[#EAEAEA]" />
                  <h3 className="font-bold text-[#111111] mb-1">{round.name}</h3>
                  <p className="text-sm text-[#6B6B6B] mb-3 font-medium">Founded {round.founded}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-3 py-1 rounded-full text-xs font-bold">{round.stage}</span>
                    <span className="font-bold text-[#111111]">{round.amount}</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] font-bold">{round.industry}</p>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Featured Startup Stories */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-8 flex justify-between items-end"><h2 className="text-3xl font-bold text-[#111111]">Startup Stories</h2><Link to="/stories" className="text-[#FF7A18] font-bold hover:gap-2 flex items-center gap-1 transition-all">View All Stories <ArrowRight className="w-4 h-4" /></Link></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 grid md:grid-cols-3 gap-8">
            {filteredStories.map((story, i) => (
              <Link key={i} to={`/article/${story.id}`} className="group cursor-pointer rounded-2xl overflow-hidden border border-[#EAEAEA] hover:border-[#FF7A18] hover:shadow-xl transition-all bg-white">
                <div className="relative"><ImageWithFallback src={story.image} alt={story.title} className="w-full h-56 object-cover" /></div>
                <div className="p-6">
                  <span className="text-[#FF7A18] text-xs font-bold uppercase mb-2 block">{story.industry}</span>
                  <h3 className="font-bold text-[#111111] mb-2 group-hover:text-[#FF7A18] transition-colors leading-tight line-clamp-2">{story.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#6B6B6B] font-medium"><span>{story.author}</span><span>•</span><span>{story.readTime}</span></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-[#F9F9F9] rounded-2xl p-6 border border-[#EAEAEA]">
              <h3 className="font-bold text-[#111111] mb-4">Filter by Industry</h3>
              <div className="space-y-2">
                {industries.map((ind) => (
                  <button key={ind} onClick={() => setActiveFilter(ind)} className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeFilter === ind ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white" : "bg-white text-[#6B6B6B] hover:border-[#FF7A18] border border-[#EAEAEA]"}`}>{ind}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* From the Community Section */}
      <section className="bg-white py-24 border-t border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-[#111111] mb-2 tracking-tight">Community Guest Posts</h2>
              <p className="text-[#6B6B6B] text-xl font-light">Real voices and raw experiences shared by the startup community.</p>
            </div>
            <Link to="/guest-post" className="text-[#FF4D8D] font-bold hover:gap-3 flex items-center gap-2 transition-all group">
              Browse All Guest Posts <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {communityStories.map((story, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-6 border border-[#EAEAEA] shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <ImageWithFallback src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-md text-[#111111] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {story.tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-3 group-hover:text-[#FF4D8D] transition-colors line-clamp-2 leading-tight">
                  {story.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <span className="font-bold text-[#111111]">{story.contributor}</span>
                  <span>•</span>
                  <span>Community Member</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-24 bg-[#F8F9FA] border-t border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-[#111111] tracking-tight">Our Partners</h2>
            <p className="text-[#6B6B6B] text-xl font-light">Collaborating with the world's most innovative organizations.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 items-center">
            {[
              { name: "TechStars", logo: "https://logo.clearbit.com/techstars.com" },
              { name: "Y Combinator", logo: "https://logo.clearbit.com/ycombinator.com" },
              { name: "Accel", logo: "https://logo.clearbit.com/accel.com" },
              { name: "Sequoia", logo: "https://logo.clearbit.com/sequoiacap.com" },
              { name: "Andreessen Horowitz", logo: "https://logo.clearbit.com/a16z.com" },
              { name: "SoftBank", logo: "https://logo.clearbit.com/softbank.jp" }
            ].map((partner, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group grayscale hover:grayscale-0 transition-all duration-500">
                <div className="w-20 h-20 flex items-center justify-center p-4 rounded-2xl bg-white shadow-sm group-hover:shadow-md transition-all">
                   <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D8D] via-[#FF7A18] to-[#FF4D8D]" /><div className="absolute inset-0 opacity-10"><div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" /><div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F4C542] rounded-full blur-3xl" /></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white"><h2 className="text-4xl font-bold mb-4">Get Real Startup Stories</h2><p className="text-2xl mb-6 opacity-90">No fluff. No hype. Just the truth.</p><p className="text-white/80 font-medium">Join 10,000+ founders and builders in the truth-first ecosystem.</p></div>
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <h3 className="text-2xl font-bold text-[#111111] mb-2">Subscribe to Our Newsletter</h3>
              {subscribeStatus === 'success' ? (
                <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 flex items-center gap-3"><CheckCircle2 className="w-6 h-6" /><p className="font-bold">Subscribed successfully!</p></div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={`w-full px-5 py-4 border rounded-xl focus:outline-none transition-colors ${subscribeStatus === 'error' ? 'border-red-500' : 'border-[#EAEAEA] focus:border-[#FF7A18]'}`} />
                  <button type="submit" className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-6 py-4 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 group font-bold text-lg">Subscribe Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
