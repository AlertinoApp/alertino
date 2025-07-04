"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteFilterAction } from "@/lib/actions/filter-actions";
import { toast } from "sonner";

interface DeleteFilterDialogProps {
  filterId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteFilterDialog({
  filterId,
  isOpen,
  onClose,
}: DeleteFilterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFilterAction(filterId);
      toast.success("Filter deleted successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to delete filter:", error);
      toast.error("Failed to delete filter. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Filter</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this filter? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
