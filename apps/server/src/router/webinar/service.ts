import { db } from "../../db";
import { webinars, webinarInstructors, webinarRegistrations } from "../../db/schema/webinar";
import { files } from "../../db/schema/files";
import { user } from "../../db/schema/auth";
import { eq, like, and, isNull, inArray, count } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "../../utils/slug";
import { documentStorage } from "../../config/upload";
import type z from "zod";
import type { createWebinarSchema, updateWebinarSchema } from "./validation";

/**
 * Creates a webinar with the given data.
 *
 * The function generates a unique slug from the title and checks for existing slugs.
 * It then inserts the webinar data into the database and returns the created webinar object.
 *
 * The function also inserts the instructor IDs into the webinarInstructors table.
 *
 * @param {z.infer<typeof createWebinarSchema>} data - The webinar data to be created.
 * @returns {Promise<Webinar>} - The created webinar object.
 */
export const createWebinarService = async (data: z.infer<typeof createWebinarSchema>) => {
  const {
    title,
    description,
    isFree,
    price,
    thumbnailFileId,
    liveLink,
    scheduledAt,
    duration,
    status,
    instructorIds,
  } = data;

  if (!isFree && !price) {
    throw new Error("Price is required if isFree is false");
  }

  const baseSlug = generateSlug(title);

  const existingWebinars = await db
    .select({ slug: webinars.slug })
    .from(webinars)
    .where(like(webinars.slug, `${baseSlug}%`));

  const existingSlugs = existingWebinars.map((w) => w.slug);
  const slug = generateUniqueSlug(baseSlug, existingSlugs);

  const [webinar] = await db
    .insert(webinars)
    .values({
      title,
      slug,
      description: description || null,
      isFree,
      price: isFree ? null : (price || null),
      thumbnailFileId: thumbnailFileId || null,
      liveLink: liveLink || null,
      scheduledAt: new Date(scheduledAt),
      duration,
      status: status || "upcoming",
    })
    .returning();

  const instructorsData = instructorIds.map((instructorId) => ({
    webinarId: webinar.id,
    instructorId,
  }));

  await db.insert(webinarInstructors).values(instructorsData);

  return {
    id: webinar.id,
    title: webinar.title,
    slug: webinar.slug,
    description: webinar.description,
    isFree: webinar.isFree,
    price: webinar.price,
    thumbnailFileId: webinar.thumbnailFileId,
    liveLink: webinar.liveLink,
    scheduledAt: webinar.scheduledAt.toISOString(),
    duration: webinar.duration,
    status: webinar.status,
    createdAt: webinar.createdAt.toISOString(),
    updatedAt: webinar.updatedAt.toISOString(),
  };
};

/**
 * Updates a webinar with the given data.
 *
 * The function checks if the webinar exists, and if the title is being updated,
 * it generates a new unique slug. It then updates the webinar data in the database.
 *
 * If instructorIds are provided, it deletes existing webinar-instructor relationships
 * and inserts new ones.
 *
 * @param {string} id - The ID of the webinar to update.
 * @param {z.infer<typeof updateWebinarSchema>} data - The webinar data to update.
 * @returns {Promise<Webinar | null>} - The updated webinar object or null if not found.
 */
export const updateWebinarService = async (
  id: string,
  data: z.infer<typeof updateWebinarSchema>
) => {
  const [existingWebinar] = await db
    .select()
    .from(webinars)
    .where(and(eq(webinars.id, id), isNull(webinars.deletedAt)))
    .limit(1);

  if (!existingWebinar) {
    throw new Error("Webinar not found");
  }

  const updateData: Partial<typeof webinars.$inferInsert> = {};

  if (data.title && data.title !== existingWebinar.title) {
    const baseSlug = generateSlug(data.title);
    const existingWebinars = await db
      .select({ slug: webinars.slug })
      .from(webinars)
      .where(like(webinars.slug, `${baseSlug}%`));

    const existingSlugs = existingWebinars
      .filter((w) => w.slug !== existingWebinar.slug)
      .map((w) => w.slug);

    updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
    updateData.title = data.title;
  }

  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.isFree !== undefined) updateData.isFree = data.isFree;
  if (data.price !== undefined) {
    updateData.price = data.isFree === false && data.price ? data.price : null;
  }
  if (data.thumbnailFileId !== undefined) updateData.thumbnailFileId = data.thumbnailFileId || null;
  if (data.liveLink !== undefined) updateData.liveLink = data.liveLink || null;
  if (data.scheduledAt !== undefined) updateData.scheduledAt = new Date(data.scheduledAt);
  if (data.duration !== undefined) updateData.duration = data.duration;
  if (data.status !== undefined) updateData.status = data.status;

  updateData.updatedAt = new Date();

  const [updatedWebinar] = await db
    .update(webinars)
    .set(updateData)
    .where(eq(webinars.id, id))
    .returning();

  if (data.instructorIds && data.instructorIds.length > 0) {
    await db.delete(webinarInstructors).where(eq(webinarInstructors.webinarId, id));

    const instructorsData = data.instructorIds.map((instructorId) => ({
      webinarId: id,
      instructorId,
    }));

    await db.insert(webinarInstructors).values(instructorsData);
  }

  return {
    id: updatedWebinar.id,
    title: updatedWebinar.title,
    slug: updatedWebinar.slug,
    description: updatedWebinar.description,
    isFree: updatedWebinar.isFree,
    price: updatedWebinar.price,
    thumbnailFileId: updatedWebinar.thumbnailFileId,
    liveLink: updatedWebinar.liveLink,
    scheduledAt: updatedWebinar.scheduledAt.toISOString(),
    duration: updatedWebinar.duration,
    status: updatedWebinar.status,
    createdAt: updatedWebinar.createdAt.toISOString(),
    updatedAt: updatedWebinar.updatedAt.toISOString(),
  };
};

