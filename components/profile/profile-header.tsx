import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";
import { Profile } from "@/types/users";

interface ProfileHeaderProps {
  user: User;
  profile: Profile;
}

export function ProfileHeader({ user, profile }: ProfileHeaderProps) {
  const displayName =
    profile?.full_name || user.user_metadata?.full_name || "User";
  const userInitials = displayName.charAt(0).toUpperCase();
  const isEmailVerified = user.email_confirmed_at !== null;

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage
              src={user.user_metadata?.avatar_url || "/placeholder.svg"}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {displayName}
            </h1>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{user.email}</span>
              </div>
              {isEmailVerified && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-gray-600">
              Member since{" "}
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
