import LegalPage from "./LegalPage";

export default function TermsOfService() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="March 2026">
      <div className="space-y-6 text-[#8A94A6] text-sm leading-relaxed">
        <p>
          Welcome to The Athletic Zone. These Terms of Service ("Terms") govern
          your access to and use of The Athletic Zone platform, owned and
          operated by Jitendra Saini, based in Udaipur, India. By accessing our
          platform, purchasing a course, or subscribing to our live coaching
          services, you agree to be bound by these Terms.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          1. Eligibility & Account Registration
        </h2>
        <p>
          You must be at least 12 years of age to register for an account and
          use this platform. If you are under the age of 18, you must have
          permission from a parent or legal guardian to participate in live
          training sessions or make purchases. You agree to provide accurate,
          complete, and current biometric and personal information during
          registration.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          2. Platform Services
        </h2>
        <p>
          The Athletic Zone provides digital athletic training services,
          including video-on-demand (VOD) training courses, performance
          analytics dashboards, and live interactive coaching (group and
          one-on-one). Access to these services is strictly contingent upon
          maintaining an active account and/or subscription.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          3. Live Session Scheduling & Attendance Rules
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Availability Submissions:</strong> Athletes must submit
            their training availability exclusively within the designated daily
            window of 5:00 PM to 9:30 PM IST.
          </li>
          <li>
            <strong>Scheduling:</strong> Platform administrators finalize and
            deploy session schedules based on the submitted availability and
            active subscription status.
          </li>
          <li>
            <strong>Attendance:</strong> If an athlete fails to join a scheduled
            session within the grace period, or is entirely absent, the session
            will be permanently marked as "MISSED" in the platform ledger.
          </li>
          <li>
            <strong>No Rescheduling:</strong> Missed sessions cannot be
            reclaimed, rolled over, or rescheduled under any circumstances.
          </li>
        </ul>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          4. Subscriptions & Payments
        </h2>
        <p>
          We offer subscription plans (1 month, 3 months, 6 months, and yearly)
          for group and one-on-one training. All payments are securely processed
          through Razorpay. The Athletic Zone does not collect or store your raw
          credit card or banking credentials. Session participation is strictly
          limited to the duration of your active subscription period.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          5. Intellectual Property
        </h2>
        <p>
          All video courses, training methodologies, dashboard designs, and
          platform content ("Content Vault") are the exclusive intellectual
          property of The Athletic Zone. Purchasing a course grants you a
          limited, non-transferable, non-exclusive license to view the content
          for personal use. Downloading, screen-recording, or redistributing
          this content is strictly prohibited and will result in immediate
          account termination.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          6. Medical Disclaimer & Limitation of Liability
        </h2>
        <p>
          The Athletic Zone provides physical training guidance. You acknowledge
          that participation in any sport or physical training program involves
          inherent risks of physical injury. By using our platform, you confirm
          that you are medically cleared to participate.
        </p>
        <p>
          To the maximum extent permitted by applicable law, The Athletic Zone,
          Jitendra Saini, and its coaches shall not be held liable for any
          direct, indirect, or consequential injuries, damages, or health
          complications resulting from the use of our training programs, live
          sessions, or video courses.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          7. Governing Law & Contact
        </h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of India, with jurisdiction in Udaipur, Rajasthan.
        </p>
        <p className="mt-4">
          For legal inquiries:{" "}
          <a
            href="mailto:theathleticzone7@gmail.com"
            className="text-amber-500 hover:underline"
          >
            theathleticzone7@gmail.com
          </a>
          <br />
          For platform support:{" "}
          <a
            href="mailto:theathleticzonesupport@gmail.com"
            className="text-amber-500 hover:underline"
          >
            theathleticzonesupport@gmail.com
          </a>
        </p>
      </div>
    </LegalPage>
  );
}
