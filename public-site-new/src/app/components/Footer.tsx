import { Link } from "react-router";
import { Twitter, Linkedin, Instagram, Youtube, Send } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#EAEAEA] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-6">
              <Logo />
            </Link>
            <p className="text-[#6B6B6B] text-lg max-w-sm mb-8 leading-relaxed">
              The voice of reality in a world of hype. We bring you the stories that matter, unfiltered and real.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#6B6B6B] hover:bg-[#FF4D8D] hover:text-white hover:border-[#FF4D8D] transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#6B6B6B] hover:bg-[#FF4D8D] hover:text-white hover:border-[#FF4D8D] transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#6B6B6B] hover:bg-[#FF4D8D] hover:text-white hover:border-[#FF4D8D] transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#6B6B6B] hover:bg-[#FF4D8D] hover:text-white hover:border-[#FF4D8D] transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-[#111111] font-bold uppercase tracking-wider text-sm mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Home</Link></li>
              <li><Link to="/news" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Startup News</Link></li>
              <li><Link to="/stories" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Startup Stories</Link></li>
              <li><Link to="/guest-post" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Guest Post</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-[#111111] font-bold uppercase tracking-wider text-sm mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Contact Us</Link></li>
              <li><Link to="/collaborate" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Collaborate</Link></li>
              <li><Link to="/careers" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-[#111111] font-bold uppercase tracking-wider text-sm mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EAEAEA] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6B6B6B] text-sm">
            © {new Date().getFullYear()} Unfilter Story. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[#6B6B6B] hover:text-[#FF4D8D] text-sm transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[#6B6B6B] hover:text-[#FF4D8D] text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
