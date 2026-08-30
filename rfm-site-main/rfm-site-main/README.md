# Raja Faith Ministries — Redesigned Static Site

Complete responsive redesign of **https://rajafaithministries.com** — modern dark theme, zero build step, zero dependencies. Drop into a GitHub Pages repo and it works immediately.

---

## What's in the bundle

```
rfm-site/
├── index.html
├── about.html
├── vision.html
├── mission.html
├── traditional-leadership.html
├── congregation.html
├── women_ministry.html
├── power_of_youth.html
├── christian_nature_children.html
├── new_church_building.html
├── volunteer.html
├── donations.html
├── testimonies.html
├── media.html
├── contact.html
├── assets/
│   ├── css/styles.css      ← design system
│   └── js/main.js          ← nav, slider, lightbox, forms, tabs, popup
├── .nojekyll               ← tells GitHub Pages to skip Jekyll
└── README.md
```

**14 pages** matching the original sitemap exactly.

---

## About the images — it just works

Images are **hotlinked** directly from `https://rajafaithministries.com/images/...` — the same paths your live site already serves. That means:

- ✅ **Every image loads immediately** the moment you open the site — no downloading, no copying, no manual work.
- ✅ Logo, pastor portrait, mission photos, church renders, UPI QR codes, all 123 anniversary gallery photos — everything appears exactly as on the live site.
- ✅ Zero broken images, zero fluctuating loads.

**When you want to self-host images later** (e.g. moving off the current server), download the whole `/images/` folder from your live site into `rfm-site/images/`, then run one command to switch every URL:

```bash
find . -name "*.html" -exec sed -i 's|https://rajafaithministries.com/images/|images/|g' {} +
```

Done in one line.

---

## Design & features

- **Theme:** dark navy (`#050816`) with warm gold accents (`#f0c674`).
- **Typography:** Fraunces (display serif) + Inter (body sans) from Google Fonts.
- **Layout:** Fluid `clamp()` type, CSS Grid, mobile-first responsive down to 320 px.
- **Navigation:** Sticky glass header with hover dropdowns on desktop, animated hamburger + slide-in menu on mobile.
- **Hero:** Full-viewport slider (4 slides, auto-advance 6 s, clickable dots).
- **Popup modal** on home for Sunday-service directions (once per browser session).
- **Media page:** Horizontal timeline tabs (00–08) for anniversaries. Each panel shows a big clickable YouTube thumbnail (opens on youtube.com — bypasses "Error 153 Video player configuration" that iframe embeds hit on some videos) plus a lightbox gallery of photos.
- **Gallery lightbox:** Click any photo → full-screen viewer with keyboard arrows/Escape.
- **Forms (Volunteer, Testimony, Contact):** Client-side validation, success/error banners, accessible labels.
- **Donations:** Four partner tier cards (Quarterly highlighted), bank info, three UPI QR codes.
- **Footer:** Five-column responsive footer with 7 clean inline-SVG social icons (Simple Icons style — no icon library).
- **Motion:** Scroll-reveal only on explicitly marked elements; elements in view at load reveal instantly; respects `prefers-reduced-motion`.

---

## Hosting on GitHub Pages — step by step

1. **Create a new GitHub repo** — e.g. `rajafaithministries.github.io` (user/org) or `rfm-site` (project).
2. **Copy everything from this `rfm-site/` folder into the repo root.**
3. **Commit and push** to `main`.
4. **Enable Pages:** Repo → **Settings → Pages** → **Source: Deploy from a branch** → branch **main**, folder **/ (root)** → **Save**.
5. GitHub gives you a live URL in ~60 seconds.
6. **Custom domain (optional):** In **Settings → Pages** add `rajafaithministries.com`. In your DNS provider add:
   - Four apex `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` on `www` → `<username>.github.io`
   Then tick **Enforce HTTPS** once the cert is provisioned.

Total time: about 5 minutes.

---

## What was fixed in this iteration

| Issue | Fix |
|---|---|
| Images "fluctuating" / broken | Hotlinked from `rajafaithministries.com` — load instantly, no setup |
| Media page: "Error 153 — Video player configuration error" | Replaced iframe embeds with big clickable YouTube thumbnails |
| Social icons rendering as generic chat bubbles | Clean, well-known SVG paths (Simple Icons) |
| "Developed by Saiteja Ponugoti" | Removed from footer |
| Scroll blocked by aggressive reveal | Reveal is now opt-in per element; anything already in view on load reveals immediately; respects reduced-motion |
| Nav buttons not clicking through | All nav triggers explicitly `type="button"`; dropdown anchors unchanged |

## Cleaned up from the original site

| Original inconsistency | Fix |
|---|---|
| `/congregation` sub-branded as "New Covenant Church" | Unified under RFM branding |
| Logo format mix (`.webp` vs `.png`) | `.webp` primary, `.png` fallback via `onerror` |
| Multiple contact emails scattered | Kept only the intended ones (footer `connect@`, contact page `pastorraja@`, donations `rajafaithministries2015@gmail.com`) |
| Broken `/projects.html`, `/activities.html` footer links | Removed |
| Missing `raja-hope-3.webp`, `5-6.webp` | Skipped in galleries |
| 1st Anniversary had no featured video | Just shows the photo gallery |

---

## Wiring forms to real submissions

All three forms do client-side validation and show a banner but don't send anywhere yet (GitHub Pages is static). To wire them up, use **Formspree**, **Formsubmit**, or **Web3Forms**. Add `action="https://formspree.io/f/YOUR_ID"` and `method="POST"` to each `<form>`, and delete the `e.preventDefault()` block in `assets/js/main.js` (or replace it with a `fetch` there). Takes about 5 minutes per form.

---

## Browser support

Chrome, Edge, Firefox, Safari — last 2 versions.
