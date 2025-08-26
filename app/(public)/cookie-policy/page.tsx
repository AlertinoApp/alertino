import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="January 1, 2025">
      <div className="prose prose-gray max-w-none">
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are stored on your device when you
          visit our website. They help us provide you with a better experience
          by remembering your preferences and understanding how you use our
          site.
        </p>

        <h2>2. How We Use Cookies</h2>
        <p>Alertino uses cookies and similar technologies to:</p>
        <ul>
          <li>Keep you signed in to your account</li>
          <li>Remember your preferences and settings</li>
          <li>Understand how you use our website</li>
          <li>Improve our services and user experience</li>
          <li>Analyze website traffic and performance</li>
        </ul>

        <h2>3. Types of Cookies We Use</h2>

        <h3>Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They
          include authentication cookies and security features. These cannot be
          disabled.
        </p>

        <h3>Functional Cookies</h3>
        <p>
          These cookies help us remember your preferences and settings to
          improve your experience, such as your theme preference (light/dark
          mode).
        </p>

        <h3>Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our
          website by collecting anonymous information. This helps us improve our
          service.
        </p>

        <h3>Marketing Cookies</h3>
        <p>
          These cookies are used to track visitors across websites to display
          relevant advertisements. We only use these with your explicit consent.
        </p>

        <h2>4. Managing Your Cookie Preferences</h2>
        <p>You have control over which cookies you accept. You can:</p>
        <ul>
          <li>Accept all cookies for the best experience</li>
          <li>Reject non-essential cookies</li>
          <li>Customize your preferences by category</li>
          <li>Change your preferences at any time</li>
        </ul>

        <p>
          You can manage your cookie preferences through our cookie banner that
          appears on your first visit, or by visiting your account settings at
          any time.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>
          Some cookies on our site are set by third-party services that help us
          provide our service:
        </p>
        <ul>
          <li>
            <strong>Supabase:</strong> Provides authentication and database
            services
          </li>
          <li>
            <strong>Google Analytics:</strong> Helps us understand how visitors
            use our website (only with your consent)
          </li>
          <li>
            <strong>Stripe:</strong> Processes payments securely
          </li>
        </ul>

        <h2>6. Cookie Retention</h2>
        <p>Different cookies are stored for different periods:</p>
        <ul>
          <li>
            <strong>Session cookies:</strong> Deleted when you close your
            browser
          </li>
          <li>
            <strong>Authentication cookies:</strong> Typically expire after 30
            days
          </li>
          <li>
            <strong>Preference cookies:</strong> Usually expire after 1 year
          </li>
          <li>
            <strong>Analytics cookies:</strong> Usually expire after 2 years
          </li>
        </ul>

        <h2>7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Be informed about how we use cookies</li>
          <li>
            Give or withdraw consent for non-essential cookies at any time
          </li>
          <li>Access information about cookies we use</li>
          <li>Request deletion of your data</li>
        </ul>

        <p>
          For detailed information about your data protection rights under GDPR,
          please see our{" "}
          <a href="/gdpr" className="text-blue-600 hover:text-blue-700">
            GDPR Compliance page
          </a>
          .
        </p>

        <h2>8. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. When we do, we
          will update the &quot;Last Updated&quot; date at the top of this page
          and notify you of significant changes.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies or this Cookie
          Policy, please contact us at{" "}
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
