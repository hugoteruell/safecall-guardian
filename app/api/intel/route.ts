import { NextResponse } from 'next/server';
import { SCAM_FEED } from '@/lib/scamFeed';

export const runtime = 'nodejs';

/**
 * Returns the live scam-intel feed.
 *
 * Today this just serves the cached snapshot. When Bright Data is wired up,
 * this route will try a real fetch and fall back to SCAM_FEED on any error so
 * the demo never breaks.
 */
export async function GET() {
  // Placeholder for future Bright Data hook:
  // const live = await tryBrightDataFetch();
  // if (live) return NextResponse.json({ ...live, source: 'bright-data' });

  return NextResponse.json(SCAM_FEED, {
    headers: { 'cache-control': 'public, max-age=60, s-maxage=60' },
  });
}
