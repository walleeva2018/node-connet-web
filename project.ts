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
    uuid: "550e8400-e29b-41d4-a716-446655440004",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440010",
    ownerId: 1,
    ownerName: "john_doe",
    name: "E-commerce Platform",
    description: "Online shopping platform",
    purpose: "production",
    environment: "prod",
    isDefault: false,
    imageUri: "https://via.placeholder.com/300x200?text=E-commerce%20Platform",
    createdAt: "2024-01-16T08:15:00.000Z",
    updatedAt: "2024-01-16T12:30:00.000Z",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440002",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440011",
    ownerId: 2,
    ownerName: "org_one",
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
    uuid: "550e8400-e29b-41d4-a716-446655440005",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440011",
    ownerId: 2,
    ownerName: "org_one",
    name: "Data Analytics",
    description: "Data analytics and reporting platform",
    purpose: "development",
    environment: "dev",
    isDefault: false,
    imageUri: "https://via.placeholder.com/300x200?text=Data%20Analytics",
    createdAt: "2024-01-12T11:30:00.000Z",
    updatedAt: "2024-01-12T15:20:00.000Z",
  },
  {
    uuid: "550e8400-e29b-41d4-a716-446655440003",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440012",
    ownerId: 3,
    ownerName: "org_two",
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
    uuid: "550e8400-e29b-41d4-a716-446655440006",
    ownerUuid: "550e8400-e29b-41d4-a716-446655440012",
    ownerId: 3,
    ownerName: "org_two",
    name: "IoT Dashboard",
    description: "Internet of Things monitoring dashboard",
    purpose: "testing",
    environment: "staging",
    isDefault: false,
    imageUri: "https://via.placeholder.com/300x200?text=IoT%20Dashboard",
    createdAt: "2024-01-11T13:45:00.000Z",
    updatedAt: "2024-01-11T17:15:00.000Z",
  },
];
// Function to get projects by owner name
function getProjectsByOwnerName(ownerName: string) {
  return projects.filter((project) => project.ownerName === ownerName);
}

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
      let filteredProjects = projects;

      // Filter by owner_uuid if provided
      if (request.ownerUuid) {
        filteredProjects = filteredProjects.filter(
          (project) => project.ownerUuid === request.ownerUuid
        );
      }

      // Filter by environment if provided
      if (request.environment) {
        filteredProjects = filteredProjects.filter(
          (project) => project.environment === request.environment
        );
      }

      const pageSize = request.pageSize || 10;
      const pageToken = request.pageToken ? parseInt(request.pageToken) : 0;
      const start = pageToken;
      const end = start + pageSize;
      const paginatedProjects = filteredProjects.slice(start, end);

      const nextPageToken = end < filteredProjects.length ? end.toString() : "";

      return create(ListProjectsResponseSchema, {
        projects: paginatedProjects.map((project) =>
          create(ProjectSchema, project)
        ),
        nextPageToken: nextPageToken,
        totalCount: filteredProjects.length,
      });
    },
  });
}

// Export the helper function for use elsewhere
export { getProjectsByOwnerName };

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
