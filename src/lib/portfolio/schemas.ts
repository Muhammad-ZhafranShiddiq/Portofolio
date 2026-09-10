import { z } from "zod";

import { SKILL_CATEGORIES } from "@/lib/portfolio/types";

const trimmedText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

const monthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use a valid month and year.");

const optionalMonthSchema = z.union([monthSchema, z.literal("")]);

function isSafeExternalUrl(value: string) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeAssetUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isSafeExternalUrl(value);
}

const optionalExternalUrl = z
  .string()
  .trim()
  .max(2_000)
  .refine(isSafeExternalUrl, "Use a secure HTTPS URL.");

const assetUrl = z
  .string()
  .trim()
  .max(2_000)
  .refine(isSafeAssetUrl, "Use a local path or secure HTTPS URL.");

const optionalInteger = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
  z.number().int().nonnegative().optional(),
);

export const mediaAssetSchema = z
  .object({
    url: assetUrl,
    publicId: z.string().trim().max(500),
    alt: z.string().trim().max(240),
    version: optionalInteger,
    signature: z.string().trim().max(500).optional(),
    resourceType: z.enum(["image", "raw"]).optional(),
    width: optionalInteger,
    height: optionalInteger,
    format: z.string().trim().max(20).optional(),
    bytes: optionalInteger,
  })
  .strict();

const publishableContentSchema = z.object({
  status: z.enum(["draft", "published"]),
});

export const experienceInputSchema = publishableContentSchema
  .extend({
    organization: trimmedText(2, 120),
    role: trimmedText(2, 120),
    location: z.string().trim().max(120),
    startDate: monthSchema,
    endDate: optionalMonthSchema,
    isCurrent: z.boolean(),
    logo: mediaAssetSchema,
    highlights: z
      .array(trimmedText(4, 500))
      .min(1, "Add at least one outcome.")
      .max(8),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.isCurrent && !value.endDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Add an end date or mark this role as current.",
      });
    }
    if (value.endDate && value.endDate < value.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be earlier than start date.",
      });
    }
    if (value.logo.url && !value.logo.alt) {
      context.addIssue({
        code: "custom",
        path: ["logo", "alt"],
        message: "Add alternative text for the logo.",
      });
    }
  });

export const projectInputSchema = publishableContentSchema
  .extend({
    title: trimmedText(2, 140),
    role: trimmedText(2, 120),
    summary: trimmedText(10, 240),
    description: trimmedText(20, 1_500),
    image: mediaAssetSchema,
    technologies: z.array(trimmedText(1, 40)).min(1).max(20),
    liveUrl: optionalExternalUrl,
    repositoryUrl: optionalExternalUrl,
    projectState: z.enum(["live", "in-progress", "private"]),
    featured: z.boolean(),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.image.url) {
      context.addIssue({
        code: "custom",
        path: ["image", "url"],
        message: "Add a project image.",
      });
    }
    if (value.image.url && !value.image.alt) {
      context.addIssue({
        code: "custom",
        path: ["image", "alt"],
        message: "Add alternative text for the project image.",
      });
    }
  });

export const certificationInputSchema = publishableContentSchema
  .extend({
    title: trimmedText(2, 180),
    issuer: trimmedText(2, 180),
    issueDate: monthSchema,
    expiryDate: optionalMonthSchema,
    credentialId: z.string().trim().max(120),
    credentialUrl: optionalExternalUrl,
    description: trimmedText(10, 1_000),
    image: mediaAssetSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.expiryDate && value.expiryDate < value.issueDate) {
      context.addIssue({
        code: "custom",
        path: ["expiryDate"],
        message: "Expiry date cannot be earlier than issue date.",
      });
    }
    if (value.image.url && !value.image.alt) {
      context.addIssue({
        code: "custom",
        path: ["image", "alt"],
        message: "Add alternative text for the credential image.",
      });
    }
  });

export const skillInputSchema = publishableContentSchema
  .extend({
    name: trimmedText(1, 80),
    category: z.enum(SKILL_CATEGORIES),
    level: z.string().trim().max(60),
    color: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color."),
  })
  .strict();

