# Firebase Database Structure

This document describes the Firestore database structure for the 360 Football Platform.

---

## Collections Overview

```
firestore/
├── users/                          # User profiles and settings
├── clubs/                          # Clubs/teams with membership info
│   └── {clubId}/
│       ├── members/                # Club members subcollection
│       ├── conversations/          # Chat conversations
│       │   └── {conversationId}/
│       │       └── messages/       # Chat messages
│       ├── events/                 # Calendar events
│       │   └── {eventId}/
│       │       └── comments/       # Event comments
│       ├── registrations/          # Registration forms
│       └── registration_categories/ # Registration categories
└── video_analyses/                 # Video analysis data
```

---

## Collection: `users`

Stores user profile information and club associations.

### Document ID

- **Format:** Firebase Auth UID (e.g., `O6v1mAyfA7fNvt4yHoPb8ltCZ3l1`)

### Fields

| Field          | Type             | Required | Description                                     |
| -------------- | ---------------- | -------- | ----------------------------------------------- |
| `email`        | `string`         | ✅       | User's email address                            |
| `displayName`  | `string`         | ✅       | User's display name                             |
| `role`         | `string`         | ✅       | User role: `"admin"` \| `"staff"` \| `"player"` |
| `clubIds`      | `array<string>`  | ✅       | Array of club IDs the user belongs to           |
| `activeClubId` | `string \| null` | ✅       | Currently selected/active club ID               |
| `createdAt`    | `timestamp`      | ✅       | Document creation timestamp                     |
| `updatedAt`    | `timestamp`      | ✅       | Last update timestamp                           |

### User Roles

| Role     | Description   | Permissions                                |
| -------- | ------------- | ------------------------------------------ |
| `admin`  | Administrator | Full access to all features and clubs      |
| `staff`  | Staff member  | Manage team, view analytics, limited admin |
| `player` | Player        | View own data, limited access              |

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

| Field            | Type             | Required | Description                                                           |
| ---------------- | ---------------- | -------- | --------------------------------------------------------------------- |
| `name`           | `string`         | ✅       | Club display name                                                     |
| `slug`           | `string`         | ✅       | URL-friendly identifier                                               |
| `description`    | `string \| null` | ❌       | Club description                                                      |
| `tagline`        | `string \| null` | ❌       | Short tagline                                                         |
| `contactEmail`   | `string \| null` | ❌       | Contact email for the club                                            |
| `displayOrder`   | `number`         | ✅       | Sort order in UI                                                      |
| `ownerUid`       | `string`         | ✅       | UID of the club owner                                                 |
| `membershipRole` | `string`         | ✅       | Default membership role: `"Administrator"` \| `"Staff"` \| `"Player"` |
| `memberIds`      | `array<string>`  | ✅       | Array of user UIDs who are members                                    |
| `memberships`    | `map`            | ✅       | Detailed membership info per user                                     |
| `membersSeeded`  | `boolean`        | ❌       | Flag indicating if default members were seeded                        |
| `createdAt`      | `timestamp`      | ✅       | Document creation timestamp                                           |
| `updatedAt`      | `timestamp`      | ✅       | Last update timestamp                                                 |

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

| Role            | Description                            |
| --------------- | -------------------------------------- |
| `Administrator` | Full club management access            |
| `Staff`         | Can manage team members, view all data |
| `Player`        | Basic member access                    |

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
  "memberIds": ["O6v1mAyfA7fNvt4yHoPb8ltCZ3l1", "5CHgZtPIhWcxtR9sXOfDku7Au883"],
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

| Field       | Type             | Required | Description                                     |
| ----------- | ---------------- | -------- | ----------------------------------------------- |
| `name`      | `string`         | ✅       | Member's full name                              |
| `initials`  | `string`         | ✅       | 2-letter initials (e.g., "MM")                  |
| `email`     | `string`         | ✅       | Member's email address                          |
| `role`      | `string`         | ✅       | Member role: `"User"` \| `"Staff"` \| `"Admin"` |
| `title`     | `string \| null` | ❌       | Position/title (e.g., "Forward · U18")          |
| `segment`   | `string`         | ✅       | Member segment: `"player"` \| `"staff"`         |
| `status`    | `string`         | ✅       | Membership status: `"active"` \| `"invited"`    |
| `clubId`    | `string`         | ✅       | Parent club ID                                  |
| `createdAt` | `timestamp`      | ✅       | Document creation timestamp                     |
| `updatedAt` | `timestamp`      | ✅       | Last update timestamp                           |

