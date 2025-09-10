import type { ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  UserService,
  FetchUserRequestSchema,
  FetchUserResponseSchema,
  UserSchema,
  CreditSchema,
  TwoFactorMethodsSchema,
  OnboardingStep,
  UserStatus,
  AuthType,
  TwoFactorMethod,
  type FetchUserRequest,
} from "./gen/user/v1/user_pb.js";

import {
  OrganizationSchema,
  OrgOnboardingStep,
  OrganizationStatus,
  Role,
  PaymentTerms,
  AuthenticationStatus,
  type Organization,
} from "./gen/organization/v1/organization_pb.js";

import { organizations } from "./organization.js";
// Dummy organizations for demo

// In-memory users with demo data
const users = [
  {
    id: 1,
    uuid: "user-uuid-1",
    email: "johndoe@example.com",
    name: "john_doe",
    displayName: "John Doe",
    location: "New York, USA",
    phoneNumber: "+1-555-123-4567",
    dropletLimit: 25,
    onboardingStep: OnboardingStep.ACTIVATED,
    newsletterSubscribed: true,
    balance: "100.00",
    credit: "50.00",
    usageTotal: "20.00",
    dropletCount: 2,
    canBeDeleted: true,
    inBadStanding: false,
    status: UserStatus.OK,
    tfaEnabled: true,
    avatar: "https://ui-avatars.com/api/?name=JD&background=007acc&color=fff",
    isHold: false,
    isVerified: true,
    isPartner: false,
    isVendor: false,
    isPaypal: false,
    onboardingOrigin: "web",
    paymentMethod: "credit_card",
    navMessage: "Welcome back!",
    createdAt: new Date().toISOString(),
    company: "Example Inc.",
    twoFactorMethods: [TwoFactorMethod.EMAIL, TwoFactorMethod.TOTP],
    hasSecureLogin: true,
    isTrial: false,
    authnType: AuthType.GOOGLE_OAUTH,
    teamLimit: 5,
    credits: [
      {
        id: "cred-1",
        amount: "50.00",
        description: "Initial Credit",
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    bankMachineResult: "passed",
    organizations: [], // reference org IDs
    password: "password123", // only for demo
  },
];

export default function (router: ConnectRouter) {
  router.service(UserService, {
    fetchUser: async (request: FetchUserRequest) => {
      const user = users[0];
      if (!user) throw new Error("User not found");

      // Map user's organization IDs to actual organization objects

      return create(FetchUserResponseSchema, {
        user: create(UserSchema, {
          ...user,
          id: BigInt(user.id),
          twoFactorMethods: create(TwoFactorMethodsSchema, {
            methods: user.twoFactorMethods,
          }),
          credits: user.credits.map((c) => create(CreditSchema, c)),
          organizations: organizations,
        }),
      });
    },
  });
}
