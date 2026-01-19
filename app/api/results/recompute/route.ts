import { NextResponse } from 'next/server';
import { computeCampaignResults } from '@/lib/scoring';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const campaignId = body?.campaignId as string | undefined;

  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  }

  const results = await computeCampaignResults(campaignId);
  return NextResponse.json(results);
}
