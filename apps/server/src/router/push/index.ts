import { eq, and } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { pushSubscriptions } from "../../db/schema/auth";

const pushRouter = new Hono();

// Save subscription
pushRouter.post("/subscribe", async (c) => {
  const body = await c.req.json();
  const { userId, subscription } = body;

  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });

  return c.json({ success: true });
});

// Unsubscribe
pushRouter.post("/unsubscribe", async (c) => {
  const body = await c.req.json();
  const { userId, endpoint } = body;

  await db
    .delete(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.endpoint, endpoint)
    ));

  return c.json({ success: true });
});

export default pushRouter;