### Member Roles (in members subcollection)

| Role    | Description                             |
| ------- | --------------------------------------- |
| `Admin` | Club administrator                      |
| `Staff` | Staff member (coach, coordinator, etc.) |
| `User`  | Regular member/player                   |

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

## Subcollection: `clubs/{clubId}/conversations`

Stores chat conversations/groups for each club.

### Document ID

- **Format:** Auto-generated Firestore ID

### Fields

| Field              | Type                   | Required | Description                                                                                       |
| ------------------ | ---------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `clubId`           | `string`               | ✅       | Parent club ID                                                                                    |
| `type`             | `string`               | ✅       | Conversation type: `"direct"` \| `"group"`                                                        |
| `name`             | `string`               | ✅       | Conversation/group name                                                                           |
| `description`      | `string \| null`       | ❌       | Group description                                                                                 |
| `avatarUrl`        | `string \| null`       | ❌       | Group avatar URL                                                                                  |
| `initials`         | `string`               | ✅       | 2-letter initials for avatar fallback                                                             |
| `participantIds`   | `array<string>`        | ✅       | Array of participant user IDs                                                                     |
| `participantNames` | `map<string, string>`  | ✅       | Map of userId to display name                                                                     |
| `adminIds`         | `array<string>`        | ✅       | Array of admin user IDs                                                                           |
| `createdBy`        | `string`               | ✅       | User ID who created the conversation                                                              |
| `lastMessage`      | `object \| null`       | ❌       | Last message preview (see below)                                                                  |
| `unreadCount`      | `map<string, number>`  | ✅       | Map of userId to unread count                                                                     |
| `tag`              | `string`               | ✅       | Category tag: `"Teams"` \| `"Staff"` \| `"Media"` \| `"Parents"` \| `"Scheduling"` \| `"General"` |
| `isPinned`         | `map<string, boolean>` | ✅       | Map of userId to pinned status                                                                    |
| `isMuted`          | `map<string, boolean>` | ✅       | Map of userId to muted status                                                                     |
| `createdAt`        | `timestamp`            | ✅       | Document creation timestamp                                                                       |
| `updatedAt`        | `timestamp`            | ✅       | Last update timestamp                                                                             |

### LastMessage Structure

```typescript
{
  content: string; // Message preview text
  senderId: string; // Sender's user ID
  senderName: string; // Sender's display name
  type: "text" | "image" | "video" | "file" | "voice";
  timestamp: Timestamp;
}
```

### Example Document

```json
{
  "clubId": "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-jordan-knights-football-club",
  "type": "group",
  "name": "Coaches",
  "description": "Staff coordination and planning",
  "initials": "CH",
  "participantIds": ["userId1", "userId2", "userId3"],
  "participantNames": {
    "userId1": "Bashar",
    "userId2": "Abed",
    "userId3": "Sarah"
  },
  "adminIds": ["userId1"],
  "createdBy": "userId1",
  "lastMessage": {
    "content": "Let's schedule the next training session",
    "senderId": "userId2",
    "senderName": "Abed",
    "type": "text",
    "timestamp": "December 24, 2025 at 10:30:00 AM UTC+3"
  },
  "unreadCount": {
    "userId1": 0,
    "userId2": 0,
    "userId3": 2
  },
  "tag": "Staff",
  "isPinned": { "userId1": true },
  "isMuted": {},
  "createdAt": "December 24, 2025 at 8:00:00 AM UTC+3",
  "updatedAt": "December 24, 2025 at 10:30:00 AM UTC+3"
}
```

---

## Subcollection: `clubs/{clubId}/conversations/{conversationId}/messages`

Stores chat messages within each conversation.

