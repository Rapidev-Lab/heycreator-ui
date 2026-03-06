/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import Link from 'next/link';
import { Trash2, Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | Hey Creator',
  description: 'Learn how to delete your data and account from Hey Creator.',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Data Deletion Instructions</h1>
          </div>
          <p className="text-lg text-red-100">
            Complete guide to deleting your data from Hey Creator
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-sm text-amber-800">
                Account and data deletion is <strong>permanent and irreversible</strong>. Please ensure
                you want to proceed before requesting deletion. Consider downloading your data first.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Right to Delete Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Hey Creator, we respect your privacy and your right to control your personal data.
              You can request deletion of your account and all associated data at any time.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This page explains what data will be deleted, how to request deletion, and what to expect
              during the process.
            </p>
          </section>

          {/* What Gets Deleted */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Data Will Be Deleted</h2>
            <p className="text-gray-700 mb-4">
              When you delete your account, we will permanently remove:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Profile information (name, email, bio)',
                'Account credentials and login data',
                'Connected social media accounts',
                'Cached social media analytics',
                'Profile photos and uploaded images',
                'Campaign data (if brand account)',
                'Application history (if creator account)',
                'Messages and communications',
                'Preferences and settings',
                'Usage history and logs',
                'Payment information (from our records)',
                'All other personally identifiable information',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-red-50 p-3 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What May Be Retained */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What May Be Retained</h2>
            <p className="text-gray-700 mb-4">
              Some information may be retained for legitimate business or legal purposes:
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Aggregated Analytics',
                  desc: 'Anonymized, non-identifiable data used for platform insights and improvements',
                },
                {
                  title: 'Transaction Records',
                  desc: 'Financial records required for accounting, tax, and legal compliance (typically 7 years)',
                },
                {
                  title: 'Legal Compliance Data',
                  desc: 'Information required to comply with legal obligations or ongoing legal matters',
                },
                {
                  title: 'Fraud Prevention Records',
                  desc: 'Limited data to prevent abuse and protect platform security',
                },
              ].map((item, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">
              All retained data is anonymized and cannot be used to identify you personally.
            </p>
          </section>

          {/* How to Delete */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Delete Your Data</h2>
            <p className="text-gray-700 mb-6">
              You have two options to request data deletion:
            </p>

            {/* Option 1 */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg px-6 py-3">
                <h3 className="text-xl font-bold">Option 1: Email Request (Recommended)</h3>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-6">
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: 'Send an Email',
                      content: 'Send a deletion request to: wieslaw@rapidevlabs.com',
                    },
                    {
                      step: 2,
                      title: 'Include Required Information',
                      content: (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                          <li>Subject line: "Data Deletion Request"</li>
                          <li>Your registered email address</li>
                          <li>Your account type (Creator or Brand)</li>
                          <li>Confirmation statement: "I confirm I want to permanently delete my account and all associated data"</li>
                        </ul>
                      ),
                    },
                    {
                      step: 3,
                      title: 'Verify Your Identity',
                      content: 'We may ask you to verify your identity to prevent unauthorized deletions',
                    },
                    {
                      step: 4,
                      title: 'Receive Confirmation',
                      content: 'You will receive a confirmation email within 48 hours',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        {typeof item.content === 'string' ? (
                          <p className="text-sm text-gray-700">{item.content}</p>
                        ) : (
                          item.content
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <div>
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg px-6 py-3">
                <h3 className="text-xl font-bold">Option 2: In-App Account Settings</h3>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-6">
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: 'Log In to Your Account',
                      content: 'Access your Hey Creator account',
                    },
                    {
                      step: 2,
                      title: 'Navigate to Settings',
                      content: 'Go to Account Settings → Privacy & Security',
                    },
                    {
                      step: 3,
                      title: 'Find Delete Account',
                      content: 'Scroll to the bottom and click "Delete Account"',
                    },
                    {
                      step: 4,
                      title: 'Confirm Deletion',
                      content: 'Read the warning, enter your password, and confirm deletion',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-700 font-bold">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-700">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600 italic">
                    Note: In-app deletion may not be available during beta. Please use email request in the meantime.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-brand-navy" />
              Deletion Timeline
            </h2>
            <p className="text-gray-700 mb-4">
              Here's what to expect after submitting a deletion request:
            </p>
            <div className="space-y-4">
              {[
                {
                  time: 'Within 48 hours',
                  event: 'Verification & Confirmation',
                  desc: 'We verify your identity and send a confirmation email',
                  color: 'blue',
                },
                {
                  time: '3-7 days',
                  event: 'Account Deactivation',
                  desc: 'Your account is immediately deactivated and inaccessible',
                  color: 'yellow',
                },
                {
                  time: 'Within 30 days',
                  event: 'Complete Data Deletion',
                  desc: 'All personal data is permanently removed from our systems',
                  color: 'green',
                },
                {
                  time: 'Within 90 days',
                  event: 'Backup Purge',
                  desc: 'Data is removed from backup systems and archives',
                  color: 'purple',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 border-${item.color}-500 bg-${item.color}-50 pl-6 pr-4 py-4 rounded-r-lg`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-semibold text-${item.color}-700 uppercase tracking-wide`}>
                          {item.time}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.event}</h4>
                      <p className="text-sm text-gray-700">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Social Media Connections */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Disconnect Social Media Accounts (Without Full Deletion)
            </h2>
            <p className="text-gray-700 mb-4">
              If you only want to disconnect social media accounts without deleting your Hey Creator account:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Steps to Disconnect:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Log in to your Hey Creator account</li>
                <li>Go to Settings → Connected Accounts</li>
                <li>Click "Disconnect" next to the platform you want to remove</li>
                <li>Confirm disconnection</li>
              </ol>
              <p className="text-sm text-blue-700 mt-4">
                This will revoke Hey Creator's access to your social media data while keeping your
                Hey Creator account active.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Can I recover my account after deletion?',
                  a: 'No. Account deletion is permanent and irreversible. Once deleted, you cannot recover your account or data.',
                },
                {
                  q: 'Will my data be deleted from social media platforms?',
                  a: 'No. We only delete data stored on Hey Creator. Your social media profiles and content remain unchanged.',
                },
                {
                  q: 'What happens to my active campaigns or applications?',
                  a: 'Active campaigns will be cancelled and brands will be notified. Applications will be withdrawn. Please complete or cancel campaigns before deletion.',
                },
                {
                  q: 'Do I need to delete my Instagram or Facebook app authorization?',
                  a: 'We automatically revoke access when you delete your account, but you can also manually remove Hey Creator from your social media settings.',
                },
                {
                  q: 'How can I verify my data has been deleted?',
                  a: 'We will send a final confirmation email once deletion is complete. You can also contact us to verify.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">Q:</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-sm text-gray-700 ml-5">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-brand-navy" />
              Need Help?
            </h2>
            <div className="bg-gradient-to-br from-brand-navy to-[#003875] text-white rounded-lg p-6">
              <p className="text-blue-100 mb-4">
                If you have questions about data deletion or need assistance, please contact us:
              </p>
              <div className="space-y-2">
                <p className="font-semibold">Email: wieslaw@rapidevlabs.com</p>
                <p className="text-sm text-blue-100">
                  We typically respond within 24-48 hours.
                </p>
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
              href="/privacy"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} Hey Creator. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
