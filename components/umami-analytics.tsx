"use client"

import Script from "next/script"

export function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL || "https://cloud.umami.is/script.js"

  if (!websiteId) return null

  return (
    <Script
      src={umamiUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  )
}
