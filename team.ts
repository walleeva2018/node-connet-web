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
  TeamSchema,
  TeamMemberSchema,
  TeamType,
  MemberRole,
  type CreateTeamRequest,
  type GetTeamRequest,
  type ListTeamsRequest,
  type UpdateTeamRequest,
  type DeleteTeamRequest,
} from "./gen/team/v1/team_pb.js";

// In-memory storage for teams
export const teams: Array<{
  id: string;
  name: string;
  description: string;
  organizationId: string;
  organizationName: string;
  type: TeamType;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "team-1",
    name: "Engineering Team",
    description: "Core engineering and development team",
    organizationId: "org-one",
    organizationName: "TechCorp Inc",
    type: TeamType.DEVELOPMENT,
    memberCount: 5,
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-12-01").toISOString(),
  },
  {
    id: "team-2",
    name: "DevOps Team",
    description: "Infrastructure and operations team",
    organizationId: "org-two",
    organizationName: "TechCorp Inc",
    type: TeamType.DEVOPS,
    memberCount: 3,
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-11-15").toISOString(),
  },
  {
    id: "team-3",
    name: "Marketing Team",
    description: "Marketing and growth team",
    organizationId: "org-2",
    organizationName: "Growth Co",
    type: TeamType.MARKETING,
    memberCount: 4,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-10-20").toISOString(),
  },
];
let nextTeamId = 4;
const randomuuid = `yuid-${Math.random().toString(36).substring(2, 10)}`;
const defaultOwner = {
  id: randomuuid,
  name: "John Doe",
  email: "john.doe@example.com",
  role: MemberRole.OWNER,
  joinedAt: new Date().toISOString(),
  teamId: `team-${nextTeamId++}`,
};

// In-memory storage for team members
export const teamMembers: Array<{
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
  teamId: string;
}> = [
  // Team 1 Members
  {
    id: "member-1",
    name: "John Doe",
    email: "john.doe@techcorp.com",
    role: MemberRole.OWNER,
    joinedAt: new Date("2024-01-15").toISOString(),
    teamId: "team-1",
  },
  {
    id: "member-2",
    name: "Jane Smith",
    email: "jane.smith@techcorp.com",
    role: MemberRole.ADMIN,
    joinedAt: new Date("2024-02-01").toISOString(),
    teamId: "team-1",
  },
  {
    id: "member-3",
    name: "Bob Wilson",
    email: "bob.wilson@techcorp.com",
    role: MemberRole.MEMBER,
    joinedAt: new Date("2024-03-15").toISOString(),
    teamId: "team-1",
  },
  // Team 2 Members
  {
    id: "member-4",
    name: "Alice Johnson",
    email: "alice.johnson@techcorp.com",
    role: MemberRole.ADMIN,
    joinedAt: new Date("2024-02-01").toISOString(),
    teamId: "team-2",
  },
  // Team 3 Members
  {
    id: "member-5",
    name: "Sarah Parker",
    email: "sarah.parker@growthco.com",
    role: MemberRole.OWNER,
    joinedAt: new Date("2024-03-10").toISOString(),
    teamId: "team-3",
  },
];

