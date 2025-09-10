# User Service API Documentation

This document provides `curl` examples for interacting with the `UserService` gRPC-Web endpoints.

---

## Base URL
```
http://localhost:8080/user.v1.UserService/
```

---

## 1. Fetch User

**Endpoint:**
`/FetchUser`

**Description:**
Fetches the current user's details.

**Request Body:**
```json
{}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/user.v1.UserService/FetchUser \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Data Model

### User Object
| Field                | Type          | Description                                      |
|----------------------|---------------|--------------------------------------------------|
| id                   | bigint        | Unique identifier for the user                  |
| uuid                 | string        | UUID for the user                                |
| email                | string        | User's email address                             |
| name                 | string        | User's username                                  |
| displayName          | string        | User's display name                              |
| location             | string        | User's location                                   |
| phoneNumber          | string        | User's phone number                              |
| dropletLimit         | number        | Maximum number of droplets allowed               |
| onboardingStep       | OnboardingStep| Current onboarding step                          |
| newsletterSubscribed | boolean       | Whether the user is subscribed to newsletters    |
| balance              | string        | User's account balance                           |
| credit               | string        | User's available credit                          |
| usageTotal           | string        | Total usage                                       |
| dropletCount         | number        | Number of droplets currently in use              |
| canBeDeleted         | boolean       | Whether the user can be deleted                  |
| inBadStanding        | boolean       | Whether the user is in bad standing              |
| status               | UserStatus    | Current status of the user                       |
| tfaEnabled           | boolean       | Whether two-factor authentication is enabled     |
| avatar               | string        | URL to the user's avatar                          |
| isHold               | boolean       | Whether the user is on hold                       |
| isVerified           | boolean       | Whether the user is verified                      |
| isPartner            | boolean       | Whether the user is a partner                     |
| isVendor             | boolean       | Whether the user is a vendor                      |
| isPaypal             | boolean       | Whether the user uses PayPal                      |
| onboardingOrigin     | string        | Origin of the user's onboarding                  |
| paymentMethod        | string        | User's payment method                             |
| navMessage           | string        | Navigation message for the user                  |
| createdAt            | string        | When the user was created                         |
| company              | string        | User's company                                    |
| twoFactorMethods     | TwoFactorMethod[] | List of enabled 2FA methods                  |
| hasSecureLogin       | boolean       | Whether the user has secure login enabled         |
| isTrial              | boolean       | Whether the user is on a trial                   |
| authnType            | AuthType      | Authentication type                               |
| teamLimit            | number        | Maximum number of team members allowed           |
| credits              | Credit[]      | List of user's credits                            |
| bankMachineResult    | string        | Result of bank machine verification               |
| organizations        | Organization[] | List of organizations the user belongs to       |

---

## Enums

### OnboardingStep
| Value       | Description                |
|-------------|----------------------------|
| NOT_STARTED | Onboarding not started      |
| ACTIVATED   | Onboarding completed       |

### UserStatus
| Value       | Description                |
|-------------|----------------------------|
| OK          | User is active             |
| SUSPENDED   | User is suspended          |

### AuthType
| Value         | Description                |
|---------------|----------------------------|
| GOOGLE_OAUTH  | Google OAuth authentication|
| EMAIL         | Email authentication        |

### TwoFactorMethod
| Value         | Description                |
|---------------|----------------------------|
| EMAIL         | Email-based 2FA            |
| TOTP          | TOTP-based 2FA             |

---
```