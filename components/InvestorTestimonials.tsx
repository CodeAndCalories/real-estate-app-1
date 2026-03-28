'use client'

type Props = {
  isDark: boolean
}

const TESTIMONIALS = [
  {
    quote:
      "PropertySignalHQ helped me identify off-market opportunities I would have never seen. The opportunity scoring alone saved me weeks of research.",
    name: 'Marcus T.',
    role: 'Fix & Flip Investor',
    location: 'Phoenix, AZ',
    avatar: 'MT',
    score: 94,
    dealLabel: 'Found a 94-score deal in Phoenix',
    avatarColor: 'bg-blue-600',
  },
  {
    quote:
      "I was spending hours on Zillow and Redfin manually hunting for distressed properties. Now I just filter by lead type and export a CSV to my dialer. Total game-changer.",
    name: 'Sandra R.',
    role: 'Wholesale Investor',
    location: 'Dallas, TX',
    avatar: 'SR',
    score: 88,
    dealLabel: 'Closed 3 wholesale deals in 60 days',
    avatarColor: 'bg-purple-600',
  },
  {
    quote:
      "The rental yield estimates and deal calculator let me run numbers on 20 properties in the time it used to take me to analyze one. My buy-and-hold pipeline has never been fuller.",
    name: 'James L.',
    role: 'Buy & Hold Investor',
    location: 'Atlanta, GA',
    avatar: 'JL',
    score: 82,
    dealLabel: 'Added 2 rentals to portfolio this quarter',
    avatarColor: 'bg-green-600',
  },
]

function Stars() {
  return (
    <div className="flex items-center gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function InvestorTestimonials({ isDark }: Props) {
  return (
    <section className="py-20 px-6 bg-[#0a0f1e]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Investor stories
          </p>
          <h2 className={`text-3xl sm:text-4xl font-black leading-tight mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Real investors. Real results.
          </h2>
          <p className={`text-base max-w-md mx-auto ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            See how investors across the country are using PropertySignalHQ to find better deals faster.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                isDark
                  ? 'bg-gray-900 border-gray-700'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Stars />

              {/* Quote */}
              <blockquote className={`text-sm leading-relaxed flex-1 mb-5 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Deal badge */}
              <div className={`flex items-center gap-2 text-xs font-semibold mb-4 px-3 py-2 rounded-lg ${
                isDark
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-green-50 text-green-700'
              }`}>
                <span>✓</span>
                <span>{t.dealLabel}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black ${t.avatarColor}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t.role} · {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof banner */}
        <div className={`rounded-2xl border px-8 py-6 flex flex-wrap items-center justify-center gap-8 text-center ${
          isDark
            ? 'bg-blue-950/40 border-blue-800'
            : 'bg-blue-50 border-blue-200'
        }`}>
          {[
            { value: '40,000+', label: 'Property signals' },
            { value: '60+',    label: 'Cities · all 50 states' },
            { value: 'Zillow', label: 'Powered market data' },
            { value: 'Weekly', label: 'Data updates' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className={`text-3xl font-black leading-none ${
                isDark ? 'text-blue-400' : 'text-blue-700'
              }`}>
                {stat.value}
              </div>
              <div className={`text-xs mt-1 font-medium ${
                isDark ? 'text-blue-500' : 'text-blue-600'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
