import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { Navbar } from "@/components/common/navbar";
import { getUserAndSubscription } from "@/lib/actions/auth-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Alertino team. We're here to help you find your perfect apartment in Poland. Contact us for support, feedback, or questions.",
  openGraph: {
    title: "Contact Alertino - We're Here to Help",
    description:
      "Get in touch with the Alertino team. We're here to help you find your perfect apartment in Poland.",
  },
};

export default async function ContactPage() {
  const { session, user, subscription } = await getUserAndSubscription();

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar user={session?.user} profile={user} subscription={subscription} />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about Alertino? We&apos;re here to help you find
              your perfect apartment in Poland.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
