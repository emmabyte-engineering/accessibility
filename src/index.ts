import { AccessibilityWidget } from './widget';
import type { AccessibilityWidgetOptions } from './widget';

export { AccessibilityWidget };
export type { AccessibilityWidgetOptions };

/**
 * Register the <accessibility-widget> custom element.
 * Safe to call multiple times — will only register once.
 */
export function register(tagName = 'accessibility-widget'): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, AccessibilityWidget);
  }
}

/**
 * Create and mount the accessibility widget.
 *
 * @example
 * ```ts
 * import { mount } from '@emmabyteeng/accessibility';
 * mount(); // defaults: bottom-right, #b93a54 accent
 * mount({ position: 'bottom-left', accentColor: '#2563eb' });
 * ```
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
 * Get current accessibility preferences from localStorage.
 */
export function getPreferences(prefix = 'a11y'): {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  largeSpacing: boolean;
} {
  const load = (key: string, fallback: string): string =>
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(`${prefix}-${key}`) ?? fallback
      : fallback;

  return {
    fontSize: parseInt(load('font-size', '100')),
    highContrast: load('high-contrast', 'false') === 'true',
    reducedMotion: load('reduced-motion', 'false') === 'true',
    dyslexiaFont: load('dyslexia-font', 'false') === 'true',
    largeSpacing: load('large-spacing', 'false') === 'true',
  };
}