export default function (router: ConnectRouter) {
  router.service(TeamService, {
    // Create a new team
    createTeam: async (request: CreateTeamRequest) => {
      const newTeamId = `team-${nextTeamId++}`;
      const createdAt = new Date().toISOString();

      const team = {
        id: newTeamId,
        name: request.name,
        description: request.description,
        organizationId: request.organizationId,
        organizationName: getOrganizationName(request.organizationId),
        type: request.type,
        memberCount: 1,
        createdAt,
        updatedAt: createdAt,
      };

      teams.push(team);

      const yuid = `yuid-${Math.random().toString(36).substring(2, 10)}`;
      const owner = {
        id: yuid,
        name: "John Doe",
        email: "john.doe@example.com",
        role: MemberRole.OWNER,
        joinedAt: createdAt,
        teamId: newTeamId,
      };

      teamMembers.push(owner);

      return create(CreateTeamResponseSchema, {
        team: create(TeamSchema, {
          ...team,
          members: [
            create(TeamMemberSchema, {
              ...owner,
              joinedAt: {
                seconds: BigInt(Math.floor(Date.parse(owner.joinedAt) / 1000)),
                nanos: 0,
              },
            }),
          ],
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

    // Get team by ID
    getTeam: async (request: GetTeamRequest) => {
      const team = teams.find((t) => t.id === request.id);
      if (!team) {
        throw new Error("Team not found");
      }

      const members = teamMembers
        .filter((m) => m.teamId === team.id)
        .map((member) =>
          create(TeamMemberSchema, {
            ...member,
            joinedAt: {
              seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
              nanos: 0,
            },
          })
        );

      return create(GetTeamResponseSchema, {
        team: create(TeamSchema, {
          ...team,
          members,
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

    // List teams with filtering
    listTeams: async (request: ListTeamsRequest) => {
      let filtered = [...teams];

      // Filter by organization
      if (request.organizationId) {
        filtered = filtered.filter(
          (team) => team.organizationId === request.organizationId
        );
      }

      const teamsResponse = filtered.map((team) => {
        const members = teamMembers
          .filter((m) => m.teamId === team.id)
          .map((member) =>
            create(TeamMemberSchema, {
              ...member,
              joinedAt: {
                seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
                nanos: 0,
              },
            })
          );

        return create(TeamSchema, {
          ...team,
          members,
          createdAt: {
            seconds: BigInt(Math.floor(Date.parse(team.createdAt) / 1000)),
            nanos: 0,
          },
          updatedAt: {
            seconds: BigInt(Math.floor(Date.parse(team.updatedAt) / 1000)),
            nanos: 0,
          },
        });
      });

      return create(ListTeamsResponseSchema, {
        teams: teamsResponse,
        nextPageToken: "",
        totalCount: filtered.length,
      });
    },

    // Update team
    updateTeam: async (request: UpdateTeamRequest) => {
      const teamIndex = teams.findIndex((t) => t.id === request.id);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }

      const team = teams[teamIndex];
      if (!team) {
        throw new Error("Team not found");
      }

      // Update fields if provided
      if (request.name) team.name = request.name;
      if (request.description) team.description = request.description;
      if (request.type !== undefined) team.type = request.type;

      team.updatedAt = new Date().toISOString();
      teams[teamIndex] = team;

      const members = teamMembers
        .filter((m) => m.teamId === team.id)
        .map((member) =>
          create(TeamMemberSchema, {
            ...member,
            joinedAt: {
              seconds: BigInt(Math.floor(Date.parse(member.joinedAt) / 1000)),
              nanos: 0,
            },
          })
        );

      return create(UpdateTeamResponseSchema, {
        team: create(TeamSchema, {
          ...team,
          members,
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
      const teamIndex = teams.findIndex((t) => t.id === request.id);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }

      // Check if team has members
      const members = teamMembers.filter((m) => m.teamId === request.id);
      if (members.length > 0) {
        return create(DeleteTeamResponseSchema, {
          success: false,
        });
      }

      // Remove team
      teams.splice(teamIndex, 1);

      return create(DeleteTeamResponseSchema, {
        success: true,
      });
    },
  });
}

function getOrganizationName(organizationId: string): string {
  const orgNames: Record<string, string> = {
    "org-1": "TechCorp Inc",
    "org-2": "Growth Co",
    "org-3": "StartupXYZ",
  };
  return orgNames[organizationId] || "Unknown Organization";
}

export async function createTeamWithDefaultOwner(request: CreateTeamRequest) {
  const newTeamId = `team-${nextTeamId++}`;
  const createdAt = new Date().toISOString();

  const newTeam = {
    id: newTeamId,
    name: request.name,
    description: request.description,
    organizationId: request.organizationId,
    organizationName: getOrganizationName(request.organizationId),
    type: request.type || TeamType.DEVELOPMENT,
    memberCount: 1,
    createdAt,
    updatedAt: createdAt,
  };

  teams.push(newTeam);

  const yuid = `yuid-${Math.random().toString(36).substring(2, 10)}`;

  const defaultOwner = {
    id: yuid,
    name: "John Doe",
    email: "john.doe@example.com",
    role: MemberRole.OWNER,
    joinedAt: createdAt,
    teamId: newTeamId,
  };

  teamMembers.push(defaultOwner);

  return {
    team: create(TeamSchema, {
      ...newTeam,
      members: [
        create(TeamMemberSchema, {
          ...defaultOwner,
          joinedAt: {
            seconds: BigInt(Math.floor(Date.parse(createdAt) / 1000)),
            nanos: 0,
          },
        }),
      ],
      createdAt: {
        seconds: BigInt(Math.floor(Date.parse(createdAt) / 1000)),
        nanos: 0,
      },
      updatedAt: {
        seconds: BigInt(Math.floor(Date.parse(createdAt) / 1000)),
        nanos: 0,
      },
    }),
  };
}
