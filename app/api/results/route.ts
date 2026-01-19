import { NextResponse } from 'next/server';
import { fetchCampaignResults } from '@/lib/scoring';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  }

  const results = await fetchCampaignResults(campaignId);
  return NextResponse.json({ results });
}
