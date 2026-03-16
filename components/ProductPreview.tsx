type Props = {
  isDark: boolean
}

const MOCK_LEADS = [
  { address: '2847 Brickell Ave', city: 'Miami', type: 'Pre-Foreclosure', score: 100, tag: 'HOT LEAD', tagColor: 'bg-green-100 text-green-800' },
  { address: '1120 Wilshire Blvd', city: 'Los Angeles', type: 'Expired Listing', score: 80, tag: 'STRONG OPP', tagColor: 'bg-yellow-100 text-yellow-800' },
  { address: '445 Park Ave', city: 'New York', type: 'Investor Opportunity', score: 80, tag: 'STRONG OPP', tagColor: 'bg-yellow-100 text-yellow-800' },
  { address: '3319 Oak Lawn Ave', city: 'Dallas', type: 'Pre-Foreclosure', score: 100, tag: 'HOT LEAD', tagColor: 'bg-green-100 text-green-800' },
  { address: '880 Peachtree St', city: 'Atlanta', type: 'Investor Opportunity', score: 60, tag: 'MODERATE', tagColor: 'bg-blue-100 text-blue-800' },
  { address: '711 S Wabash Ave', city: 'Chicago', type: 'Expired Listing', score: 80, tag: 'STRONG OPP', tagColor: 'bg-yellow-100 text-yellow-800' },
]

export default function ProductPreview({ isDark }: Props) {
  return (
    <section
      id="preview"
      className={`py-16 px-4 sm:py-24 sm:px-6 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-b from-blue-50 to-white'}`}
    >
      {/* Change 3 — max-w-full on mobile, 1100px on desktop */}
      <div className="max-w-full sm:max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            Product Preview
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Locate Off-Market Property Deals in Seconds
          </h2>
          <p className={`text-base max-w-xl mx-auto mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Ranked by opportunity score so the highest-value leads are always at the top.
          </p>

          {/* Feature callout pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Opportunity Scoring', icon: '📊' },
              { label: 'Lead Tags', icon: '🏷️' },
              { label: 'Saved Leads', icon: '⭐' },
              { label: 'CSV Calling Lists', icon: '📥' },
              { label: 'Day / Night Theme', icon: '🌗' },
            ].map((f) => (
              <span
                key={f.label}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-300'
                    : 'bg-white border-gray-200 text-gray-600 shadow-sm'
                }`}
              >
                <span>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Browser-frame mock */}
        <div
          className={`rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? 'border-gray-700 shadow-blue-950/60' : 'border-gray-200 shadow-blue-200/80'
          }`}
        >
          {/* Fake browser chrome */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
          }`}>
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <div className={`ml-3 flex-1 max-w-xs rounded text-xs px-3 py-1 ${
              isDark ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-400'
            }`}>
              leadfinder.app/finder
            </div>
          </div>

          {/* Mock toolbar */}
          <div className={`flex items-center justify-between px-5 py-3 border-b ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                6 leads found in Miami
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
              }`}>
                2 Hot Leads
              </span>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
              isDark ? 'bg-green-700 text-white' : 'bg-green-600 text-white'
            }`}>
              Download Calling List
            </span>
          </div>

          {/* Change 2 — horizontal scroll wrapper for table on mobile */}
          <div className="overflow-x-auto">
            {/* min-w prevents columns from collapsing below a readable width */}
            <div className={`min-w-[520px] ${isDark ? 'bg-gray-900' : 'bg-white'}`}>

              {/* Table header */}
              <div className={`grid grid-cols-12 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide border-b ${
                isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-100'
              }`}>
                <span className="col-span-4">Address</span>
                <span className="col-span-2">City</span>
                <span className="col-span-3">Lead Type</span>
                <span className="col-span-2 text-right">Score</span>
                <span className="col-span-1 text-right">★</span>
              </div>

              {/* Rows — Change 4: text-xs on mobile, text-sm on sm+ */}
              {MOCK_LEADS.map((lead, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-12 px-5 py-3 text-xs sm:text-sm border-b items-center ${
                    isDark
                      ? 'border-gray-800 hover:bg-gray-800/60'
                      : 'border-gray-50 hover:bg-blue-50/50'
                  } ${i === 0 ? (isDark ? 'bg-gray-800/40' : 'bg-green-50/40') : ''}`}
                >
                  <span className={`col-span-4 font-medium truncate pr-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {lead.address}
                  </span>
                  <span className={`col-span-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {lead.city}
                  </span>
                  <span className={`col-span-3 text-xs font-medium ${
                    lead.type === 'Pre-Foreclosure'
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : lead.type === 'Expired Listing'
                      ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                      : isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {lead.type}
                  </span>
                  <span className="col-span-2 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      lead.score >= 80
                        ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                        : isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lead.score}
                    </span>
                  </span>
                  <span className={`col-span-1 text-right ${i < 2 ? 'text-yellow-400' : isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                    {i < 2 ? '★' : '☆'}
                  </span>
                </div>
              ))}

              {/* Footer bar — inside scroll wrapper so it stays aligned with columns */}
              <div className={`px-5 py-2.5 text-xs flex items-center justify-between ${
                isDark ? 'bg-gray-900 text-gray-500 border-t border-gray-800' : 'bg-gray-50 text-gray-400 border-t border-gray-100'
              }`}>
                <span>Sorted by opportunity score</span>
                <span>Showing 6 of 120 leads in Miami</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
