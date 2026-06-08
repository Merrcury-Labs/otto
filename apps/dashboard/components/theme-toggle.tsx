"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "@phosphor-icons/react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-1.5 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 text-muted-foreground" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-1.5 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-sidebar-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-sidebar-foreground" />
      )}
    </button>
  )
}
