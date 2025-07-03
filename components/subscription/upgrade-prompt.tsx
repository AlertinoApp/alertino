"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, X } from "lucide-react"

interface UpgradePromptProps {
  onUpgrade: () => void
  onDismiss?: () => void
}

export function UpgradePrompt({ onUpgrade, onDismiss }: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Unlock Premium Features</h3>
              <p className="text-blue-800 text-sm">
                Get unlimited filters, priority notifications, and access to all Polish cities.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700">
              Upgrade Now
            </Button>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
