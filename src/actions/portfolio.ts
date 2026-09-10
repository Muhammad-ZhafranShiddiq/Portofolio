"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { assertAdmin, UnauthorizedAdminError } from "@/lib/auth/session";
import { normalizeUploadedAsset } from "@/lib/cloudinary/server";
import type { ActionState } from "@/lib/portfolio/action-state";
import {
  ContentOrderConflictError,
  createContent,
  deleteContent,
  reorderContent,
  saveProfile,
  updateContent,
} from "@/lib/portfolio/repository";
import {
  flattenIssues,
  parseCertificationForm,
  parseExperienceForm,
  parseProfileForm,
  parseProjectForm,
  parseSkillForm,
} from "@/lib/portfolio/schemas";
import type {
  Certification,
  ContentMutationInput,
  ContentOrderActionResult,
  Experience,
  Project,
  Skill,
  SkillCategory,
} from "@/lib/portfolio/types";
import { SKILL_CATEGORIES } from "@/lib/portfolio/types";

function validationFailure(error: z.ZodError): ActionState {
  return {
    status: "error",
    message: "Review the highlighted information and try again.",
    fieldErrors: flattenIssues(error),
  };
}

function actionFailure(error: unknown): ActionState {
  if (error instanceof UnauthorizedAdminError) {
    return {
      status: "error",
      message: "Your session is no longer authorized. Sign in again.",
      fieldErrors: {},
    };
  }

  console.error("Portfolio mutation failed", error);
  return {
    status: "error",
    message:
      error instanceof Error && error.message.includes("not configured")
        ? error.message
        : "The change could not be saved. Please try again.",
    fieldErrors: {},
  };
}

function revalidatePortfolio(adminPath: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(adminPath);
}

const orderedIdsSchema = z
  .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid content ID."))
  .max(500)
  .superRefine((ids, context) => {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Duplicate content IDs are not allowed.",
      });
    }
  });

const skillCategorySchema = z.enum(SKILL_CATEGORIES);

function orderActionFailure(error: unknown): ContentOrderActionResult {
  if (error instanceof ContentOrderConflictError) {
    return {
      status: "conflict",
      message: "This list changed in another tab. It has been refreshed; reorder it again.",
    };
  }
  if (error instanceof UnauthorizedAdminError) {
    return {
      status: "error",
      message: "Your session is no longer authorized. Sign in again.",
    };
  }

  console.error("Portfolio reorder failed", error);
  return {
    status: "error",
    message: "The new order could not be saved. Your previous order was restored.",
  };
}

async function reorderCollectionAction(
  collection: "experiences" | "projects" | "certifications",
  adminPath: string,
  expectedIds: string[],
  orderedIds: string[],
): Promise<ContentOrderActionResult> {
  try {
    await assertAdmin();
    const parsedExpectedIds = orderedIdsSchema.safeParse(expectedIds);
    const parsedIds = orderedIdsSchema.safeParse(orderedIds);
    if (!parsedExpectedIds.success || !parsedIds.success) {
      return { status: "error", message: "The submitted order is invalid." };
    }

    await reorderContent(collection, parsedIds.data, parsedExpectedIds.data);
    revalidatePortfolio(adminPath);
    return { status: "success", message: "Order saved." };
  } catch (error) {
    return orderActionFailure(error);
  }
}

export async function reorderExperiencesAction(
  expectedIds: string[],
  orderedIds: string[],
): Promise<ContentOrderActionResult> {
  return reorderCollectionAction(
    "experiences",
    "/admin/experiences",
    expectedIds,
    orderedIds,
  );
}

export async function reorderProjectsAction(
  expectedIds: string[],
  orderedIds: string[],
): Promise<ContentOrderActionResult> {
  return reorderCollectionAction(
    "projects",
    "/admin/projects",
    expectedIds,
    orderedIds,
  );
}

export async function reorderCertificationsAction(
  expectedIds: string[],
  orderedIds: string[],
): Promise<ContentOrderActionResult> {
  return reorderCollectionAction(
    "certifications",
    "/admin/certifications",
    expectedIds,
    orderedIds,
  );
}

