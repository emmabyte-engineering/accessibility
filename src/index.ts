import { AccessibilityWidget } from './widget';
import {
  type AccessibilityPreferences,
  type AccessibilityWidgetOptions,
  type AccessibilityChangeEvent,
  type AccessibilityChangeEventDetail,
  type WidgetPosition,
  STORAGE_KEYS,
  CSS_CLASSES,
  DEFAULT_PREFERENCES,
} from './types';

export { AccessibilityWidget };
export type {
  AccessibilityPreferences,
  AccessibilityWidgetOptions,
  AccessibilityChangeEvent,
  AccessibilityChangeEventDetail,
  WidgetPosition,
};
export { STORAGE_KEYS, CSS_CLASSES, DEFAULT_PREFERENCES };

/**
 * Register the `<accessibility-widget>` custom element.
 * Safe to call multiple times — only registers once per tag name.
 */
export function register(tagName = 'accessibility-widget'): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, AccessibilityWidget);
  }
}

/**
 * Create, configure, and mount the accessibility widget to the DOM.
 *
 * @example
 * ```ts
 * import { mount } from '@emmabyteeng/accessibility';
 *
 * // Defaults: bottom-right, Pulse accent color
 * mount();
 *
 * // Custom position and color
 * mount({ position: 'bottom-left', accentColor: '#2563eb' });
 * ```
 *
 * @returns The mounted `AccessibilityWidget` element.
 */
export function mount(options: AccessibilityWidgetOptions = {}): AccessibilityWidget {
  register();

  const widget = document.createElement('accessibility-widget') as unknown as AccessibilityWidget;

  if (options.position) {
    widget.setAttribute('position', options.position);
  }
  if (options.accentColor) {
    widget.setAttribute('accent-color', options.accentColor);
  }
  if (options.storagePrefix) {
    widget.setAttribute('storage-prefix', options.storagePrefix);
  }
  if (options.minFontSize !== undefined) {
    widget.setAttribute('min-font-size', String(options.minFontSize));
  }
  if (options.maxFontSize !== undefined) {
    widget.setAttribute('max-font-size', String(options.maxFontSize));
  }
  if (options.fontSizeStep !== undefined) {
    widget.setAttribute('font-size-step', String(options.fontSizeStep));
  }

  document.body.appendChild(widget);
  return widget;
}

/**
 * Read the current accessibility preferences from localStorage
 * without mounting the widget.
 *
 * Useful for server-side or build-time rendering where you need
 * to read preferences but don't want the widget in the DOM.
 *
 * @param prefix - localStorage key prefix (default: `'a11y'`)
 */
export function getPreferences(prefix = 'a11y'): AccessibilityPreferences {
  const load = (key: string, fallback: string): string =>
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(`${prefix}-${key}`) ?? fallback
      : fallback;

  return {
    fontSize: parseInt(load(STORAGE_KEYS.fontSize, '100')),
    highContrast: load(STORAGE_KEYS.highContrast, 'false') === 'true',
    reducedMotion: load(STORAGE_KEYS.reducedMotion, 'false') === 'true',
    dyslexiaFont: load(STORAGE_KEYS.dyslexiaFont, 'false') === 'true',
    largeSpacing: load(STORAGE_KEYS.largeSpacing, 'false') === 'true',
  };
}
