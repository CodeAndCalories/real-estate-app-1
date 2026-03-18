import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — PropertySignalHQ',
  description: 'About PropertySignalHQ — built to give independent investors the same data-driven edge as institutional buyers.',
}

const SIGNALS = [
  'Price drop patterns and market liquidity',
  'Days on market and relisting history',
  'Tax delinquency and vacancy indicators',
  'Ownership duration and equity position',
  'Absentee owner and inheritance signals',
]

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden px-4 py-16">

      {/* Glow orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-2xl">

        {/* Back link */}
        <Link href="/" className="text-xs text-blue-400 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <span className="mb-3 inline-block rounded-full border border-blue-600/20 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-400">
            Our Story
          </span>
          <h1 className="text-4xl font-bold text-white">About PropertySignalHQ</h1>
        </div>

        {/* Content sections */}
        <div className="space-y-8">

          {/* The Problem */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">The Problem</h2>
            <p className="text-gray-300 leading-relaxed">
              In today&apos;s real estate market, there is no shortage of data — there&apos;s just too
              much of it. Between scattered public records, shifting market trends, and opaque
              algorithms, investors often spend more time filtering noise than actually closing deals.
            </p>
          </div>

          {/* The Solution */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">The Solution</h2>
            <p className="text-gray-300 leading-relaxed mb-5">
              We built PropertySignalHQ to simplify the gut check. We analyze data across 30+ major
              US markets — from Miami to Denver — and distill it into a single, actionable
              Opportunity Score.
            </p>
            <p className="text-sm font-semibold text-white mb-3">We analyze the signals that matter:</p>
            <ul className="space-y-2">
              {SIGNALS.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-gray-400">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Our Mission */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To give independent investors the same data-driven edge that institutional buyers have,
              without the enterprise price tag. Whether you&apos;re a wholesaler in Dallas or a rental
              investor in Phoenix, our goal is to help you find the signal in the noise.
            </p>
          </div>

          {/* Founder's Note */}
          <div className="rounded-2xl border border-blue-600/20 bg-blue-600/5 p-7 backdrop-blur-xl shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Founder&apos;s Note</h2>
            <blockquote className="text-gray-300 leading-relaxed italic border-l-2 border-blue-500/40 pl-4">
              &ldquo;I built this tool because I was frustrated with the friction in property analysis.
              If you have feedback, I&apos;d love to hear it.&rdquo;
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                P
              </div>
              <div>
                <p className="text-sm font-medium text-white">PropertySignalHQ</p>
                <a
                  href="mailto:support@propertysignalhq.com"
                  className="text-xs text-blue-400 hover:underline"
                >
                  support@propertysignalhq.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/finder"
            className="rounded-xl bg-blue-600 px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
          >
            Explore the Signal Finder
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-gray-300 transition-all hover:bg-white/10"
          >
            Get in Touch
          </Link>
        </div>

        {/* Footer links */}
        <p className="mt-8 text-center text-xs text-gray-600">
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          {' · '}
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          {' · '}
          <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
        </p>

      </div>
    </div>
  )
}
