import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must be exactly 6 digits"),
});

export function normalizeUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export const resourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title must be 150 characters or less"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .transform(normalizeUrl)
    .refine((val) => {
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "Please provide a valid website or repository URL"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category name too long"),
  description: z
    .string()
    .trim()
    .max(300, "Description must be 300 characters or less")
    .default(""),
  mainFunctions: z
    .array(z.string().trim().min(1).max(50))
    .max(20, "Cannot add more than 20 key functions")
    .default([]),
  isPinned: z.boolean().default(false),
});

export const resourceUpdateSchema = resourceSchema.partial();
