import { useState, useEffect } from "react"
import type { Theme } from "../../types"
import { getThemeStorage, setThemeStorage } from "../../lib/framerApi"

/**
 * Logic hook for the Theme feature.
 * Manages state, system preference detection, and Framer storage sync.
 * Zero JSX allowed here.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light")

  // On mount: Check Framer storage first, then fall back to system preference
  useEffect(() => {
    const loadInitialTheme = async () => {
      const saved = await getThemeStorage()
      if (saved) {
        setTheme(saved)
      } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        setTheme("dark")
      }
    }
    loadInitialTheme()
  }, [])

  // Side effect: Update the DOM attribute whenever the theme state changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  /**
   * Toggles between light and dark and persists the choice
   */
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    await setThemeStorage(newTheme)
  }

  return { theme, toggleTheme }
}