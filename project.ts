import type { ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  ProjectService,
  CreateProjectRequestSchema,
  CreateProjectResponseSchema,
  ListProjectsRequestSchema,
  ListProjectsResponseSchema,
  ProjectSchema,
  type CreateProjectRequest,
  type ListProjectsRequest,
} from "./gen/project/v1/project_pb.js";

const projects: Array<{
  uuid: string;
  ownerUuid: string;
  ownerId: number;
  name: string;
  description: string;
  purpose: string;
  environment: string;
  isDefault: boolean;
  imageUri: string;
  createdAt: string;
  updatedAt: string;
}> = [];

export default function (router: ConnectRouter) {
  router.service(ProjectService, {
    createProject: async (request: CreateProjectRequest) => {
      const projectData = {
        uuid: generateUUID(),
        ownerUuid: generateUUID(),
        ownerId: 1,
        name: request.name,
        description: request.description || "",
        purpose: request.purpose || "development",
        environment: request.environment || "dev",
        isDefault: request.isDefault || false,
        imageUri: `https://via.placeholder.com/300x200?text=${encodeURIComponent(
          request.name
        )}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      projects.push(projectData);

      return create(CreateProjectResponseSchema, {
        project: create(ProjectSchema, projectData),
      });
    },

    listProjects: async (request: ListProjectsRequest) => {
      const pageSize = request.pageSize || 10;
      const pageToken = request.pageToken ? parseInt(request.pageToken) : 0;
      const start = pageToken;
      const end = start + pageSize;
      const paginatedProjects = projects.slice(start, end);

      const nextPageToken = end < projects.length ? end.toString() : "";

      return create(ListProjectsResponseSchema, {
        projects: paginatedProjects.map((project) =>
          create(ProjectSchema, project)
        ),
        nextPageToken: nextPageToken,
        totalCount: projects.length,
      });
    },
  });
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
