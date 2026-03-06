/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Mail, Globe, Lock, FileText, Users, Database, Cookie, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Hey Creator',
  description: 'Hey Creator Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-navy to-[#003875] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg text-blue-100">
            Last Updated: December 17, 2025
          </p>
          <p className="mt-4 text-blue-50">
            We respect your privacy and are committed to protecting your personal data.
            This policy explains how we handle your information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
              <p className="text-sm text-blue-800">
                By using Hey Creator, you agree to the collection and use of information in accordance
                with this policy. If you do not agree, please discontinue use of our services.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Table of Contents
          </h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              { id: 'introduction', title: 'Introduction' },
              { id: 'information-collected', title: '1. Information We Collect' },
              { id: 'how-we-use', title: '2. How We Use Your Information' },
              { id: 'meta-data', title: '3. Use of Instagram & Facebook Data' },
              { id: 'legal-basis', title: '4. Legal Basis for Processing' },
              { id: 'data-storage', title: '5. Data Storage & Security' },
              { id: 'data-sharing', title: '6. Data Sharing & Third Parties' },
              { id: 'user-rights', title: '7. Your Privacy Rights' },
              { id: 'data-deletion', title: '8. Data Deletion & Account Removal' },
              { id: 'cookies', title: '9. Cookies & Tracking Technologies' },
              { id: 'international', title: '10. International Data Transfers' },
              { id: 'california', title: '11. California Privacy Rights' },
              { id: 'children', title: '12. Children\'s Privacy' },
              { id: 'changes', title: '13. Changes to This Policy' },
              { id: 'contact', title: '14. Contact Information' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-10">
          {/* Introduction */}
          <section id="introduction">
            <p className="text-gray-700 leading-relaxed">
              Welcome to <strong>Hey Creator</strong> (the "Platform", "we", "our", or "us").
              We respect your privacy and are committed to protecting the personal data of all users,
              including influencers, brands, and visitors to our platform.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              This Privacy Policy explains how we collect, use, store, share, and protect your
              information when you use our website, applications, and services (collectively, the "Services").
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section id="information-collected">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-brand-navy" />
              1. Information We Collect
            </h2>

            <div className="space-y-6">
              {/* 1.1 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1.1 Information You Provide Directly
                </h3>
                <p className="text-gray-700 mb-3">
                  We collect information you provide when you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Create an account (influencer or brand)</li>
                  <li>Complete onboarding forms</li>
                  <li>Update your profile</li>
                  <li>Create or manage campaigns</li>
                  <li>Submit applications to campaigns</li>
                  <li>Contact us or submit support requests</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p className="text-gray-700 mt-3">This may include:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ml-4">
                  {[
                    'Full name',
                    'Email address',
                    'Phone number (optional)',
                    'Business/company name (for brands)',
                    'Social media usernames',
                    'Profile descriptions and bios',
                    'Categories, interests, or niches',
                    'Profile photos',
                    'Login credentials (securely handled via Firebase)',
                    'Payment information (processed by third-party providers)',
                  ].map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.2 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1.2 Social Media Platform Data
                </h3>
                <p className="text-gray-700 mb-3">
                  When you connect or search for social media profiles, we may collect{' '}
                  <strong>publicly available data</strong> from supported platforms such as:
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Instagram', 'Facebook', 'YouTube', 'TikTok', 'X (Twitter)'].map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-3">This data may include:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Username and profile ID</li>
                  <li>Display name and profile photo</li>
                  <li>Bio/description</li>
                  <li>Follower and following counts</li>
                  <li>Post count and public content metadata</li>
                  <li>Engagement metrics (likes, comments, views, shares)</li>
                  <li>Audience demographics (where publicly available)</li>
                  <li>Hashtags and content categories</li>
                </ul>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4 rounded-r">
                  <p className="text-sm text-amber-900">
                    <strong>Important:</strong> We only collect publicly available information.
                    We do not access private messages, private content, or non-public data
                    without explicit authorization from the account owner.
                  </p>
                </div>
              </div>

              {/* 1.3 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1.3 Aggregated & Analytical Data
                </h3>
                <p className="text-gray-700 mb-3">
                  We may process aggregated, anonymized, or de-identified data such as:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Audience size distributions</li>
                  <li>Engagement rate trends and benchmarks</li>
                  <li>Geographic and demographic breakdowns (where permitted)</li>
                  <li>Interest and content categories</li>
                  <li>Industry performance metrics</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  This data cannot be used to identify individuals and is used only to improve
                  analytics, discovery features, and platform insights.
                </p>
              </div>

              {/* 1.4 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1.4 Automatically Collected Data
                </h3>
                <p className="text-gray-700 mb-3">
                  When you use our Services, we automatically collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>IP address and approximate location</li>
                  <li>Device type, model, and operating system</li>
                  <li>Browser type and version</li>
                  <li>Pages viewed and features used</li>
                  <li>Time spent on platform and interaction patterns</li>
                  <li>Referral sources and URLs</li>
                  <li>Error logs and diagnostic data</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  This helps us maintain security, performance, reliability, and improve user experience.
                </p>
              </div>

              {/* 1.5 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1.5 Campaign & Transaction Data
                </h3>
                <p className="text-gray-700 mb-3">
                  For brands and creators using campaign features, we collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Campaign details, requirements, and budgets</li>
                  <li>Application messages and proposals</li>
                  <li>Deliverable submissions and content links</li>
                  <li>Communication history within the platform</li>
                  <li>Payment and transaction records (handled by secure payment processors)</li>
                  <li>Performance metrics and campaign analytics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section id="how-we-use">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-navy" />
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              We use collected data to provide and improve our Services, including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Provide influencer discovery and analytics tools',
                'Enable brands to find and evaluate creators',
                'Facilitate campaign creation and management',
                'Process applications and deliverables',
                'Authenticate users and secure accounts',
                'Generate insights, reports, and recommendations',
                'Personalize your platform experience',
                'Communicate updates, notifications, and support',
                'Process payments and transactions',
                'Detect and prevent fraud or abuse',
                'Improve platform features and performance',
                'Comply with legal and regulatory requirements',
              ].map((use, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{use}</p>
                </div>
              ))}
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-6 rounded-r">
              <p className="text-sm text-green-900 font-semibold">
                We do not sell, rent, or trade your personal data to third parties.
              </p>
            </div>
          </section>

          {/* 3. Use of Instagram & Facebook Data */}
          <section id="meta-data">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Use of Instagram & Facebook Data
            </h2>
            <p className="text-gray-700 mb-4">
              Our use of Meta platform data complies with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Meta Platform Terms of Service</li>
              <li>Instagram Graph API Terms</li>
              <li>Facebook Platform Policies</li>
              <li>Meta Developer Policies and Guidelines</li>
            </ul>
            <p className="text-gray-700 mb-3">Specifically:</p>
            <div className="space-y-3">
              {[
                'We only access data permitted by granted permissions and API access',
                'We only access Instagram Business or Creator accounts (not personal accounts)',
                'We do not store unnecessary personal data beyond what is required for functionality',
                'We use Instagram and Facebook data solely to support influencer analytics, discovery, and marketing insights',
                'Aggregated data is anonymized and cannot be re-identified to individuals',
                'We respect user privacy controls and platform limitations',
                'We provide clear mechanisms for users to disconnect their accounts',
                'We comply with all data retention and deletion requirements',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Legal Basis for Processing */}
          <section id="legal-basis">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Legal Basis for Processing (GDPR & Data Protection)
            </h2>
            <p className="text-gray-700 mb-4">
              Where applicable under GDPR and other data protection laws, we process personal data
              under the following legal bases:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: 'Consent',
                  desc: 'You have given clear consent for us to process your personal data for specific purposes (e.g., connecting social media accounts).',
                },
                {
                  title: 'Contractual Necessity',
                  desc: 'Processing is necessary to fulfill our contract with you (e.g., providing platform services you requested).',
                },
                {
                  title: 'Legitimate Business Interests',
                  desc: 'Processing is necessary for our legitimate interests, such as improving services, fraud prevention, and analytics, provided your rights are not overridden.',
                },
                {
                  title: 'Legal Obligations',
                  desc: 'Processing is necessary to comply with legal or regulatory requirements.',
                },
              ].map((basis, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{basis.title}</h4>
                  <p className="text-sm text-gray-600">{basis.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Data Storage & Security */}
          <section id="data-storage">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-brand-navy" />
              5. Data Storage & Security
            </h2>
            <p className="text-gray-700 mb-4">
              We take data security seriously and implement industry-standard practices to protect your information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                {
                  icon: '🔒',
                  title: 'Encryption',
                  desc: 'Data encrypted in transit (TLS/SSL) and at rest',
                },
                {
                  icon: '☁️',
                  title: 'Secure Infrastructure',
                  desc: 'Cloud hosting with enterprise-grade security (Firebase/Google Cloud)',
                },
                {
                  icon: '🔑',
                  title: 'Authentication',
                  desc: 'Firebase Authentication with multi-factor support',
                },
                {
                  icon: '🛡️',
                  title: 'Access Controls',
                  desc: 'Role-based permissions and least-privilege access',
                },
                {
                  icon: '👁️',
                  title: 'Monitoring',
                  desc: 'Continuous security monitoring and threat detection',
                },
                {
                  icon: '📋',
                  title: 'Compliance',
                  desc: 'Regular security audits and compliance reviews',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-700">
              <strong>Data Retention:</strong> We retain your data only as long as necessary to
              fulfill the purposes outlined in this policy, comply with legal obligations, resolve
              disputes, and enforce our agreements. Inactive accounts may be deleted after{' '}
              <strong>24 months</strong> of inactivity, with prior notice.
            </p>
          </section>

          {/* 6. Data Sharing & Third Parties */}
          <section id="data-sharing">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Data Sharing & Third Parties
            </h2>
            <p className="text-gray-700 mb-4">
              We may share your information with trusted third parties only as described below:
            </p>
            <div className="space-y-4">
              {[
                {
                  category: 'Service Providers',
                  parties: 'Cloud infrastructure (Google Cloud/Firebase), email services, analytics providers',
                  purpose: 'To operate, maintain, and improve our Services',
                },
                {
                  category: 'Social Media Platforms',
                  parties: 'Instagram, Facebook, YouTube, TikTok, X (Twitter)',
                  purpose: 'To access publicly available profile data via official APIs',
                },
                {
                  category: 'Payment Processors',
                  parties: 'Stripe, PayPal, or other payment gateways',
                  purpose: 'To process payments securely (we do not store full payment details)',
                },
                {
                  category: 'Analytics Tools',
                  parties: 'Google Analytics, Mixpanel (aggregated data only)',
                  purpose: 'To analyze usage patterns and improve user experience',
                },
                {
                  category: 'Legal & Compliance',
                  parties: 'Law enforcement, regulatory authorities',
                  purpose: 'When required by law or to protect rights and safety',
                },
              ].map((share, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{share.category}</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <strong>Parties:</strong> {share.parties}
                    </p>
                    <p className="text-gray-600">
                      <strong>Purpose:</strong> {share.purpose}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6 rounded-r">
              <p className="text-sm text-red-900">
                <strong>We do not share personal data with third parties for advertising or
                marketing purposes without your explicit consent.</strong>
              </p>
            </div>
          </section>

          {/* 7. Your Privacy Rights */}
          <section id="user-rights">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Your Privacy Rights
            </h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  right: 'Right to Access',
                  desc: 'Request a copy of the personal data we hold about you',
                },
                {
                  right: 'Right to Rectification',
                  desc: 'Correct inaccurate or incomplete information',
                },
                {
                  right: 'Right to Erasure',
                  desc: 'Request deletion of your personal data ("right to be forgotten")',
                },
                {
                  right: 'Right to Restrict Processing',
                  desc: 'Limit how we use your data in certain circumstances',
                },
                {
                  right: 'Right to Data Portability',
                  desc: 'Receive your data in a structured, machine-readable format',
                },
                {
                  right: 'Right to Object',
                  desc: 'Object to processing based on legitimate interests or for marketing',
                },
                {
                  right: 'Right to Withdraw Consent',
                  desc: 'Withdraw consent at any time (where processing is based on consent)',
                },
                {
                  right: 'Right to Lodge a Complaint',
                  desc: 'File a complaint with your local data protection authority',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-1">{item.right}</h4>
                  <p className="text-sm text-blue-800">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-gray-800 mb-3">
                <strong>To exercise your rights, please contact us at:</strong>
              </p>
              <a
                href="mailto:wieslaw@rapidevlabs.com"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Mail className="w-4 h-4" />
                wieslaw@rapidevlabs.com
              </a>
              <p className="text-sm text-gray-600 mt-3">
                We will respond to your request within <strong>30 days</strong> (or as required by applicable law).
              </p>
            </div>
          </section>

          {/* 8. Data Deletion & Account Removal */}
          <section id="data-deletion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Data Deletion & Account Removal
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Need detailed deletion instructions?</strong>
              </p>
              <Link
                href="/data-deletion"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                View Complete Data Deletion Guide →
              </Link>
            </div>
            <p className="text-gray-700 mb-4">You have full control over your data:</p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Disconnect Social Accounts</h4>
                <p className="text-sm text-gray-700">
                  You can disconnect linked social media accounts at any time from your account settings.
                  This will remove our access to that platform's data.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Delete Your Account</h4>
                <p className="text-sm text-gray-700">
                  You can request full account deletion by contacting us. Upon deletion, we will:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 ml-4">
                  <li>Remove your profile and personal information</li>
                  <li>Delete connected social media data</li>
                  <li>Anonymize or delete campaign and application data</li>
                  <li>Remove you from our systems within <strong>30 days</strong></li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Data Retention Exceptions</h4>
                <p className="text-sm text-gray-700">
                  Some data may be retained for legitimate purposes:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 ml-4">
                  <li>Legal compliance and regulatory requirements</li>
                  <li>Fraud prevention and security purposes</li>
                  <li>Dispute resolution and enforcing agreements</li>
                  <li>Aggregated, anonymized analytics (non-identifiable)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 9. Cookies & Tracking */}
          <section id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-brand-navy" />
              9. Cookies & Tracking Technologies
            </h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience and analyze platform usage.
            </p>
            <div className="space-y-3">
              {[
                {
                  type: 'Essential Cookies',
                  purpose: 'Required for authentication, security, and core functionality',
                  opt: 'Cannot be disabled',
                },
                {
                  type: 'Analytics Cookies',
                  purpose: 'Help us understand how users interact with our platform',
                  opt: 'Can be controlled via browser settings',
                },
                {
                  type: 'Preference Cookies',
                  purpose: 'Remember your settings and preferences',
                  opt: 'Can be controlled via browser settings',
                },
              ].map((cookie, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900">{cookie.type}</h4>
                  <p className="text-sm text-gray-600">{cookie.purpose}</p>
                  <p className="text-xs text-gray-500 mt-1 italic">{cookie.opt}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              You can manage cookie preferences through your browser settings. Note that disabling
              certain cookies may affect platform functionality.
            </p>
          </section>

          {/* 10. International Data Transfers */}
          <section id="international">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-brand-navy" />
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 mb-4">
              Hey Creator operates globally and may transfer data across borders. Your information
              may be processed in countries outside your residence, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>United States (where our infrastructure providers are based)</li>
              <li>European Union (for EU-based users)</li>
              <li>Other countries where our service providers operate</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We ensure appropriate safeguards are in place for international transfers:
            </p>
            <div className="space-y-2">
              {[
                'Standard Contractual Clauses (SCCs) approved by the European Commission',
                'Adequacy decisions by relevant data protection authorities',
                'Privacy Shield Framework (where applicable)',
                'Binding Corporate Rules and contractual commitments',
              ].map((safeguard, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{safeguard}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 11. California Privacy Rights */}
          <section id="california">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. California Privacy Rights (CCPA/CPRA)
            </h2>
            <p className="text-gray-700 mb-4">
              If you are a California resident, you have additional rights under the California
              Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              {[
                {
                  right: 'Right to Know',
                  desc: 'What personal information we collect, use, disclose, and sell',
                },
                {
                  right: 'Right to Delete',
                  desc: 'Request deletion of your personal information',
                },
                {
                  right: 'Right to Opt-Out',
                  desc: 'Opt-out of the sale or sharing of personal information',
                },
                {
                  right: 'Right to Correct',
                  desc: 'Correct inaccurate personal information',
                },
                {
                  right: 'Right to Limit',
                  desc: 'Limit use of sensitive personal information',
                },
                {
                  right: 'Right to Non-Discrimination',
                  desc: 'Not be discriminated against for exercising your rights',
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold text-blue-900">{item.right}</h4>
                  <p className="text-sm text-blue-800">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Note:</strong> We do not sell personal information to third parties.
                We do not use or disclose sensitive personal information for purposes other
                than those permitted under CCPA/CPRA.
              </p>
            </div>
          </section>

          {/* 12. Children's Privacy */}
          <section id="children">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Children's Privacy
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r">
              <p className="text-gray-800 mb-3">
                Our Services are <strong>not intended for individuals under the age of 13</strong>{' '}
                (or 16 in the European Economic Area).
              </p>
              <p className="text-gray-800 mb-3">
                We do not knowingly collect personal information from children. If you are a parent
                or guardian and believe your child has provided us with personal information, please
                contact us immediately.
              </p>
              <p className="text-gray-800">
                Upon verification, we will take steps to delete such information from our systems.
              </p>
            </div>
          </section>

          {/* 13. Changes to This Policy */}
          <section id="changes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              13. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy periodically to reflect changes in our practices,
              technology, legal requirements, or other factors.
            </p>
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>Material changes</strong> will be communicated via:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Email notification to registered users</li>
                <li>Prominent notice on our platform</li>
                <li>Updated "Last Updated" date at the top of this policy</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Your continued use of our Services after changes indicates acceptance of the
                updated policy. If you do not agree with changes, please discontinue use and
                contact us to delete your account.
              </p>
            </div>
          </section>

          {/* 14. Contact Information */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-brand-navy" />
              14. Contact Information
            </h2>
            <p className="text-gray-700 mb-6">
              If you have questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>
            <div className="bg-gradient-to-br from-brand-navy to-[#003875] text-white rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Hey Creator</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-100">Email</p>
                    <a
                      href="mailto:wieslaw@rapidevlabs.com"
                      className="text-white font-medium hover:underline"
                    >
                      wieslaw@rapidevlabs.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-100">Website</p>
                    <a
                      href="https://heycreator.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium hover:underline"
                    >
                      https://heycreator.vercel.app
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-400">
                <p className="text-sm text-blue-100">
                  <strong>Response Time:</strong> We aim to respond to all privacy inquiries
                  within 30 days (or as required by applicable law).
                </p>
              </div>
            </div>
          </section>

          {/* Meta Compliance Notes */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-navy" />
                Meta Platform Compliance
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                This privacy policy has been designed to comply with Meta (Facebook/Instagram)
                App Review requirements and explicitly addresses:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Instagram Business Basic permission requirements',
                  'Clear description of Instagram and Facebook data usage',
                  'Anonymized analytics and aggregated data practices',
                  'User rights for data access, correction, and deletion',
                  'Prohibited data use restrictions and compliance',
                  'Third-party data sharing transparency',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-navy rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
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
              href="/terms"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Terms of Service
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
