"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { User, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"

export function UserMenu() {
  const { user } = useAuth()

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <Link href="/profile">
          <Button variant="outline" className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50">
            <User size={18} />
            Profile
          </Button>
        </Link>
      ) : (
        <>
          <Link href="/login">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <LogIn size={18} />
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white">
              <UserPlus size={18} />
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}
