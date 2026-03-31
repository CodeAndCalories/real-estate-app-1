type Props = {
  isDark: boolean
}

const MOCK_LEADS = [
  { address: '3847 NW 7th St',      city: 'Miami, FL',     type: 'Pre-Foreclosure',   score: 94 },
  { address: '1204 Oak Cliff Blvd', city: 'Dallas, TX',    type: 'Pre-Foreclosure',   score: 91 },
  { address: '4410 Peachtree Rd',   city: 'Atlanta, GA',   type: 'Tax Delinquent',    score: 88 },
  { address: '7821 S Michigan Ave', city: 'Chicago, IL',   type: 'Expired Listing',   score: 83 },
  { address: '2930 W Thomas Rd',    city: 'Phoenix, AZ',   type: 'Absentee Owner',    score: 79 },
  { address: '541 Riverside Dr',    city: 'Nashville, TN', type: 'Inherited Property',score: 76 },
]

function signalColor(type: string) {
  switch (type) {
    case 'Pre-Foreclosure':    return 'text-red-400'
    case 'Tax Delinquent':     return 'text-orange-400'
    case 'Expired Listing':    return 'text-yellow-400'
    case 'Absentee Owner':     return 'text-blue-400'
    case 'Inherited Property': return 'text-purple-400'
    default:                   return 'text-gray-400'
  }
}

function scoreStyle(score: number) {
  if (score >= 90) return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
  if (score >= 80) return 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
  return 'bg-white/5 text-gray-400 border border-white/10'
}

// This component renders inside the browser-chrome wrapper in app/page.tsx.
// It intentionally uses no outer <section> or extra padding — the parent handles framing.
export default function ProductPreview({ isDark: _isDark }: Props) {
  return (
    <div className="bg-[#0a0f1e]">

      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-7 border-b border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-900/50 text-blue-400">
            Product Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">
            Locate Off-Market Deals in Seconds
          </h2>
          <p className="text-base max-w-lg mx-auto mb-6 text-gray-400">
            Ranked by opportunity score so the highest-value leads are always at the top.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Opportunity Scoring', icon: '📊' },
              { label: 'Lead Tags',           icon: '🏷️' },
              { label: 'Saved Leads',         icon: '⭐' },
              { label: 'CSV Export',          icon: '📥' },
              { label: 'Owner Contact',       icon: '📞' },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-white/5 border-white/10 text-gray-300"
              >
                <span>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mock app toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/5 bg-[#0f172a]">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mock search bar */}
          <div className="flex items-center gap-2 bg-[#020617] border border-white/10 rounded-lg px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs text-gray-300 font-medium">Miami, FL</span>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-red-400 font-medium">Pre-Foreclosure</span>
          </div>
          {/* Status badge */}
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            2 Hot Leads
          </span>
        </div>
        {/* Export button */}
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white flex-shrink-0 cursor-default">
          ↓ Export CSV
        </span>
      </div>

      {/* ── Mock table ────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <div className="min-w-[540px] bg-[#0a0f1e]">

          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 border-b border-white/5">
            <span className="col-span-4">Address</span>
            <span className="col-span-2">Market</span>
            <span className="col-span-3">Signal</span>
            <span className="col-span-2 text-center">Score</span>
            <span className="col-span-1 text-right">★</span>
          </div>

          {/* Rows */}
          {MOCK_LEADS.map((lead, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 px-5 py-3 text-xs border-b border-white/5 items-center transition-colors ${
                i === 0
                  ? 'bg-blue-500/[0.06]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <span className="col-span-4 font-medium text-gray-200 truncate pr-2">
                {lead.address}
              </span>
              <span className="col-span-2 text-gray-500 text-[11px]">
                {lead.city}
              </span>
              <span className={`col-span-3 text-[11px] font-semibold ${signalColor(lead.type)}`}>
                {lead.type}
              </span>
              <span className="col-span-2 text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-black tabular-nums ${scoreStyle(lead.score)}`}>
                  {lead.score}
                </span>
              </span>
              <span className={`col-span-1 text-right text-sm ${i < 2 ? 'text-yellow-400' : 'text-gray-700'}`}>
                {i < 2 ? '★' : '☆'}
              </span>
            </div>
          ))}

          {/* Footer */}
          <div className="px-5 py-2.5 text-[10px] text-gray-600 flex items-center justify-between bg-[#0a0f1e] border-t border-white/5">
            <span>Sorted by opportunity score · All 50 states</span>
            <span>Showing 6 of 847 leads in Miami</span>
          </div>

        </div>
      </div>

    </div>
  )
}
