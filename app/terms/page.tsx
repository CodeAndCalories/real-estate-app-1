export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <a href="/" className="text-sm text-blue-600 hover:underline">← Back to home</a>
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using PropertySignalHQ, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Demo Product Disclaimer</h2>
          <p>
            PropertySignalHQ is a demonstration product. The lead data displayed is simulated and provided for illustrative purposes only. It does not represent actual property owners, real MLS data, or verified contact information. Do not use this data for actual outreach or commercial purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Permitted Use</h2>
          <p>
            You may use PropertySignalHQ for personal, non-commercial evaluation and demonstration purposes. You may not scrape, copy, redistribute, or commercialize the data or interface without explicit written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Intellectual Property</h2>
          <p>
            All content, design, and code within PropertySignalHQ is the property of its creators. No portion may be reproduced or distributed without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Limitation of Liability</h2>
          <p>
            PropertySignalHQ is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from the use of this demo product, including but not limited to data accuracy, availability, or fitness for a particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Governing Law</h2>
          <p>
            These terms are governed by the laws of the United States. Any disputes will be resolved in the applicable jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
          <p>
            Questions about these terms? Please reach out via our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a>.
          </p>
        </section>

      </div>
    </div>
  )
}
