"use client"

import { useEffect, useRef } from "react"
import { Calendar, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type TimelineEvent = {
  year: number
  age: number
  event: string
}

interface TimelineEventDetailsProps {
  event: TimelineEvent | null
  personName: string
  birthYear: number | null
  isOpen: boolean
  onClose: () => void
  onAskAI: (question: string) => void
}

export function TimelineEventDetails({
  event,
  personName,
  birthYear,
  isOpen,
  onClose,
  onAskAI,
}: TimelineEventDetailsProps) {
  // Always define hooks at the top level, never conditionally
  const btnRef = useRef<HTMLButtonElement>(null)

  // Scroll to make the button visible when the dialog opens
  useEffect(() => {
    if (isOpen && btnRef.current && event) {
      // Use requestAnimationFrame to ensure the DOM is fully rendered
      requestAnimationFrame(() => {
        // Find the button and scroll it into view
        if (btnRef.current) {
          btnRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      })
    }
  }, [isOpen, event])

  const handleAskAI = () => {
    if (!event) return
    onAskAI(`Tell me more about ${personName} in ${event.year} when they were ${event.age} years old.`)
    onClose()
  }

  // Calculate userAge here, but handle the case where event is null
  const userAge = event && birthYear && event.year >= birthYear ? event.year - birthYear : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        {event ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="text-teal-500" size={18} />
                <span>{event.year}</span>
                {userAge !== null && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                    You: {userAge > 0 ? `${userAge} years old` : "Not born yet"}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Event Details</h3>
                  <p className="text-gray-700">{event.event}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Historical Context</h3>
                  <p className="text-gray-700">
                    At age {event.age}, {personName} experienced this milestone in their life journey.
                    {userAge !== null
                      ? ` This happened when you were ${userAge > 0 ? `${userAge} years old` : "not yet born"}.`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* The Ask AI button is now in a sticky footer and has a ref */}
            <div className="pt-4 sticky bottom-0 bg-white">
              <Button
                ref={btnRef}
                onClick={handleAskAI}
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                Ask AI About This Event
              </Button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-gray-500">No event selected</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
