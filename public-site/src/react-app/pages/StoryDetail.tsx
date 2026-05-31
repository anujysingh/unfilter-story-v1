import { Clock, ArrowLeft, Play, Headphones, FileText, User, Share2 } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import ShareButtons from "../components/ShareButtons";

const Link = ({ to, children, ...props }: { to: string; children: any; [key: string]: any }) => {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
};

export default function StoryDetail({ article, relatedStories = [] }: { article?: any; relatedStories?: any[] }) {
  const getMediaIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="w-4 h-4" />;
      case "podcast": return <Headphones className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const defaultStory = {
    id: "story-1",
    title: "We Burned $5M Before We Learned This One Truth",
    hook: "A brutally honest video documentary of how we almost destroyed everything—and the pivot that saved us.",
    author: "Vikram Shah",
    duration: "32 min",
    category: "Failure",
    type: "video",
    views: "127K",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=600&fit=crop",
    body: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"
  };

  const activeStory = article ? {
    id: article.slug || "story",
    title: article.headline,
    hook: article.summary || article.body?.replace(/<[^>]*>/g, '').substring(0, 160) + "...",
    author: article.author || "Editorial Team",
    duration: article.readingTimeMins ? `${article.readingTimeMins} min read` : "5 min read",
    category: article.category || "Founder Journey",
    type: "article",
    views: "12K",
    image: article.featuredImageUrl || "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=600&fit=crop",
    body: article.body
  } : defaultStory;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] text-white overflow-hidden py-24">
        <div className="max-w-4xl mx-auto px-6 relative">
          <Link to="/stories" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Stories
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#FF4D8D] text-white px-3 py-1 rounded-full text-xs font-medium">
              {activeStory.category}
            </span>
            <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              {getMediaIcon(activeStory.type)}
              {activeStory.duration}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {activeStory.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="text-white font-medium">{activeStory.author}</span>
            <span>•</span>
            <span>{activeStory.views} views</span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EAEAEA]">
          {activeStory.image && (
            <div className="relative group">
              <ImageWithFallback
                src={activeStory.image}
                alt={activeStory.title}
                className="w-full h-[450px] object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all cursor-pointer">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                  {getMediaIcon(activeStory.type)}
                </div>
              </div>
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] flex items-center justify-center text-white font-bold text-xl">
                  {activeStory.author[0]}
                </div>
                <div>
                  <p className="font-bold text-[#111111]">{activeStory.author}</p>
                  <p className="text-sm text-[#6B6B6B]">Founder / Contributor</p>
                </div>
              </div>
              <ShareButtons url={currentUrl} title={activeStory.title} />
            </div>

            <div className="prose prose-lg max-w-none">
              {activeStory.hook && (
                <p className="text-2xl text-[#111111] font-semibold leading-tight italic mb-10 border-l-4 border-[#FF4D8D] pl-6">
                  "{activeStory.hook}"
                </p>
              )}
              <div 
                className="text-[#444444] leading-relaxed space-y-6 text-lg prose-p:font-sans prose-p:text-gray-800 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-gray-900"
                dangerouslySetInnerHTML={{ __html: activeStory.body }}
              />
            </div>
          </div>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold mb-8">More Stories</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedStories.map((item) => (
                <Link
                  key={item.id || item.slug}
                  to={`/article/${item.slug || item.id}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-[#EAEAEA] relative">
                    <ImageWithFallback
                      src={item.featuredImageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop"}
                      alt={item.headline || item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px]">
                      {item.readingTimeMins ? `${item.readingTimeMins} min read` : "5 min read"}
                    </div>
                  </div>
                  <h4 className="font-bold text-[#111111] group-hover:text-[#FF4D8D] transition-colors line-clamp-2">
                    {item.headline || item.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
