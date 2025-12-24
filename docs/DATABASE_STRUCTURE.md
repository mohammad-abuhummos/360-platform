# Firebase Database Structure

This document describes the Firestore database structure for the 360 Football Platform.

---

## Collections Overview

```
firestore/
├── users/              # User profiles and settings
├── clubs/              # Clubs/teams with membership info
│   └── {clubId}/
│       └── members/    # Club members subcollection
└── video_analyses/     # Video analysis data
```

---

## Collection: `users`

Stores user profile information and club associations.

### Document ID
- **Format:** Firebase Auth UID (e.g., `O6v1mAyfA7fNvt4yHoPb8ltCZ3l1`)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ | User's email address |
| `displayName` | `string` | ✅ | User's display name |
| `role` | `string` | ✅ | User role: `"admin"` \| `"staff"` \| `"player"` |
| `clubIds` | `array<string>` | ✅ | Array of club IDs the user belongs to |
| `activeClubId` | `string \| null` | ✅ | Currently selected/active club ID |
| `createdAt` | `timestamp` | ✅ | Document creation timestamp |
| `updatedAt` | `timestamp` | ✅ | Last update timestamp |

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrator | Full access to all features and clubs |
| `staff` | Staff member | Manage team, view analytics, limited admin |
| `player` | Player | View own data, limited access |

### Example Document

```json
{
  "email": "admin@admin.com",
  "displayName": "Administrator",
  "role": "admin",
  "clubIds": [
    "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-club-lobby",
    "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-jordan-knights-football-club",
    "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-2021"
  ],
  "activeClubId": "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-club-lobby",
  "createdAt": "December 23, 2025 at 5:41:36 PM UTC+3",
  "updatedAt": "December 23, 2025 at 5:41:36 PM UTC+3"
}
```

---

## Collection: `clubs`

Stores club/team information and membership data.

### Document ID
- **Format:** `{ownerUid}-{slug}` (e.g., `O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-jordan-knights-football-club`)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Club display name |
| `slug` | `string` | ✅ | URL-friendly identifier |
| `description` | `string \| null` | ❌ | Club description |
| `tagline` | `string \| null` | ❌ | Short tagline |
| `contactEmail` | `string \| null` | ❌ | Contact email for the club |
| `displayOrder` | `number` | ✅ | Sort order in UI |
| `ownerUid` | `string` | ✅ | UID of the club owner |
| `membershipRole` | `string` | ✅ | Default membership role: `"Administrator"` \| `"Staff"` \| `"Player"` |
| `memberIds` | `array<string>` | ✅ | Array of user UIDs who are members |
| `memberships` | `map` | ✅ | Detailed membership info per user |
| `membersSeeded` | `boolean` | ❌ | Flag indicating if default members were seeded |
| `createdAt` | `timestamp` | ✅ | Document creation timestamp |
| `updatedAt` | `timestamp` | ✅ | Last update timestamp |

### Memberships Map Structure

```typescript
memberships: {
  [userId: string]: {
    role: "Administrator" | "Staff" | "Player";
    status: "active" | "invited";
    assignedAt: Timestamp;
  }
}
```

### Membership Roles

| Role | Description |
|------|-------------|
| `Administrator` | Full club management access |
| `Staff` | Can manage team members, view all data |
| `Player` | Basic member access |

### Example Document

```json
{
  "name": "Jordan Knights Football Club",
  "slug": "jordan-knights-football-club",
  "description": null,
  "tagline": null,
  "contactEmail": "admin@admin.com",
  "displayOrder": 2,
  "ownerUid": "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1",
  "membershipRole": "Administrator",
  "memberIds": [
    "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1",
    "5CHgZtPIhWcxtR9sXOfDku7Au883"
  ],
  "memberships": {
    "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1": {
      "role": "Administrator",
      "status": "active",
      "assignedAt": "December 23, 2025 at 5:41:36 PM UTC+3"
    },
    "5CHgZtPIhWcxtR9sXOfDku7Au883": {
      "role": "Administrator",
      "status": "active",
      "assignedAt": "December 24, 2025 at 8:11:22 AM UTC+3"
    }
  },
  "createdAt": "December 23, 2025 at 5:41:36 PM UTC+3",
  "updatedAt": "December 24, 2025 at 8:11:22 AM UTC+3"
}
```

---

## Subcollection: `clubs/{clubId}/members`

Stores detailed member information for each club (team roster).

