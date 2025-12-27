import { db } from "../../db";
import { user } from "../../db/schema/auth";
import { files } from "../../db/schema/files";
import { eq, count, and, like, isNull, or, sql } from "drizzle-orm";
import { documentStorage } from "../../config/upload";
import type z from "zod";
import type { userPaginationQuerySchema } from "./validation";
import { auth } from "../../lib/auth";
import { Context } from "hono";



/**
 * Lists all users for admin view with pagination and filters.
 * 
 * @param {ListUsersParams} params - Pagination and filter parameters.
 * @returns {Promise<{users: User[], pagination: object}>} - List of users with pagination metadata.
 */
export const listUsersService = async (params: z.infer<typeof userPaginationQuerySchema>) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        like(user.name, `%${params.search}%`),
        like(user.email, `%${params.search}%`)
      )
    );
  }

  if (params.role) {
    conditions.push(eq(user.role, params.role));
  }

  if (params.banned !== undefined) {
    conditions.push(eq(user.banned, params.banned));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalCount] = await db
    .select({ count: count() })
    .from(user)
    .where(whereClause);

  const total = totalCount?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const usersList = await db
    .select()
    .from(user)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(user.createdAt);

  const usersData = await Promise.all(
    usersList.map(async (userRecord) => {
      let avatarUrl: string | null = userRecord.image;
      if (userRecord.avatarFileId) {
        const [avatarFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, userRecord.avatarFileId))
          .limit(1);

        if (avatarFile && !avatarFile.deletedAt) {
          avatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
        }
      }

      return {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        avatar: avatarUrl,
        role: userRecord.role,
        banned: userRecord.banned || false,
        banReason: userRecord.banReason,
        banExpires: userRecord.banExpires ? userRecord.banExpires.toISOString() : null,
        phoneNumber: userRecord.phoneNumber,
        createdAt: userRecord.createdAt.toISOString(),
        updatedAt: userRecord.updatedAt.toISOString(),
      };
    })
  );

  return {
    users: usersData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};


/**
 * Retrieves a list of all admin users.
 *
 * @returns {Promise<User[]>} - List of admin users with only their IDs.
 */
export const getAllAdmin = async () => {
  const admins = await db.query.user.findMany({
  where: eq(user.role, "admin"),
  columns: { id: true },
});
return admins;
}

/**
 * Retrieves a list of all user users.
 *
 * Retrieves a list of all user users, each containing only their IDs.
 *
 * @returns {Promise<User[]>} - List of user users with only their IDs.
 */
export const getAllUsers = async () => {
 const users = await db.query.user.findMany({
          where: eq(user.role, "user"),
          columns: { id: true },
        });
        return users;
}

/**
 * Retrieves the currently authenticated user.
 *
 * Retrieves the user associated with the authentication session for the given request.
 * If no authentication session is found, returns null.
 *
 * @param {Context} c - The Hono context object.
 * @returns {Promise<User | null>} - The currently authenticated user or null if no user is found.
 */
export async function getCurrentUser(c: Context) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return session?.user; 
}
