"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccountAction } from "@/lib/actions/profile-actions";

export function DangerZone() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") return;

    setIsDeleting(true);
    try {
      await deleteAccountAction();
    } catch (error) {
      console.error("Failed to delete account:", error);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="shadow-sm border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-red-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-white rounded-lg border border-red-200">
          <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>

          {!showConfirmation ? (
            <Button
              variant="destructive"
              onClick={() => setShowConfirmation(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-2">
                  This will permanently delete your account and all data
                  including:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>All saved filters and alerts</li>
                  <li>Personal information and preferences</li>
                  <li>Account history and activity</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-red-900">
                  Type &quot;DELETE&quot; to confirm:
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="border-red-300 focus:border-red-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmationText("");
                  }}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={confirmationText !== "DELETE" || isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
