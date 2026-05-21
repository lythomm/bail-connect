# Design System Inspired by DossierFacile

## 1. Visual Theme & Atmosphere

DossierFacile embodies the official, trustworthy character of French government digital services. The design prioritizes clarity, accessibility, and user confidence through a sophisticated palette of deep navy and light, neutral backgrounds. The system emphasizes straightforward information architecture with generous whitespace, clean typography in the Marianne font family (France's national typeface), and subtle depth through careful use of borders and insets rather than shadows. The visual language conveys institutional reliability while remaining approachable and modern, with purposeful use of color accents to guide user actions through the rental document submission process.

**Key Characteristics**
- Official French government aesthetic using Marianne typeface
- Deep navy primary actions contrasting against light, spacious backgrounds
- Minimal use of shadows; preference for subtle inset borders for depth
- High contrast text ensuring accessibility and legibility
- Clean, grid-based layout with consistent spacing rhythm
- Strategic use of soft accent colors (coral, gold, green) for illustrations and status indicators
- Emphasis on form clarity and structured multi-step workflows

## 2. Color Palette & Roles

### Primary
- **Republic Blue** (`#000091`): Primary brand color for buttons, headings, and key interactive elements; represents official government authority
- **Sky Blue** (`#5770BE`): Secondary blue for supporting UI elements and subtle accents

### Accent Colors
- **Coral Orange** (`#FF6B4A`): Inferred accent for illustrations and emphasis (complementary to navy)
- **Gold Yellow** (`#FFD166`): Inferred accent for highlights and positive states
- **Success Green** (`#18753C`): Positive confirmation, approved states, and success messaging
- **Danger Red** (`#CE0500`): Error states, warnings, and critical alerts
- **Action Blue** (`#0063CB`): Alternative action color for secondary CTAs and links

### Interactive
- **Primary CTA Background** (`#000091`): Solid navy fill for primary buttons
- **Primary CTA Text** (`#F5F5FE`): Off-white text on primary buttons for high contrast
- **Secondary Button Border** (`#000091`): Navy outline for secondary button variants
- **Link Color** (`#000091`): Navy for text links and inline navigation

### Neutral Scale
- **Text Primary** (`#161616`): Darkest text for primary body content and headings
- **Text Secondary** (`#3A3A3A`): Medium gray for secondary body text and descriptions
- **Text Tertiary** (`#666666`): Light gray for helper text, captions, and disabled states
- **Text Muted** (`#929292`): Lightest gray for very subtle text or disabled interactions
- **Text Inverse** (`#FFFFFF`): White text on dark backgrounds

### Surface & Borders
- **Surface Light** (`#F5F5FE`): Soft lavender-white for cards, containers, and light backgrounds
- **Surface Lighter** (`#F6F6F6`): Pure light gray for alternate surfaces
- **Surface Default** (`#FFFFFF`): Pure white for primary page background
- **Border Light** (`#E3E3FD`): Subtle lavender border for card edges and dividers
- **Border Inset** (`#DDDDDD`): Gray inset border for form controls and modals

### Semantic / Status
- **Warning Accent** (`#FCD8D0`): Soft coral background for warning or attention-needed states
- **Info Accent** (`#E3E3FD`): Soft lavender background for informational callouts

## 3. Typography Rules

### Font Family
**Primary:** Marianne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif

**Secondary:** Marianne, sans-serif (same as primary; fallback to system fonts)

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | Marianne | 24px | 700 | 32px | 0px | Hero headline; maximum emphasis |
| Heading / H2 | Marianne | 20px | 700 | 28px | 0px | Section heading; strong visual weight |
| Body / Paragraph | Marianne | 14px | 400 | 24px | 0px | Primary content; readable at all sizes |
| Label / Span | Marianne | 16px | 500 | 24px | 0px | Form labels, button text, metadata |
| Link / Navigation | Marianne | 16px | 400 | 24px | 0px | Inline links and navigation items |
| Small / Caption | Marianne | 12px | 400 | 18px | 0px | Helper text, captions, form hints |
| Input / Form Field | Marianne | 13.33px | 400 | normal | 0px | Form input placeholder and typed text |
| Button Large | Marianne | 16px | 500 | 24px | 0px | Primary and secondary buttons |

### Principles
- **Single typeface:** Marianne is used exclusively across all hierarchies to maintain governmental consistency
- **Weight contrast:** Use 400 for body and links; 500 for labels and small buttons; 700 for headings to establish clear visual hierarchy
- **Line height:** Generous line heights (24px minimum) ensure accessibility and reduce cognitive load
- **No letter spacing:** Tight kerning maintains professional, official appearance
- **Size discipline:** Use only the defined sizes; limit to 5–6 active sizes per page to avoid visual chaos

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background:** `#000091`
- **Text Color:** `#F5F5FE`
- **Font Size:** `16px`
- **Font Weight:** `500`
- **Padding:** `8px 16px`
- **Border Radius:** `0px`
- **Border:** `0px none`
- **Box Shadow:** `none`
- **Height:** `40px`
- **Line Height:** `24px`
- **Hover State:** Background darkens to `#0B0B7D`, text remains `#F5F5FE`
- **Active State:** Background becomes `#050545`, box shadow inset `0px 0px 0px 2px #F5F5FE`
- **Disabled State:** Background `#929292`, text `#FFFFFF`, cursor not-allowed

#### Secondary Button
- **Background:** transparent
- **Text Color:** `#000091`
- **Font Size:** `16px`
- **Font Weight:** `500`
- **Padding:** `8px 16px`
- **Border Radius:** `0px`
- **Border:** `1px solid #000091` (via inset box-shadow)
- **Box Shadow:** `#000091 0px 0px 0px 1px inset`
- **Height:** `40px`
- **Line Height:** `24px`
- **Hover State:** Background `#E3E3FD`, text `#000091`, box-shadow remains
- **Active State:** Background `#5770BE`, text `#FFFFFF`, box-shadow `#5770BE 0px 0px 0px 1px inset`
- **Disabled State:** Text `#929292`, box-shadow `#929292 0px 0px 0px 1px inset`

#### Tertiary / Ghost Button
- **Background:** transparent
- **Text Color:** `#000091`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `4px 12px`
- **Border Radius:** `0px`
- **Border:** `none`
- **Box Shadow:** `none`
- **Height:** `32px`
- **Line Height:** `24px`
- **Hover State:** Background `#F5F5FE`, text `#000091`
- **Active State:** Text `#5770BE`
- **Disabled State:** Text `#929292`, cursor not-allowed

### Cards & Containers

#### Card
- **Background:** `#FFFFFF`
- **Border:** `1px solid #DDDDDD` (via inset box-shadow)
- **Box Shadow:** `#DDDDDD 0px 0px 0px 1px inset`
- **Border Radius:** `0px`
- **Padding:** `24px`
- **Margin Bottom:** `24px`
- **Text Color:** `#3A3A3A`

#### Card Header
- **Font Size:** `20px`
- **Font Weight:** `700`
- **Color:** `#161616`
- **Margin Bottom:** `16px`
- **Border Bottom:** `3px solid #000091`
- **Padding Bottom:** `12px`

#### Card Body
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Color:** `#3A3A3A`
- **Line Height:** `24px`

#### Callout / Alert Box
- **Background:** `#FCD8D0` (warning) or `#E3E3FD` (info)
- **Border Left:** `4px solid #000091` (or error color for warnings)
- **Padding:** `16px 24px`
- **Border Radius:** `0px`
- **Text Color:** `#161616`

### Inputs & Forms

#### Text Input
- **Background:** `#FFFFFF`
- **Border:** `1px solid #DDDDDD` (via inset box-shadow)
- **Box Shadow:** `#DDDDDD 0px 0px 0px 1px inset`
- **Border Radius:** `0px`
- **Padding:** `12px 16px`
- **Font Size:** `13.33px`
- **Font Weight:** `400`
- **Line Height:** `normal`
- **Color:** `#3A3A3A`
- **Height:** `40px`
- **Placeholder Color:** `#929292`
- **Focus State:** Border color becomes `#000091`, box-shadow `#000091 0px 0px 0px 1px inset`
- **Error State:** Border color `#CE0500`, background tint `#FCD8D0`, box-shadow `#CE0500 0px 0px 0px 1px inset`
- **Disabled State:** Background `#F6F6F6`, border `#929292`, color `#929292`

#### Form Label
- **Font Size:** `16px`
- **Font Weight:** `500`
- **Color:** `#161616`
- **Margin Bottom:** `8px`
- **Display:** block

#### Checkbox / Radio
- **Size:** `20px × 20px`
- **Border:** `1px solid #DDDDDD`
- **Border Radius:** `2px` (checkbox) or `50%` (radio)
- **Background:** `#FFFFFF`
- **Checked Background:** `#000091`
- **Checked Icon Color:** `#FFFFFF`
- **Focus State:** Box-shadow `#000091 0px 0px 0px 2px inset`

### Navigation

#### Navigation Link
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Color:** `#3A3A3A`
- **Padding:** `0px 24px`
- **Height:** `24px`
- **Line Height:** `24px`
- **Text Decoration:** none
- **Hover State:** Color `#000091`, text-decoration underline
- **Active State:** Color `#000091`, font-weight `500`, border-bottom `3px solid #000091`
- **Disabled State:** Color `#929292`, cursor not-allowed

#### Breadcrumb Item
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Color:** `#3A3A3A`
- **Separator:** `>` or `/` in `#929292`
- **Margin Horizontal:** `4px`
- **Active Item Color:** `#000091`

### Badges & Status Indicators

#### Badge
- **Background:** `#E3E3FD`
- **Text Color:** `#000091`
- **Font Size:** `12px`
- **Font Weight:** `500`
- **Padding:** `4px 12px`
- **Border Radius:** `16px`
- **Display:** inline-block
- **Success Variant:** Background `#18753C`, text `#FFFFFF`
- **Error Variant:** Background `#CE0500`, text `#FFFFFF`
- **Warning Variant:** Background `#FCD8D0`, text `#161616`

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Scale:**
- `4px` — Micro spacing for tight UI elements
- `8px` — Compact gap between adjacent elements
- `12px` — Small margin for form groups
- `16px` — Standard padding for components
- `24px` — Medium padding for cards and sections
- `32px` — Large spacing for layout rhythm
- `36px` — Extra spacing for emphasis
- `40px` — Generous spacing for major sections
- `48px` — Section gap for visual breathing room
- `56px` — Large container padding
- `64px` — Major section separation
- `72px` — Maximum padding for hero sections

**Usage Context:**
- Form inputs and buttons: `8px–16px` padding
- Card content: `24px` padding
- Section margins: `32px–64px`
- Container gutters: `16px–24px` per side
- Text line height: `24px` baseline

### Grid & Container

- **Max Container Width:** `1200px`
- **Number of Columns:** 12-column grid
- **Column Gutter:** `16px` (8px per side)
- **Side Margins:** `24px` on desktop, `16px` on tablet, `12px` on mobile
- **Section Pattern:** Full-width sections with centered 1200px max-width container
- **Hero Section:** Full viewport width, min-height `480px`, centered content

### Whitespace Philosophy

Whitespace is used strategically to separate content hierarchies and reduce cognitive load. Every card, section, and form group is surrounded by consistent negative space to create visual "breathing room." Content density is moderate—not cramped, not wasteful. Vertical rhythm is maintained through disciplined use of the spacing scale. Horizontal rhythm respects the 12-column grid, ensuring alignment across all layouts.

### Border Radius Scale

- `0px` — Buttons, inputs, cards, containers (sharp government aesthetic)
- `2px` — Checkbox and radio elements (subtle softness)
- `16px` — Badges and small pill-shaped elements (rounded accents)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Base) | No shadow, no inset | Background surfaces, body text |
| Subtle Inset | `#DDDDDD 0px 0px 0px 1px inset` | Form inputs, cards, container borders |
| Modal Border | `#DDDDDD 0px 1px 0px 0px inset` | Modal top border, emphasis lines |
| Focus Inset | `#000091 0px 0px 0px 1px inset` | Focused buttons, active states |
| Pressed | `#000091 0px 0px 0px 2px inset` | Active button state, pressed appearance |

