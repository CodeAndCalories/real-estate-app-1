type Props = {
  hotLeadCount: number
  city: string
}

export default function OpportunityBanner({ hotLeadCount, city }: Props) {
  if (hotLeadCount === 0) return null
  return (
    <div className="bg-green-600 text-white rounded-lg px-5 py-3 mb-4 flex items-center gap-4">
      <span className="text-3xl font-black leading-none">{hotLeadCount}</span>
      <div>
        <p className="text-sm font-extrabold uppercase tracking-widest leading-tight">
          Hot Lead{hotLeadCount !== 1 ? 's' : ''} Found
        </p>
        <p className="text-green-200 text-xs font-medium uppercase tracking-wide mt-0.5">
          in {city}
        </p>
      </div>
      <span className="ml-auto text-green-300 text-2xl">🔥</span>
    </div>
  )
}
