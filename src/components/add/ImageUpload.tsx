"use client";

import { useState, useCallback } from "react";
import type { ParsedScorecard } from "@/lib/types";

export default function ImageUpload({
  onParsed,
  passcode,
  onPasscodeRejected,
}: {
  onParsed: (data: ParsedScorecard) => void;
  passcode: string;
  onPasscodeRejected: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        setLoading(true);
        try {
          const res = await fetch("/api/parse-scorecard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: file.type,
              passcode,
            }),
          });

          if (res.status === 401) {
            onPasscodeRejected();
            return;
          }

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to parse scorecard");
          }

          const data = await res.json();
          onParsed(data);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to parse scorecard"
          );
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [onParsed, passcode, onPasscodeRejected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-forest-lighter rounded-xl p-8 text-center hover:border-green transition-colors"
    >
      {loading ? (
        <div className="space-y-3">
          <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full mx-auto" />
          <p className="text-gold font-medium">
            Analyzing scorecard with Claude Vision...
          </p>
          <p className="text-sm text-gray-400">This may take a few seconds</p>
        </div>
      ) : (
        <>
          {preview && (
            <img
              src={preview}
              alt="Scorecard preview"
              className="max-h-48 mx-auto mb-4 rounded-lg"
            />
          )}
          <p className="text-white font-semibold mb-2">
            Upload Scorecard Image
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Drag & drop or click to upload. Claude Vision will automatically
            parse player names, course, and hole-by-hole scores.
          </p>
          <label className="inline-block bg-gold text-forest font-bold px-6 py-2 rounded-lg cursor-pointer hover:bg-gold/90 transition-colors">
            Choose Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </>
      )}

      {error && (
        <div className="mt-4 bg-red-900/30 border border-red-600 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
