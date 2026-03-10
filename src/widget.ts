import { icons } from './icons';
import { globalStyles, widgetStyles, GLOBAL_STYLE_ID } from './styles';

export interface AccessibilityWidgetOptions {
  /** Position of the widget. Default: 'bottom-right' */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Accent color for active toggles. Default: '#b93a54' */
  accentColor?: string;
  /** localStorage key prefix. Default: 'a11y' */
  storagePrefix?: string;
  /** Minimum font size percentage. Default: 75 */
  minFontSize?: number;
  /** Maximum font size percentage. Default: 150 */
  maxFontSize?: number;
  /** Font size step. Default: 10 */
  fontSizeStep?: number;
}

interface Preferences {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  largeSpacing: boolean;
}

const DEFAULTS: Preferences = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
  largeSpacing: false,
};

export class AccessibilityWidget extends HTMLElement {
  private _root: ShadowRoot;
  private _prefs: Preferences = { ...DEFAULTS };
  private _open = false;
  private _storagePrefix: string;
  private _minSize: number;
  private _maxSize: number;
  private _sizeStep: number;
  private _accent: string;

  static get observedAttributes() {
    return ['position', 'accent-color', 'storage-prefix'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._storagePrefix = 'a11y';
    this._minSize = 75;
    this._maxSize = 150;
    this._sizeStep = 10;
    this._accent = '#b93a54';
  }

  connectedCallback() {
    this._storagePrefix = this.getAttribute('storage-prefix') ?? 'a11y';
    this._accent = this.getAttribute('accent-color') ?? '#b93a54';
    this._minSize = parseInt(this.getAttribute('min-font-size') ?? '75');
    this._maxSize = parseInt(this.getAttribute('max-font-size') ?? '150');
    this._sizeStep = parseInt(this.getAttribute('font-size-step') ?? '10');

    this._injectGlobalStyles();
    this._loadPreferences();
    this._applyPreferences();
    this._render();

    document.addEventListener('keydown', this._handleKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
  }

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._open) {
      this._open = false;
      this._render();
    }
  };