### Document ID

- **Format:** Auto-generated Firestore ID

### Fields

| Field            | Type                | Required | Description                                                               |
| ---------------- | ------------------- | -------- | ------------------------------------------------------------------------- |
| `conversationId` | `string`            | ✅       | Parent conversation ID                                                    |
| `clubId`         | `string`            | ✅       | Parent club ID                                                            |
| `senderId`       | `string`            | ✅       | Sender's user ID                                                          |
| `senderName`     | `string`            | ✅       | Sender's display name                                                     |
| `senderInitials` | `string`            | ✅       | Sender's initials                                                         |
| `senderRole`     | `string`            | ✅       | Sender's role (e.g., "Administrator", "Coach")                            |
| `type`           | `string`            | ✅       | Message type: `"text"` \| `"image"` \| `"video"` \| `"file"` \| `"voice"` |
| `content`        | `string`            | ✅       | Message text content                                                      |
| `attachments`    | `array<Attachment>` | ✅       | Array of attachments (see below)                                          |
| `replyTo`        | `object \| null`    | ❌       | Reply reference (see below)                                               |
| `readBy`         | `array<string>`     | ✅       | Array of user IDs who have read the message                               |
| `editedAt`       | `timestamp \| null` | ❌       | Last edit timestamp                                                       |
| `deletedAt`      | `timestamp \| null` | ❌       | Soft delete timestamp                                                     |
| `createdAt`      | `timestamp`         | ✅       | Document creation timestamp                                               |

### Attachment Structure

```typescript
{
  id: string;
  type: "image" | "video" | "file" | "voice";
  url: string;           // Storage URL
  fileName: string;      // Original file name
  fileSize: number;      // Size in bytes
  mimeType: string;      // MIME type
  duration?: number;     // For voice/video in seconds
  thumbnailUrl?: string; // For images/videos
  width?: number;        // Image/video width
  height?: number;       // Image/video height
}
```

### ReplyTo Structure

```typescript
{
  messageId: string;
  content: string; // Preview of original message
  senderName: string;
}
```

### Message Types

| Type    | Description              |
| ------- | ------------------------ |
| `text`  | Plain text message       |
| `image` | Image attachment         |
| `video` | Video attachment         |
| `file`  | Document/file attachment |
| `voice` | Voice recording          |

### Example Document

```json
{
  "conversationId": "abc123",
  "clubId": "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-jordan-knights-football-club",
  "senderId": "userId1",
  "senderName": "Bashar",
  "senderInitials": "BA",
  "senderRole": "Administrator",
  "type": "text",
  "content": "Good morning everyone! Here are the training highlights from yesterday.",
  "attachments": [
    {
      "id": "attachment_1234",
      "type": "video",
      "url": "https://storage.example.com/video.mp4",
      "fileName": "training-highlights.mp4",
      "fileSize": 15728640,
      "mimeType": "video/mp4",
      "duration": 45,
      "thumbnailUrl": "https://storage.example.com/thumb.jpg"
    }
  ],
  "readBy": ["userId1", "userId2"],
  "createdAt": "December 24, 2025 at 9:00:00 AM UTC+3"
}
```

---

## Subcollection: `clubs/{clubId}/events`

Stores calendar events for each club (practices, games, meetings, camps, cups, etc.).

### Document ID

- **Format:** Auto-generated Firestore ID

### Fields

