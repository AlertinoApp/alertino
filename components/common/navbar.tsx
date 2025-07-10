"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type SubscriptionPlan } from "@/lib/subscription-utils";
import type { User } from "@supabase/supabase-js";
import { LogOut, UserIcon, CreditCard, Home, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Subscription } from "@/types/subscription";
import type { Profile } from "@/types/users";
import { SubscriptionBadge } from "../ui/subscription-badge";
import { signOut } from "@/lib/actions/auth-actions";

interface NavbarProps {
  user?: User;
  profile?: Profile;
  subscription?: Subscription;
  variant?: "landing" | "dashboard";
  showNavigation?: boolean;
}

export function Navbar({
  user,
  profile,
  subscription,
  variant = "landing",
  showNavigation = true,
}: NavbarProps) {
  const router = useRouter();

  const subscriptionPlan = (subscription?.plan as SubscriptionPlan) || "free";
  const isPremium =
    subscriptionPlan === "premium" || subscriptionPlan === "business";

  const userInitials =
    profile?.email?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";
  const fullName = profile?.full_name || user?.user_metadata?.full_name;
  const email = profile?.email || user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  const displayName = fullName || "User";
  const welcomeName = fullName
    ? fullName.split(" ")[0]
    : email?.split("@")[0] || "User";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href={variant === "dashboard" ? "/dashboard" : "/"}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Alertino</h1>
            </Link>
          </div>

          {/* Navigation - Only show on landing variant */}
          {variant === "landing" && showNavigation && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/#features"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="/pricing"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </Link>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Welcome Message - Only show on dashboard */}
                {variant === "dashboard" && (
                  <div className="hidden md:flex items-center gap-3">
                    <span className="text-slate-700 font-medium">
                      Hi, {welcomeName}!
                    </span>
                  </div>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:bg-slate-100"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
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
                        className="flex items-center w-full px-3 py-2"
                      >
                        <Home className="mr-3 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center w-full px-3 py-2"
                      >
                        <UserIcon className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/billing"
                        className="flex items-center w-full px-3 py-2"
                      >
                        <CreditCard className="mr-3 h-4 w-4" />
                        <span>Billing & Subscription</span>
                      </Link>
                    </DropdownMenuItem>

                    {!isPremium && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/pricing"
                          className="flex items-center w-full px-3 py-2 text-blue-700 hover:text-blue-700!"
                        >
                          <Crown className="mr-3 h-4 w-4 text-blue-700" />
                          <span>Upgrade to Premium</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <form action={signOut} className="p-0! w-full">
                        <button
                          type="submit"
                          className="flex items-center w-full px-3 py-2 text-red-600"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-red-600" />
                          <span>Sign out</span>
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-blue-600 hover:bg-blue-700"
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
