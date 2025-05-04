"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, User, Calendar, Send, X, MessageSquare, Loader2, Info, Cake } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDebounce } from "@/hooks/use-debounce"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { YearPicker } from "@/components/year-picker"
import { TimeTravelEffects } from "@/components/time-travel-effects"
import { TimelineEventDetails } from "@/components/timeline-event-details"
import { useAuth } from "@/contexts/auth-context"
import { saveSearchHistory, updateBirthYear, saveTimelineData, getTimelineData } from "@/services/user-service"
import { UserMenu } from "@/components/user-menu"

// Timeline event type
type TimelineEvent = {
  year: number
  age: number
  event: string
}

export default function TimelinePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([])
  const [personName, setPersonName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState("")
  const [suggestion, setSuggestion] = useState("")

  // Interactive timeline state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [birthYear, setBirthYear] = useState<number | null>(null)
  const [personalEvents, setPersonalEvents] = useState<TimelineEvent[]>([])
  const timelineRef = useRef<HTMLDivElement>(null)
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  // Search suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isSearching, setIsSearching] = useState(false) // Track if search is in progress
  const [disableSuggestions, setDisableSuggestions] = useState(false) // New state to completely disable suggestions

  // AI Q&A state
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const [aiAnswer, setAiAnswer] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const aiAnswerRef = useRef<HTMLDivElement>(null)

  // Dialog state
  const [birthYearDialogOpen, setBirthYearDialogOpen] = useState(false)

  // Event details state
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)

  // Add this with the other useState declarations
  const { user } = useAuth()

  // Auto-scroll to the bottom of the answer as it streams in
  useEffect(() => {
    if (aiAnswerRef.current) {
      aiAnswerRef.current.scrollTop = aiAnswerRef.current.scrollHeight
    }
  }, [aiAnswer])

  // Fetch suggestions when search query changes
  useEffect(() => {
    // Don't fetch suggestions if we're in the middle of a search or if suggestions are disabled
    if (isSearching || disableSuggestions) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsFetchingSuggestions(true)

      try {
        const response = await fetch("/api/suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: debouncedSearchQuery }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch suggestions")
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(data.suggestions && data.suggestions.length > 0)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsFetchingSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearchQuery, isSearching, disableSuggestions])

  // Disable suggestions when timeline data is loaded
  useEffect(() => {
    if (timelineData.length > 0) {
      setSuggestions([]) // Clear any existing suggestions
      setShowSuggestions(false) // Hide suggestions dropdown
      setDisableSuggestions(true) // Disable suggestions when timeline is shown
    } else {
      setDisableSuggestions(false) // Re-enable suggestions when timeline is cleared
    }
  }, [timelineData])

  // Clear suggestions cache on component mount and when search is cleared
  useEffect(() => {
    // This will run on component mount and whenever disableSuggestions changes to false
    if (!disableSuggestions) {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [disableSuggestions])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Generate personal events when birth year changes
  useEffect(() => {
    if (birthYear && timelineData.length > 0) {
      generatePersonalEvents()
    } else {
      setPersonalEvents([])
    }
  }, [birthYear, timelineData])

  const generatePersonalEvents = () => {
    if (!birthYear || timelineData.length === 0) return

    const currentYear = new Date().getFullYear()
    const userAge = currentYear - birthYear

    // Filter events that happened during the user's lifetime
    const eventsInLifetime = timelineData.filter((event) => event.year >= birthYear)

    // Create personal events
    const personalTimelineEvents = eventsInLifetime.map((event) => {
      const userAgeAtEvent = event.year - birthYear
      return {
        ...event,
        userAge: userAgeAtEvent,
        personal: true,
      }
    })

    setPersonalEvents(personalTimelineEvents)
  }

  const handleSearch = async (nameToSearch = searchQuery) => {
    if (!nameToSearch.trim()) return

    setIsSearching(true) // Set searching flag to prevent suggestion updates
    setIsLoading(true)
    setNotFound(false)
    setShowAiPanel(false)
    setAiAnswer("")
    setError("")
    setSuggestion("")
    setTimelineData([])
    setShowSuggestions(false) // Hide suggestions immediately
    setPersonalEvents([])
    setDisableSuggestions(true) // Disable suggestions during search

    try {
      // Check if we have cached timeline data for this person
      let timelineEvents = null
      if (user) {
        timelineEvents = await getTimelineData(user.uid, nameToSearch)
      }

      // If no cached data, fetch from API
      if (!timelineEvents) {
        const response = await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: nameToSearch }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch timeline data")
        }

        const data = await response.json()

        if (data.error) {
          setError(data.error)
          if (data.suggestion) {
            setSuggestion(data.suggestion)
          }
          setNotFound(true)
          setDisableSuggestions(false) // Re-enable suggestions if no timeline is found
        } else if (data.events && data.events.length > 0) {
          setTimelineData(data.events)
          setPersonName(nameToSearch)

          // Save timeline data to Firestore if user is logged in
          if (user) {
            saveTimelineData(user.uid, nameToSearch, data.events)
            saveSearchHistory(user.uid, nameToSearch)
          }

          // If birth year is set, generate personal events
          if (birthYear) {
            generatePersonalEvents()
          }

          // Keep suggestions disabled when timeline is shown
          setDisableSuggestions(true)
        } else {
          setNotFound(true)
          setDisableSuggestions(false) // Re-enable suggestions if no timeline is found
        }
      } else {
        // Use cached timeline data
        setTimelineData(timelineEvents)
        setPersonName(nameToSearch)

        // Save search history
        if (user) {
          saveSearchHistory(user.uid, nameToSearch)
        }

        // If birth year is set, generate personal events
        if (birthYear) {
          generatePersonalEvents()
        }
      }
    } catch (err) {
      console.error("Error fetching timeline:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching the timeline. Please try again.")
      setNotFound(true)
      setDisableSuggestions(false) // Re-enable suggestions on error
    } finally {
      setIsLoading(false)
      setIsSearching(false) // Reset searching flag
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion) // Update the search query with the selected suggestion
    setSuggestions([]) // Clear suggestions immediately
    setShowSuggestions(false) // Hide the suggestions dropdown
    setDisableSuggestions(true) // Disable suggestions after selection
    handleSearch(suggestion) // Perform the search with the selected suggestion
  }

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!aiQuery.trim()) return

    setIsAiLoading(true)
    setAiAnswer("")

    try {
      // Enhance the query with context about the person
      const enhancedQuery = `Question about ${personName}: ${aiQuery}`

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: enhancedQuery }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      // Set up the stream reader
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and append to the answer
        const chunk = decoder.decode(value, { stream: true })
        setAiAnswer((prev) => prev + chunk)
      }
    } catch (error) {
      console.error("Error:", error)
      setAiAnswer("Sorry, there was an error processing your request.")
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleSetBirthYear = async (year: number | null) => {
    setBirthYear(year)
    if (year !== null) {
      // Close the dialog when a year is selected
      setBirthYearDialogOpen(false)

      // Save birth year to user profile if logged in
      if (user) {
        try {
          await updateBirthYear(user.uid, year)
        } catch (error) {
          console.error("Error updating birth year:", error)
        }
      }
    }
    if (year && timelineData.length > 0) {
      generatePersonalEvents()
    }
  }

  // Calculate scale for timeline items based on zoom level
  const getTimelineItemStyle = () => {
    return {
      transform: `scale(${zoomLevel})`,
      transformOrigin: "center",
      transition: "transform 0.3s ease",
    }
  }

  // Get timeline spacing based on zoom level
  const getTimelineSpacing = () => {
    const baseSpacing = 8 // rem
    return `${baseSpacing * zoomLevel}rem`
  }

  const handleCardClick = (event: TimelineEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
    setCurrentYear(event.year)
  }

  // Handle AI query from event details
  const handleAskAI = (question: string) => {
    setAiQuery(question)
    setShowAiPanel(true)

    // Use setTimeout to ensure the state is updated before submitting
    setTimeout(() => {
      handleAiQuery(new Event("submit") as any)
    }, 100)
  }

  // Add a new ref for scroll animation
  const scrollRef = useRef<HTMLDivElement>(null)

  // Add useEffect for scroll animation
  useEffect(() => {
    if (!scrollRef.current) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const elements = document.querySelectorAll(".timeline-event")

      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0

        if (isVisible) {
          element.classList.add("animate-timeline-event")
          // Add a slight delay based on the element's position
          ;(element as HTMLElement).style.animationDelay = `${index * 0.05}s`

          // Update current year for time travel effects
          if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
            const eventIndex = Number.parseInt((element as HTMLElement).dataset.index || "0", 10)
            if (timelineData[eventIndex]) {
              setCurrentYear(timelineData[eventIndex].year)
            }
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    // Trigger once on load
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [timelineData])

  // Handle clearing the search
  const handleClearSearch = () => {
    setSearchQuery("")
    setTimelineData([])
    setPersonName("")
    setNotFound(false)
    setError("")
    setSuggestion("")
    setSuggestions([]) // Clear any existing suggestions
    setShowSuggestions(false) // Hide suggestions dropdown
    setDisableSuggestions(false) // Re-enable suggestions when search is cleared

    // Force clear the suggestions cache by resetting the search input
    if (searchInputRef.current) {
      searchInputRef.current.value = ""
    }
  }

  // Clear suggestions when search query is empty
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  return (
    <div ref={scrollRef} className="min-h-screen bg-gradient-to-b from-teal-50 to-purple-50 p-4 md:p-8">
      {timelineData.length > 0 && !isLoading && (
        <TimeTravelEffects timelineData={timelineData} currentYear={currentYear} />
      )}

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-700 mb-4">Orbit</h1>
          <div className="mb-6">
            <p className="text-purple-700">Discover the age-based timeline of notable individuals</p>
            <p className="text-gray-600 text-sm mt-1">
              Add your birth year to discover timeline between your life and historical figures
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <UserMenu />
          </div>

          <Alert className="bg-blue-50 border-blue-200 mb-6 max-w-xl mx-auto">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              This app uses AI to generate timelines based on its training data. The AI model has a knowledge cutoff
              date and cannot access real-time web information. Recent events may not be included.
            </AlertDescription>
          </Alert>

          {/* Birth Year Selector above search bar */}
          <div className="max-w-xl mx-auto mb-4">
            <Dialog open={birthYearDialogOpen} onOpenChange={setBirthYearDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50 mx-auto"
                >
                  <Cake size={18} />
                  {birthYear ? `Born in ${birthYear}` : "Add Your Birth Year"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Enter Your Birth Year</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-500 mb-4">See how historical events relate to your own timeline.</p>
                  <div className="space-y-4">
                    <YearPicker
                      value={birthYear}
                      onChange={handleSetBirthYear}
                      minYear={1930}
                      maxYear={new Date().getFullYear()}
                      onClose={() => setBirthYearDialogOpen(false)}
                    />

                    <Button onClick={() => handleSetBirthYear(null)} variant="outline" className="w-full mt-4">
                      Clear Birth Year
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for any person (e.g., Elon Musk)"
                className="pl-10 pr-4 py-6 rounded-lg border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  // If we have timeline data and user starts typing again, clear the timeline
                  if (timelineData.length > 0) {
                    handleClearSearch()
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  } else if (e.key === "ArrowDown" && showSuggestions && suggestions.length > 0) {
                    const firstSuggestion = document.querySelector("[data-suggestion]") as HTMLElement
                    if (firstSuggestion) firstSuggestion.focus()
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false)
                  }
                }}
                onFocus={() => {
                  // Never show suggestions on just a focus event
                  // They will only appear when typing (handled by the useEffect with debouncedSearchQuery)
                  setShowSuggestions(false)
                }}
              />
              {isFetchingSuggestions && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}

              {/* Suggestions dropdown - only show if not disabled */}
              {showSuggestions && suggestions.length > 0 && !isSearching && !disableSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
                >
                  <ul className="py-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <button
                          data-suggestion
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSelectSuggestion(suggestion)
                            } else if (e.key === "ArrowDown") {
                              const nextSuggestion = e.currentTarget.nextElementSibling?.querySelector(
                                "[data-suggestion]",
                              ) as HTMLElement
                              if (nextSuggestion) nextSuggestion.focus()
                            } else if (e.key === "ArrowUp") {
                              const prevSuggestion = e.currentTarget.previousElementSibling?.querySelector(
                                "[data-suggestion]",
                              ) as HTMLElement
                              if (prevSuggestion) {
                                prevSuggestion.focus()
                              } else {
                                if (searchInputRef.current) searchInputRef.current.focus()
                              }
                            } else if (e.key === "Escape") {
                              setShowSuggestions(false)
                              if (searchInputRef.current) searchInputRef.current.focus()
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{suggestion}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSearch()}
              className="bg-teal-600 hover:bg-teal-700 text-white py-6 px-6"
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-2">Try any historical figure, scientist, artist, or leader</p>
        </header>

        {isLoading && (
          <div className="flex flex-col items-center justify-center my-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-teal-700">Generating timeline for {searchQuery}...</p>
            <p className="text-sm text-gray-500">This may take a moment as we gather information</p>
          </div>
        )}

        {error && (
          <Card className="my-8 bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {suggestion && (
          <Card className="my-8 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <p className="text-yellow-700 mb-3">
                Did you mean: <span className="font-semibold">{suggestion}</span>?
              </p>
              <Button
                variant="outline"
                className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                onClick={() => handleSearch(suggestion)}
              >
                Search for {suggestion}
              </Button>
            </CardContent>
          </Card>
        )}

        {notFound && !isLoading && !suggestion && (
          <Card className="my-8 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <User className="mx-auto text-gray-400 mb-2" size={40} />
              <h2 className="text-xl font-semibold text-gray-700">Person Not Found</h2>
              <p className="text-gray-500">
                We couldn't find enough information for "{searchQuery}". Please try another search.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Try searching for a well-known historical figure, like "Albert Einstein" or "Marie Curie".
              </p>
            </CardContent>
          </Card>
        )}

        {timelineData.length > 0 && !isLoading && (
          <div className="my-8">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold text-purple-700 capitalize">{personName}'s Life Timeline</h2>

              <div className="flex flex-wrap gap-2">
                {/* Birth Year Dialog - now also available in the timeline view */}
                <Dialog open={birthYearDialogOpen} onOpenChange={setBirthYearDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                    >
                      <Cake size={18} />
                      {birthYear ? `Born in ${birthYear}` : "Add Your Birth Year"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Enter Your Birth Year</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-500 mb-4">
                        See how {personName}'s life events relate to your own timeline.
                      </p>
                      <div className="space-y-4">
                        <YearPicker
                          value={birthYear}
                          onChange={handleSetBirthYear}
                          minYear={1930}
                          maxYear={new Date().getFullYear()}
                          onClose={() => setBirthYearDialogOpen(false)}
                        />

                        <Button onClick={() => handleSetBirthYear(null)} variant="outline" className="w-full mt-4">
                          Clear Birth Year
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  variant="outline"
                  className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <MessageSquare size={18} />
                  {showAiPanel ? "Hide AI Assistant" : "Ask AI Assistant"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline section */}
              <div
                ref={timelineRef}
                className={`relative ${showAiPanel ? "md:col-span-2" : "md:col-span-3"}`}
                style={{
                  overflowX: "auto",
                  paddingBottom: "2rem",
                }}
              >
                {/* Timeline line */}
                <div className="absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 h-full w-1 bg-teal-200 rounded-full"></div>

                {/* Timeline events */}
                <div className="space-y-16" style={{ marginBottom: getTimelineSpacing() }}>
                  {timelineData.map((item, index) => {
                    // Check if this event is in the user's lifetime
                    const isInUserLifetime = birthYear && item.year >= birthYear
                    const userAge = birthYear ? item.year - birthYear : null

                    return (
                      <motion.div
                        key={`timeline-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative"
                        style={getTimelineItemStyle()}
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 w-4 h-4 rounded-full z-10 ${
                            isInUserLifetime ? "bg-purple-500" : "bg-teal-500"
                          }`}
                        />

                        {/* Content card with proper positioning */}
                        <div
                          className={`flex flex-col sm:flex-row ${index % 2 === 0 ? "sm:flex-row-reverse" : ""} items-center`}
                        >
                          <Card
                            data-index={index}
                            className={`w-full sm:w-[calc(50%-4rem)] ${index % 2 === 0 ? "sm:mr-16" : "sm:ml-16"} ${
                              isInUserLifetime ? "bg-purple-50/90" : "bg-white/90"
                            } backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer timeline-event timeline-card`}
                            onClick={() => handleCardClick(item)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar
                                  className={isInUserLifetime ? "text-purple-500" : "text-teal-500"}
                                  size={16}
                                />
                                <span className={`font-bold ${isInUserLifetime ? "text-purple-700" : "text-teal-700"}`}>
                                  {item.year}
                                </span>
                                <span className={isInUserLifetime ? "text-purple-700" : "text-teal-700"}>
                                  Age: {item.age}
                                </span>

                                {/* Show user's age if birth year is set and event is in user's lifetime */}
                                {isInUserLifetime && userAge !== null && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                                    You: {userAge > 0 ? `${userAge} years old` : "Not born yet"}
                                  </span>
                                )}
                              </div>
                              <p className={isInUserLifetime ? "text-purple-900" : "text-gray-700"}>{item.event}</p>
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* AI Assistant Panel */}
              <AnimatePresence>
                {showAiPanel && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    className="md:col-span-1"
                  >
                    <Card className="sticky top-4 bg-white/95 backdrop-blur-sm shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                            <MessageSquare size={18} />
                            AI Assistant
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAiPanel(false)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <X size={16} />
                            <span className="sr-only">Close</span>
                          </Button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          Ask questions about {personName} and get AI-powered answers.
                        </p>

                        <form onSubmit={handleAiQuery} className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Ask about ${personName}...`}
                              value={aiQuery}
                              onChange={(e) => setAiQuery(e.target.value)}
                              className="text-sm"
                            />
                            <Button
                              type="submit"
                              size="sm"
                              disabled={isAiLoading || !aiQuery.trim()}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {isAiLoading ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              ) : (
                                <Send size={14} />
                              )}
                            </Button>
                          </div>

                          {aiAnswer && (
                            <div
                              ref={aiAnswerRef}
                              className="bg-purple-50 rounded-md p-3 text-sm text-gray-700 max-h-[300px] overflow-y-auto"
                            >
                              {aiAnswer}
                            </div>
                          )}
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Use the TimelineEventDetails component */}
        <TimelineEventDetails
          event={selectedEvent}
          personName={personName}
          birthYear={birthYear}
          isOpen={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          onAskAI={handleAskAI}
        />
      </div>
    </div>
  )
}
