"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";

import { assertAdmin, UnauthorizedAdminError } from "@/lib/auth/session";
import { normalizeUploadedAsset } from "@/lib/cloudinary/server";
import type { ActionState } from "@/lib/portfolio/action-state";
import {
  createContent,
  deleteContent,
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
  Experience,
  NewContentRecord,
  Project,
  Skill,
} from "@/lib/portfolio/types";

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
    } satisfies NewContentRecord<Experience>;
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
    } satisfies NewContentRecord<Project>;
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
    } satisfies NewContentRecord<Certification>;
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
