import LegalPage from "./LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="March 2026">
      <div className="space-y-6 text-[#8A94A6] text-sm leading-relaxed">
        <p>
          The Athletic Zone ("we", "our", or "us") is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use, and
          safeguard your personal and biometric information when you use our
          platform.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          1. Information We Collect
        </h2>
        <p>
          To provide our specialized athletic training services, we collect the
          following data:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Identity Data:</strong> Full name, email address, and
            profile imagery.
          </li>
          <li>
            <strong>Biometric Data:</strong> Age (must be 12+), height, weight,
            and chosen sport sector.
          </li>
          <li>
            <strong>Performance & Telemetry Data:</strong> Session attendance
            records (join/leave times), analytics history, coach feedback, and
            course playback progress.
          </li>
        </ul>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          2. How We Use Your Information
        </h2>
        <p>
          We do not sell your personal data to advertisers. Your data is used
          exclusively for platform operations, including:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Powering our grouping engine to match athletes of similar metrics
            for group sessions.
          </li>
          <li>
            Generating 30-day performance analytics and consistency dashboards.
          </li>
          <li>
            Communicating deployment schedules, password resets, and operational
            debriefs.
          </li>
          <li>Verifying account access and preventing fraudulent activity.</li>
        </ul>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          3. Third-Party Infrastructure
        </h2>
        <p>
          To deliver a secure and scalable platform, we utilize trusted industry
          infrastructure partners. By using our platform, you consent to the
          processing of necessary data by:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Razorpay:</strong> For secure payment processing. We do not
            process, route, or store your credit card or banking credentials.
          </li>
          <li>
            <strong>Cloudflare (R2):</strong> For secure media hosting, video
            streaming, and profile image storage.
          </li>
          <li>
            <strong>Google OAuth:</strong> For secure, passwordless
            authentication (if utilized).
          </li>
          <li>
            <strong>Resend:</strong> For dispatching transactional emails
            (schedules, receipts, password resets).
          </li>
        </ul>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          4. Data Security & Retention
        </h2>
        <p>
          We employ industry-standard cryptographic techniques (including JWT
          tokenization and secure database architectures) to protect your
          biometric and account data. We retain your performance data for as
          long as your account remains active to provide continuous analytics.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          5. Contact Us
        </h2>
        <p>
          If you wish to request the deletion of your account and biometric data
          from our servers, please contact our support team.
          <br />
          <br />
          Support:{" "}
          <a
            href="mailto:theathleticzonesupport@gmail.com"
            className="text-amber-500 hover:underline"
          >
            theathleticzonesupport@gmail.com
          </a>
          <br />
          Business:{" "}
          <a
            href="mailto:theathleticzone7@gmail.com"
            className="text-amber-500 hover:underline"
          >
            theathleticzone7@gmail.com
          </a>
        </p>
      </div>
    </LegalPage>
  );
}
