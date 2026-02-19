import { NextResponse } from 'next/server';
import { fetchOpenGoals } from '../../../lib/githubClient';

export async function GET() {
  try {
    const goals = await fetchOpenGoals();
    return NextResponse.json(goals);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error fetching goals';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
