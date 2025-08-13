"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { contactFormSchema, type ContactFormData } from "@/schemas/contact";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "support@alertino.com",
    action: "mailto:support@alertino.com",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our team",
    contact: "Available 9 AM - 6 PM CET",
    action: "#",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Visit our office",
    contact: "Warsaw, Poland",
    action: "#",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We typically respond",
    contact: "Within 24 hours",
    action: null,
  },
];

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
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
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
                      ? "border-red-500 focus-visible:ring-red-300"
                      : ""
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
                placeholder="What can we help you with?"
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
                placeholder="Tell us more about your question or issue..."
                rows={5}
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
              disabled={status === "loading"}
              className="w-full sm:w-auto"
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

      {/* Contact Information */}
      <Card className="gap-0 border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Get in touch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We&apos;re here to help! Choose the best way to reach us and
            we&apos;ll get back to you as soon as possible.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <method.icon className="w-2 h-2 text-blue-600" />
                    </div>
                    <span className="font-medium dark:text-gray-100">
                      {method.title}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                  {method.description}
                </p>
                {method.action ? (
                  <a
                    href={method.action}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                  >
                    {method.contact}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                    {method.contact}
                  </span>
                )}
              </div>
            ))}
          </div>
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
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
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
