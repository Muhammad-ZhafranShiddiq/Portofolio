import "server-only";

import { v2 as cloudinary } from "cloudinary";

import type { MediaAsset } from "@/lib/portfolio/types";

export type UploadKind =
  | "portrait"
  | "experience"
  | "project"
  | "certification"
  | "resume";

const uploadRules: Record<
  UploadKind,
  {
    resourceType: "image" | "raw";
    folder: string;
    acceptedTypes: string[];
    maxBytes: number;
  }
> = {
  portrait: {
    resourceType: "image",
    folder: "portfolio/portrait",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 8_000_000,
  },
  experience: {
    resourceType: "image",
    folder: "portfolio/experience",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 5_000_000,
  },
  project: {
    resourceType: "image",
    folder: "portfolio/project",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 10_000_000,
  },
  certification: {
    resourceType: "image",
    folder: "portfolio/certification",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 8_000_000,
  },
  resume: {
    resourceType: "raw",
    folder: "portfolio/resume",
    acceptedTypes: ["application/pdf"],
    maxBytes: 8_000_000,
  },
};

function getCloudinaryEnvironment() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Add the Cloudinary environment variables first.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { cloudName, apiKey, apiSecret };
}

export function createUploadSignature(kind: UploadKind) {
  const environment = getCloudinaryEnvironment();
  const rules = uploadRules[kind];
  const uploadPreset =
    rules.resourceType === "raw"
      ? process.env.CLOUDINARY_RESUME_UPLOAD_PRESET
      : process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;

  if (!uploadPreset) {
    throw new Error(
      `Cloudinary ${rules.resourceType} uploads are not configured.`,
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    folder: rules.folder,
    timestamp,
    upload_preset: uploadPreset,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    environment.apiSecret,
  );

  return {
    signature,
    timestamp,
    folder: rules.folder,
    uploadPreset,
    apiKey: environment.apiKey,
    cloudName: environment.cloudName,
    resourceType: rules.resourceType,
    acceptedTypes: rules.acceptedTypes,
    maxBytes: rules.maxBytes,
  };
}

type ResponseSignatureVerifier = (
  publicId: string,
  version: number,
  signature: string,
) => boolean;

export function normalizeUploadedAsset(asset: MediaAsset): MediaAsset {
  if (!asset.publicId) {
    return asset;
  }

  if (!asset.version || !asset.signature) {
    throw new Error("The uploaded asset could not be verified.");
  }

  getCloudinaryEnvironment();
  const verify = (
    cloudinary.utils as typeof cloudinary.utils & {
      verify_api_response_signature: ResponseSignatureVerifier;
    }
  ).verify_api_response_signature;

  if (!verify(asset.publicId, asset.version, asset.signature)) {
    throw new Error("The uploaded asset signature is invalid.");
  }

  return {
    ...asset,
    resourceType: asset.resourceType || "image",
    url: cloudinary.url(asset.publicId, {
      secure: true,
      version: asset.version,
      resource_type: asset.resourceType || "image",
      format: asset.format || undefined,
    }),
  };
}
