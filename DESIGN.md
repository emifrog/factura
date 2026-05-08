---
name: Factura Core
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The brand personality is rooted in "Financial Clarity." For freelancers and small business owners, administrative tasks are often a source of anxiety; this design system aims to mitigate that through a **Minimalist Corporate** aesthetic. The visual language emphasizes precision, reliability, and calm. 

By utilizing generous whitespace (macro-typography) and a restricted color palette, the UI reduces cognitive load, allowing users to focus on critical data like cash flow and invoice status. The emotional response should be one of "quiet confidence"—the feeling that one's business finances are organized and under control.

## Colors
This design system utilizes a high-contrast, professional palette designed for long-term legibility.

- **Primary (Deep Blue):** Used for navigation, headings, and core brand elements. It establishes a foundation of stability.
- **Secondary (Emerald Green):** Reserved exclusively for "Positive Actions" and "Success States"—getting paid, active invoices, and completed setup.
- **Tertiary (Action Blue):** Used for interactive elements like secondary buttons or links to distinguish them from brand-level containers.
- **Surface & Backgrounds:** A range of crisp whites (#FFFFFF) and cool grays (#F8FAFC to #E2E8F0) are used to layer information without introducing visual noise.

## Typography
The typography strategy prioritizes numerical clarity and reading endurance. 

- **Headlines:** Uses **Manrope** for its modern, geometric structure which feels architectural and secure. 
- **Body & UI:** Uses **Inter** for its exceptional tall x-height and readability in data-heavy tables.
- **Numerical Data:** While using Inter, tabular figures should be enabled to ensure columns of currency align perfectly in invoices and reports.

## Layout & Spacing
The design system employs a **12-column fluid grid** for the main dashboard and a **centered fixed-width layout (max 1200px)** for document views (like invoice creation).

- **Whitespace Philosophy:** We use a 8px linear scale. Generous "Section Spacing" (lg/xl) is used to separate high-level modules (e.g., separating the "Total Balance" summary from the "Recent Transactions" list).
- **Safe Zones:** A 32px outer margin ensures the content feels uncrowded even on smaller tablet screens.

## Elevation & Depth
To maintain a clean, professional aesthetic, this design system avoids heavy gradients or aggressive shadows. 

- **Tonal Layering:** The primary background is the lightest gray (#F8FAFC). Interactive cards and containers are pure white (#FFFFFF).
- **Shadow System:** We use **Ambient Shadows**. These are low-opacity (4-8%), highly diffused blurs with a slight blue tint (#0F172A) to make elements appear as though they are physically resting just above the surface. 
- **Z-Index:** Elevation is used strictly for functional hierarchy: Level 1 for persistent cards, Level 2 for hover states, and Level 3 for modals/dropdowns.

## Shapes
A "Rounded" strategy (0.5rem base) is applied to balance the professional nature of the deep blue with an approachable feel for freelancers. 

- **Interactive Elements:** Buttons and input fields use the 8px (0.5rem) radius.
- **Containers:** Main dashboard cards use 16px (1rem) to create a soft, framed look for data.
- **Small Components:** Status badges (chips) use a full pill-shape (999px) to contrast against the structured rectangular grid.

## Components

- **Clean Cards:** Background: #FFFFFF, Border: 1px solid #F1F5F9, Shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05). Cards should never have headers with background colors; use typography and dividers instead.
- **Primary Buttons:** Background: #0F172A, Text: #FFFFFF, 8px radius. Hover state: Lighten by 10%.
- **Positive Action Buttons:** Background: #10B981 (Emerald), specifically for "Send Invoice" or "Accept Payment."
- **Intuitive Form Fields:** Border: 1px solid #E2E8F0. Focus state: 1px solid #3B82F6 with a 3px soft blue glow. Labels are always positioned above the field, never as placeholders.
- **Status Chips:** High-contrast text on a 10% opacity background of the same color (e.g., "Paid" status uses emerald green text on a light emerald tint).
- **Data Visualizations:** Use "Action Blue" for primary trends and "Emerald Green" for growth. Avoid multi-colored "rainbow" charts; stick to monochromatic blue scales for complex breakdowns.
- **Invoice Line Items:** Use a alternating row tint or subtle dividers (#F1F5F9) to ensure horizontal eye-tracking across pricing and quantities.