# Xenial Events: Service Wheel (hero concept v1)

A clickable concept for the homepage hero. It is built to fix one problem: visitors think
Xenial only does staffing. The page shows all six services one after another, each in its
own colour.

## Open it

- **Quickest:** double-click `index.html` (needs internet for the Google font).
- **Or serve it:** `cd xenial-hero-concept && python3 -m http.server 4173`, then open http://127.0.0.1:4173

Screenshots of every state are in `screens/`. `00-current-live-hero.png` is the live site, for comparison.

## The idea in one line

> "Known for staffing. Built for the whole event."
> The line above the headline stays the same. The service name under it changes every 7 seconds.

## What happens on the page

| Moment | What the visitor sees |
|---|---|
| **Load (about 1.6 s)** | The XE mark builds itself, X first, then the E bars, then the dot. It flies into the centre of the wheel while the dark screen shrinks to the wheel's hub. The wheel spins in and the hero rises. |
| **Hero, left 2/3** | A huge service name, a one-line description, a CTA that names the service ("Explore event permits"), three real stats from the service page, and a motion graphic made for that service. |
| **Hero, right 1/3** | The service wheel. Six colour wedges, a hub with the logo and a countdown ring, and dial ticks. The next and previous services are always visible. |
| **Every 7 s** | The wheel turns to the next wedge. That wedge's colour spreads from the pointer over the whole page, and the text colour changes with it. The name, description, CTA, stats and graphic all change. |
| **Click "Explore…" or the graphic** | A curtain in the service's dark colour shows the service name, then lifts to reveal the service page in the same colour. |
| **Service page** | Big name, the same graphic at a larger size, what's included, stats, a sequence or venue strip, and a "Next service" block that leads into the next colour. |
| **Below the hero** | A "first permit to final teardown" timeline. It shows how the six services fit around one exhibition, which is the case for buying more than one service. |

### The six colours (each one fills the whole page)

| Service | Background | Text | Motion graphic |
|---|---|---|---|
| Staffing | Xenial orange `#F26F22` | `#1A0B03` | Lanyard badges hanging from the headline swing, flip to new roles (photos from the real roster), and a greeting cycles through 9 languages |
| Permits | Permit-paper sand `#E9DDC3` | Ink navy `#13213F` | An application fills itself in (Coca-Cola Arena/DTCM, ADNEC/DCT, DWTC, Expo City/DSC…), a rubber stamp comes down with an ink spray, and the document is filed |
| Event IT | Cobalt `#1F3FD6` | `#F2F5FF` | A badge prints line by line, the QR code is scanned, a check-in tick appears and the registrations counter goes up, over a pulsing network grid |
| Production | Safety yellow `#FFC21A` | `#17130A` | A live 3D exhibition stand goes from wireframe render to fabricated panels to a branded build with spotlights. It can be dragged to rotate |
| Media | Darkroom oxblood `#2B0B12` | `#FFE9E3` | A camera viewfinder: REC timecode, focus that hunts and locks, a live histogram, a shutter blink with a flash, and a film strip of real Xenial shots |
| Coordination | Xenial teal `#1FB2AA` | `#03211F` | A show-day run sheet with a live clock. Tasks tick off as the day goes on and radio messages pop in ("VIP convoy two minutes out") |

### Small interactions

- **Wheel:** drag to spin it. It keeps turning after you let go and stops on a wedge, with a pointer nudge and haptic tick at every wedge. You can also click a wedge, or use the arrow keys or Enter. Clicking the hub pauses or resumes.
- **Headline:** letters narrow as the cursor passes over them (Bricolage Grotesque's variable width axis).
- **Custom cursor:** changes to "Drag" over the wheel, "Explore" over the graphic and "Pause" over the hub.
- **Buttons:** they pull toward the cursor and fill from the point where it enters.
- **Auto-rotation pauses** when the cursor is over the wheel or the graphic, when the hero is scrolled out of view, or when the tab is hidden.
- **Reduced motion:** no intro, no auto-rotation, and colours change instantly.

## Questions for the creative team

1. Does the full-page colour change make the six services feel like one brand or six? The orange Xenial logo and the hub stay the same throughout.
2. Should Staffing come first (familiar, then surprise) or should Permits come first (lead with the new service)?
3. Is 7 seconds per service right? The graphics need about 4 to 5 seconds to finish one loop.
4. Wedge colours: sand and oxblood are new to the brand. Keep them, or move them toward the brand orange and teal?
5. Should the line "Known for staffing. Built for the whole event." become the brand position?

## Not done in v1 (good next steps)

- Real photos or short video loops behind each graphic. AI image tools (Gemini, GPT) could make mood frames for the creative review first.
- Real service-page content past the sections shown here.
- Arabic (RTL) version: the wheel would mirror so the pointer sits on the right.
- Performance pass before production. The concept runs six canvas or SVG loops, and only the visible one plays.

## Files

```
index.html          markup
css/style.css       tokens, layout, each graphic's styles, responsive
js/data.js          service content (from xenialevents.com) and colours
js/visuals.js       the six motion graphics
js/wheel.js         the wheel: SVG, drag with momentum, keyboard
js/app.js           intro, colour change, headline, autoplay, routing, cursor
js/vendor/gsap.min.js   GSAP 3.13 (stored locally)
assets/img/         logo and photos taken from xenialevents.com
```
