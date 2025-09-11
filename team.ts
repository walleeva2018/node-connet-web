import type { ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  TeamService,
  CreateTeamRequestSchema,
  CreateTeamResponseSchema,
  GetTeamRequestSchema,
  GetTeamResponseSchema,
  ListTeamsRequestSchema,
  ListTeamsResponseSchema,
  UpdateTeamRequestSchema,
  UpdateTeamResponseSchema,
  DeleteTeamRequestSchema,
  DeleteTeamResponseSchema,
  AddTeamMemberRequestSchema,
  AddTeamMemberResponseSchema,
  RemoveTeamMemberRequestSchema,
  RemoveTeamMemberResponseSchema,
  UpdateTeamMemberRequestSchema,
  UpdateTeamMemberResponseSchema,
  ListTeamMembersRequestSchema,
  ListTeamMembersResponseSchema,
  TeamSchema,
  TeamMemberSchema,
  TeamPermission,
  TeamType,
  TeamMemberRole,
  TeamMemberStatus,
  SignInMethod,
  type CreateTeamRequest,
  type GetTeamRequest,
  type ListTeamsRequest,
  type UpdateTeamRequest,
  type DeleteTeamRequest,
  type AddTeamMemberRequest,
  type RemoveTeamMemberRequest,
  type UpdateTeamMemberRequest,
  type ListTeamMembersRequest,
} from "./gen/team/v1/team_pb.js";

import {
  OrganizationSchema,
  SubjectRoleSchema,
  AuthenticationSchema,
} from "./gen/organization/v1/organization_pb.js";

// Import organizations data from organization.ts
import { organizations } from "./organization.js";

// In-memory storage for teams
export const teams: Array<{
  id: bigint;
  uuid: string;
  name: string;
  description: string;
  organizationUuid: string;
  permission: TeamPermission;
  type: TeamType;
  vmLimit: number;
  kubernetesLimit: number;
  dbLimit: number;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: BigInt(1),
    uuid: "team-uuid-1",
    name: "Engineering Team",
    description: "Core engineering and development team",
    organizationUuid: "org-uuid-1",
    permission: TeamPermission.ADMIN,
    type: TeamType.DEVELOPMENT,
    vmLimit: 10,
    kubernetesLimit: 5,
    dbLimit: 3,
    isActive: true,
    memberCount: 5,
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-12-01").toISOString(),
  },
  {
    id: BigInt(2),
    uuid: "team-uuid-2",
    name: "DevOps Team",
    description: "Infrastructure and operations team",
    organizationUuid: "org-uuid-1",
    permission: TeamPermission.ADMIN,
    type: TeamType.DEVOPS,
    vmLimit: 20,
    kubernetesLimit: 10,
    dbLimit: 5,
    isActive: true,
    memberCount: 3,
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-11-15").toISOString(),
  },
  {
    id: BigInt(3),
    uuid: "team-uuid-3",
    name: "Marketing Team",
    description: "Marketing and growth team",
    organizationUuid: "org-uuid-2",
    permission: TeamPermission.WRITE,
    type: TeamType.MARKETING,
    vmLimit: 5,
    kubernetesLimit: 2,
    dbLimit: 2,
    isActive: true,
    memberCount: 4,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-10-20").toISOString(),
  },
];

