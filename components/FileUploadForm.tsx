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

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace(/\.md$/, "");
      const result = await createResource({ title, content });

      if (result) {
        setMessage(result);
      }

      setFile(null);
      setIsSubmitting(false);
    };

    reader.onerror = () => {
      setMessage("Failed to read file.");
      setIsSubmitting(false);
    };

    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Markdown File</Label>
        <Input
          id="file"
          type="file"
          accept=".md"
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
