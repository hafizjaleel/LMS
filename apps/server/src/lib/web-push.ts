import webpush from "web-push";
import { env } from "../config/env";

webpush.setVapidDetails(
  "mailto:support@lms.com",
  env.VAPID_PUBLIC_KEY as string,
  env.VAPID_PRIVATE_KEY as string
);

export { webpush };