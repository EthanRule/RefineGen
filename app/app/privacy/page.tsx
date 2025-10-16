'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer/Footer';

export default function PrivacyPolicy() {
  const { data: session, status } = useSession();
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);

  const handleToggleFooter = () => {
    if (!isFooterOpen) {
      setIsFooterOpen(true);
      setTimeout(() => {
        setFooterVisible(true);
        setTimeout(() => {
          setShowFooter(true);
        }, 100);
      }, 500);
    } else {
      setShowFooter(false);
      setTimeout(() => {
        setFooterVisible(false);
        setIsFooterOpen(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (!isFooterOpen) {
      setShowFooter(false);
    }
  }, [isFooterOpen]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setTimeout(() => {
        setIsBackgroundLoaded(true);
      }, 100);
    };
    img.src = '/background.png';
  }, []);

  return (
    <div className="bg-black flex flex-col min-h-screen">
      <Header props={{ status, session }} />
      <main className="flex justify-center mx-2 mt-2 flex-1">
        <div
          className={`bg-stone-950 rounded-lg border border-stone-700 w-full flex flex-col transition-all duration-500 ease-in-out relative ${
            isFooterOpen ? 'h-[55vh] overflow-hidden' : 'min-h-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div
              className={`w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-[5000ms] ease-in-out ${
                isBackgroundLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('/background.png')`,
                filter: 'brightness(0.4)',
                transform: 'scale(1.0)',
              }}
            />
          </div>

          <div className="flex flex-1 flex-col items-center justify-start px-6 text-center relative z-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8">
              <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

              <div className="text-left text-gray-300 space-y-6">
                <p className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    1. Information We Collect
                  </h2>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-white">Account Information</h3>
                    <p>When you sign up using GitHub or Google OAuth, we collect:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Email address (required for account identification)</li>
                      <li>Name (optional, from your OAuth provider)</li>
                      <li>Profile image URL (optional, from your OAuth provider)</li>
                      <li>OAuth provider account ID (for authentication)</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mt-4">Usage Data</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Image generation prompts and selected attributes</li>
                      <li>Generated images and associated metadata</li>
                      <li>Gem usage statistics (remaining, used, purchased)</li>
                      <li>API request logs (for debugging and rate limiting)</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mt-4">
                      Payment Information
                    </h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Stripe customer ID and transaction details</li>
                      <li>Payment amounts and transaction history</li>
                      <li>Billing email address</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    2. How We Use Your Information
                  </h2>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Provide AI image generation services using OpenAI's DALL-E 3</li>
                    <li>Store and manage your generated images securely</li>
                    <li>Process gem purchases and manage transactions</li>
                    <li>Track gem usage and enforce usage limits</li>
                    <li>Provide customer support and technical assistance</li>
                    <li>Improve our services and prevent abuse</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    3. Data Storage and Security
                  </h2>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-white">Database Storage</h3>
                    <p>Your data is stored in a secure PostgreSQL database with:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Encrypted connections and data at rest</li>
                      <li>User-specific data isolation</li>
                      <li>Automatic data deletion when accounts are removed</li>
                    </ul>

                    <h3 className="text-lg font-medium text-white mt-4">Image Storage</h3>
                    <p>Generated images are stored securely in AWS S3 with:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Private access with presigned URLs (7-day expiration)</li>
                      <li>User-specific folder organization</li>
                      <li>Automatic cleanup of expired URLs</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    4. Third-Party Services
                  </h2>
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-white">Authentication</h3>
                    <p>
                      We use NextAuth.js with GitHub and Google OAuth providers. These services
                      collect and process your authentication data according to their own
                      privacy policies.
                    </p>

                    <h3 className="text-lg font-medium text-white mt-4">AI Services</h3>
                    <p>
                      We use OpenAI's DALL-E 3 API for image generation. Your prompts are sent
                      to OpenAI and processed according to their privacy policy and terms of
                      service.
                    </p>

                    <h3 className="text-lg font-medium text-white mt-4">Payment Processing</h3>
                    <p>
                      We use Stripe for payment processing. Payment data is handled by Stripe
                      according to their privacy policy and PCI compliance standards.
                    </p>

                    <h3 className="text-lg font-medium text-white mt-4">Cloud Storage</h3>
                    <p>
                      We use AWS S3 for image storage. Images are stored securely in AWS data
                      centers with appropriate access controls.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    5. Data Retention
                  </h2>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Account data: Retained until account deletion</li>
                    <li>
                      Generated images: Retained until account deletion or manual removal
                    </li>
                    <li>
                      Payment records: Retained for legal and accounting purposes (typically 7
                      years)
                    </li>
                    <li>
                      API logs: Retained for debugging and security purposes (typically 30
                      days)
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    6. Cookies and Tracking
                  </h2>
                  <p>
                    We use session cookies for authentication purposes only. We do not use
                    tracking cookies, analytics, or third-party advertising services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    7. Children's Privacy
                  </h2>
                  <p>
                    Our service is not intended for children under 13. We do not knowingly
                    collect personal information from children under 13.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    8. Changes to This Policy
                  </h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify users
                    of significant changes via email or through our service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    9. Contact Information
                  </h2>
                  <p>
                    If you have questions about this privacy policy or our data practices,
                    please contact us at:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Discord: .rudarz</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>

          {/* Footer Toggle Button */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              onClick={handleToggleFooter}
              className={`p-2 rounded-full transition-all duration-300 ease-in-out ${
                isFooterOpen
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-400/50'
                  : 'bg-stone-700 text-gray-300 hover:bg-stone-600 hover:text-white'
              }`}
              title={isFooterOpen ? 'Close Footer' : 'Open Footer'}
            >
              <svg
                className="w-6 h-6 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Footer with smooth transitions */}
      <div
        className={`mt-1 mb-2 transition-all duration-500 ease-in-out ${
          showFooter ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${footerVisible ? 'flex-1' : 'h-0 overflow-hidden'} overflow-x-auto`}
      >
        <Footer props={{ status, session }} />
      </div>
    </div>
  );
}
