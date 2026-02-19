'use client';

import { useEffect, useState } from 'react';
import type { GoalFileEntry } from '../../lib/types';

type FetchStatus = 'idle' | 'loading' | 'error' | 'success';

const statusPalette: Record<string, string> = {
  complete: 'bg-emerald-100 text-emerald-700',
  done: 'bg-emerald-100 text-emerald-700',
  inprogress: 'bg-amber-100 text-amber-700',
  active: 'bg-amber-100 text-amber-700',
  stalled: 'bg-rose-100 text-rose-700',
  blocked: 'bg-rose-100 text-rose-700'
};

const getStatusTone = (status?: string) => {
  if (!status) {
    return 'bg-slate-100 text-slate-700';
  }

  const normalized = status.toLowerCase().replace(/\s+/g, '');
  return statusPalette[normalized] ?? 'bg-slate-100 text-slate-700';
};

const formatDate = (value?: string) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

function GoalCard({ goal }: { goal: GoalFileEntry }) {
  const { data } = goal;
  const title = data.title ?? goal.name ?? 'Unnamed goal';
  const description = data.description ?? 'No description provided.';
  const status = data.status ?? 'Pending';
  const owners = Array.isArray(data.owners) ? data.owners.filter(Boolean) : [];
  const targetDate = formatDate(data.targetDate);
  const progress =
    typeof data.progress === 'number'
      ? Math.min(100, Math.max(0, Math.round(data.progress)))
      : undefined;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Goal</p>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </div>
        <span
          className={`${getStatusTone(status)} rounded-full px-3 py-1 text-xs font-semibold tracking-wide`}
        >
          {status}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="flex flex-wrap gap-2">
        {owners.map((owner) => (
          <span
            key={owner}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {owner}
          </span>
        ))}
        {targetDate && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Target: {targetDate}
          </span>
        )}
      </div>
      {typeof progress === 'number' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Progress</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400">
        <span className="font-semibold text-slate-500">File:</span> {goal.path}
      </p>
    </article>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalFileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');

  useEffect(() => {
    let cancelled = false;

    const loadGoals = async () => {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch('/api/goals', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) {
          const message =
            payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
              ? payload.error
              : 'Failed to load goals.';
          throw new Error(message);
        }
        if (cancelled) {
          return;
        }
        const payloadGoals = Array.isArray(payload) ? payload : [];
        setGoals(payloadGoals);
        setStatus('success');
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unknown error while loading goals.');
        setStatus('error');
      }
    };

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Goals Overview</h1>
        <p className="text-sm text-slate-500">
          Track your current objectives, milestones, and ownership in one responsive dashboard.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open goals</p>
          <p className="text-3xl font-semibold text-slate-900">{goals.length}</p>
          <p className="text-sm text-slate-500">
            {status === 'loading' ? 'Refreshing from GitHub' : 'Synced with goals folder'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs uppercase tracking-wide text-slate-500">Focus</p>
          <p className="text-lg font-semibold text-slate-900">Prioritize impact</p>
          <p className="text-sm text-slate-500">
            Goals surface the most important work so you can focus on measurable outcomes and progress.
          </p>
        </div>
      </div>

      {status === 'loading' && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-slate-500">
          <p className="text-sm font-semibold text-slate-700">Loading goals…</p>
          <p className="text-xs text-slate-500">Fetching the latest plan from the goals directory.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-rose-700">
          <p className="text-sm font-semibold">Unable to load goals</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {status === 'success' && (
        <>
          {goals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {goals.map((goal) => (
                <GoalCard key={goal.path} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-slate-500">
              There are no open goals available. Check back after new objectives are published.
            </div>
          )}
        </>
      )}
    </section>
  );
}
