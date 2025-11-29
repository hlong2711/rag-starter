"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { getResources, deleteResource } from "@/lib/actions/resources";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { toast } from "sonner";

type Resource = {
  id: string;
  title: string;
  createdAt: Date;
};

interface ManageDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 5;

export function ManageDocumentsModal({
  isOpen,
  onClose,
}: ManageDocumentsModalProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );

  const fetchResources = async () => {
    const { data, total } = await getResources(page, PAGE_SIZE);
    setResources(data as any);
    setTotal(total);
  };

  useEffect(() => {
    if (isOpen) {
      fetchResources();
    }
  }, [isOpen, page]);

  const handleDelete = async () => {
    if (selectedResourceId) {
      const result = await deleteResource(selectedResourceId);
      if (result?.includes("successfully")) {
        toast.success(result);
        fetchResources(); // Refresh the list
      } else {
        toast.error(result);
      }
      setIsDeleteDialogOpen(false);
      setSelectedResourceId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedResourceId(id);
    setIsDeleteDialogOpen(true);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>{resource.title}</TableCell>
                    <TableCell>
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(resource.id)}
                            className="text-red-500"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(page - 1)}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="p-2">{`Page ${page} of ${totalPages}`}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(page + 1)}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
