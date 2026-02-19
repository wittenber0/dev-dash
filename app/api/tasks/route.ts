import { NextResponse } from 'next/server';
import { fetchStatusData } from '../../../lib/githubClient';

export async function GET() {
  try {
    const statusData = await fetchStatusData();
    return NextResponse.json(statusData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error fetching tasks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
