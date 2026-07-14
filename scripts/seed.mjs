// Dev seed — 8 creators / 30 threads for a real signed-in user (DEVPLAN M4).
//
// Uses the SERVICE-ROLE key (bypasses RLS) — a secret that must NEVER live in
// the app's .env or in git. Put it in a gitignored .env.local and run:
//
//   node --env-file=.env.local scripts/seed.mjs
//
// .env.local needs:
//   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=...        # Dashboard → Project Settings → API
//   SEED_USER_EMAIL=you@example.com      # sign in on the app once first
//
// Re-running wipes this user's creators (cascades to threads) and reseeds.

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_USER_EMAIL;

if (!url || !serviceKey || !email) {
  console.error(
    'Missing env. Need EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_USER_EMAIL (see this file’s header).',
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const dateStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};
const iso = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

const CREATORS = [
  { handle: '@mika.beauty', platform: 'tiktok_shop', niche: 'Skincare', followers: 48200, contact: 'mika@dm' },
  { handle: '@jcollabs', platform: 'tiktok_shop', niche: 'Makeup', followers: 15600, contact: 'jo@dm' },
  { handle: '@cebufoodie', platform: 'tiktok_shop', niche: 'Food', followers: 92300, contact: null },
  { handle: '@glowbyria', platform: 'shopee', niche: 'Skincare', followers: 7300, contact: 'ria@dm' },
  { handle: '@techtitoph', platform: 'tiktok_shop', niche: 'Gadgets', followers: 210000, contact: null },
  { handle: '@momlife.mnl', platform: 'tiktok_shop', niche: 'Home', followers: 33400, contact: 'mom@dm' },
  { handle: '@fitjourneyjb', platform: 'shopee', niche: 'Fitness', followers: 5100, contact: null },
  { handle: '@lash.lounge', platform: 'tiktok_shop', niche: 'Beauty', followers: 18900, contact: 'lash@dm' },
];

const PRODUCTS = [
  'Vitamin C Serum', 'Matte Lip Tint', 'Sunscreen SPF50', 'Hair Growth Oil', 'Facial Cleanser',
  'Body Lotion', 'Collagen Powder', 'Under-eye Cream', 'Sheet Mask Set', 'Perfume Oil',
];

// 30 threads across a spread of states so ghosts / stalls / ROI all show up.
// counts sum to 30.
const BUCKETS = [
  { status: 'requested', count: 3 },
  { status: 'approved', count: 3 },
  { status: 'shipped', count: 4 },
  { status: 'delivered', count: 4 },
  { status: 'stalled', count: 4 }, // content_due, a few days overdue, no post
  { status: 'ghost', count: 3 }, // content_due, >7 days overdue, no post
  { status: 'posted', count: 5 },
  { status: 'gmv', count: 4 },
];

function buildThread(kind, i, creatorId, userId) {
  const product = PRODUCTS[i % PRODUCTS.length];
  const cost = 50 + (i % 6) * 35;
  const base = { user_id: userId, creator_id: creatorId, product, sample_cost: cost };

  switch (kind) {
    case 'requested':
      return { ...base, status: 'requested' };
    case 'approved':
      return { ...base, status: 'approved' };
    case 'shipped':
      return {
        ...base, status: 'shipped', tracking_number: `PH${100000 + i}`, ship_date: dateStr(-3),
      };
    case 'delivered':
      return {
        ...base, status: 'delivered', tracking_number: `PH${100000 + i}`,
        ship_date: dateStr(-5), content_due_date: dateStr(2),
      };
    case 'stalled':
      return {
        ...base, status: 'content_due', tracking_number: `PH${100000 + i}`,
        ship_date: dateStr(-10), content_due_date: dateStr(-(2 + (i % 3))),
      };
    case 'ghost':
      return {
        ...base, status: 'content_due', tracking_number: `PH${100000 + i}`,
        ship_date: dateStr(-25), content_due_date: dateStr(-(12 + (i % 8))),
      };
    case 'posted':
      return {
        ...base, status: 'posted', tracking_number: `PH${100000 + i}`,
        ship_date: dateStr(-20), content_due_date: dateStr(-13),
        posted_url: `https://tiktok.com/@seed/video/${900000 + i}`, posted_at: iso(-11),
      };
    case 'gmv':
      return {
        ...base, status: 'gmv_logged', tracking_number: `PH${100000 + i}`,
        ship_date: dateStr(-28), content_due_date: dateStr(-21),
        posted_url: `https://tiktok.com/@seed/video/${900000 + i}`, posted_at: iso(-19),
        gmv: [420, 1850, 6400, 320, 9100, 240, 5200, 780][i % 8], gmv_logged_at: iso(-9),
      };
    default:
      return { ...base, status: 'requested' };
  }
}

async function main() {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) throw listErr;
  const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`No auth user with email ${email}. Sign in on the app once, then re-run.`);
    process.exit(1);
  }
  const userId = user.id;

  // Clean reseed (threads cascade from creators).
  const { error: delErr } = await admin.from('creators').delete().eq('user_id', userId);
  if (delErr) throw delErr;

  const { data: creators, error: cErr } = await admin
    .from('creators')
    .insert(CREATORS.map((c) => ({ ...c, user_id: userId })))
    .select();
  if (cErr) throw cErr;

  const threads = [];
  let i = 0;
  for (const bucket of BUCKETS) {
    for (let n = 0; n < bucket.count; n += 1) {
      const creator = creators[i % creators.length];
      threads.push(buildThread(bucket.status, i, creator.id, userId));
      i += 1;
    }
  }

  const { error: tErr } = await admin.from('threads').insert(threads);
  if (tErr) throw tErr;

  console.log(`Seeded ${creators.length} creators and ${threads.length} threads for ${email}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