**Shadow Philosophy:**
DossierFacile avoids drop shadows in favor of inset borders and subtle lines. This reflects the formal, minimal aesthetic of French government design systems. Depth is implied through border treatments, color contrast, and strategic use of background colors rather than atmospheric shadow effects. The inset box-shadow technique creates a crisp, technical appearance consistent with official digital services.

## 7. Do's and Don'ts

### Do
- **Use navy (`#000091`) sparingly but decisively** for primary calls to action and key interactive elements
- **Maintain consistent padding and margins** using the spacing scale (4px, 8px, 12px, 16px, 24px, 32px, etc.)
- **Apply Marianne font exclusively** across all typographic roles for cohesive, official appearance
- **Leverage high contrast text** (navy or dark gray on white; white on navy) for accessibility
- **Use inset borders** instead of drop shadows to denote depth and state changes
- **Structure forms with clear labels** and ample vertical spacing between fields
- **Implement a proper focus state** with `#000091` inset box-shadow for keyboard navigation
- **Group related content into cards** with subtle `#DDDDDD` borders and `24px` padding
- **Use color accents (green, coral, gold) only in illustrations** and status indicators, not primary UI

### Don't
- **Don't use gradients or complex shadows**—maintain flat, minimal aesthetic
- **Don't deviate from the Marianne typeface** or introduce secondary fonts
- **Don't create button styles outside the defined primary/secondary/tertiary variants**
- **Don't use navy and secondary blue together** in the same component without clear hierarchy
- **Don't apply rounded corners** to buttons and form inputs (keep `border-radius: 0px`)
- **Don't shrink text below `12px`** or increase line-height beyond `32px`
- **Don't stack more than three colors** in a single component or section
- **Don't use the error red (`#CE0500`) for non-critical messages**—reserve for true errors
- **Don't create margins or padding values outside the defined spacing scale**
- **Don't apply multiple borders or complex box-shadows** to simulate depth; use inset borders only

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|---|---|---|
| Mobile | `< 576px` | Single column, `12px` side margins, `14px` base font, stacked buttons |
| Tablet | `576px–992px` | Two-column grid, `16px` side margins, `14px` base font, flex buttons |
| Desktop | `≥ 992px` | Full 12-column grid, `24px` side margins, `16px` base font, inline buttons |

