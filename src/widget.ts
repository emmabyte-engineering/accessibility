import { icons } from './icons';
import { globalStyles, widgetStyles, GLOBAL_STYLE_ID } from './styles';
import {
  type AccessibilityPreferences,
  type AccessibilityWidgetOptions,
  STORAGE_KEYS,
  CSS_CLASSES,
  DEFAULT_PREFERENCES,
} from './types';

export type { AccessibilityWidgetOptions };

type ToggleKey = keyof Omit<AccessibilityPreferences, 'fontSize'>;

export class AccessibilityWidget extends HTMLElement {
  private _root: ShadowRoot;
  private _prefs: AccessibilityPreferences = { ...DEFAULT_PREFERENCES };
  private _open = false;
  private _storagePrefix = 'a11y';
  private _minSize = 75;
  private _maxSize = 150;
  private _sizeStep = 10;
  private _accent = '#b93a54';

  static get observedAttributes(): string[] {
    return ['position', 'accent-color', 'storage-prefix'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
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

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this._handleKeydown);
  }

  /** Read the current preferences (read-only copy). */
  get preferences(): Readonly<AccessibilityPreferences> {
    return { ...this._prefs };
  }

  private _handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this._open) {
      this._open = false;
      this._render();
    }
  };

  private _injectGlobalStyles(): void {
    if (document.getElementById(GLOBAL_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = GLOBAL_STYLE_ID;
    style.textContent = globalStyles;
    document.head.appendChild(style);
  }

  private _loadPreferences(): void {
    const load = (key: string, fallback: string): string =>
      localStorage.getItem(`${this._storagePrefix}-${key}`) ?? fallback;

    this._prefs = {
      fontSize: parseInt(load(STORAGE_KEYS.fontSize, '100')),
      highContrast: load(STORAGE_KEYS.highContrast, 'false') === 'true',
      reducedMotion: load(STORAGE_KEYS.reducedMotion, 'false') === 'true',
      dyslexiaFont: load(STORAGE_KEYS.dyslexiaFont, 'false') === 'true',
      largeSpacing: load(STORAGE_KEYS.largeSpacing, 'false') === 'true',
    };
  }

  private _savePreference(key: string, value: string): void {
    localStorage.setItem(`${this._storagePrefix}-${key}`, value);
  }

  private _applyPreferences(): void {
    const html = document.documentElement;

    html.style.fontSize = `${this._prefs.fontSize}%`;

    html.classList.toggle(CSS_CLASSES.highContrast, this._prefs.highContrast);
    html.classList.toggle(CSS_CLASSES.reducedMotion, this._prefs.reducedMotion);
    html.classList.toggle(CSS_CLASSES.dyslexiaFont, this._prefs.dyslexiaFont);
    html.classList.toggle(CSS_CLASSES.largeSpacing, this._prefs.largeSpacing);

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
      this._prefs.fontSize !== DEFAULT_PREFERENCES.fontSize ||
      this._prefs.highContrast !== DEFAULT_PREFERENCES.highContrast ||
      this._prefs.reducedMotion !== DEFAULT_PREFERENCES.reducedMotion ||
      this._prefs.dyslexiaFont !== DEFAULT_PREFERENCES.dyslexiaFont ||
      this._prefs.largeSpacing !== DEFAULT_PREFERENCES.largeSpacing
    );
  }

  private _adjustFontSize(delta: number): void {
    this._prefs.fontSize = Math.min(
      this._maxSize,
      Math.max(this._minSize, this._prefs.fontSize + delta)
    );
    this._savePreference(STORAGE_KEYS.fontSize, String(this._prefs.fontSize));
    this._applyPreferences();
    this._render();
  }

  private _toggle(key: ToggleKey): void {
    this._prefs[key] = !this._prefs[key];
    const storageKey = STORAGE_KEYS[key];
    this._savePreference(storageKey, String(this._prefs[key]));
    this._applyPreferences();
    this._render();
  }

  private _resetAll(): void {
    this._prefs = { ...DEFAULT_PREFERENCES };
    Object.values(STORAGE_KEYS).forEach((key) =>
      localStorage.removeItem(`${this._storagePrefix}-${key}`)
    );
    this._applyPreferences();
    this._render();
  }

  private _togglePanel(): void {
    this._open = !this._open;
    this._render();
  }

  private _createToggleRow(label: string, key: ToggleKey): string {
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

  private _render(): void {
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

    this._root.querySelector('[data-action="toggle"]')?.addEventListener('click', () => this._togglePanel());
    this._root.querySelector('[data-action="reset"]')?.addEventListener('click', () => this._resetAll());
    this._root.querySelector('[data-action="size-down"]')?.addEventListener('click', () => this._adjustFontSize(-this._sizeStep));
    this._root.querySelector('[data-action="size-up"]')?.addEventListener('click', () => this._adjustFontSize(this._sizeStep));

    this._root.querySelectorAll<HTMLButtonElement>('.toggle-row').forEach((btn) => {
      const key = btn.dataset.key as ToggleKey;
      btn.addEventListener('click', () => this._toggle(key));
    });
  }
}
