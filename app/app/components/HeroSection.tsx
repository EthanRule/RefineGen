export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Angled Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1e40af 2px, transparent 2px),
              linear-gradient(-45deg, #1e40af 2px, transparent 2px)
            `,
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 20px 20px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1e3a8a 2px, transparent 2px),
              linear-gradient(-45deg, #1e3a8a 2px, transparent 2px)
            `,
            backgroundSize: "80px 80px",
            backgroundPosition: "0 0, 40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-powered resume tailoring
            <br />
            <span className="text-blue-600">for developers.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect your GitHub, paste a job posting, and get a tailored resume
            that highlights your relevant experience. Currently in development.
          </p>
          <div className="flex justify-center">
            <a
              href="/app"
              className="bg-blue-600 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
