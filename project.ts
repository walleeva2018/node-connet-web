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
  ownerName: string;
  name: string;
  description: string;
  purpose: string;
  environment: string;
  isDefault: boolean;
  imageUri: string;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    uuid: "550e8400-e29b-41d4-a716-446655440001",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440010",
    ownerId: 1,
    ownerName: "john_doe",
    name: "Web Application",
    description: "Main production web application",
    purpose: "production",
    environment: "prod",
    isDefault: true,
    imageUri: "https://via.placeholder.com/300x200?text=Web%20Application",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T14:20:00.000Z",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440002",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440011",
    ownerId: 2,
    ownerName: "org-one",
    name: "API Development",
    description: "Backend API development environment",
    purpose: "development",
    environment: "dev",
    isDefault: false,
    imageUri: "https://via.placeholder.com/300x200?text=API%20Development",
    createdAt: "2024-01-14T09:15:00.000Z",
    updatedAt: "2024-01-14T16:45:00.000Z",
  },
  {
    uuid: "550e8400-e29b-41a4-a716-446655440002",
    ownerUuid: "550e8400-e29b-41d5-a716-446655440011",
    ownerId: 2,
    ownerName: "org-one",
    name: "API not  Development",
    description: "Backend not API development environment",
    purpose: "development",
    environment: "dev",
    isDefault: false,
    imageUri: "https://via.placeholder.com/300x200?text=API%20Development",
    createdAt: "2024-01-14T09:15:00.000Z",
    updatedAt: "2024-01-14T16:45:00.000Z",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440003",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440012",
    ownerId: 3,
    ownerName: "org-two",
    name: "Mobile App",
    description: "Mobile application for iOS and Android",
    purpose: "testing",
    environment: "staging",
    isDefault: false,
    imageUri: "https://via.placeholder.com/300x200?text=Mobile%20App",
    createdAt: "2024-01-13T14:20:00.000Z",
    updatedAt: "2024-01-13T18:30:00.000Z",
  },
  {
    uuid: "560e8400-e29b-41d4-a716-446655440003",
    ownerUuid: "560e8400-e29b-41d4-a716-446655440012",
    ownerId: 3,
    ownerName: "org-two",
    name: "Mobile not App",
    description: "Mobile not application for iOS and Android",
    purpose: "testing",
    environment: "staging",
    isDefault: false,
    imageUri: "https://via.placeholder.com/300x200?text=Mobile%20App",
    createdAt: "2024-01-13T14:20:00.000Z",
    updatedAt: "2024-01-13T18:30:00.000Z",
  },
];

export default function (router: ConnectRouter) {
  router.service(ProjectService, {
    createProject: async (request: CreateProjectRequest) => {
      const projectData = {
        uuid: generateUUID(),
        ownerUuid: generateUUID(),
        ownerId: 1,
        ownerName: "John Doe", // Default owner name, in real app get from auth context
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
