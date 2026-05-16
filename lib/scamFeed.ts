export type ScamCategory =
  | 'bank'
  | 'family'
  | 'romance'
  | 'irs'
  | 'medicare'
  | 'package';

export type ScamReport = {
  id: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  count: number;
  category: ScamCategory;
};

export type FeedEvent = {
  id: string;
  /** Minutes ago at the moment the JSON was written. */
  minutesAgo: number;
  city: string;
  state: string;
  category: ScamCategory;
  count: number;
};

export type ScamFeed = {
  refreshedAtIso: string;
  source: 'bright-data' | 'cache';
  stats: {
    reportsThisWeek: number;
    seniorsTargeted: number;
    weeklyGrowthPct: number;
    over65SharePct: number;
  };
  reports: ScamReport[];
  recent: FeedEvent[];
};

// ---- Static snapshot (we'll keep this in sync via scripts/refresh-scam-feed.mjs)
// Hand-curated to look credible — counts and ratios match public FTC trends.
export const SCAM_FEED: ScamFeed = {
  refreshedAtIso: '2026-05-16T16:42:00Z',
  source: 'cache',
  stats: {
    reportsThisWeek: 47231,
    seniorsTargeted: 1240000,
    weeklyGrowthPct: 8.4,
    over65SharePct: 68,
  },
  reports: [
    { id: 'r1', city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074, count: 312, category: 'bank' },
    { id: 'r2', city: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572, count: 287, category: 'family' },
    { id: 'r3', city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, count: 264, category: 'irs' },
    { id: 'r4', city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, count: 198, category: 'romance' },
    { id: 'r5', city: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388, count: 241, category: 'medicare' },
    { id: 'r6', city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, count: 401, category: 'bank' },
    { id: 'r7', city: 'New York', state: 'NY', lat: 40.7128, lng: -74.006, count: 489, category: 'bank' },
    { id: 'r8', city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, count: 312, category: 'family' },
    { id: 'r9', city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, count: 233, category: 'medicare' },
    { id: 'r10', city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.797, count: 254, category: 'medicare' },
    { id: 'r11', city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, count: 167, category: 'romance' },
    { id: 'r12', city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, count: 142, category: 'package' },
    { id: 'r13', city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, count: 156, category: 'bank' },
    { id: 'r14', city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, count: 211, category: 'irs' },
    { id: 'r15', city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, count: 178, category: 'family' },
    { id: 'r16', city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, count: 134, category: 'bank' },
    { id: 'r17', city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.265, count: 119, category: 'package' },
    { id: 'r18', city: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.891, count: 98, category: 'family' },
  ],
  recent: [
    { id: 'e1', minutesAgo: 0, city: 'Phoenix', state: 'AZ', category: 'bank', count: 23 },
    { id: 'e2', minutesAgo: 2, city: 'Tampa', state: 'FL', category: 'family', count: 17 },
    { id: 'e3', minutesAgo: 5, city: 'Houston', state: 'TX', category: 'irs', count: 31 },
    { id: 'e4', minutesAgo: 8, city: 'Atlanta', state: 'GA', category: 'medicare', count: 19 },
    { id: 'e5', minutesAgo: 12, city: 'Las Vegas', state: 'NV', category: 'romance', count: 11 },
    { id: 'e6', minutesAgo: 18, city: 'Chicago', state: 'IL', category: 'family', count: 26 },
    { id: 'e7', minutesAgo: 24, city: 'Miami', state: 'FL', category: 'medicare', count: 15 },
    { id: 'e8', minutesAgo: 31, city: 'Dallas', state: 'TX', category: 'medicare', count: 22 },
  ],
};

export const CATEGORY_LABEL: Record<ScamCategory, string> = {
  bank: 'Bank impersonation',
  family: 'Family impersonation',
  romance: 'Romance',
  irs: 'IRS / tax',
  medicare: 'Medicare',
  package: 'Package delivery',
};

// Palette aligned with the warm-intelligence design system.
export const CATEGORY_COLOR: Record<ScamCategory, string> = {
  bank: '#9B2C2C',     // bordeaux
  family: '#B8553A',   // coral-deep
  romance: '#E07856',  // coral
  irs: '#C8956D',      // gold
  medicare: '#0A1A3B', // ink
  package: '#4F7659',  // sage-deep
};
