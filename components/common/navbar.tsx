"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";
import { LogOut, UserIcon, Home, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Subscription, SubscriptionPlan } from "@/types/subscription";
import type { Profile } from "@/types/users";
import { SubscriptionBadge } from "../ui/subscription-badge";
import { signOut } from "@/lib/actions/auth-actions";
import { ThemeToggle } from "../themes/theme-toggle";

interface NavbarProps {
  user?: User;
  profile?: Profile;
  subscription?: Subscription;
  variant?: "landing" | "dashboard";
  showNavigation?: boolean;
  currentPage?: string;
}

export function Navbar({
  user,
  profile,
  subscription,
  variant = "landing",
  showNavigation = true,
  currentPage,
}: NavbarProps) {
  const router = useRouter();

  const subscriptionPlan = (subscription?.plan as SubscriptionPlan) || "free";
  const isPremium = subscriptionPlan === "basic" || subscriptionPlan === "pro";

  const userInitials =
    profile?.email?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";
  const fullName = profile?.full_name || user?.user_metadata?.full_name;
  const email = profile?.email || user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  const displayName = fullName || "User";

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Current Page */}
          <div className="flex items-center">
            <Link
              href={variant === "dashboard" ? "/dashboard" : "/"}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {variant === "dashboard" && currentPage
                  ? currentPage
                  : "Alertino"}
              </h1>
            </Link>
          </div>

          {/* Navigation - Only show on landing variant */}
          {variant === "landing" && showNavigation && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Theme Toggle - Only show on dashboard */}
                {variant === "dashboard" && (
                  <div className="flex items-center">
                    <ThemeToggle />
                  </div>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:bg-muted"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-card border-border"
                    align="end"
                  >
                    {/* User Info */}
                    <div className="mb-1 px-3 py-2 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {displayName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {email}
                          </p>
                          <div className="mt-1">
                            <SubscriptionBadge
                              plan={subscriptionPlan}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center w-full px-3 py-2 gap-0! text-foreground hover:bg-muted"
                      >
                        <Home className="mr-3 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account-settings"
                        className="flex items-center w-full px-3 py-2 gap-0! text-foreground hover:bg-muted"
                      >
                        <UserIcon className="mr-3 h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    {!isPremium && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/pricing"
                          className="flex items-center w-full px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-muted"
                        >
                          <Crown className="mr-3 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Upgrade to Pro</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <form action={signOut} className="p-0! w-full">
                        <button
                          type="submit"
                          className="flex items-center w-full px-3 py-2 rounded-sm text-destructive hover:bg-muted"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-destructive" />
                          <span>Sign out</span>
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
