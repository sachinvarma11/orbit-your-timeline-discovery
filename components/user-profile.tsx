"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { YearPicker } from "@/components/year-picker"
import { getUserProfile, updateBirthYear, getSearchHistory } from "@/services/user-service"
import { Cake, History, LogOut, User } from "lucide-react"
import type { TimelineSearch } from "@/services/user-service"

export function UserProfile() {
  const { user, logout } = useAuth()
  const [birthYear, setBirthYear] = useState<number | null>(null)
  const [birthYearDialogOpen, setBirthYearDialogOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<TimelineSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Load user profile
      const profile = await getUserProfile(user.uid)
      if (profile && profile.birthYear) {
        setBirthYear(profile.birthYear)
      }

      // Load search history
      const history = await getSearchHistory(user.uid)
      setSearchHistory(history)
    } catch (error) {
      console.error("Error loading user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetBirthYear = async (year: number | null) => {
    setBirthYear(year)
    setBirthYearDialogOpen(false)

    if (user && year !== null) {
      try {
        await updateBirthYear(user.uid, year)
      } catch (error) {
        console.error("Error updating birth year:", error)
      }
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Your Profile</CardTitle>
        <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
          <LogOut size={16} />
          <span>Sign Out</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="bg-teal-100 p-3 rounded-full">
            <User className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-gray-500">{user.displayName ? user.displayName : "No display name set"}</p>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="font-medium mb-2">Birth Year</h3>
          <Dialog open={birthYearDialogOpen} onOpenChange={setBirthYearDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                <Cake size={18} />
                {birthYear ? `Born in ${birthYear}` : "Set Your Birth Year"}
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

        <div className="pt-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <History size={16} />
            Recent Searches
          </h3>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading history...</p>
            </div>
          ) : searchHistory.length > 0 ? (
            <ul className="space-y-2">
              {searchHistory.slice(0, 5).map((search, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <span>{search.personName}</span>
                  <span className="text-xs text-gray-500">{new Date(search.timestamp).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No search history yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