### Touch Targets

- **Minimum Touch Size:** `44px × 44px` (buttons and interactive elements on touch devices)
- **Comfortable Touch Size:** `56px × 56px` (large touch targets for accessibility)
- **Spacing Between Touch Targets:** `8px` minimum to prevent accidental activation
- **Link Touch Padding:** Add `8px` vertical and horizontal padding around text links on mobile

### Collapsing Strategy

- **Navigation:** Collapse to hamburger menu at `tablet` breakpoint; show expanded nav at `desktop`
- **Cards:** Single-column stack at `mobile`, two-column at `tablet`, three-column at `desktop` (context-dependent)
- **Form Inputs:** Full-width on `mobile` and `tablet`; constrain to `400px` max-width on `desktop`
- **Buttons:** Stack vertically on `mobile`, flex row on `tablet` and `desktop`
- **Spacing:** Reduce padding by 50% on `mobile` (e.g., `24px` becomes `12px`), maintain full spacing on `tablet` and `desktop`
- **Hero Section:** Reduce height to `300px` on `mobile`, `400px` on `tablet`, `480px` on `desktop`
- **Grid Gutters:** `8px` on `mobile`, `12px` on `tablet`, `16px` on `desktop`

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA Background:** Republic Blue (`#000091`)
- **Primary CTA Text:** Off-white (`#F5F5FE`)
- **Secondary CTA Border:** Republic Blue (`#000091`)
- **Heading Text:** Dark Gray (`#161616`)
- **Body Text:** Medium Gray (`#3A3A3A`)
- **Form Border / Inset:** Light Gray (`#DDDDDD`)
- **Link Color:** Republic Blue (`#000091`)
- **Error State:** Danger Red (`#CE0500`)
- **Success State:** Success Green (`#18753C`)
- **Card Background:** White (`#FFFFFF`)
- **Light Surface:** Soft Lavender (`#F5F5FE`)
- **Accent (Illustrations):** Coral Orange (`#FF6B4A`), Gold Yellow (`#FFD166`)

