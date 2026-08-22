# HUE — Digital Design Studio

Premium one-page portfolio/agency website. Static HTML/CSS/JS, no build step, no
framework or third-party runtime dependencies (only Google Fonts is loaded
remotely).

## Structure

```
index.html            entry point (single page)
assets/css/style.css   design tokens, layout, animations, responsive rules
assets/js/main.js      scroll reveal, cursor, tilt, parallax, carousel, form
```

## Local preview

```
python3 -m http.server 8080
```

then open `http://localhost:8080`.

## Deployment

Pushes to `main` are deployed to GitHub Pages via
`.github/workflows/static.yml` (uploads the whole repo root as the Pages
artifact).

## Notes

- The testimonials/reviews section uses placeholder client names — no
  content is attributed to a real business.
- Respects `prefers-reduced-motion`; cursor/tilt/magnetic effects are
  disabled on touch devices automatically.
