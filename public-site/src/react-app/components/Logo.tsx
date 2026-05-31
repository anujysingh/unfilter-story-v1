export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/src/imports/unfilter-logo.png"
        alt="Unfilter Story"
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}