### Document ID
- **Format:** Auto-generated Firestore ID

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Member's full name |
| `initials` | `string` | ✅ | 2-letter initials (e.g., "MM") |
| `email` | `string` | ✅ | Member's email address |
| `role` | `string` | ✅ | Member role: `"User"` \| `"Staff"` \| `"Admin"` |
| `title` | `string \| null` | ❌ | Position/title (e.g., "Forward · U18") |
| `segment` | `string` | ✅ | Member segment: `"player"` \| `"staff"` |
| `status` | `string` | ✅ | Membership status: `"active"` \| `"invited"` |
| `clubId` | `string` | ✅ | Parent club ID |
| `createdAt` | `timestamp` | ✅ | Document creation timestamp |
| `updatedAt` | `timestamp` | ✅ | Last update timestamp |

### Member Roles (in members subcollection)

| Role | Description |
|------|-------------|
| `Admin` | Club administrator |
| `Staff` | Staff member (coach, coordinator, etc.) |
| `User` | Regular member/player |

### Example Document

```json
{
  "name": "Abdallah Kanash",
  "initials": "AK",
  "email": "abdallah.kanash@smt.com.jo",
  "role": "Admin",
  "title": "Head coach",
  "segment": "staff",
  "status": "active",
  "clubId": "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-jordan-knights-football-club",
  "createdAt": "December 23, 2025 at 5:41:36 PM UTC+3",
  "updatedAt": "December 23, 2025 at 5:41:36 PM UTC+3"
}
```

---

## Collection: `video_analyses`

Stores video analysis sessions with clips and annotations.

### Document ID
- **Format:** Auto-generated Firestore ID

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Analysis name/title |
| `description` | `string` | ❌ | Analysis description |
| `videoFileName` | `string` | ❌ | Original video file name |
| `videoDuration` | `number` | ❌ | Video duration in seconds |
| `canvasWidth` | `number` | ❌ | Canvas width for annotations |
| `canvasHeight` | `number` | ❌ | Canvas height for annotations |
| `clips` | `array<Clip>` | ✅ | Array of video clips |
| `annotations` | `array<Annotation>` | ✅ | Array of annotations |
| `createdAt` | `timestamp` | ✅ | Document creation timestamp |
| `updatedAt` | `timestamp` | ✅ | Last update timestamp |

### Clip Structure

```typescript
{
  id: string;
  name: string;
  startTime: number;      // seconds
  endTime: number;        // seconds
  duration: number;       // seconds
  type: string;
  description?: string;
}
```

### Annotation Structure

```typescript
{
  id: string;
  type: 'text' | 'circle' | 'spotlight' | 'line' | 'arrow' | 'polygon';
  clipId: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  text?: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     RELATIONSHIPS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐         ┌─────────┐         ┌─────────────┐   │
│  │  users  │◄───────►│  clubs  │────────►│   members   │   │
│  └─────────┘         └─────────┘         │(subcollection)│  │
│       │                   │              └─────────────┘   │
│       │                   │                                 │
│       │    clubIds[]      │    memberIds[]                 │
│       │    activeClubId   │    memberships{}               │
│       │                   │                                 │
│       ▼                   ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   ID FORMAT                          │   │
│  │  clubs/{ownerUid}-{slug}                            │   │
│  │  users/{authUid}                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Default Clubs

When a new admin user is created, the following clubs are seeded:

| Slug | Name | Default Role | Order |
|------|------|--------------|-------|
| `club-lobby` | Club lobby | Administrator | 1 |
| `jordan-knights-football-club` | Jordan Knights Football Club | Administrator | 2 |
| `2021` | 2021 | Staff | 3 |
| `al-aqaba` | Al-Aqaba | Administrator | 4 |
| `al-ramtha` | Al-Ramtha | Administrator | 5 |
| `al-salt` | Al-Salt | Administrator | 6 |
| `amman` | Amman | Player | 7 |
| `club-youth-teams` | Club Youth Teams | Administrator | 8 |
| `dev` | Dev | Player | 9 |
| `grassroots` | Grassroots | Administrator | 10 |

---

## Security Considerations

1. **User documents** should only be readable/writable by the user themselves or admins
2. **Club documents** should be readable by members, writable by admins/owners
3. **Members subcollection** should follow club-level permissions
4. **Video analyses** should have club-based access control

---

## TypeScript Types Reference

See the following files for TypeScript type definitions:
- `app/lib/firestore-users.ts` - User and Club types
- `app/lib/firestore-team.ts` - ClubMember types
- `app/lib/firebase.ts` - VideoAnalysis types

