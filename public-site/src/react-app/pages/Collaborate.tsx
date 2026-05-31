import { useState } from "react";
import { Send, CheckCircle2, Building2, User, Mail, MessageSquare, Link2, Paperclip, ChevronDown } from "lucide-react";

export default function Collaborate() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
  };

  const collabTypes = [
    "Media Partnership",
    "Brand Sponsorship",
    "Content Syndication",
    "Event Collaboration",
    "Research & Data Sharing",
    "Other"
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#111111] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF4D8D]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF7A18]/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-none">
              Let's Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18]">Together.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
              We're always looking for mission-aligned partners who value truth, transparency, and the raw reality of the startup ecosystem.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-20">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#111111]">Why Partner With Us?</h2>
              <p className="text-xl text-[#6B6B6B] leading-relaxed">
                Unfilter Story is more than just a media platform. It's a community of high-signal founders, investors, and operators who value authenticity over optics.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { 
                  title: "High-Signal Audience", 
                  desc: "Connect with thousands of decision-makers in the tech and startup space.",
                  icon: <User className="w-6 h-6 text-[#FF4D8D]" />
                },
                { 
                  title: "Premium Branding", 
                  desc: "Align your brand with honesty, integrity, and operational reality.",
                  icon: <Building2 className="w-6 h-6 text-[#FF4D8D]" />
                },
                { 
                  title: "Collaborative Storytelling", 
                  desc: "Co-create deep-dive investigations and data-driven industry reports.",
                  icon: <MessageSquare className="w-6 h-6 text-[#FF4D8D]" />
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 group-hover:border-[#FF4D8D]/30 transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111111] mb-2">{item.title}</h3>
                    <p className="text-[#6B6B6B] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
              <h4 className="text-xl font-bold text-[#111111]">Direct Inquiries</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center group-hover:bg-[#FF4D8D]/10 transition-colors">
                      <Mail className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#FF4D8D]" />
                    </div>
                    <span className="text-[#111111] font-bold group-hover:text-[#FF4D8D] transition-colors">partner@unfilterstory.com</span>
                 </div>
                 <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center group-hover:bg-[#FF4D8D]/10 transition-colors">
                      <Mail className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#FF4D8D]" />
                    </div>
                    <span className="text-[#111111] font-bold group-hover:text-[#FF4D8D] transition-colors">editorial@unfilterstory.com</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            {status === 'success' ? (
              <div className="bg-white border border-[#FF4D8D]/20 rounded-[3rem] p-16 text-center shadow-xl animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[#FF4D8D]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12 text-[#FF4D8D]" />
                </div>
                <h2 className="text-4xl font-bold text-[#111111] mb-6 tracking-tight">Collaboration Request Sent</h2>
                <p className="text-[#6B6B6B] text-xl mb-10 leading-relaxed font-light">
                  Thank you for your interest in collaborating with us. Our partnership team will review your request and reach out within 24-48 hours.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="bg-[#111111] text-white px-12 py-5 rounded-2xl font-bold hover:bg-black transition-all hover:shadow-lg"
                >
                  New Request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-2xl relative">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input required type="text" placeholder="John Doe" className="w-full pl-16 pr-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input required type="email" placeholder="john@brand.com" className="w-full pl-16 pr-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Organization / Brand</label>
                      <div className="relative">
                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input required type="text" placeholder="Company Name" className="w-full pl-16 pr-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Collaboration Type</label>
                      <div className="relative">
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select required className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all appearance-none cursor-pointer">
                          <option value="">Select Type</option>
                          {collabTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Project Details</label>
                    <textarea required rows={6} placeholder="Tell us about your collaboration idea..." className="w-full px-8 py-6 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all resize-none" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Attachment (Optional)</label>
                      <div className="relative group/upload cursor-pointer">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-full px-6 py-5 bg-[#F8F9FA] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 group-hover/upload:border-[#FF4D8D] transition-all">
                          <Paperclip className="w-5 h-5 text-[#FF4D8D]" />
                          <span className="text-sm font-bold text-gray-500">Upload Deck / Files</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Website / Portfolio Link</label>
                      <div className="relative">
                        <Link2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="url" placeholder="https://..." className="w-full pl-16 pr-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-[#FF4D8D]/20 flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-[#FF4D8D]/30 transition-all hover:-translate-y-1">
                    Send Collaboration Request
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
