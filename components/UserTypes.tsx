type Props = {
  isDark: boolean
}

const USER_TYPES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    title: 'Real Estate Agents',
    description: 'Reach motivated sellers weeks before they list. Stop relying on referrals alone — build a steady pipeline of exclusive off-market opportunities in your market.',
    highlight: 'Win more listings, less cold calling',
    colorDay: 'text-blue-600',
    colorNight: 'text-blue-400',
    bgDay: 'bg-blue-50 border-blue-100',
    bgNight: 'bg-blue-950/30 border-blue-800/50',
    iconBgDay: 'bg-blue-100',
    iconBgNight: 'bg-blue-900/50',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Real Estate Investors',
    description: 'Filter for high-equity, price-drop, and strong-yield properties before they hit the MLS. Every lead includes estimated equity, rent ratio, and a data-backed opportunity score.',
    highlight: 'Find undervalued deals before they list',
    colorDay: 'text-green-600',
    colorNight: 'text-green-400',
    bgDay: 'bg-green-50 border-green-100',
    bgNight: 'bg-green-950/30 border-green-800/50',
    iconBgDay: 'bg-green-100',
    iconBgNight: 'bg-green-900/50',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Wholesalers',
    description: 'Export a ready-to-call list with distressed owners, loan balances, and equity estimates in one click. Spend your time closing, not data-mining.',
    highlight: 'Fill your pipeline in minutes, not weeks',
    colorDay: 'text-purple-600',
    colorNight: 'text-purple-400',
    bgDay: 'bg-purple-50 border-purple-100',
    bgNight: 'bg-purple-950/30 border-purple-800/50',
    iconBgDay: 'bg-purple-100',
    iconBgNight: 'bg-purple-900/50',
  },
]

export default function UserTypes({ isDark }: Props) {
  return (
    <section className={`py-24 px-6 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            Built For
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Built For Real Estate Professionals
          </h2>
          <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Whether you're closing deals, flipping properties, or building a wholesale pipeline — this tool works for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {USER_TYPES.map((u) => (
            <div
              key={u.title}
              className={`rounded-2xl border p-7 shadow-md transition-all duration-300 hover:-translate-y-1 ${
                isDark
                  ? `${u.bgNight} hover:shadow-xl hover:shadow-black/40`
                  : `${u.bgDay} hover:shadow-lg`
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  isDark ? u.iconBgNight : u.iconBgDay
                }`}
              >
                <span className={isDark ? u.colorNight : u.colorDay}>{u.icon}</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {u.title}
              </h3>
              <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {u.description}
              </p>
              <span className={`text-xs font-semibold ${isDark ? u.colorNight : u.colorDay}`}>
                → {u.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
