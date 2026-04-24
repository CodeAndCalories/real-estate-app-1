import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Distressed Property Leads by State | PropertySignalHQ',
  description:
    'Browse pre-foreclosure, absentee owner, and tax delinquent property leads across all 50 US states. Updated weekly.',
  openGraph: {
    title: 'Distressed Property Leads by State | PropertySignalHQ',
    description:
      'Browse pre-foreclosure, absentee owner, and tax delinquent property leads across all 50 US states.',
    url: 'https://propertysignalhq.com/states',
  },
}

const US_STATES = [
  { slug: 'alabama',        name: 'Alabama' },
  { slug: 'alaska',         name: 'Alaska' },
  { slug: 'arizona',        name: 'Arizona' },
  { slug: 'arkansas',       name: 'Arkansas' },
  { slug: 'california',     name: 'California' },
  { slug: 'colorado',       name: 'Colorado' },
  { slug: 'connecticut',    name: 'Connecticut' },
  { slug: 'delaware',       name: 'Delaware' },
  { slug: 'florida',        name: 'Florida' },
  { slug: 'georgia',        name: 'Georgia' },
  { slug: 'hawaii',         name: 'Hawaii' },
  { slug: 'idaho',          name: 'Idaho' },
  { slug: 'illinois',       name: 'Illinois' },
  { slug: 'indiana',        name: 'Indiana' },
  { slug: 'iowa',           name: 'Iowa' },
  { slug: 'kansas',         name: 'Kansas' },
  { slug: 'kentucky',       name: 'Kentucky' },
  { slug: 'louisiana',      name: 'Louisiana' },
  { slug: 'maine',          name: 'Maine' },
  { slug: 'maryland',       name: 'Maryland' },
  { slug: 'massachusetts',  name: 'Massachusetts' },
  { slug: 'michigan',       name: 'Michigan' },
  { slug: 'minnesota',      name: 'Minnesota' },
  { slug: 'mississippi',    name: 'Mississippi' },
  { slug: 'missouri',       name: 'Missouri' },
  { slug: 'montana',        name: 'Montana' },
  { slug: 'nebraska',       name: 'Nebraska' },
  { slug: 'nevada',         name: 'Nevada' },
  { slug: 'new-hampshire',  name: 'New Hampshire' },
  { slug: 'new-jersey',     name: 'New Jersey' },
  { slug: 'new-mexico',     name: 'New Mexico' },
  { slug: 'new-york',       name: 'New York' },
  { slug: 'north-carolina', name: 'North Carolina' },
  { slug: 'north-dakota',   name: 'North Dakota' },
  { slug: 'ohio',           name: 'Ohio' },
  { slug: 'oklahoma',       name: 'Oklahoma' },
  { slug: 'oregon',         name: 'Oregon' },
  { slug: 'pennsylvania',   name: 'Pennsylvania' },
  { slug: 'rhode-island',   name: 'Rhode Island' },
  { slug: 'south-carolina', name: 'South Carolina' },
  { slug: 'south-dakota',   name: 'South Dakota' },
  { slug: 'tennessee',      name: 'Tennessee' },
  { slug: 'texas',          name: 'Texas' },
  { slug: 'utah',           name: 'Utah' },
  { slug: 'vermont',        name: 'Vermont' },
  { slug: 'virginia',       name: 'Virginia' },
  { slug: 'washington',     name: 'Washington' },
  { slug: 'west-virginia',  name: 'West Virginia' },
  { slug: 'wisconsin',      name: 'Wisconsin' },
  { slug: 'wyoming',        name: 'Wyoming' },
]

export default function StatesPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">States</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Distressed Property Leads by State
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Browse pre-foreclosure, absentee owner, and tax delinquent property leads across
            all 50 US states — updated weekly.
          </p>
        </div>

        {/* States grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
          {US_STATES.map(({ slug, name }) => (
            <Link
              key={slug}
              href={`/states/${slug}`}
              className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 hover:border-blue-500/40 hover:bg-blue-950/20 transition-all group"
            >
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                {name}
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Find Motivated Sellers in Your Target Market
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Pre-foreclosure, absentee owner, and tax delinquent lists with owner contact
            info — updated weekly. No contracts, cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/25"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition-colors"
            >
              See Pro Plans
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
