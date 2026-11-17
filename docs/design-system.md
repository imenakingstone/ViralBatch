# ViralBatch design system — November 2026

## Direction
A warm, confident creator workspace: approachable like Buffer, calm and modular like Notion, and focused like a modern editing tool. The product UI should feel like a place to work, not a neon AI demo.

## Tokens
### Light theme
- Canvas: `#F5F3EE`
- Surface: `#FFFFFF`
- Primary ink: `#1E2D2B`
- Muted ink: `#687773`
- Borders: `#DEDED6`
- Brand/action emerald: `#16845F`
- Action hover: `#116B4D`
- Soft mint: `#E6F4EC`

### Dark theme
- Canvas: `#101714`
- Surface: `#18221D`
- Primary ink: `#EDF5EF`
- Muted ink: `#A0B0A6`
- Borders: `#2B3931`
- Brand/action emerald: `#16845F`
- Soft mint: `#20382B`

Dark mode follows the operating-system preference using `prefers-color-scheme`. Both themes use the same semantic tokens and brand accent.

## Typography and geometry
- Display/UI headings: Manrope, 600–800.
- Body and controls: DM Sans, 400–700.
- 4px base spacing rhythm; common gaps 8, 12, 16, 24, 32.
- Cards use 16px radius; controls 10–11px radius.
- Use subtle 1px borders and low-opacity shadows, not glassmorphism or heavy gradients.
- Motion is short and purposeful; honor reduced-motion preferences.

## Information architecture
- Persistent desktop sidebar: workspace identity, Studio, My batches, Integrations, future Video tools, usage/plan area.
- Top bar: breadcrumb, sign-in/account controls, studio status.
- Studio: creation form and settings in the primary column, including content goal, target audience, and brand-voice context; platform guidance and tips in a secondary rail; media upload and processing state below; generated hooks/captions in an editable results panel.
- My batches: concise saved-work list with clear empty state and detail links.
- Batch detail: script, hooks, platform captions, hashtags and metadata in readable sections.
- Integrations: role banner and provider cards that clearly distinguish configured credentials from fully authorized social accounts.
- Login: focused centered form with clear sign-in and account creation paths.

## Responsive and accessibility rules
- At 820px the sidebar becomes a drawer and the studio stacks into one column.
- At 600–700px cards and result columns stack; controls remain touch-friendly.
- Keep visible focus rings, semantic labels, and text contrast at WCAG AA or better.
- Never use color alone for connection/job status.
- Keep copy, export, save, upload, and auth actions available without hover.

## Implementation notes
The first pass is implemented in `src/app/globals.css` with semantic variables, light and dark palettes, refreshed surfaces, form states, integration/history/auth styling, responsive behavior and reduced-motion handling. Existing React workflows and page information architecture are preserved.

## Follow-up visual QA
- Check the actual app at desktop, tablet and mobile widths.
- Verify system light/dark appearance and focus visibility.
- Run lint, typecheck and production build in GitHub Actions.
- Review any contrast failures with browser tooling before launch.


## Creator brief controls
- Group language, style, hook count, and content goal together in a responsive three-column grid (two columns on tablet, one on narrow mobile).
- Keep target audience and brand voice optional, visibly labeled, and length-limited.
- The selected goal should shape the call to action; audience and voice should guide framing without inventing facts or stereotyping.
- Persist the brief with saved batches so users can understand how an output was generated.
