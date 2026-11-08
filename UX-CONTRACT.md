# Shared experience contract

## Business sources
`PRODUCT.md` records user-approved audience, family ownership, teacher authorization and child-session isolation. The migrations in `supabase/migrations` is authoritative for runtime access enforcement. `DESIGN.md` and `styles.css` define the visual language. No inherited auth contract exists: legacy browser-stored passwords are not migrated.

## Canonical UI Map
| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | src/app.js field, invalid and delegated submit | PRODUCT.md / UX-CONTRACT.md | login, signup, recovery, profile, invitation | tests/browser.mjs |
| Select/Listbox | Native HTML select in invitation dialog | DESIGN.md | adult child-profile selection | tests/browser.mjs |
| Scrollbar | styles.css :root and global scrollbar rules | DESIGN.md | forced colors system fallback | tests/browser.mjs |
| Toast | src/app.js toast | UX-CONTRACT.md | status, recoverable failure | tests/browser.mjs |
| CRUD | src/api.js AccountAPI + database RPC | PRODUCT.md | profile create/read; grant create/read/revoke | tests/database.mjs / tests/browser.mjs |

## Navigation and state
Navigation to another route sets the pt-BR document title, focuses the main content and resets document scroll. Choices and stage changes within an open game/book update its existing DOM in place via src/view.js; they preserve the board, image nodes and document scroll. Pointer choices do not move focus to the main element. Keyboard success moves focus to the next relevant action, scrolling only the minimum needed to make that control visible. All child navigation has text and recognizable imagery. Unknown routes offer a return home. Progressos uses `#progressos`; `#descobertas` and `#progresso` remain compatible aliases. Child session blocks adult routes and requires ending the session before adult login. Credentials remain in memory; only scoped child session token lives in sessionStorage. Supabase RPC rechecks live authorization on every read/write; a 60-second foreground check refreshes it between actions.

## Activities and feedback
The canonical owner for in-place activity updates is `src/view.js updateActivityView`, used by `src/app.js render` only for the currently open game/book. Trusted local templates are patched by stable control keys; account forms keep their existing rendering behavior. Action and feedback slots reserve room so answers do not move the choices. New stage/replay clears its transient hints; a new child clears all hints. Each explicit choice speaks only its specific feedback when voice is enabled, without replaying the entire page guide. `tests/interactions.mjs` verifies scroll, board/card/image identity, keyboard continuation and one utterance per answer at narrow and desktop widths.


Matching: one target plus three options; an incorrect answer stays on the round with a written hint, a correct answer reveals image and word and enables next. Story advances at the reader's pace and is completed only after visiting five scenes. Success is not learning mastery.

Progressos shows distinct completed activities out of the available total and earned achievements out of ten. Unlock rules are defined in PRODUCT.md and implemented once in `getProgress`; no achievement table is needed; additive migrations 202610260002_more_activities.sql and 202610260003_garden_train.sql extend the server completion allowlist while preserving prior records. The first successful completion unlocks Primeiro passo and that activity's badge; completing the two original activities also unlocks Grande explorador. Existing records count automatically. Replays do not reaward achievements. A failed or incomplete activity grants nothing. The completion page names and shows newly earned badges only after saving; a replay still announces successful save without new badges. The same counts appear in the adult dashboard.

Saving: exploration mode stores only completed identifiers in this tab. Connected mode announces success only after the backend responds. A failed save keeps a retry action while the page is open; unsaved completion is not falsely shown as a saved discovery. A page reload may lose an unsaved completion. Ending a session explicitly mentions an outstanding failed save.

## Accounts and permissions
Adult form validation preserves values on errors, associates messages with fields and focuses the first invalid field. Password managers and paste work. Password reveal has announced state. All submits prevent duplicate requests. Invitation preview precedes authorization; revocation names the teacher and consequence. Modal focus returns to its initiating control. Provider failures use inline actionable copy.

## Voice and motion
Written content remains available without audio. Voice uses browser speech synthesis in pt-BR after explicit activation; availability and pronunciation depend on installed browser voices. There is no microphone access. Unsupported speech shows guidance to read with an adult. Page changes and hiding the tab cancel speech. Reduced motion disables mascot animation.

## Verification boundary
Tests cover local workflows, API failure handling and actual PostgreSQL permissions using PGlite with an auth schema fixture. A configured Supabase instance is still needed to validate actual confirmation/recovery email delivery, real browser voices, deployment origin settings and live authentication sessions. No live cloud migration is applied automatically.

## Content and independent activity state
The game catalog contains five activities; the story catalog contains three books. Reader page/visited-scene state is independent for every book and resets when switching to another child. All three stories require visiting every scene and explicitly concluding; merely opening a book earns nothing. Completion and replay routes resolve through the shared activity registry. Memória das vogais offers three or five pairs, ignores repeat clicks on the same card, and waits for an explicit retry after a mismatch; there is no timer. Espiar cartas temporarily reveals all cards, disables card selection and preserves both matched pairs and the pending first selection; Voltar a brincar hides the unselected cards again. Peeking never creates a completion or a matched pair. Letra e figura uses five illustrated words and three letter choices, and explains that Á is A with an accent. Its errors keep the current round. Com palavra / Só a figura is a reversible display choice; an incorrect answer reveals the word as a hint. Changing memory size explicitly starts a fresh board and clears its found pairs; an earned achievement is preserved. Garden play requires three distinct correct flowers on each of five beds; wrong/repeated clicks never add a flower. Train play requires a correct letter in each of five trips; the matching position is always shown in the model. Ver pista and an incorrect answer highlight the corresponding model wagon without filling the gap. Correct train answers show the related picture/word on a ticket. Garden play shows a three-slot bouquet, with wrong flowers outlined and found flowers checked. Picture-only mode has a reversible Ver palavra hint. New activities have independent in-memory state, explicit next controls, completion guards, replay resets and per-child resets. Opening or partially playing never creates a completion. The original completion IDs and routes remain valid.

## Shared header
The four navigation destinations remain visible at every supported width; no hamburger is used. Every destination has both a decorative icon and a text label. A single aria-current destination tracks child routes and completions. The brand uses its image alt plus visible tagline as its accessible name. The voice button shows Com voz / Sem voz and includes that visible state in its accessible name, with aria-pressed reflecting the setting. Adult entry is visually separated. Layout lives only in header.css; palette tokens live in styles.css. Keyboard, 56px child targets, reduced motion, layout widths 320–1440px and applied palette are verified in tests/header.mjs.
