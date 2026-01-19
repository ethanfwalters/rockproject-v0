"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Moon, Sun, User, LogOut, ChevronDown, LayoutGrid, Search, X } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { fetchMinerals } from "@/features/shared/application/client/mineralsCrud"
import type { Mineral } from "@/types/mineral"
import {
  Button
} from "@/features/shared/presentation/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/features/shared/presentation/dropdown-menu";
import { Input } from "@/features/shared/presentation/input";

export function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Mineral[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [allMinerals, setAllMinerals] = useState<Mineral[]>([])
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check system preference and localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light")
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
      setIsLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Load all minerals on mount
  useEffect(() => {
    fetchMinerals()
      .then(setAllMinerals)
      .catch(console.error)
  }, [])

  // Filter minerals based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      const filtered = allMinerals.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 10))
      setIsSearching(false)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, allMinerals])

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus mobile input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [isMobileSearchOpen])

  const handleMineralSelect = useCallback((mineral: Mineral) => {
    setSearchQuery("")
    setIsSearchOpen(false)
    router.push(`/mineral/${mineral.id}`)
  }, [router])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
      <nav
          className={`sticky top-0 z-50 transition-all duration-300 ${
              isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
          }`}
      >
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <a href={userEmail ? "/" : "/"} className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 text-primary-foreground"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight hidden sm:inline">Terralis</span>
            </a>

            {/* Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search minerals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className="pl-9 pr-9 h-10 bg-muted/50 border-0 focus-visible:ring-1"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSearchResults([])
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-auto rounded-xl border bg-popover shadow-lg z-50">
                  {isSearching ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No minerals found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((mineral) => (
                        <button
                          key={mineral.id}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors"
                          onClick={() => handleMineralSelect(mineral)}
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {mineral.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{mineral.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(true)}
                className="h-10 w-10 rounded-full hover:bg-accent sm:hidden"
              >
                <Search className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Collection Icon (authenticated users) */}
              {!isLoading && userEmail && (
                  <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent">
                    <Link href="/collection">
                      <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">Collection</span>
                    </Link>
                  </Button>
              )}

              {/* Theme Toggle */}
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="relative h-10 w-10 rounded-full hover:bg-accent"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {!isLoading &&
                  (userEmail ? (
                      /* Authenticated: Profile Dropdown */
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                              variant="ghost"
                              className="flex items-center gap-2 rounded-full pl-1.5 pr-3 hover:bg-accent"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">{getInitials(userEmail)}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                          <div className="px-2 py-2">
                            <p className="text-sm font-medium">{userEmail}</p>
                            <p className="text-xs text-muted-foreground">Collector</p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push("/collection")} className="rounded-lg cursor-pointer">
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Collection
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-lg cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                              onClick={handleLogout}
                              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  ) : (
                      /* Not authenticated: Login/Signup buttons */
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost">
                          <Link href="/auth/login">Log in</Link>
                        </Button>
                        <Button asChild>
                          <Link href="/auth/sign-up">Get Started</Link>
                        </Button>
                      </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div
            ref={mobileSearchRef}
            className="absolute inset-x-0 top-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 sm:hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={mobileInputRef}
                type="text"
                placeholder="Search minerals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className="pl-9 pr-9 h-10"
              />
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false)
                  setSearchQuery("")
                  setSearchResults([])
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Search Results */}
            {searchQuery.trim() && (
              <div className="mt-2 max-h-[60vh] overflow-auto rounded-xl border bg-popover">
                {isSearching ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No minerals found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-1">
                    {searchResults.map((mineral) => (
                      <button
                        key={mineral.id}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors"
                        onClick={() => {
                          setIsMobileSearchOpen(false)
                          handleMineralSelect(mineral)
                        }}
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {mineral.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{mineral.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
  )
}
