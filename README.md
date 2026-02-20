# Dashboard Project

A Next.js 14+ dashboard that visualizes goals and task status data sourced directly from the `dev-system` GitHub repository. The project wires together API routes, reusable layout/navigation, and client pages to render a responsive status center that can be extended with new screens, cards, and tooling.

## Project Overview

- `app/layout.tsx` defines the shared layout structure, global styles, and metadata.
- `components/Nav.tsx` renders the current navigation (Goals + Tasks) and handles the mobile menu state.
- `app/goals/page.tsx` and `app/tasks/page.tsx` fetch data via `/api/goals` and `/api/tasks` and render cards with live GitHub-sourced data.
- `lib/githubClient.ts` contains helpers for fetching `STATUS.yml` and the YAML files under `goals/open` using the GitHub REST/Raw APIs.
- API routes in `app/api/*/route.ts` call the client helpers and return structured JSON for the pages to consume.

## Prerequisites

- **Node.js 20+** (tested with 20.x)
- **npm 10+** (shipped with Node 20)
- Access to the `dev-system` GitHub repository (read access)
- A GitHub personal access token (with at least `repo:status` scope or sufficient read rights) stored locally

## Installation

1. **Clone the repository** (use the worktree already provided by this environment):

   