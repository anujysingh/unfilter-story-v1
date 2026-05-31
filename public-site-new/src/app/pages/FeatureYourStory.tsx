import { useState } from "react";
import { Send, CheckCircle2, Upload, Sparkles, Award, Star, Newspaper } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function FeatureYourStory() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
  };

  const benefits = [
    {
      icon: <Award className="w-6 h-6 text-[#FF4D8D]" />,
      title: "Editorial Spotlight",
      desc: "Our senior editors work with you to craft a deep-dive narrative that highlights your journey's raw reality."
    },
    {
      icon: <Star className="w-6 h-6 text-[#FF4D8D]" />,
      title: "Premium Reach",
      desc: "Featured stories are prioritized on our homepage and sent to our exclusive network of 50k+ founders and VCs."
    },
    {
      icon: <Newspaper className="w-6 h-6 text-[#FF4D8D]" />,
      title: "Visual Excellence",
      desc: "Every featured story receives custom photography and a dedicated editorial layout for maximum impact."
    }
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Premium Hero Section */}
      <section className="bg-[#111111] text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=2000"
            alt="Feature Hero"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-[#111111]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-[0.2em] text-[#FF4D8D] uppercase border border-[#FF4D8D]/30 rounded-full bg-[#FF4D8D]/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> Editorial Exclusive
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
            Be the Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18]">Feature Story.</span>
          </h1>
          <p className="text-xl md:text-3xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
            We're looking for the most authentic, raw, and impactful startup journeys. No PR fluff—just the real story of how you built it.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-20">
          {/* Sidebar: Benefits */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-[#111111] tracking-tight">Why get featured?</h2>
              <p className="text-xl text-[#6B6B6B] leading-relaxed">Featured stories are curated editorials that go beyond the surface level.</p>
              <div className="h-1.5 w-20 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] rounded-full" />
            </div>

            <div className="space-y-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 group-hover:border-[#FF4D8D]/30 group-hover:shadow-md transition-all">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111111] mb-2">{benefit.title}</h3>
                    <p className="text-[#6B6B6B] leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-[#111111] rounded-[2rem] text-white space-y-6 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF4D8D]/10 rounded-full blur-3xl" />
               <h4 className="text-xl font-bold relative z-10">Editorial Selection</h4>
               <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                 Unlike Guest Posts which are community contributions, Feature Stories are selected by our editorial board based on depth, impact, and authenticity.
               </p>
               <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selection Rate</span>
                  <span className="text-[#FF4D8D] font-bold">~5% of Submissions</span>
               </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-7">
            {status === 'success' ? (
              <div className="bg-white border border-[#FF4D8D]/20 rounded-[3rem] p-16 text-center shadow-xl animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[#FF4D8D]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12 text-[#FF4D8D]" />
                </div>
                <h2 className="text-4xl font-bold text-[#111111] mb-6 tracking-tight">Application Received</h2>
                <p className="text-[#6B6B6B] text-xl mb-10 leading-relaxed font-light">
                  Thank you for applying for a Feature Story. Our editorial team will review your submission and contact you within 48 hours if there's a match.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="bg-[#111111] text-white px-12 py-5 rounded-2xl font-bold hover:bg-black transition-all hover:shadow-lg"
                >
                  Apply Again
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Your Full Name</label>
                      <input required type="text" placeholder="John Doe" className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <input required type="email" placeholder="john@company.com" className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Company Name</label>
                      <input required type="text" placeholder="TechFlow Inc." className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Role / Position</label>
                      <input required type="text" placeholder="Founder / CEO" className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Proposed Story Hook</label>
                    <input required type="text" placeholder="E.g., How we survived a 90% revenue drop overnight" className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">The Unfiltered Truth (Brief Summary)</label>
                    <textarea required rows={6} placeholder="Give us a glimpse into the raw, messy parts of your story..." className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all resize-none" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Supporting Links / Pitch Deck (Optional)</label>
                    <div className="w-full h-40 border-2 border-dashed border-[#EAEAEA] rounded-[2rem] flex flex-col items-center justify-center text-[#6B6B6B] hover:border-[#FF4D8D] hover:bg-[#FDFDFD] transition-all cursor-pointer group/upload">
                      <Upload className="w-8 h-8 mb-4 text-[#FF4D8D] group-hover/upload:-translate-y-1 transition-transform" />
                      <span className="text-sm font-bold">Upload Pitch Deck or Supporting Documents</span>
                      <span className="text-xs text-gray-400 mt-2">PDF, PNG, JPG up to 10MB</span>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-[#FF4D8D]/20 flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-[#FF4D8D]/30 transition-all hover:-translate-y-1">
                    Apply for Featured Story
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