// In-memory storage for team members
export const teamMembers: Array<{
  id: string;
  teamId: bigint;
  teamUuid: string;
  teamName: string;
  email: string;
  name: string;
  avatar: string;
  twoFactorAuthEnabled: boolean;
  hasSecureLogin: boolean;
  signInMethod: SignInMethod;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  subjectRole: {
    uuid: string;
    name: string;
    description: string;
  };
  joinedAt: string;
  lastActiveAt: string;
  isOrganizationOwner: boolean;
  permissions: string[];
}> = [
  // Team 1 Members
  {
    id: "member-uuid-1",
    teamId: BigInt(1),
    teamUuid: "team-uuid-1",
    teamName: "Engineering Team",
    email: "john.doe@org1.com",
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    twoFactorAuthEnabled: true,
    hasSecureLogin: true,
    signInMethod: SignInMethod.PASSWORD,
    role: TeamMemberRole.OWNER,
    status: TeamMemberStatus.ACTIVE,
    subjectRole: {
      uuid: "subrole-uuid-1",
      name: "Team Lead",
      description: "Full team management capabilities",
    },
    joinedAt: new Date("2024-01-15").toISOString(),
    lastActiveAt: new Date().toISOString(),
    isOrganizationOwner: true,
    permissions: ["*"],
  },
  {
    id: "member-uuid-2",
    teamId: BigInt(1),
    teamUuid: "team-uuid-1",
    teamName: "Engineering Team",
    email: "jane.smith@org1.com",
    name: "Jane Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    twoFactorAuthEnabled: false,
    hasSecureLogin: false,
    signInMethod: SignInMethod.OAUTH,
    role: TeamMemberRole.ADMIN,
    status: TeamMemberStatus.ACTIVE,
    subjectRole: {
      uuid: "subrole-uuid-2",
      name: "Senior Developer",
      description: "Code review and deployment permissions",
    },
    joinedAt: new Date("2024-02-01").toISOString(),
    lastActiveAt: new Date().toISOString(),
    isOrganizationOwner: false,
    permissions: ["code.write", "deploy.staging", "review.approve"],
  },
  {
    id: "member-uuid-3",
    teamId: BigInt(1),
    teamUuid: "team-uuid-1",
    teamName: "Engineering Team",
    email: "bob.wilson@org1.com",
    name: "Bob Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    twoFactorAuthEnabled: true,
    hasSecureLogin: true,
    signInMethod: SignInMethod.SSO,
    role: TeamMemberRole.MEMBER,
    status: TeamMemberStatus.ACTIVE,
    subjectRole: {
      uuid: "subrole-uuid-3",
      name: "Developer",
      description: "Standard development permissions",
    },
    joinedAt: new Date("2024-03-15").toISOString(),
    lastActiveAt: new Date().toISOString(),
    isOrganizationOwner: false,
    permissions: ["code.write", "deploy.dev"],
  },
  // Team 2 Members
  {
    id: "member-uuid-4",
    teamId: BigInt(2),
    teamUuid: "team-uuid-2",
    teamName: "DevOps Team",
    email: "alice.johnson@org1.com",
    name: "Alice Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    twoFactorAuthEnabled: true,
    hasSecureLogin: true,
    signInMethod: SignInMethod.PASSWORD,
    role: TeamMemberRole.ADMIN,
    status: TeamMemberStatus.ACTIVE,
    subjectRole: {
      uuid: "subrole-uuid-4",
      name: "DevOps Lead",
      description: "Infrastructure management permissions",
    },
    joinedAt: new Date("2024-02-01").toISOString(),
    lastActiveAt: new Date().toISOString(),
    isOrganizationOwner: false,
    permissions: ["infra.*", "deploy.*", "monitor.*"],
  },
  // Team 3 Members
  {
    id: "member-uuid-5",
    teamId: BigInt(3),
    teamUuid: "team-uuid-3",
    teamName: "Marketing Team",
    email: "sarah.parker@org2.com",
    name: "Sarah Parker",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    twoFactorAuthEnabled: false,
    hasSecureLogin: false,
    signInMethod: SignInMethod.OAUTH,
    role: TeamMemberRole.OWNER,
    status: TeamMemberStatus.ACTIVE,
    subjectRole: {
      uuid: "subrole-uuid-5",
      name: "Marketing Lead",
      description: "Full marketing team access",
    },
    joinedAt: new Date("2024-03-10").toISOString(),
    lastActiveAt: new Date().toISOString(),
    isOrganizationOwner: false,
    permissions: ["marketing.*", "analytics.view", "campaign.create"],
  },
];

let nextTeamId = 4;
let nextMemberId = 6;

