"use client";

import { useState, useRef } from "react";
import { saveGroupMedia } from "@/api/saveGroupMedia";

interface AttachmentModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (media: unknown) => void;
}

export default function AttachmentModal({
  groupId,
  isOpen,
  onClose,
  onUploaded,
}: AttachmentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const response = await saveGroupMedia({ groupId, file, caption });

      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }

      onUploaded?.(response.data);
      handleClose();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCaption("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-slate-900">Add Media</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a photo or video and describe it with an optional caption.
        </p>

        <div className="mt-5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
          >
            {file ? (
              <>
                <span className="block text-base font-semibold text-slate-700">
                  {file.name}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Click to change the file
                </span>
              </>
            ) : (
              <>
                <span className="block text-base font-semibold text-slate-700">
                  Click to select a file
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  PNG, JPG, GIF or MP4 up to 25 MB
                </span>
              </>
            )}
          </button>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Caption (optional)
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Say something about this media..."
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}