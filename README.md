# @emmabyteeng/accessibility

A drop-in accessibility preferences widget for any web application. Zero dependencies, framework-agnostic, built as a Web Component with Shadow DOM isolation.

Developed by [Emmabyte Engineering, Inc.](https://emmabyte.io)

## Features

- **Text size** — adjustable from 75% to 150%
- **High contrast** — boosts text and border contrast
- **Reduced motion** — disables CSS animations and transitions
- **Dyslexia-friendly font** — switches to [OpenDyslexic](https://opendyslexic.org)
- **Large spacing** — increases letter, word, and line spacing
- **Persistent** — preferences saved to `localStorage`
- **Accessible** — full ARIA support, keyboard navigation, focus management
- **Dark mode** — adapts to `prefers-color-scheme`
- **Customizable** — position, accent color, storage prefix, font size range
- **Framework-agnostic** — works with Svelte, React, Vue, Angular, plain HTML

## Installation

```bash
# From npm (once published)
pnpm add @emmabyteeng/accessibility

# From GitHub
pnpm add git+ssh://git@github.com:emmabyte-engineering/accessibility.git
```

## Quick Start

### One-liner (recommended)

```ts
import { mount } from '@emmabyteeng/accessibility';

mount();
```

That's it. A floating accessibility button appears in the bottom-right corner of the page.

### With options

```ts
import { mount } from '@emmabyteeng/accessibility';

mount({
  position: 'bottom-left',
  accentColor: '#2563eb',
  storagePrefix: 'myapp',
  minFontSize: 80,
  maxFontSize: 130,
  fontSizeStep: 5,
});
```

### HTML custom element

```html
<script type="module">
  import { register } from '@emmabyteeng/accessibility';
  register();
</script>

<accessibility-widget
  position="bottom-right"
  accent-color="#b93a54"
  storage-prefix="a11y"
></accessibility-widget>
```

### CDN / plain HTML

```html
<script type="module">
  import { mount } from 'https://esm.sh/@emmabyteeng/accessibility';
  mount();
</script>
```

## Framework Examples

### SvelteKit

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { mount } from '@emmabyteeng/accessibility';

  onMount(() => mount());
</script>

{@render children()}
```

### React / Next.js

```tsx
// app/layout.tsx or a client component
'use client';
import { useEffect } from 'react';
import { mount } from '@emmabyteeng/accessibility';

export function AccessibilityWidget() {
  useEffect(() => {
    const widget = mount();
    return () => widget.remove();
  }, []);
  return null;
}
```

### Vue / Nuxt

```vue
<!-- App.vue or a layout component -->
<script setup>
import { onMounted } from 'vue';
import { mount } from '@emmabyteeng/accessibility';

onMounted(() => mount());
</script>
```

## API Reference

### `mount(options?): AccessibilityWidget`

Creates and appends the widget to `document.body`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `WidgetPosition` | `'bottom-right'` | Corner placement |
| `accentColor` | `string` | `'#b93a54'` | Active toggle color |
| `storagePrefix` | `string` | `'a11y'` | localStorage key prefix |
| `minFontSize` | `number` | `75` | Minimum font size (%) |
| `maxFontSize` | `number` | `150` | Maximum font size (%) |
| `fontSizeStep` | `number` | `10` | Font size step (%) |

### `register(tagName?): void`

Registers the `<accessibility-widget>` custom element. Called automatically by `mount()`. Safe to call multiple times.

### `getPreferences(prefix?): AccessibilityPreferences`

Reads current preferences from localStorage without mounting the widget. Useful for SSR or conditional logic.

```ts
import { getPreferences } from '@emmabyteeng/accessibility';

const prefs = getPreferences();
if (prefs.reducedMotion) {
  // Skip animations
}
```

### `AccessibilityWidget` (class)

The custom element class. Exposes a read-only `preferences` getter:

```ts
const widget = mount();
console.log(widget.preferences);
// { fontSize: 100, highContrast: false, reducedMotion: false, ... }
```

### Events

The widget dispatches an `a11y-change` custom event (bubbles, composed) whenever preferences change:

```ts
document.addEventListener('a11y-change', (e) => {
  console.log(e.detail);
  // { fontSize: 110, highContrast: true, reducedMotion: false, ... }
});
```

## Exported Constants

| Constant | Description |
|----------|-------------|
| `STORAGE_KEYS` | localStorage key suffixes for each preference |
| `CSS_CLASSES` | CSS class names applied to `<html>` for each mode |
| `DEFAULT_PREFERENCES` | Default preference values (frozen object) |

### CSS Classes Reference

These classes are applied to `document.documentElement` (`<html>`) and can be used in your own stylesheets:

| Class | Mode |
|-------|------|
| `a11y-high-contrast` | High contrast |
| `a11y-reduced-motion` | Reduced motion |
| `a11y-dyslexia-font` | Dyslexia-friendly font |
| `a11y-large-spacing` | Large spacing |

### localStorage Keys

With the default prefix `a11y`:

| Key | Type | Values |
|-----|------|--------|
| `a11y-font-size` | number | `75`–`150` |
| `a11y-high-contrast` | boolean | `'true'` / `'false'` |
| `a11y-reduced-motion` | boolean | `'true'` / `'false'` |
| `a11y-dyslexia-font` | boolean | `'true'` / `'false'` |
| `a11y-large-spacing` | boolean | `'true'` / `'false'` |

## TypeScript

All types are exported and fully documented:

```ts
import type {
  AccessibilityPreferences,
  AccessibilityWidgetOptions,
  AccessibilityChangeEvent,
  AccessibilityChangeEventDetail,
  WidgetPosition,
} from '@emmabyteeng/accessibility';
```

The `a11y-change` event is typed on `HTMLElementEventMap`, so `addEventListener` is fully type-safe.

## How It Works

- The widget renders inside a **Shadow DOM** so its styles are isolated from your page
- Global accessibility styles (reduced motion, high contrast, etc.) are injected into `<head>` as a `<style>` tag to affect the full page
- Font size is applied via `document.documentElement.style.fontSize`, which scales all `rem`/`em` units
- Preferences persist in `localStorage` and are restored on page load
- The dyslexia-friendly font (OpenDyslexic) is loaded from jsDelivr CDN on demand

## Browser Support

Works in all modern browsers that support Web Components (Custom Elements v1):

- Chrome/Edge 67+
- Firefox 63+
- Safari 10.1+

## Development

```bash
pnpm install
pnpm dev          # Watch mode
pnpm build        # Production build
pnpm test         # Run tests
pnpm test:watch   # Watch mode tests
pnpm test:coverage # Coverage report
pnpm typecheck    # Type checking
```

## License

MIT - [Emmabyte Engineering, Inc.](https://emmabyte.io)