export async function reorderSkillsAction(
  category: SkillCategory,
  expectedIds: string[],
  orderedIds: string[],
): Promise<ContentOrderActionResult> {
  try {
    await assertAdmin();
    const parsedCategory = skillCategorySchema.safeParse(category);
    const parsedExpectedIds = orderedIdsSchema.safeParse(expectedIds);
    const parsedIds = orderedIdsSchema.safeParse(orderedIds);
    if (
      !parsedCategory.success ||
      !parsedExpectedIds.success ||
      !parsedIds.success
    ) {
      return { status: "error", message: "The submitted order is invalid." };
    }

    await reorderContent(
      "skills",
      parsedIds.data,
      parsedExpectedIds.data,
      parsedCategory.data,
    );
    revalidatePortfolio("/admin/skills");
    return { status: "success", message: "Order saved." };
  } catch (error) {
    return orderActionFailure(error);
  }
}

export async function createExperienceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseExperienceForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    const input = {
      ...parsed.data,
      logo: normalizeUploadedAsset(parsed.data.logo),
    } satisfies ContentMutationInput<Experience>;
    await createContent<Experience>("experiences", input);
    revalidatePortfolio("/admin/experiences");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/experiences?status=created");
}

export async function updateExperienceAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseExperienceForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    const updated = await updateContent<Experience>("experiences", id, {
      ...parsed.data,
      logo: normalizeUploadedAsset(parsed.data.logo),
    });
    if (!updated) {
      return { status: "error", message: "Experience not found.", fieldErrors: {} };
    }
    revalidatePortfolio("/admin/experiences");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/experiences?status=updated");
}

export async function deleteExperienceAction(id: string) {
  await assertAdmin();
  await deleteContent("experiences", id);
  revalidatePortfolio("/admin/experiences");
}

export async function createProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseProjectForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    const input = {
      ...parsed.data,
      image: normalizeUploadedAsset(parsed.data.image),
    } satisfies ContentMutationInput<Project>;
    await createContent<Project>("projects", input);
    revalidatePortfolio("/admin/projects");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/projects?status=created");
}

export async function updateProjectAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseProjectForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    const updated = await updateContent<Project>("projects", id, {
      ...parsed.data,
      image: normalizeUploadedAsset(parsed.data.image),
    });
    if (!updated) {
      return { status: "error", message: "Project not found.", fieldErrors: {} };
    }
    revalidatePortfolio("/admin/projects");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/projects?status=updated");
}

export async function deleteProjectAction(id: string) {
  await assertAdmin();
  await deleteContent("projects", id);
  revalidatePortfolio("/admin/projects");
}

export async function createCertificationAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseCertificationForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    const input = {
      ...parsed.data,
      image: normalizeUploadedAsset(parsed.data.image),
    } satisfies ContentMutationInput<Certification>;
    await createContent<Certification>("certifications", input);
    revalidatePortfolio("/admin/certifications");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/certifications?status=created");
}

export async function updateCertificationAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseCertificationForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    const updated = await updateContent<Certification>("certifications", id, {
      ...parsed.data,
      image: normalizeUploadedAsset(parsed.data.image),
    });
    if (!updated) {
      return {
        status: "error",
        message: "Certification not found.",
        fieldErrors: {},
      };
    }
    revalidatePortfolio("/admin/certifications");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/certifications?status=updated");
}

export async function deleteCertificationAction(id: string) {
  await assertAdmin();
  await deleteContent("certifications", id);
  revalidatePortfolio("/admin/certifications");
}

export async function createSkillAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseSkillForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    await createContent<Skill>("skills", parsed.data);
    revalidatePortfolio("/admin/skills");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/skills?status=created");
}

export async function updateSkillAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseSkillForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    const updated = await updateContent<Skill>("skills", id, parsed.data);
    if (!updated) {
      return { status: "error", message: "Skill not found.", fieldErrors: {} };
    }
    revalidatePortfolio("/admin/skills");
  } catch (error) {
    return actionFailure(error);
  }

  redirect("/admin/skills?status=updated");
}

export async function deleteSkillAction(id: string) {
  await assertAdmin();
  await deleteContent("skills", id);
  revalidatePortfolio("/admin/skills");
}

export async function updateProfileAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = parseProfileForm(formData);
    if (!parsed.success) return validationFailure(parsed.error);

    await saveProfile({
      ...parsed.data,
      portrait: normalizeUploadedAsset(parsed.data.portrait),
    });
    revalidatePortfolio("/admin/profile");
    return {
      status: "success",
      message: "Profile settings saved.",
      fieldErrors: {},
    };
  } catch (error) {
    return actionFailure(error);
  }
}
