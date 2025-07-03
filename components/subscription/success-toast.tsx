"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export function SuccessToast() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success) {
      toast.success("Subscription activated successfully!");
    }
    if (canceled) {
      toast.error("Subscription canceled");
    }
  }, [success, canceled]);

  return null;
}
