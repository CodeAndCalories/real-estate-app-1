import { Property } from '@/app/finder/page'

export function exportToCSV(data: Property[], filename: string) {
  const headers = [
    'Address',
    'City',
    'ZIP',
    'Lead Type',
    'Score',
    'Est Value',
    'Est Equity',
    'Loan Balance',
    'Days on Market',
    'Owner Name',
    'Owner Phone',
    'Owner Mailing Address',
  ]

  const rows = data.map((p) => {
    const equity =
      p.estimated_value != null && p.loan_balance_estimate != null
        ? p.estimated_value - p.loan_balance_estimate
        : ''
    return [
      p.address,
      p.city,
      p.zip,
      p.lead_type,
      p.opportunity_score ?? '',
      p.estimated_value ?? '',
      equity,
      p.loan_balance_estimate ?? '',
      p.days_on_market ?? '',
      p.owner_name ?? '',
      p.owner_phone ?? '',
      p.owner_mailing_address ?? '',
    ]
  })

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
