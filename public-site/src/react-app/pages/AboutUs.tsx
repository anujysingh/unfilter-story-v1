import { Users, Target, Shield, Zap, TrendingUp, Award } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function AboutUs({ content }: { content?: string }) {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-[#FF4D8D]" />,
      title: "Unfiltered Truth",
      description: "We strip away the PR fluff and success porn to show the raw reality of building a business."
    },
    {
      icon: <Shield className="w-8 h-8 text-[#FF4D8D]" />,
      title: "High Integrity",
      description: "Our reporting is rooted in facts, unit economics, and operational reality, not hype."
    },
    {
      icon: <Users className="w-8 h-8 text-[#FF4D8D]" />,
      title: "Founder First",
      description: "We prioritize the mental health and sustainable growth of the startup community."
    },
    {
      icon: <Zap className="w-8 h-8 text-[#FF4D8D]" />,
      title: "Real Impact",
      description: "Our insights aim to provide actionable value that helps builders survive and thrive."
    }
  ];

  const partners = [
    { name: "TechStars", logo: "https://logo.clearbit.com/techstars.com" },
    { name: "Y Combinator", logo: "https://logo.clearbit.com/ycombinator.com" },
    { name: "Accel", logo: "https://logo.clearbit.com/accel.com" },
    { name: "Sequoia", logo: "https://logo.clearbit.com/sequoiacap.com" },
    { name: "Andreessen Horowitz", logo: "https://logo.clearbit.com/a16z.com" },
    { name: "SoftBank", logo: "https://logo.clearbit.com/softbank.jp" }
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#111111]">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
            alt="About Hero"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/80 to-[#111111]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] text-[#FF4D8D] uppercase border border-[#FF4D8D]/30 rounded-full bg-[#FF4D8D]/10">
            Our Story
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight">
            The Truth, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18]">Unfiltered.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
            Unfilter Story is the voice of reality in a world addicted to startup hype. We document the raw, messy, and painful truth of building something from nothing.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FF4D8D]/5 rounded-full blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000"
                  alt="Our Mission"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-xl max-w-xs hidden md:block">
                <p className="text-4xl font-bold text-[#111111] mb-2">500+</p>
                <p className="text-[#6B6B6B] font-medium uppercase tracking-wider text-xs">Stories Published with Integrity</p>
              </div>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-[#111111] tracking-tight">Why We Exist</h2>
                <div className="h-1.5 w-20 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] rounded-full" />
              </div>
              
              <div className="prose prose-lg text-[#444444] space-y-6">
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <>
                    <p className="text-xl leading-relaxed">
                      The current startup media landscape is dominated by <strong>"success porn"</strong> and valuation-driven narratives. This creates a distorted reality for founders, leading to unnecessary burnout and misaligned expectations.
                    </p>
                    <p className="text-xl leading-relaxed">
                      Unfilter Story was founded to provide a counter-narrative—one rooted in unit economics, mental health, and operational reality. We are for the builders who value authenticity over optics.
                    </p>
                  </>
                )}
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8 pt-6">
                {values.slice(0, 2).map((v, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-12 h-12 bg-[#FF4D8D]/10 rounded-2xl flex items-center justify-center">
                      {v.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[#111111]">{v.title}</h3>
                    <p className="text-[#6B6B6B] leading-relaxed">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-32 bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold">Our Core Values</h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">The principles that guide our reporting and community.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-[#1A1A1A] p-10 rounded-3xl border border-white/5 hover:border-[#FF4D8D]/50 transition-all group">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{v.title}</h3>
                <p className="text-gray-400 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-20">
            <h2 className="text-4xl font-bold text-[#111111]">Our Partners</h2>
            <p className="text-[#6B6B6B] text-xl max-w-2xl mx-auto">Collaborating with the world's most innovative organizations.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 items-center opacity-60 hover:opacity-100 transition-opacity">
            {partners.map((partner, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group">
                <div className="w-24 h-24 grayscale hover:grayscale-0 transition-all duration-500 flex items-center justify-center p-4 rounded-2xl bg-[#F8F9FA] group-hover:shadow-lg">
                   <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] rounded-[3rem] p-16 md:p-24 text-white text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
               <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-[100px]" />
               <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-[100px]" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-6xl font-black">Ready to share your story?</h2>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
                Whether it's a guest post or a featured editorial, we want to hear the truth.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                <button className="bg-white text-[#FF4D8D] px-10 py-5 rounded-2xl font-black text-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  Submit Guest Post
                </button>
                <button className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white hover:text-[#FF4D8D] transition-all">
                  Feature Your Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
