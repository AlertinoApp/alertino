import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="December 29, 2024">
      <div className="prose prose-gray max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Alertino (&quot;the Service&quot;), you accept
          and agree to be bound by the terms and provision of this agreement. If
          you do not agree to abide by the above, please do not use this
          service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Alertino is an apartment alert service that monitors various apartment
          listing websites in Poland and sends notifications to users when new
          listings match their specified criteria. The service includes:
        </p>
        <ul>
          <li>Custom filter creation for apartment searches</li>
          <li>Automated monitoring of apartment listing websites</li>
          <li>Email notifications for matching listings</li>
          <li>Dashboard for managing filters and viewing alerts</li>
        </ul>

        <h2>3. User Accounts</h2>
        <p>
          To use certain features of the Service, you must register for an
          account. You agree to provide accurate, current, and complete
          information during the registration process and to update such
          information to keep it accurate, current, and complete.
        </p>
        <p>
          You are responsible for safeguarding the password and for all
          activities that occur under your account. You agree not to disclose
          your password to any third party.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Distribute spam, malware, or other harmful content</li>
          <li>
            Attempt to gain unauthorized access to the Service or other
            users&apos; accounts
          </li>
          <li>
            Use the Service for any commercial purpose without our express
            written consent
          </li>
        </ul>

        <h2>5. Service Availability</h2>
        <p>
          While we strive to provide reliable service, we do not guarantee that
          the Service will be available at all times. The Service may be
          temporarily unavailable due to maintenance, updates, or technical
          issues.
        </p>
        <p>
          We are not responsible for any delays, failures, or interruptions in
          the delivery of apartment alerts due to technical issues, third-party
          website changes, or other factors beyond our control.
        </p>

        <h2>6. Data Accuracy</h2>
        <p>
          The apartment listings and information provided through the Service
          are sourced from third-party websites. We do not guarantee the
          accuracy, completeness, or timeliness of this information. Users
          should verify all information directly with the listing source or
          property owner.
        </p>

        <h2>7. Privacy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy,
          which also governs your use of the Service, to understand our
          practices.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of Alertino and its licensors.
          The Service is protected by copyright, trademark, and other laws.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the Service
          immediately, without prior notice or liability, under our sole
          discretion, for any reason whatsoever, including without limitation if
          you breach the Terms.
        </p>
        <p>
          If you wish to terminate your account, you may simply discontinue
          using the Service or contact us to request account deletion.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          In no event shall Alertino, nor its directors, employees, partners,
          agents, suppliers, or affiliates, be liable for any indirect,
          incidental, special, consequential, or punitive damages, including
          without limitation, loss of profits, data, use, goodwill, or other
          intangible losses, resulting from your use of the Service.
        </p>

        <h2>11. Disclaimer</h2>
        <p>
          The information on this Service is provided on an &quot;as is&quot;
          basis. To the fullest extent permitted by law, this Company excludes
          all representations, warranties, conditions and terms whether express
          or implied.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These Terms shall be interpreted and governed by the laws of Poland.
          Any disputes arising from these Terms or the use of the Service shall
          be subject to the jurisdiction of Polish courts.
        </p>

        <h2>13. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material, we will provide at least 30 days notice prior
          to any new terms taking effect.
        </p>

        <h2>14. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a
            href="mailto:legal@alertino.com"
            className="text-blue-600 hover:text-blue-700"
          >
            legal@alertino.com
          </a>
          .
        </p>
      </div>
    </LegalPageLayout>
  );
}
