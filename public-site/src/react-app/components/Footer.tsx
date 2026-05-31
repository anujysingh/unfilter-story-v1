import { Send } from "lucide-react";
import Logo from "./Logo";

const Link = ({ to, children, ...props }: { to: string; children: any; [key: string]: any }) => {
  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
};

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className="fill-current" {...props} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className="fill-current" {...props} xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

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
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#6B6B6B] hover:bg-[#FF4D8D] hover:text-white hover:border-[#FF4D8D] transition-all">
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#6B6B6B] hover:bg-[#FF4D8D] hover:text-white hover:border-[#FF4D8D] transition-all">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center text-[#6B6B6B] hover:bg-[#FF4D8D] hover:text-white hover:border-[#FF4D8D] transition-all">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-bold text-[#111111] mb-6 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/stories" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Stories</Link></li>
              <li><Link to="/startup-news" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Startup News</Link></li>
              <li><Link to="/guest-post" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Submit Guest Post</Link></li>
              <li><Link to="/feature-your-story" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Apply for Feature</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-bold text-[#111111] mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-bold text-[#111111] mb-6 uppercase tracking-wider text-sm">Subscribe</h4>
            <p className="text-[#6B6B6B] text-sm mb-4">Get the unfiltered truth delivered straight to your inbox.</p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-[#FF4D8D] transition-all pr-12 text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#111111] text-white rounded-lg flex items-center justify-center hover:bg-[#FF4D8D] transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-[#EAEAEA] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#6B6B6B]">
            © {new Date().getFullYear()} Unfilter Story. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[#6B6B6B]">
            <Link to="/privacy" className="hover:text-[#FF4D8D] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#FF4D8D] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
