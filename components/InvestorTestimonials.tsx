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
    dealLabel: 'Found a 94-score deal in Phoenix',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  },
  {
    quote:
      "I was spending hours on Zillow and Redfin manually hunting for distressed properties. Now I just filter by lead type and export a CSV to my dialer. Total game-changer.",
    name: 'Sandra R.',
    role: 'Wholesale Investor',
    location: 'Dallas, TX',
    avatar: 'SR',
    dealLabel: 'Closed 3 wholesale deals in 60 days',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  },
  {
    quote:
      "The rental yield estimates and deal calculator let me run numbers on 20 properties in the time it used to take me to analyze one. My pipeline has never been fuller.",
    name: 'James L.',
    role: 'Buy & Hold Investor',
    location: 'Atlanta, GA',
    avatar: 'JL',
    dealLabel: 'Added 2 rentals to portfolio this quarter',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
  },
  {
    quote:
      "The alert system is the best part. I set it up once and now I get notified when a 90+ score deal hits my target city. It's like having an analyst working for me 24/7.",
    name: 'David K.',
    role: 'Multi-Family Investor',
    location: 'Denver, CO',
    avatar: 'DK',
    dealLabel: 'Automated alerts saved 10 hrs/week',
    gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
  },
  {
    quote:
      "I used to pay $149/month for PropStream and still had to manually score every deal. PropertySignalHQ does all of that automatically at a fraction of the price.",
    name: 'Rachel M.',
    role: 'Real Estate Agent',
    location: 'Charlotte, NC',
    avatar: 'RM',
    dealLabel: 'Switched from $149/mo PropStream',
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
  },
  {
    quote:
      "The market temperature data helps me explain to clients why certain neighborhoods are heating up. I use PropertySignalHQ in every single listing presentation now.",
    name: 'Tom B.',
    role: 'Licensed Realtor',
    location: 'Nashville, TN',
    avatar: 'TB',
    dealLabel: 'Uses it in every listing presentation',
    gradient: 'linear-gradient(135deg, #be185d, #f472b6)',
  },
]

function Stars() {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div
      className="flex-shrink-0 w-[320px] rounded-2xl border border-white/10 p-6 flex flex-col hover:border-white/20 transition-all duration-300"
      style={{
        background: 'rgba(15,23,42,0.9)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <Stars />

      {/* Quote mark decoration */}
      <div className="relative">
        <span
          className="absolute -top-2 -left-1 text-4xl font-black leading-none select-none pointer-events-none"
          style={{ color: 'rgba(37,99,235,0.25)' }}
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <blockquote className="text-sm leading-relaxed flex-1 mb-4 text-gray-300 pt-3 pl-3">
          {t.quote}
        </blockquote>
      </div>

      {/* Deal badge */}
      <div className="flex items-center gap-2 text-xs font-semibold mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span>✓</span>
        <span>{t.dealLabel}</span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
          style={{ background: t.gradient }}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{t.name}</p>
          <p className="text-xs text-gray-500">{t.role} · {t.location}</p>
        </div>
      </div>
    </div>
  )
}

export default function InvestorTestimonials({ isDark: _isDark }: Props) {
  // Double the array so the marquee can loop seamlessly
  const row1 = [...TESTIMONIALS, ...TESTIMONIALS]
  const row2 = [...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(0, 3)]

  return (
    <section className="py-20 overflow-hidden bg-[#0a0f1e]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-400">
            Investor stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4 text-white">
            Real investors. Real results.
          </h2>
          <p className="text-base max-w-md mx-auto text-gray-400">
            See how investors across the country are using PropertySignalHQ to find better deals faster.
          </p>
        </div>
      </div>

      {/* Marquee row 1 */}
      <div className="marquee-track mb-4">
        <div className="marquee-inner">
          {row1.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Marquee row 2 — reversed */}
      <div className="marquee-track">
        <div className="marquee-inner reverse">
          {row2.map((t, i) => (
            <TestimonialCard key={`r2-${i}`} t={t} />
          ))}
        </div>
      </div>

    </section>
  )
}
