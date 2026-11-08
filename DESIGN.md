---
version: alpha
colors:
  canvas: "#FFFDF8"
  surface: "#FFFFFF"
  ink: "#243557"
  muted: "#55647B"
  primary: "#2F63BF"
  blueTint: "#EAF3FE"
  yellow: "#F7C95C"
  yellowTint: "#FFF4D6"
  coral: "#E88B78"
  coralTint: "#FFF0EA"
  success: "#35745B"
  successTint: "#EDF7F1"
  danger: "#A12D39"
typography:
  heading:
    fontFamily: "'Baloo 2', 'Trebuchet MS', sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Nunito, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
rounded:
  card: "12px"
  button: "15px"
  field: "11px"
spacing:
  unit: "8px"
  cardGap: "20px"
components:
  Button:
    height: "56px"
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
  ActivityCard:
    rounded: "12px"
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  Canvas:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
  BluePanel:
    backgroundColor: "{colors.blueTint}"
  YellowBlock:
    backgroundColor: "{colors.yellow}"
  DiscoveryPanel:
    backgroundColor: "{colors.yellowTint}"
  CoralBlock:
    backgroundColor: "{colors.coral}"
  StoryPanel:
    backgroundColor: "{colors.coralTint}"
  Success:
    textColor: "{colors.success}"
    backgroundColor: "{colors.successTint}"
  Danger:
    textColor: "{colors.danger}"
---

# ABC do saber

## Overview
The elephant’s letter garden: an illustrated play mat with planted vowel blocks, a winding path and a wooden letter train. The exact blue baby elephant guides children aged 3–5. This signature composition replaces the generic colored hero panel; a large garden station sits beside a story corner and a sticker passport. Product register: exploration rather than marketing. The user approved the name, geometric toy direction, and then explicitly requested an elephant mascot with optional speech. School desktop with teacher support is the primary setting; audio cannot be assumed.

## Colors
Runtime source of truth: `styles.css :root`. Colors above map to matching semantic CSS custom properties (`primary` maps to `--blue`, `success` to `--green`). Blue calls to action, navy text, pale blue/coral/yellow activity surfaces and a warm paper canvas. The palette was created with AI Color Picker; the original SVG logo keeps its protected brand blue #285BCE. Decorative light elephant blue #86B6E8 and mint #72B99A support illustrations; they are not text colors on white. Coral and yellow are accents with dark text. Never use pale accents for small text on white. No gradients or rainbow borders.

## Typography
Self-hosted Nunito and Baloo 2 in `assets/fonts`. Heading sizes 29–59px; short adult-readable text and large activity letters. Learning letters use Nunito with no rotation, illustration, or decoration. Logo uses a portable generic rounded font stack, with source SVG and raster versions.

## Layout
1176px content inside 1240px outer container. Header: larger original logo and tagline, four always-visible icon-and-label destinations in a central rounded tray, solid primary active state, 56px minimum child targets, visible voice state and separate adult entry. Navigation moves to a second row at 900px and remains fully visible at 320px. Home destinations form an asymmetrical workbench: garden station on the left, book corner and passport on the right; all stack at 900px. Game catalog: three stations plus two horizontal garden/train stations at desktop, two columns at 900px and one at 650px. Screen transformations at 1150, 900 and 650px. Natural document scrolling in all routes. School desktop game layouts place models beside choices; the garden uses one row of six flowers from 900px. Narrow layouts retain stacked play areas. Answer updates keep the same board and position; feedback and action areas reserve room to prevent layout jumps. No fixed-height shell. Runtime 8px rhythm with optical adjustments documented in component rules.

## Elevation & Depth
Soft border and shallow shadow for quiet activity cards. Toy blocks use a stronger bottom edge. No continuously floating or bouncing mascot. Optional speech produces restrained motion; reduced-motion disables it.

## Shapes
Paper sheets use small 9–12px corners and restrained tape accents; toy letter pieces keep 12–24px corners and a sturdy lower edge. Original SVG planters, flower tiles, train rails and stamp shapes connect the pages. Display copy may be expressive; learning letters stay upright and unobscured. Elephant image is the exact generated local asset; the small elephant logo is an original editable geometric SVG. No emoji replacements for identity.

## Components
Canonical owners: `src/view.js` patches activity templates in place while preserving control/image nodes; shared markup helpers in `src/app.js`, icon and illustration helpers in `src/art.js`, runtime tokens and base component styles in `styles.css`. The garden visual layer and its responsive behavior are owned by `quintal.css`; no header rules live there. `header.css` is the sole owner of header, brand, main navigation, voice and adult-link layout; old header declarations were removed from the global stylesheet. Button has primary, outline, soft, ghost and danger variants. Native select is intentional for adult profile selection. Native `<dialog>` provides modal focus containment, Escape and restoration. Native fields use owned validation, error association and revealable password inputs. Global visible scrollbars, live status, keyboard focus and no-drag controls.

Progressos replaces Descobertas in navigation and the home shelf. It uses a native activity progress bar, an eight-item activity checklist and ten achievement cards. Earned cards use a solid border, green check and explicit "Conquistada!" status; upcoming cards keep their unlocking instruction and show their current step count. Completion celebrates only newly unlocked achievements after saving. Progress calculations live in `src/domain.js getProgress`, shared with the adult dashboard. No timer, score or competitive ranking is introduced. Story catalog retains three book cards. The game workbench has three letter stations and two horizontal illustrated stations, then two columns at 900px and one at 650px. New games reuse the same letter tiles, clues and completion feedback; memory cards have explicit face-down/revealed/matched states, a 3/5-pair choice, a reversible peek and a picture gallery. Figure play offers a visible-word or picture-only mode, with written recovery hints. Garden play finds three target flowers in each of five beds. Train play copies a visible three-vowel model, with a different missing vowel each trip. Shared collection stamps show completed steps, using trip numbers for the train. These controls do not require dragging or audio. Story illustrations are original SVG scenes with the same exact elephant mascot and staged seed/kite content.

## Do's and Don'ts
Use three clear choices, a single task per activity, persistent written guidance and optional speech. Show actual completed activities. Never use timers, lives, grades, rankings, fake completion percentages, autoplay audio, public child listings, or school access without parent authorization.