/**
 * Soft deletes a webinar by setting the deletedAt timestamp.
 *
 * @param {string} id - The ID of the webinar to delete.
 * @returns {Promise<boolean>} - Returns true if deleted, false if not found.
 */
export const deleteWebinarService = async (id: string): Promise<boolean> => {
  const [deletedWebinar] = await db
    .update(webinars)
    .set({ deletedAt: new Date() })
    .where(and(eq(webinars.id, id), isNull(webinars.deletedAt)))
    .returning();

  if (!deletedWebinar) {
    throw new Error("Webinar not found");
  }

  // Delete thumbnail file from storage and soft delete file record
  if (deletedWebinar.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, deletedWebinar.thumbnailFileId))
      .limit(1);

    if (thumbnailFile) {
      try {
        await documentStorage.deleteDocument(thumbnailFile.key);
      } catch (error) {
        throw error;
      }

      await db
        .update(files)
        .set({ deletedAt: new Date() })
        .where(eq(files.id, thumbnailFile.id));
    }
  }

  await db
    .update(webinarInstructors)
    .set({ deletedAt: new Date() })
    .where(eq(webinarInstructors.webinarId, id));

  await db
    .update(webinarRegistrations)
    .set({ deletedAt: new Date() })
    .where(eq(webinarRegistrations.webinarId, id));

  return !!deletedWebinar;
};

/**
 * Retrieves a webinar by ID with instructors and thumbnail URL.
 *
 * @param {string} id - The ID of the webinar to retrieve.
 * @returns {Promise<Webinar>} - The webinar object with instructors and thumbnail URL.
 */
export const listWebinarsService = async (params: { page?: number; limit?: number; search?: string; status?: string; }) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const whereClauses: any[] = [isNull(webinars.deletedAt)];
  if (params.search) whereClauses.push(like(webinars.title, `%${params.search}%`));
  if (params.status) whereClauses.push(eq(webinars.status, params.status as any));

  const [totalResult] = await db.select({ count: count() }).from(webinars).where(and(...whereClauses));
  const total = totalResult?.count || 0;

  const records = await db
    .select()
    .from(webinars)
    .where(and(...whereClauses))
    .orderBy(webinars.scheduledAt)
    .limit(limit)
    .offset(offset);

  const webinarIds = records.map((r) => r.id);

  let instructorsMap: Record<string, Array<{ id: string; name: string; email: string }>> = {};
  if (webinarIds.length > 0) {
    const instructorRows = await db
      .select({
        webinarId: webinarInstructors.webinarId,
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(webinarInstructors)
      .innerJoin(user, eq(webinarInstructors.instructorId, user.id))
      .where(and(inArray(webinarInstructors.webinarId, webinarIds), isNull(webinarInstructors.deletedAt)));

    instructorsMap = instructorRows.reduce((acc: any, ir: any) => {
      acc[ir.webinarId] = acc[ir.webinarId] || [];
      acc[ir.webinarId].push({ id: ir.id, name: ir.name, email: ir.email });
      return acc;
    }, {});
  }

  const mapped = await Promise.all(records.map(async (w) => {
    let thumbnailUrl: string | null = null;
    if (w.thumbnailFileId) {
      const [f] = await db.select().from(files).where(eq(files.id, w.thumbnailFileId)).limit(1);
      if (f) thumbnailUrl = await documentStorage.getSignedUrl(f.key);
    }
    return {
      id: w.id,
      title: w.title,
      slug: w.slug,
      description: w.description,
      isFree: w.isFree,
      price: w.price,
      thumbnailFileId: w.thumbnailFileId,
      thumbnailUrl,
      liveLink: w.liveLink,
      scheduledAt: w.scheduledAt.toISOString(),
      duration: w.duration,
      status: w.status,
      instructors: instructorsMap[w.id] || [],
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    };
  }));

  return {
    webinars: mapped,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getWebinarService = async (id: string) => {
  const [webinar] = await db
    .select()
    .from(webinars)
    .where(and(eq(webinars.id, id), isNull(webinars.deletedAt)))
    .limit(1);

  if (!webinar) {
    throw new Error("Webinar not found");
  }

  // Get instructors
  const instructorRecords = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(webinarInstructors)
    .innerJoin(user, eq(webinarInstructors.instructorId, user.id))
    .where(and(
      eq(webinarInstructors.webinarId, id),
      isNull(webinarInstructors.deletedAt)
    ));

  // Get thumbnail URL if exists
  let thumbnailUrl: string | null = null;
  if (webinar.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, webinar.thumbnailFileId))
      .limit(1);

    if (thumbnailFile) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  return {
    id: webinar.id,
    title: webinar.title,
    slug: webinar.slug,
    description: webinar.description,
    isFree: webinar.isFree,
    price: webinar.price,
    thumbnailFileId: webinar.thumbnailFileId,
    thumbnailUrl,
    liveLink: webinar.liveLink,
    scheduledAt: webinar.scheduledAt.toISOString(),
    duration: webinar.duration,
    status: webinar.status,
    instructors: instructorRecords,
    createdAt: webinar.createdAt.toISOString(),
    updatedAt: webinar.updatedAt.toISOString(),
  };
};
