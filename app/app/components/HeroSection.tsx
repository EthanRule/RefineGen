export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>
    </section>
  );
}
