"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TimeTravelEffectsProps {
  timelineData: Array<{ year: number; age: number; event: string }>
  currentYear: number | null
}

export function TimeTravelEffects({ timelineData, currentYear }: TimeTravelEffectsProps) {
  const [showPortal, setShowPortal] = useState(false)
  const [visibleArtifacts, setVisibleArtifacts] = useState<number[]>([])
  const [yearIndicator, setYearIndicator] = useState<number | null>(null)
  const lastScrollTop = useRef(0)
  const scrollDirection = useRef<"up" | "down">("down")

  // Artifacts for different time periods (without emojis)
  const artifacts = [
    { id: 1, era: "ancient", icon: "", position: { top: "20%", left: "10%" } },
    { id: 2, era: "medieval", icon: "", position: { top: "40%", left: "85%" } },
    { id: 3, era: "renaissance", icon: "", position: { top: "70%", left: "15%" } },
    { id: 4, era: "industrial", icon: "", position: { top: "30%", left: "75%" } },
    { id: 5, era: "modern", icon: "", position: { top: "60%", left: "90%" } },
    { id: 6, era: "future", icon: "", position: { top: "80%", left: "5%" } },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100

      // Determine scroll direction
      if (scrollTop > lastScrollTop.current) {
        scrollDirection.current = "down"
      } else {
        scrollDirection.current = "up"
      }
      lastScrollTop.current = scrollTop

      // Show time portal effect on rapid scrolling
      if (Math.abs(scrollTop - lastScrollTop.current) > 50) {
        setShowPortal(true)
        setTimeout(() => setShowPortal(false), 1000)
      }

      // Show artifacts based on scroll position
      const newVisibleArtifacts = []
      for (let i = 0; i < artifacts.length; i++) {
        if (scrollPercentage > i * 15 && scrollPercentage < (i + 1) * 15 + 10) {
          newVisibleArtifacts.push(artifacts[i].id)
        }
      }
      setVisibleArtifacts(newVisibleArtifacts)

      // Update year indicator based on visible timeline events
      if (timelineData.length > 0) {
        const timelineElements = document.querySelectorAll(".timeline-event")
        let closestElement = null
        let closestDistance = Number.POSITIVE_INFINITY

        timelineElements.forEach((element) => {
          const rect = element.getBoundingClientRect()
          const distance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2)

          if (distance < closestDistance) {
            closestDistance = distance
            closestElement = element
          }
        })

        if (closestElement) {
          const index = Array.from(timelineElements).indexOf(closestElement)
          if (index >= 0 && index < timelineData.length) {
            setYearIndicator(timelineData[index].year)
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [timelineData])

  return (
    <>
      {/* Time portal effect */}
      <div className={`time-portal ${showPortal ? "active" : ""}`}>
        <div className="time-portal-inner"></div>
      </div>

      {/* Era artifacts */}
      {artifacts.map((artifact) => (
        <div
          key={artifact.id}
          className={`era-artifact ${visibleArtifacts.includes(artifact.id) ? "visible" : ""}`}
          style={{
            top: artifact.position.top,
            left: artifact.position.left,
            fontSize: "2rem",
          }}
        >
          {artifact.icon}
        </div>
      ))}

      {/* Clock animation removed */}
      <></>

      {/* Year indicator */}
      <AnimatePresence>
        {yearIndicator && (
          <motion.div
            key={yearIndicator}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="timeline-year-indicator"
          >
            {yearIndicator}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
