import { Link, useLocation } from "react-router";
import { Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/news", label: "Startup News" },
    { path: "/stories", label: "Startup Stories" },
  ];

  const moreLinks = [
    { path: "/guest-post", label: "Guest Post" },
    { path: "/feature-your-story", label: "Feature Your Story" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? "border-b border-[#EAEAEA] shadow-sm" : ""
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative transition-colors hover:text-[#FF4D8D] font-medium ${location.pathname === link.path
                  ? "text-[#111111]"
                  : "text-[#6B6B6B]"
                }`}
            >
              {link.label}
              {location.pathname === link.path && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18]" />
              )}
            </Link>
          ))}

          {/* More Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsMoreOpen(true)}
            onMouseLeave={() => setIsMoreOpen(false)}
          >
            <button className={`flex items-center gap-1 transition-colors hover:text-[#FF4D8D] font-medium ${moreLinks.some(link => location.pathname === link.path) ? "text-[#111111]" : "text-[#6B6B6B]"
              }`}>
              More
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`absolute top-full -left-4 pt-4 transition-all duration-200 ${isMoreOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
              }`}>
              <div className="bg-white border border-[#EAEAEA] rounded-2xl shadow-xl py-3 min-w-[200px] overflow-hidden">
                {moreLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-6 py-3 transition-colors hover:bg-[#F9F9F9] hover:text-[#FF4D8D] ${location.pathname === link.path ? "text-[#FF4D8D] bg-[#F9F9F9]" : "text-[#6B6B6B]"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <Search className="w-5 h-5 text-[#6B6B6B]" />
          </button>
          <Link to="/feature-your-story" className="hidden md:block bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all font-bold text-sm">
            Share Your Story
          </Link>
        </div>
      </div>
    </header>
  );
}
