import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const pricingFAQs = [
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "What happens if I exceed my filter limit on the Free plan?",
    answer:
      "You'll be prompted to upgrade to Premium or remove existing filters. We'll never charge you without explicit consent.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "How does the free trial work for Premium plan?",
    answer:
      "You get 14 days of full Premium features at no cost. No credit card required. After the trial, you can choose to subscribe or continue with the free plan.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay via bank transfer.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Do you offer discounts for students or non-profits?",
    answer:
      "Yes! We offer 50% discounts for students and registered non-profit organizations. Contact us with verification documents to apply.",
  },
  {
    question: "What's included in priority support?",
    answer:
      "Premium and Business customers get priority email support with response times under 4 hours during business hours, plus access to our knowledge base and video tutorials.",
  },
];

export function PricingFAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to know about pricing
          </h2>
          <p className="text-xl text-gray-600">
            Can&apos;t find the answer you&apos;re looking for? Feel free to
            contact our support team.
          </p>
        </div>

        <div className="grid gap-6">
          {pricingFAQs.map((faq, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  );
}
