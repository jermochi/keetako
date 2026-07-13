# Keetako — Affiliate CRM for TikTok Shop Sellers

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## What this is

Mobile-first affiliate CRM for **Filipino TikTok Shop sellers** who run sample programs (10–100+ samples/month, often also on Shopee, whole business run from a phone). It replaces the spreadsheet + screenshot folder + DM scroll-back they use today, and answers the question none of that answers: **which creators actually make me money?**

Sellers pay; creators are distribution (free companion surface in v2). TikTok's native Seller Center is the real competitor but shows *data*, not *workflow* — Keetako is the ops layer above it: sample cost + courier per thread, triage notes, blocklist, follow-up ladder, true ROI (GMV minus sample spend), Shopee coverage.

**Positioning:** tagline *"Know which creators actually make you money."* Hook: *"Stop feeding ghosts."* Never lead with "sample tracking" — lead with ROI-per-creator and ghost-proofing; tracking is the how, clarity is the product.

## Hard product rules

1. **No invented numbers, ever** — not in the app's AI, not in copy. Every AI output is computed from the user's own records or data they explicitly paste in.
2. Never put "TikTok"/"Tok" in the app *name* (trademark = store rejection). "Keetako" is clean. Descriptions may say "for TikTok Shop sellers" (descriptive use).
3. **Data policy:** user-owned data, manual/screenshot entry only, CSV export, **no TikTok API** — the product must survive any TikTok policy change as a general seller CRM.
4. UI, store listing, and marketing are **English**. (The AI Follow-Up Writer *outputs* EN/Tagalog/Bisaya — a feature setting, not the product language.)

## Core scenarios (this IS the spec)

| # | Pain | Feature |
|---|------|---------|
| 1 | **Ghost drain.** 11 of 30 shipped samples never become videos; product cost + ₱50–150 shipping burned per ghost (~₱3–6k/mo), invisible in any dashboard. | **Creator CRM + Sample Pipeline** (MVP): per-creator profile {handle, niche, followers, notes, auto ghost-flag} + per-sample thread: Requested → Approved → Shipped (tracking #, ₱ cost) → Delivered → Content Due (date) → Posted (link) → GMV logged. Stall alerts nudge the *seller* when a thread sits past due. |
| 2 | **Request triage hell.** 60 sample requests; which 10 deserve product? Today: vibes and follower counts. | **AI Vet Score** (v1.1, Pro): paste requester stats/screenshot → approve/decline score with reasons, grounded ONLY in pasted data + the seller's own history. |
| 3 | **Follow-up dread.** Chasing creators is awkward, so threads die silently. | **AI Follow-Up Writer** (MVP, Pro): one tap on a stalled thread → message drafted from that thread's real data, three tones (friendly nudge / professional check-in / final notice), output toggle EN/Tagalog/Bisaya, copy-to-clipboard. Never auto-sends. |
| 4 | **"Who actually earns for me?"** GMV lives in Seller Center, sample costs live nowhere. | **ROI Board** (MVP): per creator — samples sent, ₱ cost, posts, GMV, ROI. Sortable. Re-invest and blocklist tags. The screen in every demo. |
| 5 | **Data-entry tax.** "I'm not copying 30 threads into another app." | **Screenshot-to-CRM** (MVP, Pro): snap the DM or Seller Center screen → fields extracted → confirm screen → saved. |
| 6 | **Creator side** tracks samples in Notes. | **Creator companion** (v2): free confirm-links so creators update thread status themselves; every link is watermarked distribution. |

**Pricing:** Free = up to 10 active threads, no AI. Pro ₱499/mo or ₱4,990/yr = unlimited threads, all AI, CSV export. Founding Lifetime ₱2,999, first 30 sellers (cap enforced manually).

## Stack

Expo + TypeScript; supabase-js for auth/data with RLS; offline-tolerant via local cache + optimistic writes; expo-notifications for stall alerts; react-native-view-shot for the report card; RevenueCat for payments; PostHog for analytics.

## Conventions

- Small components, no over-abstraction.
- All user-facing strings in `strings.ts` (English).
- Every screen handles the empty state beautifully.
- Ask before adding any dependency.

## AI rules (the no-slop covenant — read before touching any AI feature)

1. **The model never invents a number.** Every metric is computed in SQL from the user's own records; the model formats, ranks, prioritizes, and drafts — nothing else.
2. **Every extraction confirms before saving.** Screenshot-to-CRM always shows the parsed fields for one-tap edit/confirm. Garbage in → flagged, never silently saved.
3. **Every draft is copy-to-send.** Nothing auto-sends to a creator, ever.
4. **No AI for AI's sake.** No chatbot tab, no generic "content ideas" generator. Each AI feature must delete a measurable chunk of time or dread: triage hours → minutes, follow-up dread → one tap, weekly analysis → a 90-second read.
5. **Cost discipline.** AI is Pro-only, behind Edge Function rate limits; small fast model for extraction, strong model for the Monday Briefing. Target AI COGS < 5% of a ₱499 subscription. Founding-lifetime users get a generous but stated fair-use cap.