export default function (router: ConnectRouter) {
  router.service(TeamService, {
    // Create a new team
    createTeam: async (request: CreateTeamRequest) => {
      // Verify organization exists
      const organization = organizations.find(
        (org) => org.uuid === request.organizationUuid
      );
      if (!organization) {
        throw new Error("Organization not found");
      }

      const team = {
        id: BigInt(nextTeamId++),
        uuid: generateUUID(),
        name: request.name,
        description: request.description,
        organizationUuid: request.organizationUuid,
        permission: request.permission || TeamPermission.READ,
        type: request.type || TeamType.CUSTOM,
        vmLimit: request.vmLimit || 10,
        kubernetesLimit: request.kubernetesLimit || 5,
        dbLimit: request.dbLimit || 3,
        isActive: true,
        memberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      teams.push(team);

      return create(CreateTeamResponseSchema, {
        team: create(TeamSchema, {
          ...team,
          createdAt: {
            seconds: BigInt(Math.floor(Date.parse(team.createdAt) / 1000)),
            nanos: 0,
          },
          updatedAt: {
            seconds: BigInt(Math.floor(Date.parse(team.updatedAt) / 1000)),
            nanos: 0,
          },
        }),
      });
    },

    // Get team by ID or UUID
    getTeam: async (request: GetTeamRequest) => {
      // The protobuf defines team_id as a string field that can contain either ID or UUID
      const teamIdentifier = request.teamId;

      let team;
      // Try to find by UUID first, then by ID
      team = teams.find((t) => t.uuid === teamIdentifier);
      if (!team) {
        // Try to parse as number for ID lookup
        try {
          const id = BigInt(teamIdentifier);
          team = teams.find((t) => t.id === id);
        } catch {
          // Not a valid number, continue with UUID search result (null)
        }
      }

      if (!team) {
        throw new Error("Team not found");
      }

      const teamResponse = create(TeamSchema, {
        ...team,
        createdAt: {
          seconds: BigInt(Math.floor(Date.parse(team.createdAt) / 1000)),
          nanos: 0,
        },
        updatedAt: {
          seconds: BigInt(Math.floor(Date.parse(team.updatedAt) / 1000)),
          nanos: 0,
        },
      });

      // Include members if requested
      if (request.includeMembers) {
        const members = teamMembers.filter((m) => m.teamUuid === team.uuid);
        teamResponse.members = members.map((member) =>
          create(TeamMemberSchema, {
            ...member,
            teamId: member.teamId,
            subjectRole: create(SubjectRoleSchema, member.subjectRole),
            joinedAt: {
              seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
              nanos: 0,
            },
            lastActiveAt: {
              seconds: BigInt(
                Math.floor(Date.parse(member.lastActiveAt) / 1000)
              ),
              nanos: 0,
            },
          })
        );
      }

      // Include organization if requested
      if (request.includeOrganization) {
        const organization = organizations.find(
          (org) => org.uuid === team.organizationUuid
        );
        if (organization) {
          teamResponse.organization = create(OrganizationSchema, {
            ...organization,
            subjectRole: create(SubjectRoleSchema, organization.subjectRole),
            authentication: create(
              AuthenticationSchema,
              organization.authentication
            ),
          });
        }
      }

      return create(GetTeamResponseSchema, { team: teamResponse });
    },

    // List teams with filtering
    listTeams: async (request: ListTeamsRequest) => {
      let filtered = [...teams];

      // Filter by organization
      if (request.organizationUuid) {
        filtered = filtered.filter(
          (team) => team.organizationUuid === request.organizationUuid
        );
      }

      // Filter by type
      if (request.type) {
        filtered = filtered.filter((team) => team.type === request.type);
      }

      // Filter by permission
      if (request.permission) {
        filtered = filtered.filter(
          (team) => team.permission === request.permission
        );
      }

      // Filter by active status
      if (request.isActive !== undefined) {
        filtered = filtered.filter(
          (team) => team.isActive === request.isActive
        );
      }

      // Pagination
      const pageSize = request.pageSize || 10;
      const pageToken = request.pageToken ? parseInt(request.pageToken) : 0;
      const start = pageToken;
      const end = start + pageSize;
      const paginatedTeams = filtered.slice(start, end);

      const nextPageToken = end < filtered.length ? end.toString() : "";

      const teamsResponse = paginatedTeams.map((team) => {
        const teamProto = create(TeamSchema, {
          ...team,
          createdAt: {
            seconds: BigInt(Math.floor(Date.parse(team.createdAt) / 1000)),
            nanos: 0,
          },
          updatedAt: {
            seconds: BigInt(Math.floor(Date.parse(team.updatedAt) / 1000)),
            nanos: 0,
          },
        });

        // Include members if requested
        if (request.includeMembers) {
          const members = teamMembers.filter((m) => m.teamUuid === team.uuid);
          teamProto.members = members.map((member) =>
            create(TeamMemberSchema, {
              ...member,
              teamId: member.teamId,
              subjectRole: create(SubjectRoleSchema, member.subjectRole),
              joinedAt: {
                seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
                nanos: 0,
              },
              lastActiveAt: {
                seconds: BigInt(
                  Math.floor(Date.parse(member.lastActiveAt) / 1000)
                ),
                nanos: 0,
              },
            })
          );
        }

        return teamProto;
      });

      return create(ListTeamsResponseSchema, {
        teams: teamsResponse,
        nextPageToken,
        totalCount: filtered.length,
      });
    },

    // Update team
    updateTeam: async (request: UpdateTeamRequest) => {
      const teamIndex = teams.findIndex((t) => t.uuid === request.uuid);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }

      const team = teams[teamIndex];
      if (!team) {
        throw new Error("Team not found");
      }

      // Update fields based on update mask or if provided
      if (!request.updateMask || request.updateMask.length === 0) {
        // Update all provided fields
        if (request.name) team.name = request.name;
        if (request.description) team.description = request.description;
        if (request.type !== undefined) team.type = request.type;
        if (request.permission !== undefined)
          team.permission = request.permission;
        if (request.vmLimit !== undefined) team.vmLimit = request.vmLimit;
        if (request.kubernetesLimit !== undefined)
          team.kubernetesLimit = request.kubernetesLimit;
        if (request.dbLimit !== undefined) team.dbLimit = request.dbLimit;
        if (request.isActive !== undefined) team.isActive = request.isActive;
      } else {
        // Update only fields in update mask
        for (const field of request.updateMask) {
          switch (field) {
            case "name":
              if (request.name) team.name = request.name;
              break;
            case "description":
              if (request.description) team.description = request.description;
              break;
            case "type":
              if (request.type !== undefined) team.type = request.type;
              break;
            case "permission":
              if (request.permission !== undefined)
                team.permission = request.permission;
              break;
            case "vm_limit":
              if (request.vmLimit !== undefined) team.vmLimit = request.vmLimit;
              break;
            case "kubernetes_limit":
              if (request.kubernetesLimit !== undefined)
                team.kubernetesLimit = request.kubernetesLimit;
              break;
            case "db_limit":
              if (request.dbLimit !== undefined) team.dbLimit = request.dbLimit;
              break;
            case "is_active":
              if (request.isActive !== undefined)
                team.isActive = request.isActive;
              break;
          }
        }
      }

      team.updatedAt = new Date().toISOString();
      teams[teamIndex] = team;

      return create(UpdateTeamResponseSchema, {
        team: create(TeamSchema, {
          ...team,
          createdAt: {
            seconds: BigInt(Math.floor(Date.parse(team.createdAt) / 1000)),
            nanos: 0,
          },
          updatedAt: {
            seconds: BigInt(Math.floor(Date.parse(team.updatedAt) / 1000)),
            nanos: 0,
          },
        }),
      });
    },

    // Delete team
    deleteTeam: async (request: DeleteTeamRequest) => {
      const teamIndex = teams.findIndex((t) => t.uuid === request.uuid);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }

      const team = teams[teamIndex];
      if (!team) {
        throw new Error("Team not found");
      }

      // Check if team has members
      const members = teamMembers.filter((m) => m.teamUuid === team.uuid);
      if (members.length > 0) {
        return create(DeleteTeamResponseSchema, {
          success: false,
          message: "Cannot delete team with active members",
        });
      }

      // Soft delete - mark as inactive
      team.isActive = false;
      team.updatedAt = new Date().toISOString();

      return create(DeleteTeamResponseSchema, {
        success: true,
        message: "Team deleted successfully",
      });
    },

    // Add team member
    addTeamMember: async (request: AddTeamMemberRequest) => {
      const team = teams.find((t) => t.uuid === request.teamUuid);
      if (!team) {
        throw new Error("Team not found");
      }

      // Check if member already exists
      const existingMember = teamMembers.find(
        (m) => m.teamUuid === request.teamUuid && m.email === request.email
      );
      if (existingMember) {
        throw new Error("Member already exists in this team");
      }

      const member = {
        id: `member-uuid-${nextMemberId++}`,
        teamId: team.id,
        teamUuid: team.uuid,
        teamName: team.name,
        email: request.email,
        name: request.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.email}`,
        twoFactorAuthEnabled: false,
        hasSecureLogin: false,
        signInMethod: SignInMethod.PASSWORD,
        role: request.role || TeamMemberRole.MEMBER,
        status: TeamMemberStatus.PENDING,
        subjectRole: {
          uuid: generateUUID(),
          name: getRoleName(request.role || TeamMemberRole.MEMBER),
          description: getRoleDescription(
            request.role || TeamMemberRole.MEMBER
          ),
        },
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOrganizationOwner: false,
        permissions:
          request.permissions ||
          getDefaultPermissions(request.role || TeamMemberRole.MEMBER),
      };

      teamMembers.push(member);

      // Update team member count
      team.memberCount++;
      team.updatedAt = new Date().toISOString();

      return create(AddTeamMemberResponseSchema, {
        member: create(TeamMemberSchema, {
          ...member,
          teamId: member.teamId,
          subjectRole: create(SubjectRoleSchema, member.subjectRole),
          joinedAt: {
            seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
            nanos: 0,
          },
          lastActiveAt: {
            seconds: BigInt(Math.floor(Date.parse(member.lastActiveAt) / 1000)),
            nanos: 0,
          },
        }),
      });
    },

    // Remove team member
    removeTeamMember: async (request: RemoveTeamMemberRequest) => {
      const memberIndex = teamMembers.findIndex(
        (m) => m.teamUuid === request.teamUuid && m.id === request.memberId
      );
      if (memberIndex === -1) {
        throw new Error("Member not found");
      }

      const member = teamMembers[memberIndex];
      if (!member) {
        throw new Error("Member not found");
      }

      // Don't allow removing the last owner
      if (member.role === TeamMemberRole.OWNER) {
        const otherOwners = teamMembers.filter(
          (m) =>
            m.teamUuid === request.teamUuid &&
            m.id !== request.memberId &&
            m.role === TeamMemberRole.OWNER
        );
        if (otherOwners.length === 0) {
          return create(RemoveTeamMemberResponseSchema, {
            success: false,
            message: "Cannot remove the last owner of the team",
          });
        }
      }

      // Remove member
      teamMembers.splice(memberIndex, 1);

      // Update team member count
      const team = teams.find((t) => t.uuid === request.teamUuid);
      if (team) {
        team.memberCount--;
        team.updatedAt = new Date().toISOString();
      }

      return create(RemoveTeamMemberResponseSchema, {
        success: true,
        message: "Member removed successfully",
      });
    },

    // Update team member
    updateTeamMember: async (request: UpdateTeamMemberRequest) => {
      const memberIndex = teamMembers.findIndex(
        (m) => m.teamUuid === request.teamUuid && m.id === request.memberId
      );
      if (memberIndex === -1) {
        throw new Error("Member not found");
      }

      const member = teamMembers[memberIndex];
      if (!member) {
        throw new Error("Member not found");
      }

      // Update fields based on update mask
      if (!request.updateMask || request.updateMask.length === 0) {
        // Update all provided fields
        if (request.role !== undefined) {
          member.role = request.role;
          member.subjectRole = {
            uuid: member.subjectRole.uuid,
            name: getRoleName(request.role),
            description: getRoleDescription(request.role),
          };
        }
        if (request.status !== undefined) member.status = request.status;
        if (request.permissions) member.permissions = request.permissions;
      } else {
        // Update only fields in update mask
        for (const field of request.updateMask) {
          switch (field) {
            case "role":
              if (request.role !== undefined) {
                member.role = request.role;
                member.subjectRole = {
                  uuid: member.subjectRole.uuid,
                  name: getRoleName(request.role),
                  description: getRoleDescription(request.role),
                };
              }
              break;
            case "status":
              if (request.status !== undefined) member.status = request.status;
              break;
            case "permissions":
              if (request.permissions) member.permissions = request.permissions;
              break;
          }
        }
      }

      member.lastActiveAt = new Date().toISOString();
      teamMembers[memberIndex] = member;

      return create(UpdateTeamMemberResponseSchema, {
        member: create(TeamMemberSchema, {
          ...member,
          teamId: member.teamId,
          subjectRole: create(SubjectRoleSchema, member.subjectRole),
          joinedAt: {
            seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
            nanos: 0,
          },
          lastActiveAt: {
            seconds: BigInt(Math.floor(Date.parse(member.lastActiveAt) / 1000)),
            nanos: 0,
          },
        }),
      });
    },

    // List team members
    listTeamMembers: async (request: ListTeamMembersRequest) => {
      let filtered = teamMembers.filter((m) => m.teamUuid === request.teamUuid);

      // Filter by role
      if (request.role) {
        filtered = filtered.filter((m) => m.role === request.role);
      }

      // Filter by status
      if (request.status) {
        filtered = filtered.filter((m) => m.status === request.status);
      }

      // Pagination
      const pageSize = request.pageSize || 10;
      const pageToken = request.pageToken ? parseInt(request.pageToken) : 0;
      const start = pageToken;
      const end = start + pageSize;
      const paginatedMembers = filtered.slice(start, end);

      const nextPageToken = end < filtered.length ? end.toString() : "";

      return create(ListTeamMembersResponseSchema, {
        members: paginatedMembers.map((member) =>
          create(TeamMemberSchema, {
            ...member,
            teamId: member.teamId,
            subjectRole: create(SubjectRoleSchema, member.subjectRole),
            joinedAt: {
              seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
              nanos: 0,
            },
            lastActiveAt: {
              seconds: BigInt(
                Math.floor(Date.parse(member.lastActiveAt) / 1000)
              ),
              nanos: 0,
            },
          })
        ),
        nextPageToken,
        totalCount: filtered.length,
      });
    },
  });
}

// Helper functions
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getRoleName(role: TeamMemberRole): string {
  switch (role) {
    case TeamMemberRole.OWNER:
      return "Owner";
    case TeamMemberRole.ADMIN:
      return "Admin";
    case TeamMemberRole.MEMBER:
      return "Member";
    case TeamMemberRole.VIEWER:
      return "Viewer";
    default:
      return "Member";
  }
}

function getRoleDescription(role: TeamMemberRole): string {
  switch (role) {
    case TeamMemberRole.OWNER:
      return "Full team ownership and management capabilities";
    case TeamMemberRole.ADMIN:
      return "Team administration and member management";
    case TeamMemberRole.MEMBER:
      return "Standard team member with full access";
    case TeamMemberRole.VIEWER:
      return "Read-only access to team resources";
    default:
      return "Standard team member access";
  }
}

function getDefaultPermissions(role: TeamMemberRole): string[] {
  switch (role) {
    case TeamMemberRole.OWNER:
      return ["*"];
    case TeamMemberRole.ADMIN:
      return [
        "team.manage",
        "member.manage",
        "resource.write",
        "resource.read",
      ];
    case TeamMemberRole.MEMBER:
      return ["resource.write", "resource.read"];
    case TeamMemberRole.VIEWER:
      return ["resource.read"];
    default:
      return ["resource.read"];
  }
}
