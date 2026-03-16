import { Property } from '@/app/finder/page'

type Props = {
  data: Property[]
}

type Card = {
  label: string
  count: number
  bg: string
  text: string
  border: string
  icon: string
}

export default function InsightCards({ data }: Props) {
  const cards: Card[] = [
    {
      label: 'Hot Leads',
      count: data.filter((p) => (p.opportunity_score ?? 0) >= 80).length,
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: '🔥',
    },
    {
      label: 'Distressed Owners',
      count: data.filter((p) => (p.days_in_default ?? 0) > 60).length,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '⚠️',
    },
    {
      label: 'Investor Opportunities',
      count: data.filter((p) => p.lead_type === 'Investor Opportunity').length,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: '📈',
    },
    {
      label: 'Price Drops',
      count: data.filter((p) => (p.price_drop_percent ?? 0) > 10).length,
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: '⬇️',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} ${card.border} border rounded-lg p-3 flex items-center gap-3`}
        >
          <span className="text-xl leading-none">{card.icon}</span>
          <div>
            <div className={`text-2xl font-bold leading-none ${card.text}`}>{card.count}</div>
            <div className={`text-xs font-medium mt-0.5 ${card.text} opacity-80`}>{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
