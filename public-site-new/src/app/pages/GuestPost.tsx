import { Clock, User, Send, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

export default function GuestPost() {
  const [submitted, setSubmitted] = useState(false);

  const guestStories = [
    {
      title: "Why Unit Economics Matter More Than Valuation",
      contributor: "Anjali Mehta",
      time: "5 hours ago",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      tag: "Guest Post"
    },
    {
      title: "The Hard Truth About Hiring Your First 10 Employees",
      contributor: "Vikram Singh",
      time: "8 hours ago",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
      tag: "Guest Post"
    },
    {
      title: "How We Survived a 90% Revenue Drop Overnight",
      contributor: "Priya Gupta",
      time: "1 day ago",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
      tag: "Guest Post"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#111111] text-white py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FF4D8D]/10 skew-x-12 transform translate-x-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.2em] text-[#FF4D8D] uppercase border border-[#FF4D8D]/30 rounded-full bg-[#FF4D8D]/10">
              Community Voice
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18]">Perspective.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-light">
              Guest Posts are community-submitted insights. Share your journey, lessons, and raw truths with thousands of fellow founders and operators.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Content: Recent Guest Posts */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <h2 className="text-3xl font-bold text-[#111111]">Recent Guest Posts</h2>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4D8D]" />
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <div className="w-2 h-2 rounded-full bg-gray-200" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {guestStories.map((story, i) => (
                <div key={i} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#FF4D8D]/30 hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[16/10]">
                    <ImageWithFallback
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md text-[#111111] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {story.tag}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 text-sm text-[#6B6B6B] mb-4">
                       <span className="font-bold text-[#111111]">{story.contributor}</span>
                       <span>•</span>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.time}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#111111] mb-4 group-hover:text-[#FF4D8D] transition-colors line-clamp-2 leading-tight">
                      {story.title}
                    </h3>
                    <button className="text-[#FF4D8D] font-bold text-sm uppercase tracking-wider flex items-center gap-2 group/btn">
                      Read Story <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            <div className="pt-10 text-center">
               <button className="px-12 py-4 rounded-2xl border-2 border-[#111111] text-[#111111] font-black hover:bg-[#111111] hover:text-white transition-all">
                 Browse All Community Posts
               </button>
            </div>
          </div>

          {/* Sidebar: Submission Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-[#111111] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF4D8D]/20 rounded-full blur-3xl" />
                
                {!submitted ? (
                  <div className="relative z-10 space-y-8">
                    <div>
                      <div className="w-16 h-16 bg-[#FF4D8D]/10 rounded-2xl flex items-center justify-center mb-6">
                        <FileText className="w-8 h-8 text-[#FF4D8D]" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">Submit Your Post</h2>
                      <p className="text-gray-400">Share your story with our community. We review and publish high-quality, authentic insights weekly.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Your Name" 
                          className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#FF4D8D] transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Email Address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="your@email.com" 
                          className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#FF4D8D] transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-2">Story Draft Link / Content</label>
                        <textarea 
                          required
                          placeholder="Link to Google Doc or paste your story hook here..." 
                          className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 h-32 focus:outline-none focus:border-[#FF4D8D] transition-colors resize-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white py-5 rounded-2xl font-black text-lg hover:shadow-lg hover:shadow-[#FF4D8D]/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                      >
                        Submit for Review <Send className="w-5 h-5" />
                      </button>
                    </form>

                    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <AlertCircle className="w-5 h-5 text-[#FF4D8D] shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        By submitting, you agree to our community guidelines. We prioritize authentic, data-driven, and non-promotional content.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 text-center py-10 space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-[#FF4D8D]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-[#FF4D8D]" />
                    </div>
                    <h2 className="text-3xl font-bold">Submission Received!</h2>
                    <p className="text-gray-400 leading-relaxed">
                      Thank you for sharing your story. Our editorial team will review it and get back to you within 3-5 business days.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-[#FF4D8D] font-bold uppercase tracking-widest text-sm"
                    >
                      Submit another post
                    </button>
                  </div>
                )}
              </div>

              {/* Difference Card */}
              <div className="mt-8 p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                <h4 className="font-bold text-[#111111] mb-4">Guest Post vs Feature Story</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D8D] mt-2 shrink-0" />
                    <p className="text-sm text-[#6B6B6B]"><strong>Guest Post:</strong> Open to all community members. Self-submitted perspectives.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A18] mt-2 shrink-0" />
                    <p className="text-sm text-[#6B6B6B]"><strong>Feature Story:</strong> Editorial-selected deep dives and exclusive interviews.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
