'use client';

import { useEffect, useState } from 'react';
import type { TaskEntry } from '../../lib/types';

type FetchStatus = 'idle' | 'loading' | 'error' | 'success';

const closedStatuses = new Set(['done', 'completed', 'closed', 'resolved', 'archived', 'cancelled']);

const normalizeStatus = (status?: string) => (status ?? 'open').toString().toLowerCase().trim();

const getStatusBadgeClasses = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized.includes('block')) {
    return 'border border-rose-100 bg-rose-50 text-rose-700';
  }
  if (normalized.includes('progress') || normalized.includes('inprogress')) {
    return 'border border-amber-100 bg-amber-50 text-amber-700';
  }
  if (normalized.includes('review') || normalized.includes('qa')) {
    return 'border border-sky-100 bg-sky-50 text-sky-700';
  }
  if (normalized.includes('planned') || normalized.includes('backlog')) {
    return 'border border-slate-200 bg-slate-50 text-slate-700';
  }
  return 'border border-slate-200 bg-slate-100 text-slate-700';
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

const formatTitle = (value?: string) => {
  if (!value) {
    return 'Untitled task';
  }
  return value;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [metadata, setMetadata] = useState<{ generatedAt?: string } | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch('/api/tasks', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) {
          const message =
            payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
              ? payload.error
              : 'Failed to load tasks.';
          throw new Error(message);
        }
        if (cancelled) {
          return;
        }
        const payloadTasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
        setTasks(payloadTasks);
        const payloadMetadata =
          payload && typeof payload === 'object' && payload.metadata && typeof payload.metadata === 'object'
            ? { ...(payload.metadata as { generatedAt?: string }) }
            : null;
        setMetadata(payloadMetadata);
        setStatus('success');
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unknown error while loading tasks.');
        setStatus('error');
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  const openTasks = tasks.filter((task) => {
    const normalized = normalizeStatus(task.status);
    if (!normalized) {
      return true;
    }
    return !closedStatuses.has(normalized);
  });

  const syncedAt = metadata?.generatedAt ? formatDate(metadata.generatedAt) : null;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Tasks Board</h1>
        <p className="text-sm text-slate-500">
          Monitor and manage your ongoing work with live status indicators and open-task visibility.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open tasks</p>
          <p className="text-3xl font-semibold text-slate-900">{openTasks.length}</p>
          <p className="text-sm text-slate-500">
            {status === 'loading' ? 'Refreshing…' : 'Active work items'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tracked tasks</p>
          <p className="text-3xl font-semibold text-slate-900">{tasks.length}</p>
          <p className="text-sm text-slate-500">Including completed and archived items</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs uppercase tracking-wide text-slate-500">Last sync</p>
          <p className="text-lg font-semibold text-slate-900">{syncedAt ?? 'Waiting for data'}</p>
          <p className="text-sm text-slate-500">Timestamp from STATUS.yml</p>
        </div>
      </div>

      {status === 'loading' && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-slate-500">
          <p className="text-sm font-semibold text-slate-700">Loading tasks…</p>
          <p className="text-xs text-slate-500">Fetching the latest STATUS.yml snapshot.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-rose-700">
          <p className="text-sm font-semibold">Unable to load tasks</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {status === 'success' && (
        <>
          {openTasks.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {openTasks.map((task, index) => {
                const identifier = task.id ?? task.title ?? `task-${index}`;
                return (
                  <article
                    key={identifier}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-slate-200/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Task
                        </p>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {formatTitle(task.title)}
                        </h2>
                      </div>
                      <span
                        className={`${getStatusBadgeClasses(task.status)} rounded-full px-3 py-1 text-xs font-semibold`}
                      >
                        {task.status ? task.status : 'Open'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {task.description ?? 'No description available for this task.'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {task.priority && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                          Priority: {task.priority}
                        </span>
                      )}
                      {task.due && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                          Due: {formatDate(task.due) ?? task.due}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Array.isArray(task.assignees) &&
                        task.assignees.map((assignee) => (
                          <span
                            key={assignee}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                          >
                            {assignee}
                          </span>
                        ))}
                      {Array.isArray(task.tags) &&
                        task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-slate-500">
              No open tasks were detected. Everything looks up to date!
            </div>
          )}
        </>
      )}
    </section>
  );
}
