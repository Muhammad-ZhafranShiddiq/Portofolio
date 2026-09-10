export type ContentStatus = "draft" | "published";

export const SKILL_CATEGORIES = [
  "Industry Knowledge",
  "Tools & Technology",
  "Interpersonal Skill",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface MediaAsset {
  url: string;
  publicId: string;
  alt: string;
  version?: number;
  signature?: string;
  resourceType?: "image" | "raw";
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  instagram: string;
}

export interface ProfileMetric {
  value: string;
  label: string;
}

export interface SeoSettings {
  title: string;
  description: string;
}

export interface Profile {
  id: "profile";
  name: string;
  eyebrow: string;
  headline: string;
  biography: string;
  availability: string;
  location: string;
  email: string;
  resumeUrl: string;
  portrait: MediaAsset;
  socials: SocialLinks;
  metrics: ProfileMetric[];
  seo: SeoSettings;
  updatedAt: string;
}

export interface ContentRecord {
  id: string;
  status: ContentStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Experience extends ContentRecord {
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  logo: MediaAsset;
  highlights: string[];
}

export type ProjectState = "live" | "in-progress" | "private";

export interface Project extends ContentRecord {
  title: string;
  role: string;
  summary: string;
  description: string;
  image: MediaAsset;
  technologies: string[];
  liveUrl: string;
  repositoryUrl: string;
  projectState: ProjectState;
  featured: boolean;
}

export interface Certification extends ContentRecord {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  description: string;
  image: MediaAsset;
}

export interface Skill extends ContentRecord {
  name: string;
  category: SkillCategory;
  level: string;
  color: string;
}

export interface PortfolioData {
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  certifications: Certification[];
  skills: Skill[];
  source: "mongodb" | "fallback";
}

export interface ContentOrderActionResult {
  status: "success" | "conflict" | "error";
  message: string;
}

export type NewContentRecord<T extends ContentRecord> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;

export type ContentMutationInput<T extends ContentRecord> = Omit<
  NewContentRecord<T>,
  "displayOrder"
>;
