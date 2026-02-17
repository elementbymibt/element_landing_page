# ELEMENT Landing (06.ELEMENT-LANDING)

High-conversion landing for paid traffic with two conversion paths:
- Primary: booking (`NEXT_PUBLIC_BOOKING_URL`)
- Secondary: full intake flow (`/intake/start`)

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Framer Motion
- Server Actions
- GA4 + Vercel Analytics + Meta Pixel placeholder

## Routes
- `/` landing page
- `/admin/test` dev-only CRO readiness dashboard
- `/intake/start` intake entry
- `/intake/new` draft creator redirect
- `/intake/[id]` full intake wizard
- `/thank-you` post-submit page (includes booking CTA)

## Events
Tracked events:
- `landing_view`
- `booking_click`
- `message_match_variant`
- `risk_reversal_view`
- `before_after_interaction`
- `sticky_cta_click`
- `microlead_submit`
- `microlead_skip`
- `hero_variant_a_view`
- `hero_variant_b_view`
- `video_play`
- `scroll_25`, `scroll_50`, `scroll_75`, `scroll_90`
- `intake_start`
- `intake_submit`
- `email_popup_submit`
- `email_popup_skip`

## Environment
Copy `.env.example` to `.env.local` and fill values.

## Run
```bash
npm install
npm run dev
```

## Email Flow
- Intake submit emails are sent from `src/lib/intake/notify.ts`
- Popup lead emails are sent from server action `src/actions/email-guide.ts`
- Shared email transport lives in `src/lib/email/send-email.ts`
- Sender address is read from `RESEND_FROM_EMAIL` (fallback: `onboarding@resend.dev`)
- Priority order:
  1. Resend (`RESEND_API_KEY`)
  2. SMTP fallback (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

## Content Editing
- Hero and chapter copy: `src/data/landing-content.ts`
- OfferBook (first 4 chapters): `src/components/landing/OfferBook.tsx`
- Chapter shell and open-book layout: `src/components/landing/BookChapter.tsx`
- Stacked cards section: `src/components/landing/StackedBulletCards.tsx`
- Bonus gold frame page: `src/components/landing/GoldFrameBonusPage.tsx`
- Sticky CTA engine: `src/components/landing/StickyCTA.tsx`
- Landing assembly (all sections): `src/components/landing/landing-page.tsx`
- Bonus section (POGLAVLJE 03): `src/data/landing-content.ts` (`chapter03Items`)
- Booking URL: `.env.local` (`NEXT_PUBLIC_BOOKING_URL`)

## Deploy (Vercel + subdomain)
1. Import this repo to Vercel.
2. Set production env vars from `.env.example`.
3. In project domain settings, add `landing.elementbymibt.com`.
4. In DNS, create a CNAME for `landing` to Vercel target.
5. Trigger production deploy.