| Field              | Type                  | Required | Description                                                                          |
| ------------------ | --------------------- | -------- | ------------------------------------------------------------------------------------ |
| `clubId`           | `string`              | ✅       | Parent club ID                                                                       |
| `type`             | `string`              | ✅       | Event type: `"game"` \| `"practice"` \| `"meeting"` \| `"camp"` \| `"cup"` \| `"other"` |
| `title`            | `string`              | ✅       | Event title                                                                          |
| `description`      | `string \| null`      | ❌       | Event description                                                                    |
| `location`         | `string`              | ✅       | Event location                                                                       |
| `locationCoords`   | `object \| null`      | ❌       | Lat/lng coordinates for location                                                     |
| `startTime`        | `timestamp`           | ✅       | Event start time                                                                     |
| `endTime`          | `timestamp`           | ✅       | Event end time                                                                       |
| `meetTimeBefore`   | `number`              | ✅       | Minutes to meet before event (default 0)                                             |
| `rsvpBefore`       | `timestamp \| null`   | ❌       | RSVP deadline                                                                        |
| `repeat`           | `string`              | ✅       | Repeat: `"none"` \| `"daily"` \| `"weekly"` \| `"biweekly"` \| `"monthly"`           |
| `repeatUntil`      | `timestamp \| null`   | ❌       | End date for recurring events                                                        |
| `autoAddAdmins`    | `boolean`             | ✅       | Auto-add new admins as organizers                                                    |
| `autoAddPlayers`   | `boolean`             | ✅       | Auto-add new players as participants                                                 |
| `hideParticipants` | `boolean`             | ✅       | Hide participants from each other                                                    |
| `visibility`       | `string`              | ✅       | Visibility: `"everyone"` \| `"organizers_only"` \| `"participants_only"`             |
| `showOnWebsite`    | `boolean`             | ✅       | Show event on public website                                                         |
| `physicalStrain`   | `number`              | ✅       | Physical strain level (0-100)                                                        |
| `attachments`      | `array<Attachment>`   | ✅       | Array of attachments                                                                 |
| `gameDetails`      | `object \| null`      | ❌       | Game-specific details (for type "game" or "cup")                                     |
| `resources`        | `array<Resource>`     | ✅       | Array of resources (fields, equipment)                                               |
| `session`          | `object \| null`      | ❌       | Training session details                                                             |
| `organizers`       | `array<Participant>`  | ✅       | Array of organizers                                                                  |
| `participants`     | `array<Participant>`  | ✅       | Array of participants                                                                |
| `attendanceStats`  | `object`              | ✅       | Attendance statistics                                                                |
| `createdBy`        | `string`              | ✅       | User ID who created the event                                                        |
| `createdByName`    | `string`              | ✅       | Display name of creator                                                              |
| `commentsCount`    | `number`              | ✅       | Number of comments                                                                   |
| `createdAt`        | `timestamp`           | ✅       | Document creation timestamp                                                          |
| `updatedAt`        | `timestamp`           | ✅       | Last update timestamp                                                                |

### Event Types

| Type       | Description              | Has Game Details |
| ---------- | ------------------------ | ---------------- |
| `game`     | Match/game               | ✅               |
| `practice` | Training session         | ❌               |
| `meeting`  | Team meeting             | ❌               |
| `camp`     | Training camp            | ❌               |
| `cup`      | Cup/tournament match     | ✅               |
| `other`    | Other event type         | ❌               |

### GameDetails Structure (for game/cup events)

```typescript
{
  homeTeam?: {
    id?: string;
    name: string;
    logoUrl?: string;
  };
  awayTeam?: {
    id?: string;
    name: string;
    logoUrl?: string;
  };
  gameStart?: string;
  competition?: string;
  competitionId?: string;
  isFriendlyMatch: boolean;
  gameFormat: string; // "11v11", "9v9", "7v7", "5v5"
  periods: number;
  periodLength: number; // minutes
  field?: string;
  fieldType?: "grass" | "artificial" | "indoor" | "unknown";
}
```

### Participant Structure

```typescript
{
  id: string;
  name: string;
  initials: string;
  role: "organizer" | "participant";
  attendanceStatus: "accepted" | "declined" | "pending" | "waiting";
  attendedAt?: Timestamp;
}
```

### AttendanceStats Structure

```typescript
{
  accepted: number;
  declined: number;
  pending: number;
  waiting: number;
}
```

### Example Document

