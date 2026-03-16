'use client'

import { useState } from 'react'
import { useThemeMode } from '@/lib/hooks/useThemeMode'

type Props = { isDark?: boolean }

function toNum(v: string): number {
  const n = parseFloat(v.replace(/,/g, ''))
  return isNaN(n) ? 0 : n
}

function fmtDollar(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`
}

function fmtPct(n: number): string {
  return isFinite(n) && n !== 0 ? `${n.toFixed(2)}%` : '—'
}

export default function DealCalculator({ isDark: isDarkProp }: Props) {
  const { isDark: themeDark } = useThemeMode()
  const isDark = isDarkProp ?? themeDark

  const [purchasePrice, setPurchasePrice] = useState('300000')
  const [repairCost,    setRepairCost]    = useState('25000')
  const [arv,           setArv]           = useState('380000')
  const [monthlyRent,   setMonthlyRent]   = useState('2200')
  const [downPct,       setDownPct]       = useState('20')

  const purchase = toNum(purchasePrice)
  const repair   = toNum(repairCost)
  const arvVal   = toNum(arv)
  const rent     = toNum(monthlyRent)
  const down     = Math.min(100, Math.max(0, toNum(downPct)))

  // Derived
  const downAmount  = purchase * (down / 100)
  const loanAmount  = purchase - downAmount + repair

  // Monthly cost estimates
  const mortgage   = loanAmount  * 0.00665        // ~7% 30yr amortisation
  const taxMonthly = (purchase   * 0.012) / 12    // 1.2% annual property tax
  const insurance  = (purchase   * 0.005) / 12    // 0.5% annual
  const maintenance= (purchase   * 0.010) / 12    // 1% annual
  const totalCosts = mortgage + taxMonthly + insurance + maintenance

  // Outputs
  const profit    = arvVal - purchase - repair
  const cashFlow  = rent - totalCosts
  const capRate   = purchase > 0 ? ((rent * 12) / purchase) * 100      : 0
  const invested  = downAmount + repair
  const cocReturn = invested > 0 ? ((cashFlow * 12) / invested) * 100  : 0

  // Styles
  const card      = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const divider   = isDark ? 'border-gray-700'              : 'border-gray-100'
  const inputCls  = isDark
    ? 'w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls  = `block text-xs font-semibold uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'

  const positiveColor = (v: number) =>
    v > 0 ? 'text-green-500' : v < 0 ? 'text-red-400' : textPrimary
  const rateColor = (v: number, good: number) =>
    v >= good ? 'text-green-500' : v > 0 ? (isDark ? 'text-yellow-400' : 'text-yellow-600') : 'text-red-400'

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${card}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-5 py-3 border-b ${divider}`}>
        <span className="text-base">🧮</span>
        <h2 className={`text-sm font-bold ${textPrimary}`}>Deal Calculator</h2>
        <span className={`text-xs ${textMuted}`}>Analyze a deal in real-time</span>
      </div>

      <div className="px-5 py-4">
        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {([
            ['Purchase Price', purchasePrice, setPurchasePrice, '300000'],
            ['Repair Cost',    repairCost,    setRepairCost,    '25000'],
            ['ARV',            arv,           setArv,           '380000'],
            ['Monthly Rent',   monthlyRent,   setMonthlyRent,   '2200'],
            ['Down Payment %', downPct,       setDownPct,       '20'],
          ] as [string, string, (v: string) => void, string][]).map(([label, val, set, ph]) => (
            <div key={label}>
              <label className={labelCls}>{label}</label>
              <input
                type="text"
                value={val}
                onChange={(e) => set(e.target.value)}
                className={inputCls}
                placeholder={ph}
              />
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {/* Profit */}
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`text-lg font-black ${positiveColor(profit)}`}>{fmtDollar(profit)}</div>
            <div className={`text-[11px] mt-0.5 ${textMuted}`}>Est. Profit (Flip)</div>
          </div>

          {/* Cash flow */}
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`text-lg font-black ${positiveColor(cashFlow)}`}>
              {cashFlow !== 0 ? `${fmtDollar(cashFlow)}/mo` : '—'}
            </div>
            <div className={`text-[11px] mt-0.5 ${textMuted}`}>Monthly Cash Flow</div>
          </div>

          {/* Cap rate */}
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`text-lg font-black ${rateColor(capRate, 6)}`}>{fmtPct(capRate)}</div>
            <div className={`text-[11px] mt-0.5 ${textMuted}`}>Cap Rate</div>
          </div>

          {/* CoC */}
          <div className={`rounded-lg border p-3 text-center ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`text-lg font-black ${rateColor(cocReturn, 8)}`}>{fmtPct(cocReturn)}</div>
            <div className={`text-[11px] mt-0.5 ${textMuted}`}>Cash-on-Cash Return</div>
          </div>
        </div>

        {/* Cost breakdown & assumptions */}
        <div className={`rounded-lg border px-3 py-2.5 text-[11px] ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
          <span className="font-semibold">Est. monthly costs:</span>{' '}
          {fmtDollar(totalCosts)}/mo
          <span className="mx-2 opacity-40">·</span>
          Mortgage {fmtDollar(mortgage)} · Tax {fmtDollar(taxMonthly)} · Insurance {fmtDollar(insurance)} · Maintenance {fmtDollar(maintenance)}
          <span className="mx-2 opacity-40">·</span>
          Assumes 7% rate, 30yr loan
        </div>
      </div>
    </div>
  )
}
