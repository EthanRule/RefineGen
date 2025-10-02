import VideoPlaceholder from "../ui/VideoPlaceholder";

export default function VideoSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            See it in action
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how TailorApply will analyze your GitHub projects and create a
            job-specific resume tailored to each posting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VideoPlaceholder
            title="Complete Demo: From GitHub to Tailored Resume"
            description="See the full process of connecting your GitHub account, pasting a job posting, and getting a perfectly tailored resume."
            duration="2:15"
          />
          <VideoPlaceholder
            title="GitHub Integration Deep Dive"
            description="Learn how we analyze your repositories, commits, and contributions to extract the most relevant experience."
            duration="1:45"
          />
        </div>
      </div>
    </section>
  );
}
