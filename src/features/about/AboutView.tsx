import { PLUGIN_NAME, PLUGIN_VERSION, PLUGIN_LABEL } from "../../plugin.config"

export function AboutView() {
  return (
    <div className="about-view">

      {/* Logo + identity */}
      <div className="about-hero">
        <div className="about-logo">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--framer-color-tint)"/>
            <path d="M8 10h10M8 16h16M8 22h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="about-identity">
          <div className="about-name">{PLUGIN_NAME}</div>
          <div className="about-label">{PLUGIN_LABEL}</div>
        </div>
        <div className="about-version">v{PLUGIN_VERSION}</div>
      </div>

      <div className="about-divider" />

      <div className="about-section-title">Support</div>

      <div className="about-links">
        <a className="about-link" href="https://buymeacoffee.com/heyaghassi" target="_blank" rel="noreferrer">
          <span className="about-link-icon">☕</span>
          <div className="about-link-info">
            <div className="about-link-label">Buy me a coffee</div>
            <div className="about-link-sub">Support the development</div>
          </div>
          <svg className="about-link-arrow" width="13" height="13" viewBox="0 0 256 256" fill="currentColor">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
          </svg>
        </a>

        <a className="about-link" href="mailto:maghassiz@gmail.com?subject=Feedback%20%2F%20Feature%20Request%20-%20Assetify" target="_blank" rel="noreferrer">
          <span className="about-link-icon">💬</span>
          <div className="about-link-info">
            <div className="about-link-label">Feature request / Feedback</div>
            <div className="about-link-sub">Share ideas or report bugs</div>
          </div>
          <svg className="about-link-arrow" width="13" height="13" viewBox="0 0 256 256" fill="currentColor">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
          </svg>
        </a>

        <a className="about-link" href="https://YOUR_DOCS_LINK_HERE" target="_blank" rel="noreferrer">
          <span className="about-link-icon">📖</span>
          <div className="about-link-info">
            <div className="about-link-label">Documentation</div>
            <div className="about-link-sub">Learn how to use Assetify</div>
          </div>
          <svg className="about-link-arrow" width="13" height="13" viewBox="0 0 256 256" fill="currentColor">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
          </svg>
        </a>
      </div>

      <div className="about-divider" />

      <div className="about-footer">Built with ❤️ for the Framer community</div>

    </div>
  )
}
