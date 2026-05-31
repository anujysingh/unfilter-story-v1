import { Link2, Share2 } from "lucide-react";
import { useState } from "react";

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

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      icon: <TwitterIcon className="w-4 h-4" />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      label: "Twitter",
    },
    {
      icon: <LinkedinIcon className="w-4 h-4" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      label: "LinkedIn",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.112.551 4.16 1.597 5.978L0 24l6.188-1.623c1.737.947 3.697 1.446 5.688 1.446 6.626 0 12-5.374 12-12s-5.374-12-12-12zm0 22.016c-1.808 0-3.582-.486-5.127-1.405l-.367-.218-3.807.998 1.016-3.712-.24-.381c-.991-1.576-1.514-3.4-1.514-5.298 0-5.513 4.484-9.997 9.997-9.997 5.513 0 9.997 4.484 9.997 9.997s-4.484 9.997-9.997 9.997z" />
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
      label: "WhatsApp",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
        title="Copy Link"
      >
        <Link2 className="w-4 h-4 text-gray-500" />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded">
            Copied!
          </span>
        )}
      </button>
      {shareLinks.map((link, i) => (
        <a
          key={i}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title={`Share on ${link.label}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
