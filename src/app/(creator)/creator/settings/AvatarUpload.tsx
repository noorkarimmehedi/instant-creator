"use client";

import { useRef, useState } from "react";
import { SettingsBookmarkButton } from "@/components/ui/SettingsBookmarkButton";

export function AvatarUpload({ currentUrl }: { currentUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-hairline-strong bg-surface-elevated overflow-hidden transition-colors hover:border-accent-orange cursor-pointer"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl text-stone">+</span>
        )}
      </button>
      <div>
        <SettingsBookmarkButton type="button" onClick={() => inputRef.current?.click()} ariaLabel={preview ? "Change photo" : "Upload photo"} icon="upload" wide>
          {preview ? "Change" : "Upload"}
        </SettingsBookmarkButton>
        <p className="text-xs text-stone mt-0.5">JPG, PNG. Max 2MB.</p>
      </div>
      <input
        ref={inputRef}
        name="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
