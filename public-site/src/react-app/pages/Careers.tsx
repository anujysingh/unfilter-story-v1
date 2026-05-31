export default function Careers() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-[#111111] to-[#2A2A2A] text-white py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-6xl font-bold mb-6">Careers</h1>
          <p className="text-2xl text-gray-300">We're building something meaningful. Join us.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-[#F9F9F9] rounded-3xl p-12 border border-[#EAEAEA] text-center">
          <h3 className="text-3xl font-bold text-[#111111] mb-4">No Open Roles Currently</h3>
          <p className="text-[#6B6B6B] text-lg mb-8 max-w-2xl mx-auto">
            We are always looking for passionate writers, data analysts, and investigative journalists who care about the truth. If that's you, send us your portfolio.
          </p>
          <a 
            href="mailto:careers@unfilterstory.com"
            className="inline-block bg-[#111111] text-white px-10 py-4 rounded-xl font-bold hover:bg-black transition-all"
          >
            Send Portfolio
          </a>
        </div>
      </section>
    </div>
  );
}
