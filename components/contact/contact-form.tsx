"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { contactFormSchema, type ContactFormData } from "@/schemas/contact";
import { toast } from "sonner";

export function ContactForm() {
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
    <Card className="shadow-lg border-0">
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
                  errors.name ? "border-red-500 focus-visible:ring-red-300" : ""
                }
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
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
                    ? "border-red-500 focus-visible:ring-red-300"
                    : ""
                }
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
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
              placeholder="What's this about?"
              className={
                errors.subject
                  ? "border-red-500 focus-visible:ring-red-300"
                  : ""
              }
            />
            {errors.subject && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
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
              placeholder="Tell us how we can help..."
              rows={6}
              className={
                errors.message
                  ? "border-red-500 focus-visible:ring-red-300"
                  : ""
              }
            />
            {errors.message && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.message}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
  );
}
