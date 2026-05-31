import { Clock, ArrowRight, Play, Headphones, FileText } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

export default function Stories() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Failures",
    "Pivots",
    "Founder Journeys",
    "Behind the Scenes",
  ];

  const featuredStory = {
    id: "story-1",
    title: "We Burned $5M Before We Learned This One Truth",
    hook: "A brutally honest video documentary of how we almost destroyed everything—and the pivot that saved us.",
    author: "Vikram Shah",
    duration: "32 min",
    category: "Failure",
    type: "video",
    views: "127K",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=600&fit=crop",
  };

  const stories = [
    {
      id: "story-2",
      title: "From 10 Employees to Zero: Our Shutdown Story",
      hook: "The hardest decision we ever made, and what we learned from letting everyone go.",
      category: "Failure",
      author: "Ananya Reddy",
      duration: "18 min",
      type: "video",
      views: "89K",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop",
    },
    {
      id: "story-3",
      title: "We Pivoted 7 Times in 2 Years",
      hook: "Each pivot felt like starting over. Hear the full journey on our podcast.",
      category: "Pivot",
      author: "Rohan Gupta",
      duration: "52 min",
      type: "podcast",
      views: "45K",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop",
    },
    {
      id: "story-4",
      title: "Rejected by 50 Investors: A Founder's Diary",
      hook: "The emotional toll of constant rejection and how we kept going.",
      category: "Founder Journey",
      author: "Meera Joshi",
      duration: "12 min read",
      type: "article",
      views: "62K",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    },
  ];

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="w-4 h-4" />;
      case "podcast": return <Headphones className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#FF4D8D] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#FF7A18] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-3">Startup Stories</h1>
            <p className="text-lg text-gray-300">
              Raw, unfiltered stories from the trenches of building startups
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link to={`/stories/${featuredStory.id}`} className="block bg-gradient-to-br from-[#111111] to-[#2A2A2A] text-white rounded-3xl overflow-hidden mb-16 hover:shadow-2xl hover:shadow-pink-500/20 transition-all border-2 border-transparent hover:border-[#FF4D8D]">
          <div className="grid md:grid-cols-2">
            <div className="p-12 flex flex-col justify-center order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#FFD84D] text-[#111111] px-3 py-1 rounded-full text-sm font-medium">
                  {featuredStory.category}
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  {getMediaIcon(featuredStory.type)}
                  {featuredStory.duration}
                </span>
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                {featuredStory.title}
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed line-clamp-2">
                {featuredStory.hook}
              </p>
              <div className="flex items-center gap-6 mb-8 text-gray-400">
                <span className="font-medium text-white">{featuredStory.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredStory.views} views
                </span>
              </div>
              <div className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-8 py-4 rounded-full hover:shadow-xl transition-all flex items-center gap-2 group w-fit font-bold">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Documentary
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="relative h-full min-h-[500px] order-1 md:order-2">
              <ImageWithFallback
                src={featuredStory.image}
                alt={featuredStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                <div className="w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-12 h-12 text-[#FF4D8D] ml-2" />
                </div>
              </div>
            </div>
          </div>
        </Link>

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

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <Link
              key={i}
              to={`/stories/${story.id}`}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white border-2 border-[#EAEAEA] hover:border-[#FF4D8D] hover:shadow-2xl hover:scale-[1.03] transition-all"
            >
              <div className="relative">
                <ImageWithFallback
                  src={story.image}
                  alt={story.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  {story.type === "video" && (
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                      <Play className="w-7 h-7 text-[#FF4D8D] ml-1" />
                    </div>
                  )}
                  {story.type === "podcast" && (
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                      <Headphones className="w-7 h-7 text-[#FF4D8D]" />
                    </div>
                  )}
                </div>
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                  {getMediaIcon(story.type)}
                  {story.duration}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#111111] px-3 py-1.5 rounded-full text-xs font-medium">
                  {story.views} views
                </div>
              </div>
              <div className="p-6">
                <span className="inline-block bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-3 py-1 rounded-full text-xs mb-3 font-bold">
                  {story.category}
                </span>
                <h3 className="text-xl font-bold text-[#111111] mb-3 group-hover:text-[#FF4D8D] transition-colors leading-tight">
                  {story.title}
                </h3>
                <p className="text-[#6B6B6B] mb-4 leading-relaxed line-clamp-2">{story.hook}</p>
                <div className="flex items-center justify-between text-sm text-[#6B6B6B] pt-4 border-t border-[#EAEAEA]">
                  <span className="font-bold">{story.author}</span>
                  <ArrowRight className="w-5 h-5 text-[#FF4D8D] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="bg-gradient-to-br from-[#FFFBF0] to-white border-t-2 border-[#FFD84D] py-16 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-[#111111] mb-4">
            Have a Story to Share?
          </h2>
          <p className="text-[#6B6B6B] mb-8 text-lg leading-relaxed">
            We're always looking for real founders willing to share their unfiltered journeys.
            Your story could inspire thousands.
          </p>
          <Link
            to="/feature-your-story"
            className="inline-block bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-10 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all font-bold text-lg"
          >
            Submit Your Story
          </Link>
        </div>
      </section>
    </div>
  );
}
