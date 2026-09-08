import type { ProjectState } from "@/lib/portfolio/types";

export const projectStateLabels: Record<ProjectState, string> = {
  live: "Live project",
  "in-progress": "In progress",
  private: "Private build",
};

export function unavailableProjectLabel(projectState: ProjectState) {
  if (projectState === "in-progress") {
    return "In active development";
  }

  if (projectState === "private") {
    return "Private project";
  }

  return "Case study coming soon";
}
