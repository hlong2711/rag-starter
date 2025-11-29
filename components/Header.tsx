"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImportModal } from "./ImportModal";
import { ManageDocumentsModal } from "./ManageDocumentsModal";

export function Header() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">RAG Starter</h1>
          <div className="space-x-2">
            <Button onClick={() => setIsImportModalOpen(true)}>
              Import Document
            </Button>
            <Button variant="outline" onClick={() => setIsManageModalOpen(true)}>
              Manage Documents
            </Button>
          </div>
        </div>
      </header>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      <ManageDocumentsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </>
  );
}
