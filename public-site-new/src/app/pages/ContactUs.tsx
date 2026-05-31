import { Mail, MessageSquare, MapPin, Send, Phone, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#111111] text-white py-32 relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4D8D]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF7A18]/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] text-[#FF4D8D] uppercase border border-[#FF4D8D]/30 rounded-full bg-[#FF4D8D]/10">
            Get in Touch
          </span>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18]">Connect.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
            Have a tip, a story, or just want to say hi? We're all ears for the unfiltered truth.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-20">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#111111] tracking-tight">Contact Information</h2>
              <p className="text-xl text-[#6B6B6B] leading-relaxed">
                Reach out to the right team for the fastest response.
              </p>
            </div>

            <div className="grid gap-8">
              {[
                { 
                  title: "Editorial Tips", 
                  value: "tips@unfilterstory.com",
                  icon: <MessageSquare className="w-6 h-6 text-[#FF4D8D]" />,
                  desc: "Send us anonymous tips or story ideas."
                },
                { 
                  title: "General Support", 
                  value: "hello@unfilterstory.com",
                  icon: <Mail className="w-6 h-6 text-[#FF4D8D]" />,
                  desc: "For general inquiries and feedback."
                },
                { 
                  title: "Our Office", 
                  value: "HSR Layout, Bangalore, KA",
                  icon: <MapPin className="w-6 h-6 text-[#FF4D8D]" />,
                  desc: "Visit us for a coffee and a chat."
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#FF4D8D]/10 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111111] mb-1">{item.title}</h3>
                    <p className="text-[#FF4D8D] font-bold mb-2">{item.value}</p>
                    <p className="text-sm text-[#6B6B6B]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-10 bg-[#111111] rounded-[2.5rem] text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A18]/10 rounded-full blur-3xl" />
               <div className="flex items-center gap-4 mb-6">
                  <Clock className="w-6 h-6 text-[#FF7A18]" />
                  <h4 className="text-xl font-bold">Response Time</h4>
               </div>
               <p className="text-gray-400 leading-relaxed mb-6">
                 Our team typically responds to all inquiries within 24 hours during business days.
               </p>
               <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Currently Online
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-white border border-[#FF4D8D]/20 rounded-[3rem] p-16 text-center shadow-xl animate-in fade-in zoom-in duration-500 h-full flex flex-col justify-center items-center">
                <div className="w-24 h-24 bg-[#FF4D8D]/10 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle2 className="w-12 h-12 text-[#FF4D8D]" />
                </div>
                <h2 className="text-4xl font-bold text-[#111111] mb-6 tracking-tight">Message Sent!</h2>
                <p className="text-[#6B6B6B] text-xl mb-10 leading-relaxed font-light">
                  Thank you for reaching out. We've received your message and will get back to you shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-[#111111] text-white px-12 py-5 rounded-2xl font-bold hover:bg-black transition-all hover:shadow-lg"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Your Name</label>
                      <input required type="text" placeholder="John Doe" className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <input required type="email" placeholder="john@company.com" className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Subject</label>
                    <input required type="text" placeholder="How can we help?" className="w-full px-6 py-5 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#111111] uppercase tracking-[0.2em] ml-1">Your Message</label>
                    <textarea required rows={8} placeholder="Write your message here..." className="w-full px-8 py-6 bg-[#F8F9FA] border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-[#FF4D8D]/20 flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-[#FF4D8D]/30 transition-all hover:-translate-y-1">
                    Send Message
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
