"use client";

import Header from "@/app/components/Header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header props={{ status: "unauthenticated", session: null }} />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-gray-700">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly to us, such as when
                you create an account, upload resumes, or interact with our
                services. This may include:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Account information (name, email address)</li>
                <li>Resume files and content you upload</li>
                <li>Job descriptions you provide</li>
                <li>GitHub profile information (with your permission)</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Analyze resumes and job descriptions for optimization</li>
                <li>Communicate with you about our services</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Information Sharing
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties, except:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>To protect our rights, property, or safety</li>
                <li>
                  With service providers who assist in our operations (under
                  strict confidentiality)
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Data Security
              </h2>
              <p>
                We implement appropriate security measures to protect your
                personal information. However, no method of transmission over
                the internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Retention
              </h2>
              <p>
                We retain your personal information only as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Withdraw consent for data processing</li>
                <li>Data portability</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Third-Party Services
              </h2>
              <p>
                Our service integrates with GitHub for authentication and
                project analysis. Please review GitHub's privacy policy for
                information about how they handle your data.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Updates to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this
                page.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at privacy@tailorapply.dev
              </p>
            </div>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-gray-700 hover:text-gray-800 font-medium"
          >
            ← Back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}
