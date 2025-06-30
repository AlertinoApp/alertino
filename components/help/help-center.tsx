import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Bell,
  Settings,
  CreditCard,
  Shield,
} from "lucide-react";

const faqCategories = [
  {
    icon: Filter,
    title: "Getting Started",
    badge: "Popular",
    questions: [
      {
        question: "How do I create my first apartment filter?",
        answer:
          "After signing in, click the 'Add Filter' button on your dashboard. Enter your desired city, maximum price, and minimum number of rooms. Your filter will start monitoring immediately.",
      },
      {
        question: "How quickly will I receive alerts?",
        answer:
          "Our system checks for new listings every 15 minutes. You'll receive email notifications within minutes of a matching apartment being posted.",
      },
      {
        question: "Can I create multiple filters?",
        answer:
          "Yes! You can create unlimited filters for different cities, price ranges, and room requirements. Each filter works independently.",
      },
    ],
  },
  {
    icon: Bell,
    title: "Alerts & Notifications",
    questions: [
      {
        question: "Why am I not receiving any alerts?",
        answer:
          "This could be due to very specific filter criteria. Try adjusting your price range or room requirements. Also check your spam folder for alert emails.",
      },
      {
        question: "Can I customize notification frequency?",
        answer:
          "Currently, you receive immediate notifications for each matching listing. We're working on digest options for future updates.",
      },
      {
        question: "How do I stop receiving alerts?",
        answer:
          "You can delete individual filters from your dashboard or pause all notifications in your account settings.",
      },
    ],
  },
  {
    icon: Settings,
    title: "Account Management",
    questions: [
      {
        question: "How do I change my email address?",
        answer:
          "Currently, email changes require creating a new account. We're working on an email change feature. Contact support for assistance.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Contact our support team at support@alertino.com to request account deletion. All your data will be permanently removed within 30 days.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes, we use enterprise-grade security measures including encryption and secure hosting. We never share your personal information with third parties.",
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Billing & Pricing",
    questions: [
      {
        question: "Is Alertino free to use?",
        answer:
          "Yes, Alertino is currently free for all users. We may introduce premium features in the future, but basic apartment alerts will always remain free.",
      },
      {
        question: "Will you charge for the service in the future?",
        answer:
          "We may introduce premium features, but our core service of apartment alerts will remain free. Any pricing changes will be communicated well in advance.",
      },
    ],
  },
];

export function HelpCenter() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Find answers to common questions about using Alertino to find your
          perfect apartment.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input placeholder="Search for help..." className="pl-10 h-12" />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-12">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <category.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {category.title}
              </h2>
              {category.badge && (
                <Badge className="ml-3 bg-green-100 text-green-800 border-green-200">
                  {category.badge}
                </Badge>
              )}
            </div>

            <div className="grid gap-4">
              {category.questions.map((faq, faqIndex) => (
                <Card
                  key={faqIndex}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="mt-16 text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Still need help?
            </h3>
            <p className="text-gray-600 mb-6">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help you get the most out of Alertino.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="mailto:support@alertino.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
