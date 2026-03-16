export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <a href="/" className="text-sm text-blue-600 hover:underline">← Back to home</a>
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p>
            PropertySignalHQ is a demo product. We do not collect personally identifiable information unless you voluntarily submit it through a contact form. The information we may collect includes your name and email address when you reach out via our contact page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <p>
            Any information submitted through the contact form is used solely to respond to your inquiry. We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3" id="cookies">3. Cookie Policy</h2>
          <p>
            This site uses minimal cookies and browser local storage to remember your preferences, such as your chosen theme (Day/Night) and cookie banner acceptance. No tracking cookies or third-party advertising cookies are used. You can clear your browser storage at any time to reset these preferences.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Retention</h2>
          <p>
            Contact form submissions are retained only as long as necessary to respond to your inquiry. Local storage data (theme preference, cookie acceptance) is stored entirely in your browser and can be cleared at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Third-Party Services</h2>
          <p>
            This demo product does not currently use third-party analytics, advertising networks, or tracking services. If this changes, this policy will be updated accordingly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of any personal information we hold about you. To exercise these rights, please contact us via the <a href="/contact" className="text-blue-600 hover:underline">Contact page</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the service after changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
          <p>
            For privacy-related questions, email us at{' '}
            <a href="mailto:support@propertysignalhq.com" className="text-blue-600 hover:underline">
              support@propertysignalhq.com
            </a>{' '}
            or use our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a>.
          </p>
        </section>

      </div>
    </div>
  )
}