```json
{
  "clubId": "O6v1mAyfA7fNvt4yHoPb8ltCZ3l1-jordan-knights-football-club",
  "type": "practice",
  "title": "U15-B - Autumn 2025",
  "description": "Weekly practice session",
  "location": "Jordan Knights Stadium",
  "startTime": "December 24, 2025 at 5:00:00 PM UTC+3",
  "endTime": "December 24, 2025 at 6:30:00 PM UTC+3",
  "meetTimeBefore": 15,
  "repeat": "weekly",
  "autoAddAdmins": true,
  "autoAddPlayers": true,
  "hideParticipants": false,
  "visibility": "everyone",
  "showOnWebsite": true,
  "physicalStrain": 60,
  "attachments": [],
  "resources": [
    {
      "id": "field-1",
      "name": "AHG",
      "type": "field",
      "location": "Amman"
    }
  ],
  "organizers": [
    {
      "id": "userId1",
      "name": "SMT Dev",
      "initials": "SD",
      "role": "organizer",
      "attendanceStatus": "accepted"
    }
  ],
  "participants": [
    {
      "id": "userId2",
      "name": "Ayham Motaz",
      "initials": "AM",
      "role": "participant",
      "attendanceStatus": "accepted"
    }
  ],
  "attendanceStats": {
    "accepted": 2,
    "declined": 0,
    "pending": 0,
    "waiting": 0
  },
  "createdBy": "userId1",
  "createdByName": "SMT Dev",
  "commentsCount": 3,
  "createdAt": "December 24, 2025 at 10:00:00 AM UTC+3",
  "updatedAt": "December 24, 2025 at 10:30:00 AM UTC+3"
}
```

---

## Subcollection: `clubs/{clubId}/events/{eventId}/comments`

Stores comments for each event.

### Document ID

- **Format:** Auto-generated Firestore ID

### Fields

| Field          | Type        | Required | Description                 |
| -------------- | ----------- | -------- | --------------------------- |
| `eventId`      | `string`    | ✅       | Parent event ID             |
| `userId`       | `string`    | ✅       | Commenter's user ID         |
| `userName`     | `string`    | ✅       | Commenter's display name    |
| `userInitials` | `string`    | ✅       | Commenter's initials        |
| `content`      | `string`    | ✅       | Comment text                |
| `createdAt`    | `timestamp` | ✅       | Comment creation timestamp  |

### Example Document

```json
{
  "eventId": "event123",
  "userId": "userId1",
  "userName": "SMT Dev",
  "userInitials": "SD",
  "content": "Looking forward to the session!",
  "createdAt": "December 24, 2025 at 10:30:00 AM UTC+3"
}
```

---

## Collection: `video_analyses`

Stores video analysis sessions with clips and annotations.

### Document ID

- **Format:** Auto-generated Firestore ID

### Fields

| Field           | Type                | Required | Description                   |
| --------------- | ------------------- | -------- | ----------------------------- |
| `name`          | `string`            | ✅       | Analysis name/title           |
| `description`   | `string`            | ❌       | Analysis description          |
| `videoFileName` | `string`            | ❌       | Original video file name      |
| `videoDuration` | `number`            | ❌       | Video duration in seconds     |
| `canvasWidth`   | `number`            | ❌       | Canvas width for annotations  |
| `canvasHeight`  | `number`            | ❌       | Canvas height for annotations |
| `clips`         | `array<Clip>`       | ✅       | Array of video clips          |
| `annotations`   | `array<Annotation>` | ✅       | Array of annotations          |
| `createdAt`     | `timestamp`         | ✅       | Document creation timestamp   |
| `updatedAt`     | `timestamp`         | ✅       | Last update timestamp         |

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
┌──────────────────────────────────────────────────────────────────────────────┐
│                              RELATIONSHIPS                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐         ┌─────────┐                                            │
│  │  users  │◄───────►│  clubs  │                                            │
│  └─────────┘         └─────────┘                                            │
│       │                   │                                                  │
│       │    clubIds[]      │                                                  │
│       │    activeClubId   │                                                  │
│       │                   │                                                  │
│       │                   ├──────────────────────────────────────────────┐  │
│       │                   │                                              │  │
│       │          ┌────────▼────────┐  ┌────────────────┐  ┌───────────┐ │  │
│       │          │    members/     │  │ conversations/ │  │registrations│ │  │
│       │          │ (subcollection) │  │(subcollection) │  │    /       │ │  │
│       │          └─────────────────┘  └───────┬────────┘  └───────────┘ │  │
│       │                                       │                          │  │
│       │                               ┌───────▼────────┐                │  │
│       │                               │   messages/    │                │  │
│       │                               │(subcollection) │                │  │
│       │                               └────────────────┘                │  │
│       │                                                                  │  │
│       ▼                                                                  │  │
│  ┌───────────────────────────────────────────────────────────────────┐  │  │
│  │                          ID FORMAT                                 │  │  │
│  │  clubs/{ownerUid}-{slug}                                          │  │  │
│  │  users/{authUid}                                                  │  │  │
│  │  clubs/{clubId}/conversations/{conversationId}                    │  │  │
│  │  clubs/{clubId}/conversations/{conversationId}/messages/{msgId}   │  │  │
│  │  clubs/{clubId}/events/{eventId}                                  │  │  │
│  │  clubs/{clubId}/events/{eventId}/comments/{commentId}             │  │  │
│  └───────────────────────────────────────────────────────────────────┘  │  │
│                                                                          │  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Club Switching

