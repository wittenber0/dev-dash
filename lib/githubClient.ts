import { load } from 'js-yaml';
import type { GoalFileEntry, GoalYaml, TaskYaml } from './types';

const OWNER = 'dev-system';
const REPO = 'dev-system';
const BRANCH = 'main';
const STATUS_PATH = 'STATUS.yml';
const GOALS_DIRECTORY = 'goals/open';
const RAW_CONTENT_BASE_URL = 'https://raw.githubusercontent.com';
const GITHUB_API_BASE_URL = 'https://api.github.com';

const ensureToken = (): string => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required to access dev-system data.');
  }
  return token;
};

const buildHeaders = (includeAccept = false): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: `token ${ensureToken()}`
  };

  if (includeAccept) {
    headers.Accept = 'application/vnd.github+json';
  }

  return headers;
};

const parseYaml = <T>(yamlString: string): T => {
  const parsed = load(yamlString);
  return (parsed ?? {}) as T;
};

export async function fetchStatusData(): Promise<TaskYaml> {
  const url = `${RAW_CONTENT_BASE_URL}/${OWNER}/${REPO}/${BRANCH}/${STATUS_PATH}`;
  const response = await fetch(url, {
    headers: buildHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch STATUS.yml (${response.status} ${response.statusText})`);
  }

  const text = await response.text();
  const parsed = parseYaml<TaskYaml>(text);
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  return {
    ...parsed,
    tasks
  };
}

interface GithubContentItem {
  path: string;
  name: string;
  type: string;
  download_url: string | null;
}

export async function fetchOpenGoals(): Promise<GoalFileEntry[]> {
  const listUrl = `${GITHUB_API_BASE_URL}/repos/${OWNER}/${REPO}/contents/${GOALS_DIRECTORY}?ref=${BRANCH}`;
  const listResponse = await fetch(listUrl, {
    headers: buildHeaders(true)
  });

  if (!listResponse.ok) {
    throw new Error(
      `Failed to list open goals (${listResponse.status} ${listResponse.statusText})`
    );
  }

  const contents = (await listResponse.json()) as GithubContentItem[];
  const goalFiles = (Array.isArray(contents) ? contents : []).filter(
    (item) =>
      item.type === 'file' &&
      item.download_url &&
      (item.name.endsWith('.yml') || item.name.endsWith('.yaml'))
  );

  const goals = await Promise.all(
    goalFiles.map(async (file) => {
      const fileResponse = await fetch(file.download_url!, {
        headers: buildHeaders()
      });

      if (!fileResponse.ok) {
        throw new Error(
          `Failed to fetch goal file ${file.path} (${fileResponse.status} ${fileResponse.statusText})`
        );
      }

      const text = await fileResponse.text();
      const data = parseYaml<GoalYaml>(text);

      return {
        path: file.path,
        name: file.name,
        data
      };
    })
  );

  return goals;
}
