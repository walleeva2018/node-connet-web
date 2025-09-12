import type { ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  OrganizationService,
  CreateOrganizationRequestSchema,
  CreateOrganizationResponseSchema,
  GetOrganizationRequestSchema,
  GetOrganizationResponseSchema,
  ListOrganizationsRequestSchema,
  ListOrganizationsResponseSchema,
  UpdateOrganizationRequestSchema,
  UpdateOrganizationResponseSchema,
  DeleteOrganizationRequestSchema,
  DeleteOrganizationResponseSchema,
  OrganizationSchema,
  SubjectRoleSchema,
  AuthenticationSchema,
  OrgOnboardingStep,
  OrganizationStatus,
  Role,
  PaymentTerms,
  AuthenticationStatus,
  type CreateOrganizationRequest,
  type GetOrganizationRequest,
  type ListOrganizationsRequest,
  type UpdateOrganizationRequest,
  type DeleteOrganizationRequest,
} from "./gen/organization/v1/organization_pb.js";
import { createProjectInternal } from "./project.js";

// In-memory storage for demo purposes
export const organizations: Array<{
  id: bigint;
  uuid: string;
  contactEmail: string;
  emailConfirmedAt: string;
  emailVerifiedAt: string;
  name: string;
  displayName: string;
  description: string;
  websiteUrl: string;
  location: string;
  phoneNumber: string;
  dropletLimit: number;
  orgOnboardingStep: OrgOnboardingStep;
  newsletterSubscribed: boolean;
  balance: string;
  usageTotal: string;
  dropletCount: number;
  canBeDeleted: boolean;
  inBadStanding: boolean;
  status: OrganizationStatus;
  avatarInitials: string;
  avatarColor: number;
  tfaEnabled: boolean;
  isArchived: boolean;
  isHold: boolean;
  isVerified: boolean;
  isPaypal: boolean;
  isPartner: boolean;
  isWireTransferEligible: boolean;
  requiresSecureLogin: boolean;
  paymentMethod: string;
  company: string;
  isTrial: boolean;
  role: Role;
  subjectRole: {
    uuid: string;
    name: string;
    description: string;
  };
  convertedPersonalAccount: boolean;
  isAchDebitEligible: boolean;
  isAchwireOnly: boolean;
  paymentTerms: PaymentTerms;
  authentication: {
    status: AuthenticationStatus;
    currentMethods: string[];
    requiredMethods: string[];
  };
}> = [
  {
    id: BigInt(1),
    uuid: "org-uuid-1",
    contactEmail: "contact@org1.com",
    emailConfirmedAt: "",
    emailVerifiedAt: "",
    displayName: "Org One",
    name: "org-one",
    description: "Organization One",
    websiteUrl: "https://org1.com",
    location: "New York, USA",
    phoneNumber: "+1-555-111-1111",
    dropletLimit: 10,
    orgOnboardingStep: OrgOnboardingStep.COMPLETED,
    newsletterSubscribed: true,
    balance: "0.00",
    usageTotal: "0.00",
    dropletCount: 0,
    canBeDeleted: true,
    inBadStanding: false,
    status: OrganizationStatus.OK,
    avatarInitials: "O1",
    avatarColor: 0x007acc,
    tfaEnabled: false,
    isArchived: false,
    isHold: false,
    isVerified: true,
    isPaypal: false,
    isPartner: false,
    isWireTransferEligible: false,
    requiresSecureLogin: false,
    paymentMethod: "credit_card",
    company: "Org One Inc.",
    isTrial: false,
    role: Role.MEMBER,
    subjectRole: {
      uuid: "subrole-uuid-1",
      name: "Owner",
      description: "Full access to org resources",
    },
    convertedPersonalAccount: false,
    isAchDebitEligible: false,
    isAchwireOnly: false,
    paymentTerms: PaymentTerms.TOS,
    authentication: {
      status: AuthenticationStatus.AUTHENTICATED,
      currentMethods: ["email"],
      requiredMethods: ["email"],
    },
  },
  {
    id: BigInt(2),
    uuid: "org-uuid-2",
    contactEmail: "contact@org2.com",
    emailConfirmedAt: "",
    emailVerifiedAt: "",
    displayName: "Org Two",
    name: "org-two",
    description: "Organization Two",
    websiteUrl: "https://org2.com",
    location: "San Francisco, USA",
    phoneNumber: "+1-555-222-2222",
    dropletLimit: 20,
    orgOnboardingStep: OrgOnboardingStep.COMPLETED,
    newsletterSubscribed: false,
    balance: "50.00",
    usageTotal: "10.00",
    dropletCount: 1,
    canBeDeleted: true,
    inBadStanding: false,
    status: OrganizationStatus.OK,
    avatarInitials: "O2",
    avatarColor: 0x28a745,
    tfaEnabled: true,
    isArchived: false,
    isHold: false,
    isVerified: true,
    isPaypal: true,
    isPartner: false,
    isWireTransferEligible: false,
    requiresSecureLogin: true,
    paymentMethod: "paypal",
    company: "Org Two LLC",
    isTrial: true,
    role: Role.OWNER,
    subjectRole: {
      uuid: "subrole-uuid-2",
      name: "Owner",
      description: "Full access to org resources",
    },
    convertedPersonalAccount: false,
    isAchDebitEligible: true,
    isAchwireOnly: false,
    paymentTerms: PaymentTerms.TOS,
    authentication: {
      status: AuthenticationStatus.AUTHENTICATED,
      currentMethods: ["email", "totp"],
      requiredMethods: ["email"],
    },
  },
];

