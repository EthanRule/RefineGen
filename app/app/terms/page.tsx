"use client";

import Header from "@/app/components/Header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header props={{ status: "unauthenticated", session: null }} />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="space-y-6 text-gray-700">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using TailorApply ("the Service"), you accept
                and agree to be bound by the terms and provision of this
                agreement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p>
                TailorApply is an AI-powered resume optimization service that
                analyzes job descriptions and user resumes to provide tailored
                recommendations and improvements.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Responsibilities
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account
                </li>
                <li>You agree to provide accurate and complete information</li>
                <li>You will not use the service for any unlawful purpose</li>
                <li>
                  You will not attempt to gain unauthorized access to any part
                  of the service
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Privacy and Data
              </h2>
              <p>
                Your privacy is important to us. Please read our Privacy Policy
                to understand how we collect, use, and protect your information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Limitation of Liability
              </h2>
              <p>
                TailorApply shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other
                intangible losses.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Changes
                will be effective immediately upon posting to our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at support@tailorapply.dev
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
