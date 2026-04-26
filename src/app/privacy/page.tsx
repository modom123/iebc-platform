import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | IEBC',
  description: 'How IEBC collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  const updated = 'April 23, 2026'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0F4C81] rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">I</span>
            </div>
            <span className="font-extrabold text-[#0F4C81] text-lg">IEBC</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {updated}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Who We Are</h2>
            <p>
              IEBC (Integrated Efficiency Business Consultants) operates the website at{' '}
              <span className="font-medium">iebusinessconsultants.com</span> and the IEBC Financial Infrastructure
              platform (collectively, the &ldquo;Service&rdquo;). We are the data controller for personal information
              collected through the Service.
            </p>
            <p className="mt-2">Contact us at: <a href="mailto:info@iebusinessconsultants.com" className="text-[#0F4C81] underline">info@iebusinessconsultants.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account data:</strong> name, email address, phone number, business name, password (hashed).</li>
              <li><strong>Billing data:</strong> billing address. Payment card details are processed and stored by Stripe — we do not store card numbers.</li>
              <li><strong>Usage data:</strong> pages visited, features used, timestamps, IP address, browser type.</li>
              <li><strong>Financial data you enter:</strong> invoices, transactions, expenses, and other records you create inside the platform.</li>
              <li><strong>Bank connection data:</strong> if you connect a bank account via Plaid, we receive read-only transaction data as permitted by you.</li>
              <li><strong>AI conversation data:</strong> messages you send to IEBC AI Consultants may be processed by Anthropic&apos;s Claude API.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To create and manage your account.</li>
              <li>To process payments and manage your subscription via Stripe.</li>
              <li>To provide the accounting and AI advisory features of the Service.</li>
              <li>To send transactional emails (receipts, password resets, support replies).</li>
              <li>To detect fraud and ensure platform security.</li>
              <li>To comply with applicable laws and regulations.</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>We share data only with:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Stripe</strong> — payment processing. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0F4C81] underline">stripe.com/privacy</a>.</li>
              <li><strong>Supabase</strong> — database and authentication hosting.</li>
              <li><strong>Anthropic</strong> — AI processing for advisory conversations.</li>
              <li><strong>Plaid</strong> — bank connection (only if you opt in).</li>
              <li><strong>ElevenLabs</strong> — text-to-speech for AI advisor voice (only if you use voice features).</li>
              <li><strong>Law enforcement</strong> — when required by valid legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you close your account, we delete
              your personal data within 90 days, except where retention is required by law (e.g., financial records
              required for tax compliance).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access a copy of your personal data.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li>Restrict or object to processing.</li>
              <li>Data portability (export your data in a machine-readable format).</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, email{' '}
              <a href="mailto:info@iebusinessconsultants.com" className="text-[#0F4C81] underline">
                info@iebusinessconsultants.com
              </a>.
              We respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              We use essential cookies to maintain your login session. We do not use third-party advertising
              cookies. You can disable cookies in your browser settings, but the Service may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Security</h2>
            <p>
              We implement industry-standard measures including TLS encryption in transit, encrypted storage at rest,
              and access controls. No system is 100% secure; please use a strong, unique password and enable
              two-factor authentication when available.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Children</h2>
            <p>
              The Service is not directed to children under 13. We do not knowingly collect data from children. If
              you believe a child has provided us personal data, contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you by email or by posting a notice in the
              platform at least 14 days before material changes take effect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>
              Questions? Email{' '}
              <a href="mailto:info@iebusinessconsultants.com" className="text-[#0F4C81] underline">
                info@iebusinessconsultants.com
              </a>.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white mt-12 py-6 px-6 text-center text-xs text-gray-400">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
          <a href="mailto:info@iebusinessconsultants.com" className="hover:text-gray-600">Contact</a>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} IEBC. All rights reserved.</p>
      </div>
    </main>
  )
}
