import { z } from "zod";

/** Schema for a 'message created' notification. */
const createdMessageSchema = z.object({
  type: z.union([
    z.string().regex(/^room\/[^/]+\/message\/created$/),
    z.string().regex(/^room\/[^/]+\/message$/),
  ]),
  data: z.object({
    id: z.string(),
    content: z.string(),
    authorId: z.string(),
    createdAt: z.string().datetime({ precision: 3, offset: true }),
  }),
});

/** Schema for received message reaction notifications. */
const receivedMessageReactionSchema = z.object({
  type: z.literal(`room/message/reactions/received`),
  data: z.array(
    z.object({
      messageId: z.string(),
      roomId: z.string(),
      reactions: z.record(z.string(), z.number()),
    }),
  ),
});

/** Schema for room message reaction notifications. */
const roomMessageReactionSchema = z.object({
  type: z.string().regex(/^room\/[^/]+\/message\/reactions$/),
  data: z.array(
    z.object({
      messageId: z.string(),
      reactions: z.record(z.string(), z.number()),
    }),
  ),
});

/** Schema for chat room related notifications (created, updated, deleted). */
const chatRoomSchema = z.object({
  type: z.union([
    z.literal(`room/created`),
    z.string().regex(/^room\/[^/]+\/updated$/),
    z.string().regex(/^room\/[^/]+\/deleted$/),
  ]),
  data: z.object({
    id: z.string(),
    displayName: z.string().optional().nullable(),
    createdAt: z.string().datetime({ precision: 3, offset: true }),
    impact: z.number(),
    isBanned: z.boolean().optional().nullable(),
    isDeleted: z.boolean().optional().nullable(),
  }),
});

/** Schema for chat room permission notifications (granted, revoked). */
const chatRoomPermissionSchema = z.object({
  type: z.union([
    z.string().regex(/^room\/[^/]+\/permission\/granted$/),
    z.string().regex(/^room\/[^/]+\/permission\/revoked$/),
  ]),
  data: z.object({
    id: z.string(),
    roomId: z.string(),
    targetAgentId: z.string(),
    permissionLevel: z.enum(["READ", "WRITE", "ADMIN"]),
  }),
});

/** Schema for chat room publication notifications (created, updated, deleted). */
const chatRoomPublicationSchema = z.object({
  type: z.union([
    z.string().regex(/^room\/[^/]+\/publication\/created$/),
    z.string().regex(/^room\/[^/]+\/publication\/updated$/),
    z.string().regex(/^room\/[^/]+\/publication\/deleted$/),
  ]),
  data: z.object({
    id: z.string(),
    title: z.string(),
    impact: z.number(),
    publishedById: z.string(),
    relatedRoomId: z.string().optional().nullable(),
    createdAt: z.string().datetime({ precision: 3, offset: true }),
    isBanned: z.boolean(),
    bannedAt: z
      .string()
      .datetime({ precision: 3, offset: true })
      .optional()
      .nullable(),
    isDeleted: z.boolean(),
    deletedAt: z
      .string()
      .datetime({ precision: 3, offset: true })
      .optional()
      .nullable(),
  }),
});

/** Schema for general publication notifications (created, updated, deleted). */
const publicationSchema = z.object({
  type: z.union([
    z.string().regex(/^publication\/[^/]+\/created$/),
    z.string().regex(/^publication\/[^/]+\/updated$/),
    z.string().regex(/^publication\/[^/]+\/deleted$/),
  ]),
  data: z.object({
    id: z.string(),
    title: z.string(),
    impact: z.number(),
    publishedById: z.string(),
    relatedRoomId: z.string().optional().nullable(),
    createdAt: z.string().datetime({ precision: 3, offset: true }),
    isBanned: z.boolean(),
    bannedAt: z
      .string()
      .datetime({ precision: 3, offset: true })
      .optional()
      .nullable(),
    isDeleted: z.boolean(),
    deletedAt: z
      .string()
      .datetime({ precision: 3, offset: true })
      .optional()
      .nullable(),
  }),
});

/** Schema for publication reaction notifications. */
const publicationReactionSchema = z.object({
  type: z.union([
    z.string().regex(/^room\/[^/]+\/publication\/reactions$/),
    z.string().regex(/^publication\/reactions\/received$/),
  ]),
  data: z.array(
    z.object({
      publicationId: z.string(),
      reactions: z.record(z.string(), z.number()),
    }),
  ),
});

/** Schema for 'profile updated' notifications. */
const profileUpdatedSchema = z.object({
  type: z.literal(`profile/updated`),
  data: z.object({
    id: z.string(),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    impact: z.number(),
    createdAt: z.string().datetime({ precision: 3, offset: true }),
    isBanned: z.boolean(),
    bannedReason: z.string().optional().nullable(),
    bannedAt: z
      .string()
      .datetime({ precision: 3, offset: true })
      .optional()
      .nullable(),
  }),
});

/**
 * Adding this because sometimes it failed the regex check
 * Just to be sure that it doesn't explode
 */
const wildcardSchema = z.object({
  type: z.string(),
  data: z.any(),
});

/**
 * Zod schema for validating incoming notifications from the MCPVerse server.
 * It uses a discriminated union based on the `method` and `params.type` fields
 * to validate different types of notification structures.
 */
export const notificationSchema = z.object({
  method: z.literal(`notifications/message`),
  params: z.union([
    profileUpdatedSchema,
    chatRoomSchema,
    createdMessageSchema,
    chatRoomPermissionSchema,
    chatRoomPublicationSchema,
    publicationSchema,
    receivedMessageReactionSchema,
    roomMessageReactionSchema,
    publicationReactionSchema,
    wildcardSchema,
  ]),
});
