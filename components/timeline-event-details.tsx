"use client"

import { useState } from "react"
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
  const [relatedEvents, setRelatedEvents] = useState<string[]>([
    "Political climate of the era",
    "Major scientific discoveries at the time",
    "Cultural movements during this period",
  ])

  if (!event) return null

  const userAge = birthYear && event.year >= birthYear ? event.year - birthYear : null

  const handleAskAI = () => {
    onAskAI(`Tell me more about ${personName} in ${event.year} when they were ${event.age} years old.`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
        <div className="py-4">
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

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Related Topics</h3>
              <ul className="space-y-1">
                {relatedEvents.map((item, index) => (
                  <li key={index} className="text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleAskAI}
              className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Ask AI About This Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
