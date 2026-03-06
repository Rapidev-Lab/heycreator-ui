/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, AlertTriangle, Scale, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Hey Creator',
  description: 'Hey Creator Terms of Service - Legal terms and conditions for using our platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-navy to-[#003875] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-lg text-blue-100">
            Last Updated: December 17, 2025
          </p>
          <p className="mt-4 text-blue-50">
            Please read these terms carefully before using Hey Creator.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Binding Agreement</h3>
              <p className="text-sm text-amber-800">
                By accessing or using Hey Creator, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              Welcome to <strong>Hey Creator</strong> ("we", "our", "us", or the "Platform").
              These Terms of Service ("Terms") govern your access to and use of our website,
              applications, and services (collectively, the "Services").
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By creating an account or using our Services, you agree to comply with these Terms
              and our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-3">
              By accessing or using Hey Creator, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and all applicable laws and regulations.
            </p>
            <p className="text-gray-700">
              If you are using our Services on behalf of an organization, you represent and warrant
              that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          {/* 2. User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Account Creation</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You must provide accurate and complete information</li>
                  <li>You must be at least 13 years old (or 16 in the EEA)</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You may not share your account credentials</li>
                  <li>One person or entity may only create one account</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Account Types</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Creator Accounts:</strong> For influencers and content creators</li>
                  <li><strong>Brand Accounts:</strong> For businesses and marketing teams</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Violate any laws or regulations',
                'Infringe on intellectual property rights',
                'Upload malicious code or viruses',
                'Attempt to gain unauthorized access',
                'Harass, threaten, or abuse others',
                'Post false or misleading information',
                'Scrape or collect data without permission',
                'Impersonate others or misrepresent affiliations',
                'Use the platform for spam or unsolicited marketing',
                'Interfere with platform operations',
                'Violate third-party terms (e.g., social media platforms)',
                'Engage in fraudulent activities',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-1">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Platform Content</h3>
                <p className="text-gray-700">
                  All content, features, and functionality on Hey Creator (including but not limited
                  to text, graphics, logos, icons, images, software) are owned by us or our licensors
                  and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 User Content</h3>
                <p className="text-gray-700 mb-3">
                  You retain ownership of content you submit to the platform. By uploading or sharing
                  content, you grant us a non-exclusive, worldwide, royalty-free license to use,
                  display, and distribute your content solely to provide and improve our Services.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Campaign Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Campaign Management</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 For Brands</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You are responsible for campaign content and requirements</li>
                  <li>You must provide accurate budget and timeline information</li>
                  <li>You agree to review applications in a timely manner</li>
                  <li>You must fulfill payment obligations to accepted creators</li>
                  <li>You may not discriminate based on protected characteristics</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 For Creators</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You must accurately represent your capabilities and metrics</li>
                  <li>You agree to deliver work as specified in accepted applications</li>
                  <li>You must disclose sponsored content per FTC guidelines</li>
                  <li>You retain ownership of created content (subject to campaign terms)</li>
                  <li>You are responsible for obtaining necessary rights and permissions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Payments & Fees */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments & Fees</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.1 Platform Fees</h3>
                <p className="text-gray-700">
                  Hey Creator may charge service fees for certain features or transactions.
                  Current fees will be clearly displayed before you commit to any payment.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.2 Payment Processing</h3>
                <p className="text-gray-700">
                  Payments are processed through third-party payment providers. You agree to
                  their terms and conditions. We are not responsible for payment processing errors.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.3 Refunds</h3>
                <p className="text-gray-700">
                  Refund policies vary by transaction type. Campaign-specific refunds are subject
                  to agreement between brands and creators.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                <strong>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
                OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
              </p>
              <p className="text-gray-700 mb-4">
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>The Services will be uninterrupted, secure, or error-free</li>
                <li>The results obtained will be accurate or reliable</li>
                <li>Any errors or defects will be corrected</li>
                <li>User-generated content is accurate or reliable</li>
                <li>Third-party integrations (e.g., social media APIs) will remain available</li>
              </ul>
            </div>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <p className="text-gray-800 mb-3">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, HEY CREATOR SHALL NOT BE LIABLE FOR:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages arising from user conduct or content</li>
                <li>Damages from third-party services or integrations</li>
                <li>Damages exceeding the amount paid to us in the past 12 months</li>
              </ul>
            </div>
          </section>

          {/* 9. Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless Hey Creator and its affiliates,
              officers, directors, employees, and agents from any claims, liabilities, damages,
              losses, costs, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your use of the Services</li>
              <li>Content you submit or share</li>
              <li>Your interactions with other users</li>
            </ul>
          </section>

          {/* 10. Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">10.1 By You</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by contacting us or using account
                  deletion features. Termination does not relieve you of obligations incurred
                  before termination.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">10.2 By Us</h3>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate your account immediately, without
                  notice, if you violate these Terms or engage in harmful conduct. We may also
                  terminate inactive accounts after reasonable notice.
                </p>
              </div>
            </div>
          </section>

          {/* 11. Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">11.1 Informal Resolution</h3>
                <p className="text-gray-700">
                  If you have a dispute, please contact us first at wieslaw@rapidevlabs.com.
                  We will attempt to resolve disputes informally.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">11.2 Governing Law</h3>
                <p className="text-gray-700">
                  These Terms are governed by the laws of South Africa, without regard to
                  conflict of law principles.
                </p>
              </div>
            </div>
          </section>

          {/* 12. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to These Terms</h2>
            <p className="text-gray-700 mb-3">
              We may update these Terms from time to time. Material changes will be communicated
              via email or platform notification at least 30 days before they take effect.
            </p>
            <p className="text-gray-700">
              Your continued use of the Services after changes indicates acceptance. If you do
              not agree, please discontinue use and close your account.
            </p>
          </section>

          {/* 13. General Provisions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. General Provisions</h2>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">Severability</h4>
                <p className="text-sm text-gray-700">
                  If any provision is found unenforceable, the remaining provisions remain in effect.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Entire Agreement</h4>
                <p className="text-sm text-gray-700">
                  These Terms constitute the entire agreement between you and Hey Creator.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">No Waiver</h4>
                <p className="text-sm text-gray-700">
                  Our failure to enforce any provision does not constitute a waiver of that provision.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Assignment</h4>
                <p className="text-sm text-gray-700">
                  You may not assign these Terms. We may assign them without notice.
                </p>
              </div>
            </div>
          </section>

          {/* 14. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms, please contact:
            </p>
            <div className="bg-gradient-to-br from-brand-navy to-[#003875] text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Hey Creator</h3>
              <p className="text-blue-100 mb-2">Email: wieslaw@rapidevlabs.com</p>
              <p className="text-blue-100">Website: https://heycreator.vercel.app</p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              ← Back to Home
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <a
              href="mailto:wieslaw@rapidevlabs.com"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Contact Us
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} Hey Creator. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
