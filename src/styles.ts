// Global styles injected into the document head for accessibility modes.
// These must live outside Shadow DOM to affect the full page.

export const GLOBAL_STYLE_ID = 'emmabyteeng-a11y-global';

export const globalStyles = `
/* @emmabyteeng/accessibility — global modes */

/* Reduced motion */
.a11y-reduced-motion,
.a11y-reduced-motion * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}

/* High contrast — light mode */
.a11y-high-contrast {
  --a11y-fg: #000;
  --a11y-muted: #333;
  --a11y-border: #555;
}
/* High contrast — dark mode */
@media (prefers-color-scheme: dark) {
  .a11y-high-contrast {
    --a11y-fg: #fff;
    --a11y-muted: #ccc;
    --a11y-border: #aaa;
  }
}
.a11y-high-contrast .dark {
  --a11y-fg: #fff;
  --a11y-muted: #ccc;
  --a11y-border: #aaa;
}

/* Dyslexia-friendly font — OpenDyslexic */
@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
.a11y-dyslexia-font,
.a11y-dyslexia-font * {
  font-family: 'OpenDyslexic', sans-serif !important;
}

/* Large spacing */
.a11y-large-spacing {
  letter-spacing: 0.05em;
  word-spacing: 0.1em;
  line-height: 1.8;
}
.a11y-large-spacing p,
.a11y-large-spacing li,
.a11y-large-spacing span,
.a11y-large-spacing td,
.a11y-large-spacing label {
  line-height: 2;
}
`;

// Shadow DOM styles for the widget itself
export const widgetStyles = `
:host {
  --a11y-accent: #b93a54;
  --a11y-bg: #fff;
  --a11y-fg: #111;
  --a11y-muted: #6b7280;
  --a11y-border: #e5e7eb;
  --a11y-hover: #f3f4f6;
  --a11y-toggle-off: #d1d5db;

  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--a11y-fg);
}

@media (prefers-color-scheme: dark) {
  :host {
    --a11y-bg: #1a1a1a;
    --a11y-fg: #e5e5e5;
    --a11y-muted: #9ca3af;
    --a11y-border: #333;
    --a11y-hover: #262626;
    --a11y-toggle-off: #444;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #111;
  color: #fff;
}

@media (prefers-color-scheme: dark) {
  .trigger {
    background: #fff;
    color: #111;
  }
}

.trigger:hover {
  transform: scale(1.05);
}

.trigger:focus-visible {
  outline: 2px solid var(--a11y-accent);
  outline-offset: 2px;
}

.indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--a11y-accent);
  border: 2px solid var(--a11y-bg);
}

.panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 288px;
  border-radius: 12px;
  border: 1px solid var(--a11y-border);
  background: var(--a11y-bg);
  padding: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--a11y-fg);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--a11y-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.reset-btn:hover {
  color: var(--a11y-fg);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Text size control */
.size-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
}

.size-label {
  font-size: 14px;
  color: var(--a11y-fg);
}

.size-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--a11y-border);
  background: none;
  color: var(--a11y-fg);
  cursor: pointer;
  transition: background 0.15s ease;
}

.size-btn:hover:not(:disabled) {
  background: var(--a11y-hover);
}

.size-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.size-btn:focus-visible {
  outline: 2px solid var(--a11y-accent);
  outline-offset: 1px;
}

.size-value {
  width: 40px;
  text-align: center;
  font-size: 12px;
  color: var(--a11y-muted);
}

/* Toggle row */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 4px;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--a11y-fg);
  text-align: left;
  transition: background 0.15s ease;
}

.toggle-row:hover {
  background: var(--a11y-hover);
}

.toggle-row:focus-visible {
  outline: 2px solid var(--a11y-accent);
  outline-offset: 1px;
}

.toggle-track {
  display: flex;
  align-items: center;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  padding: 0 2px;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.toggle-track[data-on="true"] {
  background: var(--a11y-accent);
}

.toggle-track[data-on="false"] {
  background: var(--a11y-toggle-off);
}

.toggle-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s ease;
}

.toggle-thumb[data-on="true"] {
  transform: translateX(14px);
}

.toggle-thumb[data-on="false"] {
  transform: translateX(0);
}

/* Position variants */
:host([position="bottom-left"]) {
  right: auto;
  left: 24px;
}

:host([position="bottom-left"]) .panel {
  right: auto;
  left: 0;
}

:host([position="top-right"]) {
  bottom: auto;
  top: 24px;
}

:host([position="top-right"]) .panel {
  bottom: auto;
  top: 60px;
}

:host([position="top-left"]) {
  bottom: auto;
  top: 24px;
  right: auto;
  left: 24px;
}

:host([position="top-left"]) .panel {
  bottom: auto;
  top: 60px;
  right: auto;
  left: 0;
}
`;
