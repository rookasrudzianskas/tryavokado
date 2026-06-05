import { z } from "zod";
import { ECOMMERCE_PLATFORMS } from "@/lib/constants";

export const createWorkspaceSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(80, "That name is a little long."),
  primaryPlatform: z.enum(ECOMMERCE_PLATFORMS),
});

export type CreateWorkspaceFormInput = z.infer<typeof createWorkspaceSchema>;
