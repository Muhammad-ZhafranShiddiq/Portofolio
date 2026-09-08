import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export type FieldErrors = Record<string, string[]>;

const inputClassName =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#335cff] focus:ring-4 focus:ring-[#335cff]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function fieldId(name: string) {
  return `field-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;

  return (
    <div id={id} className="space-y-1 text-sm text-rose-700">
      {errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
}

interface SharedFieldProps {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
  required?: boolean;
}

export function TextField({
  label,
  name,
  hint,
  errors,
  required,
  className,
  ...props
}: SharedFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = props.id || fieldId(name);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, errors?.length ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required ? (
          <span className="ml-1 text-rose-600" aria-label="required">
            *
          </span>
        ) : null}
      </label>
      <input
        {...props}
        id={id}
        name={name}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={inputClassName}
      />
      {hint ? (
        <p id={hintId} className="mt-2 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} errors={errors} />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  hint,
  errors,
  required,
  className,
  ...props
}: SharedFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = props.id || fieldId(name);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, errors?.length ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required ? (
          <span className="ml-1 text-rose-600" aria-label="required">
            *
          </span>
        ) : null}
      </label>
      <textarea
        {...props}
        id={id}
        name={name}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`${inputClassName} min-h-32 resize-y`}
      />
      {hint ? (
        <p id={hintId} className="mt-2 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} errors={errors} />
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  label,
  name,
  hint,
  errors,
  required,
  options,
  className,
  ...props
}: SharedFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  const id = props.id || fieldId(name);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, errors?.length ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required ? (
          <span className="ml-1 text-rose-600" aria-label="required">
            *
          </span>
        ) : null}
      </label>
      <select
        {...props}
        id={id}
        name={name}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={inputClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="mt-2 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
      <FieldError id={errorId} errors={errors} />
    </div>
  );
}

export function CheckboxField({
  label,
  description,
  name,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
}) {
  const id = props.id || fieldId(name || label);

  return (
    <label
      htmlFor={id}
      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition hover:border-slate-300 ${className || ""}`}
    >
      <input
        {...props}
        id={id}
        name={name}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-[#335cff]"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function fieldErrors(errors: FieldErrors, key: string) {
  return errors[key];
}