### Iteration Guide

1. **Always use `border-radius: 0px`** for buttons, inputs, and cards to maintain sharp government aesthetic; exception is badges at `16px`.

2. **Maintain the spacing scale religiously:** Use only `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `36px`, `40px`, `48px`, `56px`, `64px`, `72px`. No arbitrary values.

3. **Typography is Marianne-only across all roles.** Map sizes to: Display `24px/700`, Heading `20px/700`, Body `14px/400`, Label `16px/500`, Small `12px/400`. Do not add intermediate sizes.

4. **Use inset box-shadow for all borders and depth:** `#DDDDDD 0px 0px 0px 1px inset` for standard borders; `#000091 0px 0px 0px 1px inset` for focus/active states. No CSS `border` property.

5. **Color hierarchy:** Navy (`#000091`) for primary actions, medium gray (`#3A3A3A`) for secondary text, light gray (`#929292`) for disabled/tertiary. Never reverse this for readability.

6. **Form design:** Inputs are always `40px` tall with `12px 16px` padding, `#FFFFFF` background, and `#DDDDDD` inset border. Focus state changes border to `#000091`.

7. **Buttons follow three variants only:** Primary (solid navy, white text), Secondary (navy outline, transparent background), Tertiary (no border, navy text, smaller). All use inset box-shadow borders, never CSS `border`.

8. **Card structure:** `24px` padding, white background, `#DDDDDD` inset border (1px). Headers are `20px/700`, text is `14px/400`. Add `24px` margin-bottom between cards.

9. **Responsive collapse:** On mobile (`< 576px`), reduce margins to `12px`, stack all layout to single column, increase button height to `48px` for touch. Maintain typography sizes (no smaller than `12px`).

10. **Links and navigation:** Always `#000091` by default, add underline on hover. Active nav items get `border-bottom: 3px solid #000091` and font-weight `500`. Never use secondary colors for links except in illustrations.