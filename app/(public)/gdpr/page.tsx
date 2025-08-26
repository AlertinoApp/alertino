import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function GDPRPage() {
  return (
    <LegalPageLayout title="GDPR Compliance" lastUpdated="January 1, 2025">
      <div className="prose prose-gray max-w-none">
        <h2>1. What is GDPR?</h2>
        <p>
          The General Data Protection Regulation (GDPR) is a comprehensive data
          protection law that came into effect on May 25, 2018. It applies to
          all organizations that process personal data of individuals in the
          European Union, regardless of where the organization is located.
        </p>

        <h2>2. Our Commitment to GDPR</h2>
        <p>
          Alertino is committed to protecting your privacy and ensuring
          compliance with GDPR and other applicable data protection laws. We
          implement appropriate technical and organizational measures to protect
          your personal data.
        </p>

        <h2>3. Your Rights Under GDPR</h2>
        <p>
          Under GDPR, you have the following rights regarding your personal
          data:
        </p>

        <h3>Right to be Informed</h3>
        <p>
          You have the right to be informed about how we collect, use, and
          process your personal data. This information is provided in our
          Privacy Policy and Cookie Policy.
        </p>

        <h3>Right of Access</h3>
        <p>
          You have the right to request a copy of the personal data we hold
          about you, including information about how we process it.
        </p>

        <h3>Right to Rectification</h3>
        <p>
          You have the right to request correction of inaccurate or incomplete
          personal data we hold about you.
        </p>

        <h3>Right to Erasure (Right to be Forgotten)</h3>
        <p>
          You have the right to request deletion of your personal data in
          certain circumstances, such as when the data is no longer necessary
          for the original purpose.
        </p>

        <h3>Right to Restrict Processing</h3>
        <p>
          You have the right to request that we restrict the processing of your
          personal data in certain circumstances.
        </p>

        <h3>Right to Data Portability</h3>
        <p>
          You have the right to receive your personal data in a structured,
          commonly used, and machine-readable format, and to transmit that data
          to another controller.
        </p>

        <h3>Right to Object</h3>
        <p>
          You have the right to object to the processing of your personal data
          for certain purposes, such as direct marketing.
        </p>

        <h3>Rights Related to Automated Decision Making</h3>
        <p>
          You have the right not to be subject to decisions based solely on
          automated processing that significantly affect you.
        </p>

        <h2>4. Lawful Basis for Processing</h2>
        <p>
          We process your personal data based on the following lawful bases
          under GDPR:
        </p>

        <h3>Consent</h3>
        <p>
          We process certain data based on your explicit consent, such as
          analytics cookies and marketing communications. You can withdraw your
          consent at any time.
        </p>

        <h3>Contract Performance</h3>
        <p>
          We process data necessary to provide our apartment alert service,
          including account information and search preferences.
        </p>

        <h3>Legitimate Interest</h3>
        <p>
          We process data based on our legitimate interest in providing and
          improving our service, ensuring security, and preventing fraud.
        </p>

        <h3>Legal Obligation</h3>
        <p>
          We may process data to comply with legal obligations, such as
          maintaining records for tax purposes.
        </p>

        <h2>5. Data Transfers</h2>
        <p>
          Your personal data may be transferred to and processed in countries
          outside the European Economic Area (EEA). When we transfer data
          internationally, we ensure appropriate safeguards are in place,
          including:
        </p>
        <ul>
          <li>Adequacy decisions by the European Commission</li>
          <li>Standard Contractual Clauses (SCCs)</li>
          <li>Binding Corporate Rules</li>
          <li>Certification schemes</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>
          We retain your personal data only for as long as necessary to fulfill
          the purposes outlined in our Privacy Policy. Specific retention
          periods include:
        </p>
        <ul>
          <li>
            <strong>Account data:</strong> Until you delete your account
          </li>
          <li>
            <strong>Search filters:</strong> Until you remove them or delete
            your account
          </li>
          <li>
            <strong>Alert history:</strong> Up to 12 months or until account
            deletion
          </li>
          <li>
            <strong>Log data:</strong> Up to 90 days
          </li>
          <li>
            <strong>Marketing data:</strong> Until you withdraw consent
          </li>
        </ul>

        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized access, alteration,
          disclosure, or destruction. These measures include:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication requirements</li>
          <li>Secure hosting infrastructure</li>
          <li>Staff training on data protection</li>
        </ul>

        <h2>8. Data Breach Notification</h2>
        <p>
          In the event of a personal data breach that is likely to result in a
          high risk to your rights and freedoms, we will notify you without
          undue delay and within 72 hours of becoming aware of the breach.
        </p>

        <h2>9. Children&apos;s Data</h2>
        <p>
          Our service is not intended for children under 16 years of age. We do
          not knowingly collect personal data from children under 16. If we
          become aware that we have collected personal data from a child under
          16, we will take steps to delete such information.
        </p>

        <h2>10. Exercising Your Rights</h2>
        <p>To exercise any of your GDPR rights, you can:</p>
        <ul>
          <li>
            Contact us at{" "}
            <a
              href="mailto:privacy@alertino.com"
              className="text-blue-600 hover:text-blue-700"
            >
              privacy@alertino.com
            </a>
          </li>
          <li>
            Contact our Data Protection Officer at{" "}
            <a
              href="mailto:dpo@alertino.com"
              className="text-blue-600 hover:text-blue-700"
            >
              dpo@alertino.com
            </a>
          </li>
          <li>Use the privacy settings in your account dashboard</li>
        </ul>

        <p>
          We will respond to your request within one month of receipt. If your
          request is complex, we may extend this period by up to two additional
          months.
        </p>

        <h2>11. Supervisory Authority</h2>
        <p>
          You have the right to lodge a complaint with a supervisory authority
          if you believe we have not handled your personal data in accordance
          with GDPR. In Poland, the supervisory authority is the President of
          the Personal Data Protection Office (UODO).
        </p>

        <h2>12. Updates to This Information</h2>
        <p>
          We may update this GDPR information from time to time to reflect
          changes in our practices or applicable laws. We will notify you of any
          material changes.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          If you have any questions about our GDPR compliance or wish to
          exercise your rights, please contact us at{" "}
          <a
            href="mailto:privacy@alertino.com"
            className="text-blue-600 hover:text-blue-700"
          >
            privacy@alertino.com
          </a>
          .
        </p>
      </div>
    </LegalPageLayout>
  );
}
