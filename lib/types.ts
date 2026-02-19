export interface TaskEntry {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  assignees?: string[];
  owner?: string;
  due?: string;
  priority?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface TaskYaml {
  metadata?: {
    generatedAt?: string;
    [key: string]: unknown;
  };
  tasks: TaskEntry[];
  [key: string]: unknown;
}

export interface GoalYaml {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  progress?: number;
  owners?: string[];
  targetDate?: string;
  milestones?: string[];
  [key: string]: unknown;
}

export interface GoalFileEntry {
  path: string;
  name: string;
  data: GoalYaml;
}
