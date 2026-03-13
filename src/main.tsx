import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"

// No theme setup needed — Framer sets data-framer-theme="dark"|"light"
// on document.body automatically. Our CSS [data-framer-theme="dark"] selector
// picks it up with zero JS required.

const root = document.getElementById("root")
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
