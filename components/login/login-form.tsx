"use client";

import type React from "react";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientForBrowser } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle, Facebook, Chrome } from "lucide-react";
import Link from "next/link";
import { loginSchema } from "@/schemas/auth";
import { Spinner } from "../ui/shadcn-io/spinner";

export function LoginForm() {
  const supabase = createClientForBrowser();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Get redirect URL from search params
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const parsed = loginSchema.safeParse({ email });

    if (!parsed.success) {
      setErrorMessage(parsed.error.errors[0].message);
      setStatus("error");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    } else {
      setStatus("sent");
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/confirm?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error(error);
      setErrorMessage(
        error.message || "Social login failed. Please try again."
      );
    }
  };

  if (status === "sent") {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-muted-foreground">
                We&apos;ve sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Click the link in the email to sign in to your account.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-4 shadow-xl border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your Alertino account to manage your apartment alerts
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-0">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-12 ${errorMessage ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              disabled={status === "loading"}
            />
            {errorMessage && (
              <p className="text-destructive text-sm">{errorMessage}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Sending magic link...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send magic link
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="h-12"
            >
              <Chrome className="w-5 h-5" />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              className="h-12"
            >
              <Facebook className="w-5 h-5" />
              Facebook
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
