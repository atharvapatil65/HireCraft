"use client"

import { PricingTable as ClerkPricingTable } from "@clerk/nextjs"
import { DEMO_MODE } from "@/data/env/demo"

export function PricingTable() {
  if (DEMO_MODE) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg font-semibold text-foreground">
          You&apos;re in demo mode
        </p>
        <p>
          Pricing and billing are disabled for this demo. All features are
          unlocked.
        </p>
      </div>
    )
  }

  return <ClerkPricingTable newSubscriptionRedirectUrl="/app" />
}
