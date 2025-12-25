import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.string().default("3001").transform(Number),

    DATABASE_URL: z.string().url({
      message: "DATABASE_URL must be a valid URL",
    }),

    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long"),

    BETTER_AUTH_URL: z.string().url().default("http://localhost:3001"),

    ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

    // Optional OAuth support
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
    SMTP_PORT: z.string().default('587'),
    SMTP_USER: z.string().email('SMTP_USER must be a valid email'),
    SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
    EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),

    SUPER_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
    SUPER_ADMIN_PASSWORD: z.string().min(8).default('SuperAdmin@123'),
    SUPER_ADMIN_NAME: z.string().default('Super Admin'),
    SUPER_ADMIN_PHONE: z.string().optional(),

    R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
    R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
    R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
    R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required'),

    SUPPORT_EMAIL: z.string().email().default('support@example'),

  },

  runtimeEnv: process.env,
});
