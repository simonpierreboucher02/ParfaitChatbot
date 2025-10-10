# AgentiLab ChatBuilder - Design Guidelines

## Design Approach

**Hybrid System**: Custom dark-first design system inspired by modern SaaS platforms (Linear, Vercel, Notion) with distinctive violet-spectrum branding and glassmorphic UI elements. The design balances enterprise-grade clarity with immersive, futuristic aesthetics.

**Core Philosophy**: "Legendary but Functional" - Every visual choice must serve both beauty and usability. Mobile-first responsive design with cinematic transitions and real-time feedback.

---

## Color Palette

### Dark Mode (Primary)
- **Background Base**: 0 0% 3% (near-black foundation)
- **Surface Elevated**: 0 0% 8% (cards, panels)
- **Surface Hover**: 0 0% 12% (interactive states)
- **Border Subtle**: 0 0% 15% (dividers, outlines)

### Brand Colors
- **Primary Violet**: 258 90% 66% (main CTA, active states)
- **Violet Glow**: 258 100% 75% (neon accents, highlights)
- **Secondary Purple**: 280 85% 55% (secondary actions)
- **Accent Blue**: 220 90% 60% (informational elements)

### Semantic Colors
- **Success Green**: 142 76% 45%
- **Warning Amber**: 38 92% 50%
- **Error Red**: 0 84% 60%
- **Info Cyan**: 189 85% 55%

### Text Hierarchy
- **Primary Text**: 0 0% 98% (headings, key content)
- **Secondary Text**: 0 0% 70% (body, descriptions)
- **Tertiary Text**: 0 0% 50% (metadata, timestamps)
- **Disabled Text**: 0 0% 35%

---

## Typography

### Font Families
- **Display/Headings**: Inter or Manrope (700-800 weight)
- **Body/UI**: Inter (400-600 weight)
- **Monospace**: JetBrains Mono (code, API keys)

### Type Scale (Desktop)
- **Hero**: 3.5rem / 56px (landing hero)
- **H1**: 2.5rem / 40px (page titles)
- **H2**: 2rem / 32px (section headers)
- **H3**: 1.5rem / 24px (card titles)
- **Body Large**: 1.125rem / 18px (primary content)
- **Body**: 1rem / 16px (standard text)
- **Small**: 0.875rem / 14px (metadata, captions)
- **Tiny**: 0.75rem / 12px (labels, badges)

### Responsive Scaling
Mobile type scales down 15-20% while maintaining readability (minimum 14px body).

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 24 (p-1, m-4, gap-8, etc.)

### Containers
- **Max Width**: max-w-7xl (dashboard), max-w-6xl (content), max-w-md (forms)
- **Padding**: px-4 mobile, px-6 tablet, px-8 desktop
- **Section Spacing**: py-12 mobile, py-20 desktop

### Grid Systems
- **Dashboard Layout**: 12-column grid (grid-cols-12)
- **Feature Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- **Split Layouts**: grid-cols-1 lg:grid-cols-2 (forms + preview)

---

## Component Library

### Navigation
- **Top Bar**: Glassmorphic header with blur (backdrop-blur-xl), sticky positioning
- **Sidebar**: Collapsible on mobile, permanent on desktop, violet accent for active items
- **Breadcrumbs**: Small text with chevron separators, violet current page

### Buttons
- **Primary**: Solid violet gradient with glow effect on hover
- **Secondary**: Outline with violet border, transparent background
- **Ghost**: Transparent with hover state (violet/10 background)
- **Icon Buttons**: 40px square, rounded-lg, subtle hover lift

### Cards & Panels
- **Glassmorphic Cards**: bg-surface with backdrop-blur-md, 1px violet border, rounded-2xl
- **Elevated Panels**: Subtle shadow with violet glow (box-shadow: 0 0 20px violet/10)
- **Hover State**: Slight translate-y lift with increased glow

### Forms & Inputs
- **Input Fields**: Dark background (bg-surface), violet focus ring, rounded-lg
- **Dropdowns**: Dark surface with violet highlight for selected items
- **Toggle Switches**: Violet active state with smooth transition
- **File Upload**: Drag-and-drop zone with dashed violet border, icon + text centered

