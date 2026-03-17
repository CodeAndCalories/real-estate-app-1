'use client'

/**
 * DealWorkspace — client wrapper for the per-property CRM tools.
 *
 * Owns the onActivity refresh cycle so the timeline re-renders
 * whenever the user takes an action (adds a note, tag, or contact attempt).
 * The server component just renders <DealWorkspace propertyId={...} />.
 */

import { useCallback, useState } from 'react'
import DealTags from '@/components/DealTags'
import DealNotes from '@/components/DealNotes'
import ContactTracker from '@/components/ContactTracker'
import DealActivityTimeline from '@/components/DealActivityTimeline'

type Props = {
  propertyId: string
}

export default function DealWorkspace({ propertyId }: Props) {
  // Bump this counter whenever a child logs an activity — forces the
  // timeline to re-read localStorage and show the fresh entry.
  const [refreshKey, setRefreshKey] = useState(0)
  const handleActivity = useCallback(() => setRefreshKey((k) => k + 1), [])

  return (
    <>
      {/* Tags — per spec: above DealNotes */}
      <DealTags propertyId={propertyId} onActivity={handleActivity} />

      {/* Notes — per spec: under DealScoreExplanation */}
      <DealNotes propertyId={propertyId} onActivity={handleActivity} />

      {/* Contact tracker — below DealNotes */}
      <ContactTracker propertyId={propertyId} onActivity={handleActivity} />

      {/* Activity timeline — below ContactTracker; key forces remount on activity */}
      <DealActivityTimeline key={refreshKey} propertyId={propertyId} />
    </>
  )
}
