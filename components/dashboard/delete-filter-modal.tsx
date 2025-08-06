"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  deleteFilterAction,
  getFilterAlertCount,
} from "@/lib/actions/filter-actions";
import { toast } from "sonner";

interface DeleteFilterDialogProps {
  filterId: string;
  filterName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteFilterDialog({
  filterId,
  filterName = "this filter",
  isOpen,
  onClose,
}: DeleteFilterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertCount, setAlertCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Fetch alert count when modal opens
  useEffect(() => {
    if (isOpen && filterId) {
      setIsLoadingCount(true);
      getFilterAlertCount(filterId)
        .then((count) => {
          setAlertCount(count);
        })
        .catch((error) => {
          console.error("Failed to get alert count:", error);
          setAlertCount(0);
        })
        .finally(() => {
          setIsLoadingCount(false);
        });
    }
  }, [isOpen, filterId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting filter...", {
      description:
        alertCount && alertCount > 0
          ? `We're removing this filter and all ${alertCount} associated alert${alertCount === 1 ? "" : "s"}.`
          : "We're removing this filter and any associated alerts.",
    });

    try {
      await deleteFilterAction(filterId);

      toast.dismiss(loadingToast);

      if (alertCount && alertCount > 0) {
        toast("✅ Filter and alerts deleted", {
          description: `Filter and its ${alertCount} alert${alertCount === 1 ? "" : "s"} have been deleted.`,
        });
      } else {
        toast("✅ Filter deleted", {
          description: "The filter was successfully removed from your list.",
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to delete filter:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to delete filter", {
        description: "Something went wrong while deleting. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setAlertCount(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Filter</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {filterName}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {isLoadingCount ? (
          <div className="py-4 text-center text-sm text-gray-500">
            Loading alert count...
          </div>
        ) : alertCount !== null && alertCount > 0 ? (
          <div className="py-4">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                This filter has {alertCount} alert{alertCount === 1 ? "" : "s"}{" "}
                associated with it.
              </p>
              <p className="text-sm text-yellow-700">
                Deleting this filter will also remove all associated alerts
                permanently.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
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