  private _injectGlobalStyles() {
    if (document.getElementById(GLOBAL_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = GLOBAL_STYLE_ID;
    style.textContent = globalStyles;
    document.head.appendChild(style);
  }

  private _loadPreferences() {
    const load = (key: string, fallback: string): string =>
      localStorage.getItem(`${this._storagePrefix}-${key}`) ?? fallback;

    this._prefs = {
      fontSize: parseInt(load('font-size', '100')),
      highContrast: load('high-contrast', 'false') === 'true',
      reducedMotion: load('reduced-motion', 'false') === 'true',
      dyslexiaFont: load('dyslexia-font', 'false') === 'true',
      largeSpacing: load('large-spacing', 'false') === 'true',
    };
  }

  private _savePreference(key: string, value: string) {
    localStorage.setItem(`${this._storagePrefix}-${key}`, value);
  }

  private _applyPreferences() {
    const html = document.documentElement;

    html.style.fontSize = `${this._prefs.fontSize}%`;

    const toggle = (cls: string, on: boolean) => {
      html.classList.toggle(cls, on);
    };

    toggle('a11y-high-contrast', this._prefs.highContrast);
    toggle('a11y-reduced-motion', this._prefs.reducedMotion);
    toggle('a11y-dyslexia-font', this._prefs.dyslexiaFont);
    toggle('a11y-large-spacing', this._prefs.largeSpacing);

    this.dispatchEvent(
      new CustomEvent('a11y-change', {
        detail: { ...this._prefs },
        bubbles: true,
        composed: true,
      })
    );
  }

  private get _hasCustomizations(): boolean {
    return (
      this._prefs.fontSize !== 100 ||
      this._prefs.highContrast ||
      this._prefs.reducedMotion ||
      this._prefs.dyslexiaFont ||
      this._prefs.largeSpacing
    );
  }

  private _adjustFontSize(delta: number) {
    this._prefs.fontSize = Math.min(this._maxSize, Math.max(this._minSize, this._prefs.fontSize + delta));
    this._savePreference('font-size', String(this._prefs.fontSize));
    this._applyPreferences();
    this._render();
  }

  private _toggle(key: keyof Omit<Preferences, 'fontSize'>) {
    this._prefs[key] = !this._prefs[key];
    const storageKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    this._savePreference(storageKey, String(this._prefs[key]));
    this._applyPreferences();
    this._render();
  }

  private _resetAll() {
    this._prefs = { ...DEFAULTS };
    ['font-size', 'high-contrast', 'reduced-motion', 'dyslexia-font', 'large-spacing'].forEach(
      (key) => localStorage.removeItem(`${this._storagePrefix}-${key}`)
    );
    this._applyPreferences();
    this._render();
  }

  private _togglePanel() {
    this._open = !this._open;
    this._render();
  }

  private _createToggleRow(label: string, key: keyof Omit<Preferences, 'fontSize'>): string {
    const on = this._prefs[key];
    return `
      <button class="toggle-row" role="switch" aria-checked="${on}" data-key="${key}">
        <span>${label}</span>
        <span class="toggle-track" data-on="${on}">
          <span class="toggle-thumb" data-on="${on}"></span>
        </span>
      </button>
    `;
  }

  private _render() {
    const accentStyle = `--a11y-accent: ${this._accent};`;

    this._root.innerHTML = `
      <style>${widgetStyles}\n:host { ${accentStyle} }</style>
      <button
        class="trigger"
        aria-label="${this._open ? 'Close accessibility options' : 'Open accessibility options'}"
        aria-expanded="${this._open}"
        aria-controls="a11y-panel"
        data-action="toggle"
      >
        ${this._open ? icons.close : icons.accessibility}
        ${this._hasCustomizations && !this._open ? '<span class="indicator"></span>' : ''}
      </button>
      ${
        this._open
          ? `
        <div id="a11y-panel" class="panel" role="dialog" aria-label="Accessibility preferences">
          <div class="panel-header">
            <span class="panel-title">Accessibility</span>
            ${
              this._hasCustomizations
                ? `<button class="reset-btn" data-action="reset" aria-label="Reset all accessibility preferences">
                    ${icons.reset} Reset
                  </button>`
                : ''
            }
          </div>
          <div class="controls">
            <div class="size-control">
              <span class="size-label">Text size</span>
              <div class="size-buttons">
                <button
                  class="size-btn"
                  data-action="size-down"
                  aria-label="Decrease text size"
                  ${this._prefs.fontSize <= this._minSize ? 'disabled' : ''}
                >${icons.minus}</button>
                <span class="size-value">${this._prefs.fontSize}%</span>
                <button
                  class="size-btn"
                  data-action="size-up"
                  aria-label="Increase text size"
                  ${this._prefs.fontSize >= this._maxSize ? 'disabled' : ''}
                >${icons.plus}</button>
              </div>
            </div>
            ${this._createToggleRow('High contrast', 'highContrast')}
            ${this._createToggleRow('Reduced motion', 'reducedMotion')}
            ${this._createToggleRow('Dyslexia-friendly font', 'dyslexiaFont')}
            ${this._createToggleRow('Large spacing', 'largeSpacing')}
          </div>
        </div>
      `
          : ''
      }
    `;

    // Bind events
    this._root.querySelector('[data-action="toggle"]')?.addEventListener('click', () => this._togglePanel());
    this._root.querySelector('[data-action="reset"]')?.addEventListener('click', () => this._resetAll());
    this._root.querySelector('[data-action="size-down"]')?.addEventListener('click', () => this._adjustFontSize(-this._sizeStep));
    this._root.querySelector('[data-action="size-up"]')?.addEventListener('click', () => this._adjustFontSize(this._sizeStep));

    this._root.querySelectorAll('.toggle-row').forEach((btn) => {
      const key = (btn as HTMLElement).dataset.key as keyof Omit<Preferences, 'fontSize'>;
      btn.addEventListener('click', () => this._toggle(key));
    });
  }
}