export const profileInputSchema = z
  .object({
    name: trimmedText(2, 120),
    eyebrow: trimmedText(4, 160),
    headline: trimmedText(10, 220),
    biography: trimmedText(20, 1_500),
    availability: trimmedText(4, 180),
    location: trimmedText(2, 120),
    email: z.string().trim().email().max(180),
    resumeUrl: optionalExternalUrl,
    portrait: mediaAssetSchema,
    socials: z
      .object({
        linkedin: optionalExternalUrl,
        github: optionalExternalUrl,
        instagram: optionalExternalUrl,
      })
      .strict(),
    metrics: z
      .array(
        z
          .object({
            value: trimmedText(1, 30),
            label: trimmedText(1, 60),
          })
          .strict(),
      )
      .max(6),
    seo: z
      .object({
        title: trimmedText(10, 70),
        description: trimmedText(50, 170),
      })
      .strict(),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.portrait.url) {
      context.addIssue({
        code: "custom",
        path: ["portrait", "url"],
        message: "Add a portrait image.",
      });
    }
    if (value.portrait.url && !value.portrait.alt) {
      context.addIssue({
        code: "custom",
        path: ["portrait", "alt"],
        message: "Add alternative text for the portrait.",
      });
    }
  });

function text(formData: FormData, name: string) {
  return String(formData.get(name) || "");
}

function checked(formData: FormData, name: string) {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function lines(formData: FormData, name: string) {
  return uniqueList(text(formData, name).split(/\r?\n/));
}

function commaSeparated(formData: FormData, name: string) {
  return uniqueList(text(formData, name).split(","));
}

export function mediaFromForm(formData: FormData, prefix: string) {
  return {
    url: text(formData, `${prefix}Url`),
    publicId: text(formData, `${prefix}PublicId`),
    alt: text(formData, `${prefix}Alt`),
    version: text(formData, `${prefix}Version`),
    signature: text(formData, `${prefix}Signature`) || undefined,
    resourceType: text(formData, `${prefix}ResourceType`) || undefined,
    width: text(formData, `${prefix}Width`),
    height: text(formData, `${prefix}Height`),
    format: text(formData, `${prefix}Format`) || undefined,
    bytes: text(formData, `${prefix}Bytes`),
  };
}

export function parseExperienceForm(formData: FormData) {
  return experienceInputSchema.safeParse({
    organization: text(formData, "organization"),
    role: text(formData, "role"),
    location: text(formData, "location"),
    startDate: text(formData, "startDate"),
    endDate: checked(formData, "isCurrent") ? "" : text(formData, "endDate"),
    isCurrent: checked(formData, "isCurrent"),
    logo: mediaFromForm(formData, "logo"),
    highlights: lines(formData, "highlights"),
    status: text(formData, "status"),
  });
}

export function parseProjectForm(formData: FormData) {
  return projectInputSchema.safeParse({
    title: text(formData, "title"),
    role: text(formData, "role"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    image: mediaFromForm(formData, "image"),
    technologies: commaSeparated(formData, "technologies"),
    liveUrl: text(formData, "liveUrl"),
    repositoryUrl: text(formData, "repositoryUrl"),
    projectState: text(formData, "projectState"),
    featured: checked(formData, "featured"),
    status: text(formData, "status"),
  });
}

export function parseCertificationForm(formData: FormData) {
  return certificationInputSchema.safeParse({
    title: text(formData, "title"),
    issuer: text(formData, "issuer"),
    issueDate: text(formData, "issueDate"),
    expiryDate: text(formData, "expiryDate"),
    credentialId: text(formData, "credentialId"),
    credentialUrl: text(formData, "credentialUrl"),
    description: text(formData, "description"),
    image: mediaFromForm(formData, "image"),
    status: text(formData, "status"),
  });
}

export function parseSkillForm(formData: FormData) {
  return skillInputSchema.safeParse({
    name: text(formData, "name"),
    category: text(formData, "category"),
    level: text(formData, "level"),
    color: text(formData, "color"),
    status: text(formData, "status"),
  });
}

export function parseProfileForm(formData: FormData) {
  const metricValues = formData.getAll("metricValue").map(String);
  const metricLabels = formData.getAll("metricLabel").map(String);
  const metrics = metricValues
    .map((value, index) => ({ value, label: metricLabels[index] || "" }))
    .filter((metric) => metric.value.trim() || metric.label.trim());

  return profileInputSchema.safeParse({
    name: text(formData, "name"),
    eyebrow: text(formData, "eyebrow"),
    headline: text(formData, "headline"),
    biography: text(formData, "biography"),
    availability: text(formData, "availability"),
    location: text(formData, "location"),
    email: text(formData, "email"),
    resumeUrl: text(formData, "resumeUrl"),
    portrait: mediaFromForm(formData, "portrait"),
    socials: {
      linkedin: text(formData, "linkedin"),
      github: text(formData, "github"),
      instagram: text(formData, "instagram"),
    },
    metrics,
    seo: {
      title: text(formData, "seoTitle"),
      description: text(formData, "seoDescription"),
    },
  });
}

export function flattenIssues(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fieldErrors[key] ??= [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}
