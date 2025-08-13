"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, CreditCard, Settings, MessageSquare, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OverviewTab } from "./tabs/overview-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { BillingTab } from "./tabs/billing-tab";
import { ContactTab } from "./tabs/contact-tab";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Subscription, TrialInfo } from "@/types/subscription";
import type { Profile } from "@/types/users";
import { updateProfileAction } from "@/lib/actions/profile-actions";
import { toast } from "sonner";

interface AccountSettingsClientProps {
  user: SupabaseUser;
  profile: Profile | null;
  subscription: Subscription | null;
  trialInfo: TrialInfo | null;
  filtersCount: number;
  alertsCount: number;
  defaultTab: string;
}

type TabType = "overview" | "settings" | "billing" | "contact";

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

const tabs: TabItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <User className="w-4 h-4" />,
    description: "Account summary and usage analytics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    description: "Personal information and preferences",
  },
  {
    id: "billing",
    label: "Billing & Invoices",
    icon: <CreditCard className="w-4 h-4" />,
    description: "Subscription and payment management",
  },
  {
    id: "contact",
    label: "Contact Us",
    icon: <MessageSquare className="w-4 h-4" />,
    description: "Get help and support",
  },
];

export function AccountSettingsClient({
  user,
  profile,
  subscription,
  trialInfo,
  filtersCount,
  alertsCount,
  defaultTab,
}: AccountSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab as TabType);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editName, setEditName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.replace(`/account-settings?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  const currentPlan = subscription?.plan || "free";
  const isTrialActive = trialInfo?.isActive || false;
  const displayName =
    profile?.full_name || user.user_metadata?.full_name || "User";
  const email = profile?.email || user.email;

  const handleEditName = async () => {
    if (!editName.trim() || editName.trim() === displayName) {
      setIsEditModalOpen(false);
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Updating profile...", {
      description: "Saving your profile changes. Please wait.",
    });

    try {
      await updateProfileAction({ full_name: editName.trim() });
      toast.dismiss(loadingToast);
      toast("✅ Profile updated", {
        description: "Your name has been updated successfully.",
      });
      setIsEditModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.dismiss(loadingToast);
      toast("❌ Failed to update profile", {
        description: "Something went wrong. Please try again shortly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditName(displayName);
    setIsEditModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            user={user}
            profile={profile}
            subscription={subscription}
            trialInfo={trialInfo}
            filtersCount={filtersCount}
            alertsCount={alertsCount}
          />
        );
      case "settings":
        return <SettingsTab user={user} profile={profile} />;
      case "billing":
        return (
          <BillingTab
            user={user}
            subscription={subscription}
            trialInfo={trialInfo}
          />
        );
      case "contact":
        return <ContactTab />;
      default:
        return (
          <OverviewTab
            user={user}
            profile={profile}
            subscription={subscription}
            trialInfo={trialInfo}
            filtersCount={filtersCount}
            alertsCount={alertsCount}
          />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <div className="sticky top-8">
            {/* User Info Section */}
            <div className="flex flex-col gap-3.5 border-0 p-2 mb-6">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="px-2 flex items-start gap-2 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div title={displayName} className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-gray-100">
                          {displayName}
                        </p>
                      </div>
                      <Dialog
                        open={isEditModalOpen}
                        onOpenChange={setIsEditModalOpen}
                      >
                        <DialogTrigger asChild>
                          <button
                            className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-400 flex-shrink-0"
                            aria-label="Edit name"
                            onClick={handleOpenEditModal}
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Name</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name" className="mb-2">
                                Full Name
                              </Label>
                              <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter your full name"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleEditName();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleEditName}
                                disabled={
                                  isLoading ||
                                  !editName.trim() ||
                                  editName.trim() === displayName
                                }
                              >
                                {isLoading ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div
                      className="flex items-center gap-1 min-w-0"
                      title={`${currentPlan} · ${email}`}
                    >
                      <p className="text-sm text-slate-500 dark:text-gray-400 flex-shrink-0 capitalize">
                        {isTrialActive ? `${currentPlan} Trial` : currentPlan}
                      </p>
                      <span className="text-slate-500 dark:text-gray-400 flex-shrink-0">
                        ·
                      </span>
                      <p className="text-sm text-slate-500 dark:text-gray-400 truncate">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col border-0 !bg-none p-0">
              <div className="flex flex-col gap-px">
                {tabs.map((tab) => (
                  <div key={tab.id}>
                    <button
                      title={tab.label}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm transition-colors min-w-0 ${
                        activeTab === tab.id
                          ? "bg-slate-100 dark:bg-gray-700 text-slate-900 dark:text-gray-100"
                          : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-gray-100"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center transition-colors flex-shrink-0 ${
                          activeTab === tab.id
                            ? "text-slate-900 dark:text-gray-100"
                            : "text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-gray-100"
                        }`}
                      >
                        {tab.icon}
                      </span>
                      <span className="truncate">{tab.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
