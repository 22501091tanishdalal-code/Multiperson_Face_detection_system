// src/lib/FormField.tsx
import React from "react";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1">{children}</label>;
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }
) {
  const { error, className = "", ...rest } = props;
  return (
    <div>
      <input
        {...rest}
        className={
          "w-full rounded-lg border px-3 py-2 outline-none " +
          (error ? "border-red-500" : "border-slate-300") +
          " " +
          className
        }
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
) {
  const { error, className = "", children, ...rest } = props;
  return (
    <div>
      <select
        {...rest}
        className={
          "w-full rounded-lg border px-3 py-2 " +
          (error ? "border-red-500" : "border-slate-300") +
          " " +
          className
        }
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium border bg-black text-white hover:bg-neutral-800 " +
        className
      }
    />
  );
}
