"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Save, X, Key } from "lucide-react";
import { updateProfileAction } from "@/lib/actions/profile-actions";
import { Profile } from "@/types/users";

interface PersonalInformationProps {
  user: User;
  profile: Profile | null;
}

export function PersonalInformation({
  user,
  profile,
}: PersonalInformationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user.user_metadata?.full_name || "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfileAction(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || user.user_metadata?.full_name || "",
    });
    setIsEditing(false);
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Personal Information
        </CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            {isEditing ? (
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                placeholder="Enter your full name"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                {formData.full_name || "Not provided"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-500">
              {user.email}
              <span className="text-xs ml-2">(Cannot be changed)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
