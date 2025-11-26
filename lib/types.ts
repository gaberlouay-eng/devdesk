// Types matching Prisma schema
export type ItemType = "TASK" | "BUG";
export type ItemStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type ItemPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  repositoryUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string | null;
  status: ItemStatus;
  priority: ItemPriority;
  projectId: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: Date;
  updatedAt: Date;
  project?: Project | null;
}

export interface CreateItemInput {
  type: ItemType;
  title: string;
  description?: string;
  status?: ItemStatus;
  priority?: ItemPriority;
  projectId?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  status?: ItemStatus;
  priority?: ItemPriority;
  projectId?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

export interface FilterOptions {
  type?: ItemType;
  status?: ItemStatus;
  priority?: ItemPriority;
  projectId?: string;
  search?: string;
}

