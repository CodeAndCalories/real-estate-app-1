'use client'

import { useState } from 'react'

type Props = {
  ownerName: string | null
}

function Modal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Owner Contact Lookup</h3>
              <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-blue-800 leading-relaxed">
            Owner contact lookup is coming soon. This feature will provide{' '}
            <span className="font-bold">verified phone numbers</span> and{' '}
            <span className="font-bold">mailing addresses</span> for off-market outreach —
            directly integrated with your favorite dialers and CRM tools.
          </p>
        </div>

        {/* What's coming */}
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
          What&apos;s included
        </p>
        <ul className="space-y-2 mb-5">
          {[
            'Verified mobile and landline phone numbers',
            'Current mailing address (even if different from property)',
            'Estimated ownership length',
            'Skip-trace powered by real county records',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
        >
          Got it — notify me when available
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          Available with the Premium plan at launch.
        </p>
      </div>
    </div>
  )
}

export default function OwnerContactCard({ ownerName }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Owner Information</h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            Contact Lookup Available Soon
          </span>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Owner details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Owner Name</p>
              <p className="text-sm font-semibold text-gray-800">{ownerName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mailing Address</p>
              <p className="text-sm font-semibold text-gray-400 italic">Not available</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ownership Length</p>
              <p className="text-sm font-semibold text-gray-400 italic">Not available</p>
            </div>
          </div>

          {/* Phone numbers placeholder */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="text-sm text-gray-500 italic">
                Phone numbers available with contact lookup.
              </p>
            </div>
          </div>

          {/* Reveal button */}
          <div className="pt-1">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm shadow-blue-600/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Reveal Owner Contact
            </button>
            <p className="mt-2 text-xs text-gray-400">
              Verified phone numbers and mailing address — coming soon.
            </p>
          </div>
        </div>
      </section>

      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </>
  )
}
