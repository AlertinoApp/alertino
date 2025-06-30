import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock, MessageCircle } from "lucide-react";

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

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in touch</h2>
        <p className="text-gray-600 mb-8">
          We&apos;re here to help! Choose the best way to reach us and
          we&apos;ll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contactMethods.map((method, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <method.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {method.description}
                  </p>
                  {method.action ? (
                    <a
                      href={method.action}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {method.contact}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-medium text-sm">
                      {method.contact}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Need immediate help?
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            Check our Help Center for instant answers to common questions about
            setting up filters, managing alerts, and troubleshooting.
          </p>
          <a
            href="/help"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Visit Help Center →
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
