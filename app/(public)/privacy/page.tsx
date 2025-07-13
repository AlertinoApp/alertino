import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="December 29, 2024">
      <div className="prose prose-gray max-w-none">
        <h2>1. Information We Collect</h2>
        <h3>Personal Information</h3>
        <p>
          When you use Alertino, we may collect the following personal
          information:
        </p>
        <ul>
          <li>
            Email address (required for account creation and notifications)
          </li>
          <li>Search preferences (cities, price ranges, room requirements)</li>
          <li>Usage data (how you interact with our service)</li>
          <li>
            Device information (browser type, IP address, operating system)
          </li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <p>
          We automatically collect certain information when you use our service:
        </p>
        <ul>
          <li>Log data (access times, pages viewed, IP address)</li>
          <li>Cookies and similar tracking technologies</li>
          <li>Performance and analytics data</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our apartment alert service</li>
          <li>Send you notifications about matching apartment listings</li>
          <li>Improve and optimize our service</li>
          <li>Communicate with you about your account and our service</li>
          <li>Ensure the security and integrity of our platform</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>3. Information Sharing and Disclosure</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information
          to third parties, except:
        </p>
        <ul>
          <li>With your explicit consent</li>
          <li>
            To service providers who assist us in operating our service (under
            strict confidentiality agreements)
          </li>
          <li>When required by law or to protect our rights and safety</li>
          <li>In connection with a business transfer or acquisition</li>
        </ul>

        <h3>Third-Party Services</h3>
        <p>
          We use the following third-party services that may collect
          information:
        </p>
        <ul>
          <li>Supabase (authentication and database services)</li>
          <li>Email service providers (for sending notifications)</li>
          <li>Analytics services (for service improvement)</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security
          measures to protect your personal information against unauthorized
          access, alteration, disclosure, or destruction. These measures
          include:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication requirements</li>
          <li>Secure hosting infrastructure</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to
          provide our services and fulfill the purposes outlined in this Privacy
          Policy. Specifically:
        </p>
        <ul>
          <li>Account information: Until you delete your account</li>
          <li>Search filters: Until you remove them or delete your account</li>
          <li>Alert history: For up to 12 months or until account deletion</li>
          <li>Log data: For up to 90 days</li>
        </ul>

        <h2>6. Your Rights and Choices</h2>
        <p>
          You have the following rights regarding your personal information:
        </p>
        <ul>
          <li>
            Access: Request a copy of the personal information we hold about you
          </li>
          <li>
            Correction: Request correction of inaccurate or incomplete
            information
          </li>
          <li>Deletion: Request deletion of your personal information</li>
          <li>Portability: Request transfer of your data to another service</li>
          <li>Objection: Object to certain processing of your information</li>
          <li>
            Restriction: Request restriction of processing in certain
            circumstances
          </li>
        </ul>

        <h2>7. Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Remember your preferences and settings</li>
          <li>Analyze how our service is used</li>
          <li>Provide security features</li>
          <li>Improve user experience</li>
        </ul>
        <p>
          You can control cookies through your browser settings, but disabling
          cookies may affect the functionality of our service.
        </p>

        <h2>8. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your own. We ensure appropriate safeguards are in place to
          protect your information in accordance with applicable data protection
          laws.
        </p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          Our service is not intended for children under 16 years of age. We do
          not knowingly collect personal information from children under 16. If
          we become aware that we have collected personal information from a
          child under 16, we will take steps to delete such information.
        </p>

        <h2>10. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the new Privacy Policy on this
          page and updating the &quot;Last Updated&quot; date.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our privacy
          practices, please contact us at:
        </p>
        <ul>
          <li>
            Email:{" "}
            <a
              href="mailto:privacy@alertino.com"
              className="text-blue-600 hover:text-blue-700"
            >
              privacy@alertino.com
            </a>
          </li>
          <li>Address: Alertino, ul. Przykładowa 123, 00-001 Warsaw, Poland</li>
        </ul>
      </div>
    </LegalPageLayout>
  );
}
