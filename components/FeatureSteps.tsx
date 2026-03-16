type Props = {
  isDark: boolean
}

const STEPS = [
  {
    number: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Search Market',
    description: 'Choose a city and lead type to instantly find pre-foreclosure, expired, and investor opportunities.',
  },
  {
    number: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analyze Leads',
    description: 'See opportunity scores, lead tags, equity estimates, and insights for every property instantly.',
  },
  {
    number: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: 'Download Calling List',
    description: 'Export owner leads as a CSV ready for your dialer, CRM, or outreach sequence in one click.',
  },
]

export default function FeatureSteps({ isDark }: Props) {
  return (
    <section className={`py-24 px-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            From Search to Outreach in Minutes
          </h2>
          <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            A simple three-step workflow to go from market selection to ready-to-call lead list.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`rounded-2xl p-7 border shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isDark
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-700'
                  : 'bg-gray-50 border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-4xl font-black leading-none ${isDark ? 'text-blue-500/30' : 'text-blue-100'}`}>
                  {step.number}
                </span>
                <span className={`[&>svg]:w-7 [&>svg]:h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{step.icon}</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
