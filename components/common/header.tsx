import { createClientForServer } from "@/app/utils/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Profile } from "@/types/users";
import { User } from "@supabase/supabase-js";
import { LogOut, UserIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface HeaderProps {
  user: User;
  profile: Profile;
}

export async function Header({ user, profile }: HeaderProps) {
  async function signOut() {
    "use server";
    const supabase = await createClientForServer();
    await supabase.auth.signOut();
    redirect("/");
  }

  const userInitials = profile.email.charAt(0).toUpperCase() || "U";
  const fullName = profile.full_name;
  const email = profile.email;
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600">Alertino</h1>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-gray-700 font-medium">
              {fullName
                ? `Hi, ${fullName.split(" ")[0]}!`
                : `Hi, ${email.split("@")[0]}!`}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center w-full">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <form action={signOut}>
                    <button type="submit" className="flex items-center w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
