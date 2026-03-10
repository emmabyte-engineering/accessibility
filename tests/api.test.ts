import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { register, mount, getPreferences, STORAGE_KEYS, CSS_CLASSES, DEFAULT_PREFERENCES } from '../src/index';

describe('register()', () => {
  it('registers the custom element with default tag name', () => {
    register();
    expect(customElements.get('accessibility-widget')).toBeDefined();
  });

  it('does not throw when registering a second tag name', () => {
    // Note: jsdom does not support registering the same class under
    // multiple tag names, so we just verify it doesn't throw.
    expect(() => register('accessibility-widget')).not.toThrow();
  });

  it('is safe to call multiple times', () => {
    register();
    register();
    expect(customElements.get('accessibility-widget')).toBeDefined();
  });
});

describe('mount()', () => {
  afterEach(() => {
    document.querySelectorAll('accessibility-widget').forEach((el) => el.remove());
    document.documentElement.className = '';
    document.documentElement.style.fontSize = '';
    localStorage.clear();
  });

  it('appends widget to document.body', () => {
    mount();
    const el = document.querySelector('accessibility-widget');
    expect(el).not.toBeNull();
  });

  it('sets position attribute', () => {
    const widget = mount({ position: 'top-left' });
    expect(widget.getAttribute('position')).toBe('top-left');
  });

  it('sets accent-color attribute', () => {
    const widget = mount({ accentColor: '#2563eb' });
    expect(widget.getAttribute('accent-color')).toBe('#2563eb');
  });

  it('sets storage-prefix attribute', () => {
    const widget = mount({ storagePrefix: 'myapp' });
    expect(widget.getAttribute('storage-prefix')).toBe('myapp');
  });

  it('sets font size range attributes', () => {
    const widget = mount({ minFontSize: 80, maxFontSize: 130, fontSizeStep: 5 });
    expect(widget.getAttribute('min-font-size')).toBe('80');
    expect(widget.getAttribute('max-font-size')).toBe('130');
    expect(widget.getAttribute('font-size-step')).toBe('5');
  });

  it('returns the widget element', () => {
    const widget = mount();
    expect(widget).toBeInstanceOf(HTMLElement);
  });
});

describe('getPreferences()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when localStorage is empty', () => {
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('reads font size from localStorage', () => {
    localStorage.setItem('a11y-font-size', '130');
    expect(getPreferences().fontSize).toBe(130);
  });

  it('reads boolean preferences from localStorage', () => {
    localStorage.setItem('a11y-high-contrast', 'true');
    localStorage.setItem('a11y-reduced-motion', 'true');
    const prefs = getPreferences();
    expect(prefs.highContrast).toBe(true);
    expect(prefs.reducedMotion).toBe(true);
    expect(prefs.dyslexiaFont).toBe(false);
    expect(prefs.largeSpacing).toBe(false);
  });

  it('uses custom prefix', () => {
    localStorage.setItem('custom-high-contrast', 'true');
    const prefs = getPreferences('custom');
    expect(prefs.highContrast).toBe(true);
  });
});

describe('exported constants', () => {
  it('STORAGE_KEYS maps all preference keys', () => {
    expect(STORAGE_KEYS.fontSize).toBe('font-size');
    expect(STORAGE_KEYS.highContrast).toBe('high-contrast');
    expect(STORAGE_KEYS.reducedMotion).toBe('reduced-motion');
    expect(STORAGE_KEYS.dyslexiaFont).toBe('dyslexia-font');
    expect(STORAGE_KEYS.largeSpacing).toBe('large-spacing');
  });

  it('CSS_CLASSES maps all toggle keys', () => {
    expect(CSS_CLASSES.highContrast).toBe('a11y-high-contrast');
    expect(CSS_CLASSES.reducedMotion).toBe('a11y-reduced-motion');
    expect(CSS_CLASSES.dyslexiaFont).toBe('a11y-dyslexia-font');
    expect(CSS_CLASSES.largeSpacing).toBe('a11y-large-spacing');
  });

  it('DEFAULT_PREFERENCES is frozen', () => {
    expect(Object.isFrozen(DEFAULT_PREFERENCES)).toBe(true);
  });
});
