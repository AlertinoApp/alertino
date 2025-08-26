"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, CheckCircle, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { contactFormSchema, type ContactFormData } from "@/schemas/contact";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export function ContactTab() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrors({});

    const parsed = contactFormSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors: Partial<ContactFormData> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          const field = err.path[0] as keyof ContactFormData;
          fieldErrors[field] = err.message;
        }
      });

      setErrors(fieldErrors);
      setStatus("error");
      toast.error("Please fix the highlighted fields", {
        description: "All required fields must be filled correctly.",
      });
      return;
    }

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would send this to your backend
      console.log("Contact form submitted:", parsed.data);

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours.",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      toast.error("Failed to send message", {
        description: "Please try again shortly.",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Form */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Thank you for your message! We&apos;ll get back to you within 24
                hours.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={
                    errors.name
                      ? "border-destructive focus-visible:ring-destructive/20"
                      : ""
                  }
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-destructive text-sm">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive/20"
                      : ""
                  }
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-destructive text-sm">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What can we help you with?"
                className={
                  errors.subject
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : ""
                }
              />
              {errors.subject && (
                <div className="flex items-center gap-1 text-destructive text-sm">
                  <AlertCircle className="w-3 h-3" />
                  {errors.subject}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your question or issue..."
                rows={5}
                className={
                  errors.message
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : ""
                }
              />
              {errors.message && (
                <div className="flex items-center gap-1 text-destructive text-sm">
                  <AlertCircle className="w-3 h-3" />
                  {errors.message}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full sm:w-auto"
            >
              {status === "loading" ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Help Center */}
      <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Need immediate help?
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                Check our Help Center for instant answers to common questions
                about setting up filters, managing alerts, and troubleshooting.
              </p>
              <a
                href="/help"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Visit Help Center →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
