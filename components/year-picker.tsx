"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YearPickerProps {
  value: number | null
  onChange: (year: number | null) => void
  minYear?: number
  maxYear?: number
  onClose?: () => void
}

export function YearPicker({
  value,
  onChange,
  minYear = 1930,
  maxYear = new Date().getFullYear(),
  onClose = () => {},
}: YearPickerProps) {
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null)
  const [decades, setDecades] = useState<number[]>([])
  const [yearsInDecade, setYearsInDecade] = useState<number[]>([])
  const [view, setView] = useState<"decades" | "years">("decades")

  // Initialize decades
  useEffect(() => {
    const startDecade = Math.floor(minYear / 10) * 10
    const endDecade = Math.floor(maxYear / 10) * 10
    const decadesList = []

    for (let decade = startDecade; decade <= endDecade; decade += 10) {
      decadesList.push(decade)
    }

    setDecades(decadesList)

    // If a value is already selected, show the appropriate decade
    if (value) {
      const valueDecade = Math.floor(value / 10) * 10
      setSelectedDecade(valueDecade)
      generateYearsForDecade(valueDecade)
      setView("years")
    }
  }, [minYear, maxYear, value])

  const generateYearsForDecade = (decade: number) => {
    const years = []
    const startYear = Math.max(decade, minYear)
    const endYear = Math.min(decade + 9, maxYear)

    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }

    setYearsInDecade(years)
  }

  const handleDecadeClick = (decade: number) => {
    setSelectedDecade(decade)
    generateYearsForDecade(decade)
    setView("years")
  }

  const handleYearClick = (year: number) => {
    onChange(year)
    onClose() // Close the dialog after selecting a year
  }

  const handleBackToDecades = () => {
    setView("decades")
  }

  return (
    <div className="w-full">
      {view === "decades" ? (
        <div className="space-y-4">
          <div className="text-center text-sm font-medium text-gray-500">Select Decade</div>
          <div className="grid grid-cols-3 gap-2">
            {decades.map((decade) => (
              <Button
                key={decade}
                variant={decade === selectedDecade ? "default" : "outline"}
                className={`h-12 ${decade === selectedDecade ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                onClick={() => handleDecadeClick(decade)}
              >
                {decade}s
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBackToDecades}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <div className="text-sm font-medium text-gray-500">{selectedDecade}s</div>
            <div className="w-16"></div> {/* Spacer for alignment */}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {yearsInDecade.map((year) => (
              <Button
                key={year}
                variant={year === value ? "default" : "outline"}
                className={`h-12 ${year === value ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