When a user switches clubs via the club switcher dropdown:

1. `activeClubId` is updated in the `users` collection
2. Auth context updates → all components re-render
3. All subscriptions use `activeClub.id` as the base path
4. Data automatically shows for the new club

```typescript
// Example: Subscribing to chat conversations
useEffect(() => {
  if (!activeClub?.id || !userId) return;

  const unsubscribe = subscribeToConversations(
    activeClub.id, // Club-scoped data
    userId,
    (conversations) => setConversations(conversations)
  );

  return () => unsubscribe();
}, [activeClub?.id, userId]); // Re-run when club changes
```

---

## Default Clubs

When a new admin user is created, the following clubs are seeded:

| Slug                           | Name                         | Default Role  | Order |
| ------------------------------ | ---------------------------- | ------------- | ----- |
| `club-lobby`                   | Club lobby                   | Administrator | 1     |
| `jordan-knights-football-club` | Jordan Knights Football Club | Administrator | 2     |
| `2021`                         | 2021                         | Staff         | 3     |
| `al-aqaba`                     | Al-Aqaba                     | Administrator | 4     |
| `al-ramtha`                    | Al-Ramtha                    | Administrator | 5     |
| `al-salt`                      | Al-Salt                      | Administrator | 6     |
| `amman`                        | Amman                        | Player        | 7     |
| `club-youth-teams`             | Club Youth Teams             | Administrator | 8     |
| `dev`                          | Dev                          | Player        | 9     |
| `grassroots`                   | Grassroots                   | Administrator | 10    |

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
- `app/lib/firestore-chat.ts` - Conversation and ChatMessage types
- `app/lib/firestore-events.ts` - CalendarEvent and EventComment types
- `app/lib/firestore-registrations.ts` - Registration types
- `app/lib/firebase.ts` - VideoAnalysis types

---

## Chat Feature Summary

The chat system supports:

### Features

- **Group Conversations**: Create groups with multiple club members
- **Real-time Messaging**: Messages sync instantly via Firestore listeners
- **Rich Media**: Support for text, images, videos, files, and voice messages
- **Read Receipts**: Track who has read each message
- **Message Actions**: Reply, edit, delete (soft delete) messages
- **Notifications**: Mute/unmute conversations per user
- **Pinned Conversations**: Pin important conversations
- **Search**: Filter conversations by name or content

### Message Types

| Type    | Description        | Attachment Fields                         |
| ------- | ------------------ | ----------------------------------------- |
| `text`  | Plain text message | None                                      |
| `image` | Photo attachment   | `url`, `thumbnailUrl`, `width`, `height`  |
| `video` | Video attachment   | `url`, `thumbnailUrl`, `duration`         |
| `file`  | Document/file      | `url`, `fileName`, `fileSize`, `mimeType` |
| `voice` | Voice recording    | `url`, `duration`                         |

### Conversation Tags

- `Teams` - Team-specific groups
- `Staff` - Staff coordination
- `Media` - Media sharing
- `Parents` - Parent communication
- `Scheduling` - Schedule coordination
- `General` - General discussions
