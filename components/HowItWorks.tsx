type Props = {
  isDark: boolean
}

const STEPS = [
  {
    number: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Search Market',
    description: 'Choose a city and lead type to generate a focused list of pre-foreclosure, expired, and investor opportunities.',
  },
  {
    number: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analyze Leads',
    description: 'See opportunity scores, lead tags, equity estimates, and data-backed insights for every property — instantly.',
  },
  {
    number: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: 'Download Calling List',
    description: 'Export owner leads as a CSV ready for your dialer, CRM, or outreach sequence with a single click.',
  },
]

export default function HowItWorks({ isDark }: Props) {
  return (
    <section
      id="how-it-works"
      className="py-12 md:py-24 px-6 bg-[#020617]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-900/50 text-blue-400">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-white">
            From Search to Outreach in Minutes
          </h2>
          <p className="text-base max-w-xl mx-auto text-gray-400">
            A simple three-step workflow to go from city selection to a ready-to-call lead list.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-[#0f172a] border border-white/10 rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-blue-950/60 hover:border-blue-500/40"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl font-black leading-none select-none text-blue-500/25">
                  {step.number}
                </span>
                <span className="text-blue-400 [&>svg]:w-7 [&>svg]:h-7">{step.icon}</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