let nextOrgId = 1;

export default function (router: ConnectRouter) {
  router.service(OrganizationService, {
    // Create a new organization
    createOrganization: async (request: CreateOrganizationRequest) => {
      const slug = generateSlug(request.name);

      // Check if organization with this slug already exists
      const existingOrg = organizations.find((org) => org.name === slug);
      if (existingOrg) {
        throw new Error("Organization with this name already exists");
      }

      const organization = {
        id: BigInt(nextOrgId++),
        uuid: generateUUID(),
        contactEmail: "",
        emailConfirmedAt: "",
        emailVerifiedAt: "",
        name: slug,
        displayName: request.displayName,
        description: request.description,
        websiteUrl: request.websiteUrl,
        location: "",
        phoneNumber: "",
        dropletLimit: 25,
        orgOnboardingStep: OrgOnboardingStep.COMPLETED,
        newsletterSubscribed: false,
        balance: "0.00",
        usageTotal: "0.00",
        dropletCount: 0,
        canBeDeleted: true,
        inBadStanding: false,
        status: OrganizationStatus.OK,
        avatarInitials: generateInitials(request.name),
        avatarColor: generateAvatarColor(),
        tfaEnabled: false,
        isArchived: false,
        isHold: false,
        isVerified: false,
        isPaypal: false,
        isPartner: false,
        isWireTransferEligible: false,
        requiresSecureLogin: false,
        paymentMethod: "",
        company: "",
        isTrial: true,
        role: Role.MEMBER,
        subjectRole: {
          uuid: generateUUID(),
          name: "Owner",
          description: "Full access to organization resources and settings",
        },
        convertedPersonalAccount: false,
        isAchDebitEligible: false,
        isAchwireOnly: false,
        paymentTerms: PaymentTerms.TOS,
        authentication: {
          status: AuthenticationStatus.AUTHENTICATED,
          currentMethods: [],
          requiredMethods: ["email"],
        },
      };

      organizations.push(organization);

      createProjectInternal({
        ownerName: organization.name, // org slug
        name: `First Project`,
        description: `Default project for ${organization.displayName}`,
        purpose: "development",
        environment: "dev",
        isDefault: true,
      });

      return create(CreateOrganizationResponseSchema, {
        organization: create(OrganizationSchema, {
          ...organization,
          subjectRole: create(SubjectRoleSchema, organization.subjectRole),
          authentication: create(
            AuthenticationSchema,
            organization.authentication
          ),
        }),
      });
    },

    // Get organization by ID
    getOrganization: async (request: GetOrganizationRequest) => {
      const organization = organizations.find(
        (org) => org.id.toString() === request.id || org.uuid === request.id
      );

      if (!organization) {
        throw new Error("Organization not found");
      }

      return create(GetOrganizationResponseSchema, {
        organization: create(OrganizationSchema, {
          ...organization,
          subjectRole: create(SubjectRoleSchema, organization.subjectRole),
          authentication: create(
            AuthenticationSchema,
            organization.authentication
          ),
        }),
      });
    },

    // List organizations with filtering
    listOrganizations: async (request: ListOrganizationsRequest) => {
      let filtered = [...organizations];

      // Simple pagination
      const pageSize = request.pageSize || 10;
      const pageToken = request.pageToken ? parseInt(request.pageToken) : 0;
      const start = pageToken;
      const end = start + pageSize;
      const paginatedOrgs = filtered.slice(start, end);

      const nextPageToken = end < filtered.length ? end.toString() : "";
      console.log("Filtered Orgs:", filtered);
      console.log("Paginated Orgs:", paginatedOrgs);
      console.log("Next Page Token:", nextPageToken);

      return create(ListOrganizationsResponseSchema, {
        organizations: paginatedOrgs.map((org) =>
          create(OrganizationSchema, {
            ...org,
            subjectRole: create(SubjectRoleSchema, org.subjectRole),
            authentication: create(AuthenticationSchema, org.authentication),
          })
        ),
        nextPageToken,
        totalCount: filtered.length,
      });
    },

    // Update organization
    updateOrganization: async (request: UpdateOrganizationRequest) => {
      const orgIndex = organizations.findIndex(
        (org) => org.uuid === request.uuid
      );
      if (orgIndex === -1) {
        throw new Error("Organization not found");
      }

      const organization = organizations[orgIndex];

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Update fields if provided

      if (request.displayName) {
        organization.displayName = request.displayName;
      }

      if (request.phoneNumber) {
        organization.phoneNumber = request.phoneNumber;
      }
      if (request.company) {
        organization.company = request.company;
      }
      if (request.newsletterSubscribed !== undefined) {
        organization.newsletterSubscribed = request.newsletterSubscribed;
      }
      if (request.dropletLimit) {
        organization.dropletLimit = request.dropletLimit;
      }
      if (request.tfaEnabled !== undefined) {
        organization.tfaEnabled = request.tfaEnabled;
      }

      organizations[orgIndex] = organization;

      return create(UpdateOrganizationResponseSchema, {
        organization: create(OrganizationSchema, {
          ...organization,
          subjectRole: create(SubjectRoleSchema, organization.subjectRole),
          authentication: create(
            AuthenticationSchema,
            organization.authentication
          ),
        }),
      });
    },

    // Delete organization
    deleteOrganization: async (request: DeleteOrganizationRequest) => {
      const orgIndex = organizations.findIndex(
        (org) => org.uuid === request.uuid
      );
      if (orgIndex === -1) {
        throw new Error("Organization not found");
      }

      const organization = organizations[orgIndex];

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Check if organization can be deleted
      if (!organization.canBeDeleted) {
        return create(DeleteOrganizationResponseSchema, {
          success: false,
          message: "Organization cannot be deleted due to active resources",
        });
      }

      // Soft delete - mark as deleted instead of removing
      organization.status = OrganizationStatus.DELETED;
      organization.isArchived = true;

      return create(DeleteOrganizationResponseSchema, {
        success: true,
        message: "Organization deleted successfully",
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateAvatarColor(): number {
  const colors = [
    0x007acc, // Blue
    0x28a745, // Green
    0xdc3545, // Red
    0xffc107, // Yellow
    0x6f42c1, // Purple
    0xfd7e14, // Orange
    0x20c997, // Teal
    0xe83e8c, // Pink
  ];
  return colors[Math.floor(Math.random() * colors.length)]!;
}
