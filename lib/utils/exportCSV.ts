import { Property } from '@/app/finder/page'

export function exportToCSV(data: Property[], filename: string) {
  const headers = [
    'Address',
    'City',
    'ZIP',
    'Owner Name',
    'Estimated Value',
    'Loan Balance Estimate',
    'Days In Default',
    'Previous Listing Price',
    'Days On Market',
    'Agent Name',
    'Lead Type',
    'Price Per Sqft',
    'Market Avg Price Per Sqft',
    'Price Drop %',
    'Rent Estimate',
    'Opportunity Score',
  ]

  const rows = data.map((p) => [
    p.address,
    p.city,
    p.zip,
    p.owner_name ?? '',
    p.estimated_value ?? '',
    p.loan_balance_estimate ?? '',
    p.days_in_default ?? '',
    p.previous_listing_price ?? '',
    p.days_on_market ?? '',
    p.agent_name ?? '',
    p.lead_type,
    p.price_per_sqft ?? '',
    p.market_avg_price_per_sqft ?? '',
    p.price_drop_percent ?? '',
    p.rent_estimate ?? '',
    p.opportunity_score ?? '',
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