### Chat Interface
- **Message Bubbles**: User messages (violet gradient), Bot messages (dark surface with subtle border)
- **Streaming Indicator**: Animated violet dots or cursor blink
- **Citations**: Inline numbered references with violet accent
- **Input Area**: Fixed bottom with glassmorphic background, auto-resize textarea

### Data Visualization
- **Map**: Dark themed Mapbox/Leaflet with violet markers for interactions
- **Charts**: Violet-cyan gradient color scheme, dark backgrounds
- **Stat Cards**: Large numbers with violet accent, small trend indicators

### Real-time Elements
- **Status Indicators**: Pulsing dot (green active, gray inactive)
- **Live Counter**: Animated number changes with violet flash
- **Notification Badges**: Violet circle with white count

### Modals & Overlays
- **Modal Background**: Black/80 backdrop with blur
- **Modal Content**: Centered card with violet border glow, max-w-2xl
- **Bottom Sheets** (Mobile): Slide up from bottom, rounded top corners, drag handle

---

## Animations & Micro-interactions

**Use Sparingly, Purposefully**

- **Page Transitions**: Subtle fade + slide (200ms ease-out)
- **Hover States**: Scale 1.02 or translate-y-1 with 150ms timing
- **Loading States**: Violet shimmer effect on skeleton screens
- **Message Send**: Gentle bounce + violet flash on submit
- **Success Feedback**: Checkmark with violet ripple effect
- **Map Interactions**: Zoom + glow on marker click

---

## Mobile-First Considerations

### Responsive Breakpoints
- **Mobile**: Base styles, single column, bottom sheet modals
- **Tablet** (md: 768px): 2-column grids, expanded navigation
- **Desktop** (lg: 1024px): Full layouts, sidebar visible, 3+ columns
- **Wide** (xl: 1280px): Maximum content width, enhanced spacing

### Touch Optimization
- **Minimum Touch Target**: 44px height for all interactive elements
- **Bottom Navigation**: Fixed mobile nav with 5 max icons
- **Swipe Gestures**: Swipe to dismiss modals, swipe between dashboard tabs
- **Haptic Feedback**: Vibration on button press (mobile only)

---

## Glassmorphism Implementation

- **Base Effect**: backdrop-blur-xl + bg-surface/80 opacity
- **Border**: 1px solid white/10 or violet/20
- **Context Usage**: Headers, floating panels, chat widget overlay
- **Performance**: Limit blur to 5-7 elements max per view

---

## Accessibility

- **Focus Indicators**: 2px violet ring with offset, visible in all contexts
- **Color Contrast**: Minimum 4.5:1 for body text, 3:1 for large text
- **Dark Mode**: Default and only mode (no light mode)
- **Screen Readers**: Proper ARIA labels, semantic HTML, skip links
- **Keyboard Navigation**: Full tab order, escape to close, arrow keys in lists

---

## Key Pages & Layouts

### Landing Page
- **Hero**: Full viewport with gradient mesh background, large heading, violet CTA
- **Features Grid**: 3 columns showcasing core capabilities with icons
- **Interactive Demo**: Embedded chat widget preview with live interaction
- **Social Proof**: Logos carousel, testimonials with avatars
- **Footer**: Comprehensive with newsletter, links, social icons

### Dashboard
- **Stats Overview**: 4-card grid with metrics, violet accent numbers
- **Activity Feed**: Real-time list with timestamps, user avatars
- **Quick Actions**: Prominent violet buttons for common tasks
- **Map Widget**: Embedded geographical view of active users

### Chat Widget (Embed)
- **Bubble Launcher**: Fixed bottom-right, violet circle with icon, pulsing when new message
- **Chat Window**: Slides up (mobile) or expands (desktop), max 500px wide
- **Message Stream**: Auto-scroll, typing indicators, citations
- **Input Bar**: Fixed bottom, send button with violet gradient

---

## Images

**Hero Section**: Yes - use a futuristic abstract visualization featuring AI neural networks, data streams, or a 3D rendered globe with connection points. Dark background with violet-cyan accents. Alternatively, use an animated mesh gradient or particle system.

**Dashboard Screenshots**: Product screenshots showing the interface in action - emphasize the dark theme and violet accents

**Feature Icons**: Use Heroicons or Lucide icons, rendered in violet gradient or outlined style

**Map Visualization**: Custom dark-themed world map with violet pin clusters