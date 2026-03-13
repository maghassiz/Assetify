import type { Theme } from "../../types"

interface Props {
  theme: Theme
  onToggle: () => void
}

/**
 * ThemeToggle UI Component.
 * Purely functional JSX. Zero logic or API calls.
 */
export function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  )
}