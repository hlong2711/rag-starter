"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createResource } from "@/lib/actions/resources";

export function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (file.type === "application/pdf") {
        // Upload PDF to server, which will use loadFileFromPath
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        setMessage(result.message);
      } else {
        // Handle markdown files client-side
        const reader = new FileReader();
        reader.onload = async (event) => {
          const title = file.name.replace(/\.md$/, "");
          const content = event.target?.result as string;
          console.log({ title, content });
          const result = await createResource({ title, content });

          if (result) {
            setMessage(result);
          }
        };

        reader.onerror = () => {
          throw new Error("Failed to read file.");
        };

        reader.readAsText(file);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFile(null);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Markdown File</Label>
        <Input
          id="file"
          type="file"
          accept=".md,.pdf"
          onChange={handleFileChange}
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !file}>
        {isSubmitting ? "Uploading..." : "Upload"}
      </Button>
      {message && <p className="text-sm text-gray-500 mt-2">{message}</p>}
    </form>
  );
}
