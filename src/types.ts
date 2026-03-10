/** Position of the accessibility widget on the page. */
export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

/** User accessibility preferences stored in localStorage. */
export interface AccessibilityPreferences {
  /** Font size as a percentage (75–150). Default: 100 */
  fontSize: number;
  /** Whether high-contrast mode is enabled. Default: false */
  highContrast: boolean;
  /** Whether animations and transitions are suppressed. Default: false */
  reducedMotion: boolean;
  /** Whether OpenDyslexic font is active. Default: false */
  dyslexiaFont: boolean;
  /** Whether increased letter/word/line spacing is active. Default: false */
  largeSpacing: boolean;
}

/** Configuration options for the accessibility widget. */
export interface AccessibilityWidgetOptions {
  /** Position of the widget on the page. Default: `'bottom-right'` */
  position?: WidgetPosition;
  /** Accent color for active toggles (any valid CSS color). Default: `'#b93a54'` */
  accentColor?: string;
  /** Prefix for localStorage keys. Default: `'a11y'` */
  storagePrefix?: string;
  /** Minimum font size percentage. Default: `75` */
  minFontSize?: number;
  /** Maximum font size percentage. Default: `150` */
  maxFontSize?: number;
  /** Font size adjustment step in percentage points. Default: `10` */
  fontSizeStep?: number;
}

/** localStorage keys used by the widget (appended to the storage prefix). */
export const STORAGE_KEYS = {
  fontSize: 'font-size',
  highContrast: 'high-contrast',
  reducedMotion: 'reduced-motion',
  dyslexiaFont: 'dyslexia-font',
  largeSpacing: 'large-spacing',
} as const satisfies Record<keyof AccessibilityPreferences, string>;

/** CSS class names applied to `<html>` for each accessibility mode. */
export const CSS_CLASSES = {
  highContrast: 'a11y-high-contrast',
  reducedMotion: 'a11y-reduced-motion',
  dyslexiaFont: 'a11y-dyslexia-font',
  largeSpacing: 'a11y-large-spacing',
} as const;

/** Default preferences when no localStorage values exist. */
export const DEFAULT_PREFERENCES: Readonly<AccessibilityPreferences> = Object.freeze({
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
  largeSpacing: false,
});

/** Custom event detail emitted on preference changes. */
export interface AccessibilityChangeEventDetail extends AccessibilityPreferences {}

/** Typed custom event for `a11y-change`. */
export type AccessibilityChangeEvent = CustomEvent<AccessibilityChangeEventDetail>;

// Augment GlobalEventHandlersEventMap so addEventListener is typed
declare global {
  interface HTMLElementEventMap {
    'a11y-change': AccessibilityChangeEvent;
  }
}
