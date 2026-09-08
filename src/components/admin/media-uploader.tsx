"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { FileText, ImagePlus, LoaderCircle, Trash2, UploadCloud } from "lucide-react";

import type { MediaAsset } from "@/lib/portfolio/types";

type ImageUploadKind = "portrait" | "experience" | "project" | "certification";
type UploadKind = ImageUploadKind | "resume";

interface SignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
  uploadPreset: string;
  apiKey: string;
  cloudName: string;
  resourceType: "image" | "raw";
  acceptedTypes: string[];
  maxBytes: number;
  error?: string;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  version?: number;
  signature?: string;
  resource_type?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  error?: { message?: string };
}

const imageAccept = "image/jpeg,image/png,image/webp,image/avif";

async function uploadToCloudinary(file: File, kind: UploadKind) {
  const signatureRequest = await fetch("/api/cloudinary/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const signature = (await signatureRequest.json()) as SignatureResponse;

  if (!signatureRequest.ok) {
    throw new Error(signature.error || "Unable to prepare the upload.");
  }
  if (!signature.acceptedTypes.includes(file.type)) {
    throw new Error("Choose a supported file format.");
  }
  if (file.size > signature.maxBytes) {
    throw new Error(
      `This file is too large. The maximum size is ${Math.round(signature.maxBytes / 1_000_000)} MB.`,
    );
  }

  const payload = new FormData();
  payload.set("file", file);
  payload.set("api_key", signature.apiKey);
  payload.set("timestamp", String(signature.timestamp));
  payload.set("signature", signature.signature);
  payload.set("upload_preset", signature.uploadPreset);
  payload.set("folder", signature.folder);

  const uploadRequest = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/${signature.resourceType}/upload`,
    { method: "POST", body: payload },
  );
  const upload = (await uploadRequest.json()) as CloudinaryUploadResponse;

  if (!uploadRequest.ok || !upload.secure_url || !upload.public_id) {
    throw new Error(upload.error?.message || "The upload did not complete.");
  }

  return upload;
}

function HiddenMediaFields({
  prefix,
  asset,
}: {
  prefix: string;
  asset: MediaAsset;
}) {
  return (
    <>
      <input type="hidden" name={`${prefix}Url`} value={asset.url} />
      <input type="hidden" name={`${prefix}PublicId`} value={asset.publicId} />
      <input type="hidden" name={`${prefix}Version`} value={asset.version ?? ""} />
      <input type="hidden" name={`${prefix}Signature`} value={asset.signature ?? ""} />
      <input type="hidden" name={`${prefix}ResourceType`} value={asset.resourceType ?? ""} />
      <input type="hidden" name={`${prefix}Width`} value={asset.width ?? ""} />
      <input type="hidden" name={`${prefix}Height`} value={asset.height ?? ""} />
      <input type="hidden" name={`${prefix}Format`} value={asset.format ?? ""} />
      <input type="hidden" name={`${prefix}Bytes`} value={asset.bytes ?? ""} />
    </>
  );
}

export function MediaUploader({
  label,
  description,
  kind,
  prefix,
  initialAsset,
  errors,
  required,
}: {
  label: string;
  description: string;
  kind: ImageUploadKind;
  prefix: "portrait" | "logo" | "image";
  initialAsset: MediaAsset;
  errors?: Record<string, string[]>;
  required?: boolean;
}) {
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [asset, setAsset] = useState(initialAsset);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const urlErrors = errors?.[`${prefix}.url`];
  const altErrors = errors?.[`${prefix}.alt`];

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      const uploaded = await uploadToCloudinary(file, kind);
      setAsset((current) => ({
        url: uploaded.secure_url || "",
        publicId: uploaded.public_id || "",
        alt: current.alt,
        version: uploaded.version,
        signature: uploaded.signature,
        resourceType: uploaded.resource_type === "raw" ? "raw" : "image",
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
      }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload this file.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-800">
          {label}
          {required ? (
            <span className="ml-1 text-rose-600" aria-label="required">
              *
            </span>
          ) : null}
        </label>
        {asset.url ? (
          <button
            type="button"
            onClick={() => setAsset({ url: "", publicId: "", alt: "" })}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-rose-700 outline-none hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
            Remove
          </button>
        ) : null}
      </div>
      <p className="mb-3 text-xs leading-5 text-slate-500">{description}</p>

      <div className="grid gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 sm:grid-cols-[9rem_1fr] sm:p-4">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          {asset.url ? (
            <Image
              src={asset.url}
              alt=""
              fill
              unoptimized
              sizes="144px"
              className="object-cover"
            />
          ) : (
            <ImagePlus aria-hidden="true" className="size-8 text-slate-300" />
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <input
            ref={fileInput}
            id={inputId}
            type="file"
            accept={imageAccept}
            disabled={uploading}
            onChange={(event) => void handleFile(event.target.files?.[0])}
            className="sr-only"
          />
          <label
            htmlFor={inputId}
            className={`inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-[#335cff] hover:text-[#335cff] focus-within:ring-2 focus-within:ring-[#335cff] focus-within:ring-offset-2 ${
              uploading ? "cursor-wait opacity-60" : "cursor-pointer"
            }`}
          >
            {uploading ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <UploadCloud aria-hidden="true" className="size-4" />
            )}
            {uploading ? "Uploading…" : asset.url ? "Replace image" : "Choose image"}
          </label>
          <p className="mt-2 truncate text-xs text-slate-500">
            {asset.publicId || (asset.url ? asset.url : "JPG, PNG, WebP, or AVIF")}
          </p>
          {uploadError ? (
            <p role="alert" className="mt-2 text-sm text-rose-700">
              {uploadError}
            </p>
          ) : null}
          {urlErrors?.map((error) => (
            <p key={error} className="mt-2 text-sm text-rose-700">
              {error}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor={`${inputId}-alt`} className="mb-2 block text-sm font-semibold text-slate-800">
          Alternative text
          {asset.url ? (
            <span className="ml-1 text-rose-600" aria-label="required">
              *
            </span>
          ) : null}
        </label>
        <input
          id={`${inputId}-alt`}
          name={`${prefix}Alt`}
          value={asset.alt}
          onChange={(event) =>
            setAsset((current) => ({ ...current, alt: event.target.value }))
          }
          maxLength={240}
          aria-invalid={altErrors?.length ? true : undefined}
          aria-describedby={altErrors?.length ? `${inputId}-alt-error` : undefined}
          placeholder="Describe what the image shows"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#335cff] focus:ring-4 focus:ring-[#335cff]/10"
        />
        {altErrors?.length ? (
          <div id={`${inputId}-alt-error`} className="mt-2 text-sm text-rose-700">
            {altErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
      </div>

      <HiddenMediaFields prefix={prefix} asset={asset} />
    </div>
  );
}

export function ResumeUploader({
  initialUrl,
  errors,
}: {
  initialUrl: string;
  errors?: string[];
}) {
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const uploaded = await uploadToCloudinary(file, "resume");
      setUrl(uploaded.secure_url || "");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload this file.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div>
      <label htmlFor={`${inputId}-url`} className="mb-2 block text-sm font-semibold text-slate-800">
        Resume URL
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`${inputId}-url`}
          name="resumeUrl"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          maxLength={2000}
          placeholder="https://…"
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={errors?.length ? `${inputId}-error` : undefined}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#335cff] focus:ring-4 focus:ring-[#335cff]/10"
        />
        <input
          ref={fileInput}
          id={inputId}
          type="file"
          accept="application/pdf"
          disabled={uploading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
          className="sr-only"
        />
        <label
          htmlFor={inputId}
          className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition hover:border-[#335cff] hover:text-[#335cff] focus-within:ring-2 focus-within:ring-[#335cff] focus-within:ring-offset-2 ${uploading ? "cursor-wait opacity-60" : "cursor-pointer"}`}
        >
          {uploading ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <FileText aria-hidden="true" className="size-4" />
          )}
          {uploading ? "Uploading…" : "Upload PDF"}
        </label>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Paste a secure link or upload a PDF directly to Cloudinary.
      </p>
      {uploadError ? (
        <p role="alert" className="mt-2 text-sm text-rose-700">
          {uploadError}
        </p>
      ) : null}
      {errors?.length ? (
        <div id={`${inputId}-error`} className="mt-2 text-sm text-rose-700">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
