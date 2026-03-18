import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — PropertySignalHQ',
  description: 'Privacy Policy for PropertySignalHQ.',
}

const SECTIONS: { title: string; bullets?: string[]; body?: string; contact?: true }[] = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us, such as when you create an account (email address) and the property addresses or data you input into our "Analyze Deal" tool. We also automatically collect log data and cookies via Supabase to improve our service.',
  },
  {
    title: '2. How We Use Your Information',
    bullets: [
      'Provide and maintain the PropertySignalHQ platform',
      'Save and display your Saved Deals and Favorites',
      'Process payments via Stripe',
      'Communicate with you about service updates or support',
    ],
  },
  {
    title: '3. Data Sharing',
    body: 'We do not sell your personal data. We share data only with service providers (Vercel, Supabase, Stripe, Resend) necessary to run the website.',
  },
  {
    title: '4. Data Security',
    body: 'We use industry-standard security measures (SSL/HTTPS) to protect your information. However, no internet transmission is 100% secure.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your data as long as your account is active. You may request deletion by emailing support@propertysignalhq.com.',
  },
  {
    title: '6. Cookies',
    body: 'We use essential cookies for authentication and session management only. We do not use advertising cookies.',
  },
  {
    title: '7. Contact',
    contact: true,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden px-4 py-16">

      {/* Glow orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-3xl">

        {/* Back link */}
        <Link href="/" className="text-xs text-blue-400 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: March 17, 2026</p>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-sm font-semibold text-white mb-2">{s.title}</h2>

              {s.contact && (
                <p className="text-sm text-gray-400 leading-relaxed">
                  Questions? Email:{' '}
                  <a
                    href="mailto:support@propertysignalhq.com"
                    className="text-blue-400 hover:underline"
                  >
                    support@propertysignalhq.com
                  </a>
                </p>
              )}

              {s.bullets && (
                <ul className="space-y-1.5 mt-1">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-400">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {s.body && (
                <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer links */}
        <p className="mt-8 text-center text-xs text-gray-600">
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          {' · '}
          <Link href="/about" className="hover:text-gray-400 transition-colors">About</Link>
          {' · '}
          <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
        </p>

      </div>
    </div>
  )
}
