export default function Privacy({ content }: { content?: string }) {
  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="bg-gray-50 border-b border-[#EAEAEA] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-[#111111] mb-4">Privacy Policy</h1>
          <p className="text-[#6B6B6B]">Last updated: April 28, 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        {content ? (
          <div className="prose prose-lg max-w-none text-[#444444]" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className="prose prose-lg max-w-none text-[#444444] space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#111111] mb-4">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you subscribe to our newsletter, submit a story, or contact us. This may include your name, email address, and any other information you choose to provide.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#111111] mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience on our platform.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#111111] mb-4">3. Information Sharing</h2>
              <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#111111] mb-4">4. Data Security</h2>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
