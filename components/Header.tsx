"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImportModal } from "./ImportModal";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">RAG Starter</h1>
          <Button onClick={() => setIsModalOpen(true)}>Import Document</Button>
        </div>
      </header>
      <ImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
