import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccessibilityWidget } from '../src/widget';
import { STORAGE_KEYS, CSS_CLASSES, DEFAULT_PREFERENCES } from '../src/types';
import { GLOBAL_STYLE_ID } from '../src/styles';

// Register the custom element once
const TAG = 'a11y-widget-test';
if (!customElements.get(TAG)) {
  customElements.define(TAG, AccessibilityWidget);
}

function createElement(attrs: Record<string, string> = {}): AccessibilityWidget {
  const el = document.createElement(TAG) as unknown as AccessibilityWidget;
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  document.body.appendChild(el);
  return el;
}

function clickShadow(el: AccessibilityWidget, selector: string): void {
  const target = el.shadowRoot!.querySelector<HTMLElement>(selector);
  if (!target) throw new Error(`Element not found: ${selector}`);
  target.click();
}

describe('AccessibilityWidget', () => {
  let widget: AccessibilityWidget;

  beforeEach(() => {
    localStorage.clear();
    // Clean up any global styles from previous tests
    document.getElementById(GLOBAL_STYLE_ID)?.remove();
    document.documentElement.className = '';
    document.documentElement.style.fontSize = '';
  });

  afterEach(() => {
    widget?.remove();
    document.getElementById(GLOBAL_STYLE_ID)?.remove();
    document.documentElement.className = '';
    document.documentElement.style.fontSize = '';
  });

  describe('initialization', () => {
    it('renders the trigger button in shadow DOM', () => {
      widget = createElement();
      const trigger = widget.shadowRoot!.querySelector('.trigger');
      expect(trigger).not.toBeNull();
    });

    it('panel is closed by default', () => {
      widget = createElement();
      const panel = widget.shadowRoot!.querySelector('.panel');
      expect(panel).toBeNull();
    });

    it('injects global styles into document head', () => {
      widget = createElement();
      const style = document.getElementById(GLOBAL_STYLE_ID);
      expect(style).not.toBeNull();
      expect(style!.textContent).toContain('a11y-reduced-motion');
    });

    it('does not inject global styles twice', () => {
      widget = createElement();
      const widget2 = createElement();
      const styles = document.querySelectorAll(`#${GLOBAL_STYLE_ID}`);
      expect(styles.length).toBe(1);
      widget2.remove();
    });

    it('has correct default preferences', () => {
      widget = createElement();
      expect(widget.preferences).toEqual(DEFAULT_PREFERENCES);
    });

    it('sets font size to 100% by default', () => {
      widget = createElement();
      expect(document.documentElement.style.fontSize).toBe('100%');
    });
  });

  describe('trigger button', () => {
    it('has accessible aria-label when closed', () => {
      widget = createElement();
      const trigger = widget.shadowRoot!.querySelector('.trigger')!;
      expect(trigger.getAttribute('aria-label')).toBe('Open accessibility options');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens the panel on click', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      const panel = widget.shadowRoot!.querySelector('.panel');
      expect(panel).not.toBeNull();
    });

    it('has correct aria attributes when open', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      const trigger = widget.shadowRoot!.querySelector('.trigger')!;
      expect(trigger.getAttribute('aria-label')).toBe('Close accessibility options');
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('shows indicator dot when customizations are active', () => {
      localStorage.setItem('a11y-high-contrast', 'true');
      widget = createElement();
      const indicator = widget.shadowRoot!.querySelector('.indicator');
      expect(indicator).not.toBeNull();
    });

    it('hides indicator dot when no customizations', () => {
      widget = createElement();
      const indicator = widget.shadowRoot!.querySelector('.indicator');
      expect(indicator).toBeNull();
    });
  });

  describe('panel', () => {
    it('has dialog role and aria-label', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      const panel = widget.shadowRoot!.querySelector('.panel')!;
      expect(panel.getAttribute('role')).toBe('dialog');
      expect(panel.getAttribute('aria-label')).toBe('Accessibility preferences');
    });

    it('closes on Escape key', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      expect(widget.shadowRoot!.querySelector('.panel')).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(widget.shadowRoot!.querySelector('.panel')).toBeNull();
    });

    it('closes when trigger is clicked again', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      expect(widget.shadowRoot!.querySelector('.panel')).not.toBeNull();

      clickShadow(widget, '[data-action="toggle"]');
      expect(widget.shadowRoot!.querySelector('.panel')).toBeNull();
    });

    it('renders all five controls', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      const toggleRows = widget.shadowRoot!.querySelectorAll('.toggle-row');
      expect(toggleRows.length).toBe(4); // 4 toggles + 1 size control (separate)
      expect(widget.shadowRoot!.querySelector('.size-control')).not.toBeNull();
    });
  });

  describe('text size', () => {
    it('increases font size on plus click', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-action="size-up"]');
      expect(document.documentElement.style.fontSize).toBe('110%');
      expect(localStorage.getItem('a11y-font-size')).toBe('110');
    });

    it('decreases font size on minus click', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-action="size-down"]');
      expect(document.documentElement.style.fontSize).toBe('90%');
      expect(localStorage.getItem('a11y-font-size')).toBe('90');
    });

    it('clamps font size at maximum', () => {
      localStorage.setItem('a11y-font-size', '150');
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');

      const upBtn = widget.shadowRoot!.querySelector<HTMLButtonElement>('[data-action="size-up"]')!;
      expect(upBtn.disabled).toBe(true);

      // Clicking should not exceed max
      clickShadow(widget, '[data-action="size-up"]');
      expect(document.documentElement.style.fontSize).toBe('150%');
    });

    it('clamps font size at minimum', () => {
      localStorage.setItem('a11y-font-size', '75');
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');

      const downBtn = widget.shadowRoot!.querySelector<HTMLButtonElement>('[data-action="size-down"]')!;
      expect(downBtn.disabled).toBe(true);
    });

    it('displays current percentage', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      const value = widget.shadowRoot!.querySelector('.size-value')!;
      expect(value.textContent).toBe('100%');
    });

    it('respects custom font-size-step attribute', () => {
      widget = createElement({ 'font-size-step': '5' });
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-action="size-up"]');
      expect(document.documentElement.style.fontSize).toBe('105%');
    });

    it('respects custom min/max attributes', () => {
      widget = createElement({ 'min-font-size': '90', 'max-font-size': '120' });
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-action="size-down"]');
      expect(document.documentElement.style.fontSize).toBe('90%');

      // Should be clamped at 90
      clickShadow(widget, '[data-action="size-down"]');
      expect(document.documentElement.style.fontSize).toBe('90%');
    });
  });

  describe('toggle controls', () => {
    it.each([
      ['highContrast', CSS_CLASSES.highContrast, STORAGE_KEYS.highContrast],
      ['reducedMotion', CSS_CLASSES.reducedMotion, STORAGE_KEYS.reducedMotion],
      ['dyslexiaFont', CSS_CLASSES.dyslexiaFont, STORAGE_KEYS.dyslexiaFont],
      ['largeSpacing', CSS_CLASSES.largeSpacing, STORAGE_KEYS.largeSpacing],
    ])('toggling %s adds CSS class and saves to localStorage', (key, cssClass, storageKey) => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, `[data-key="${key}"]`);

      expect(document.documentElement.classList.contains(cssClass)).toBe(true);
      expect(localStorage.getItem(`a11y-${storageKey}`)).toBe('true');
    });

    it.each([
      ['highContrast', CSS_CLASSES.highContrast, STORAGE_KEYS.highContrast],
      ['reducedMotion', CSS_CLASSES.reducedMotion, STORAGE_KEYS.reducedMotion],
      ['dyslexiaFont', CSS_CLASSES.dyslexiaFont, STORAGE_KEYS.dyslexiaFont],
      ['largeSpacing', CSS_CLASSES.largeSpacing, STORAGE_KEYS.largeSpacing],
    ])('toggling %s off removes CSS class', (key, cssClass, storageKey) => {
      localStorage.setItem(`a11y-${storageKey}`, 'true');
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, `[data-key="${key}"]`);

      expect(document.documentElement.classList.contains(cssClass)).toBe(false);
      expect(localStorage.getItem(`a11y-${storageKey}`)).toBe('false');
    });

    it('toggle buttons have correct role and aria-checked', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      const toggles = widget.shadowRoot!.querySelectorAll('.toggle-row');
      toggles.forEach((toggle) => {
        expect(toggle.getAttribute('role')).toBe('switch');
        expect(toggle.getAttribute('aria-checked')).toBe('false');
      });
    });

    it('aria-checked updates after toggle', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-key="highContrast"]');
      const toggle = widget.shadowRoot!.querySelector('[data-key="highContrast"]')!;
      expect(toggle.getAttribute('aria-checked')).toBe('true');
    });
  });

  describe('reset', () => {
    it('does not show reset button when no customizations', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      expect(widget.shadowRoot!.querySelector('[data-action="reset"]')).toBeNull();
    });

    it('shows reset button when customizations are active', () => {
      localStorage.setItem('a11y-high-contrast', 'true');
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      expect(widget.shadowRoot!.querySelector('[data-action="reset"]')).not.toBeNull();
    });

    it('resets all preferences to defaults', () => {
      localStorage.setItem('a11y-font-size', '130');
      localStorage.setItem('a11y-high-contrast', 'true');
      localStorage.setItem('a11y-reduced-motion', 'true');
      localStorage.setItem('a11y-dyslexia-font', 'true');
      localStorage.setItem('a11y-large-spacing', 'true');
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-action="reset"]');

      expect(document.documentElement.style.fontSize).toBe('100%');
      expect(document.documentElement.classList.contains(CSS_CLASSES.highContrast)).toBe(false);
      expect(document.documentElement.classList.contains(CSS_CLASSES.reducedMotion)).toBe(false);
      expect(document.documentElement.classList.contains(CSS_CLASSES.dyslexiaFont)).toBe(false);
      expect(document.documentElement.classList.contains(CSS_CLASSES.largeSpacing)).toBe(false);

      Object.values(STORAGE_KEYS).forEach((key) => {
        expect(localStorage.getItem(`a11y-${key}`)).toBeNull();
      });
    });

    it('has accessible aria-label', () => {
      localStorage.setItem('a11y-high-contrast', 'true');
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      const resetBtn = widget.shadowRoot!.querySelector('[data-action="reset"]')!;
      expect(resetBtn.getAttribute('aria-label')).toBe('Reset all accessibility preferences');
    });
  });

  describe('persistence', () => {
    it('restores preferences from localStorage on mount', () => {
      localStorage.setItem('a11y-font-size', '120');
      localStorage.setItem('a11y-high-contrast', 'true');
      localStorage.setItem('a11y-dyslexia-font', 'true');
      widget = createElement();

      expect(widget.preferences.fontSize).toBe(120);
      expect(widget.preferences.highContrast).toBe(true);
      expect(widget.preferences.dyslexiaFont).toBe(true);
      expect(widget.preferences.reducedMotion).toBe(false);
      expect(widget.preferences.largeSpacing).toBe(false);
    });

    it('applies restored preferences to the DOM', () => {
      localStorage.setItem('a11y-font-size', '120');
      localStorage.setItem('a11y-reduced-motion', 'true');
      widget = createElement();

      expect(document.documentElement.style.fontSize).toBe('120%');
      expect(document.documentElement.classList.contains(CSS_CLASSES.reducedMotion)).toBe(true);
    });

    it('uses custom storage prefix', () => {
      widget = createElement({ 'storage-prefix': 'myapp' });
      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-key="highContrast"]');

      expect(localStorage.getItem('myapp-high-contrast')).toBe('true');
      expect(localStorage.getItem('a11y-high-contrast')).toBeNull();
    });
  });

  describe('events', () => {
    it('dispatches a11y-change event on preference change', () => {
      widget = createElement();
      const handler = vi.fn();
      widget.addEventListener('a11y-change', handler);

      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-key="highContrast"]');

      const lastCall = handler.mock.calls[handler.mock.calls.length - 1][0] as CustomEvent;
      expect(lastCall.detail.highContrast).toBe(true);
    });

    it('dispatches event with all current preferences', () => {
      localStorage.setItem('a11y-font-size', '120');
      widget = createElement();
      const handler = vi.fn();
      widget.addEventListener('a11y-change', handler);

      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-key="reducedMotion"]');

      const detail = (handler.mock.calls[handler.mock.calls.length - 1][0] as CustomEvent).detail;
      expect(detail.fontSize).toBe(120);
      expect(detail.reducedMotion).toBe(true);
      expect(detail.highContrast).toBe(false);
    });

    it('event bubbles and is composed (crosses shadow DOM)', () => {
      widget = createElement();
      const handler = vi.fn();
      document.addEventListener('a11y-change', handler);

      clickShadow(widget, '[data-action="toggle"]');
      clickShadow(widget, '[data-key="largeSpacing"]');

      expect(handler).toHaveBeenCalled();
      document.removeEventListener('a11y-change', handler);
    });
  });

  describe('cleanup', () => {
    it('removes keydown listener on disconnect', () => {
      widget = createElement();
      clickShadow(widget, '[data-action="toggle"]');
      widget.remove();

      // After removal, Escape should not throw
      expect(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }).not.toThrow();
    });
  });

  describe('preferences getter', () => {
    it('returns a copy, not a reference', () => {
      widget = createElement();
      const prefs1 = widget.preferences;
      const prefs2 = widget.preferences;
      expect(prefs1).toEqual(prefs2);
      expect(prefs1).not.toBe(prefs2);
    });
  });
});
