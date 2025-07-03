import { Button } from "@/components/ui/button";
import { createPortalSessionAction } from "@/lib/actions/subscription-actions";

export function ManageButton() {
  return (
    <form action={createPortalSessionAction}>
      <Button type="submit" variant="outline">
        Manage Subscription
      </Button>
    </form>
  );
}
