import { useParams, Link } from "react-router";
import { Clock, ArrowLeft, Calendar, User } from "lucide-react";
import { mockNews } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import ShareButtons from "../components/ShareButtons";

export default function NewsDetail() {
  const { id } = useParams();
  const news = mockNews.find((n) => n.id === id);

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">News not found</h2>
          <Link to="/news" className="text-[#FF4D8D] font-medium flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>
        </div>
      </div>
    );
  }

  const relatedNews = mockNews.filter((n) => n.id !== id).slice(0, 3);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] text-white overflow-hidden py-20">
        <div className="max-w-4xl mx-auto px-6 relative">
          <Link to="/news" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> News
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#FFD84D] text-[#111111] px-3 py-1 rounded-full text-xs font-medium">
              {news.category}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {news.timestamp}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {news.title}
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAEAEA]">
          <ImageWithFallback
            src={news.thumbnail}
            alt={news.title}
            className="w-full h-[400px] object-cover"
          />
          
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[#6B6B6B]">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Editorial Team</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B6B6B]">
                  <Calendar className="w-4 h-4" />
                  <span>Apr 28, 2026</span>
                </div>
              </div>
              <ShareButtons url={window.location.href} title={news.title} />
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-[#111111] font-medium leading-relaxed mb-8">
                {news.excerpt}
              </p>
              <div className="text-[#444444] leading-relaxed space-y-6 text-lg">
                {news.content.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related News */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold mb-8">Related News</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedNews.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group block"
              >
                <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-[#EAEAEA]">
                  <ImageWithFallback
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-bold text-[#111111] group-hover:text-[#FF4D8D] transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
