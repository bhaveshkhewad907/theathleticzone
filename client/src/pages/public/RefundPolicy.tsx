import LegalPage from "./LegalPage";

export default function RefundPolicy() {
  return (
    <LegalPage title="Refund & Cancellation Policy" lastUpdated="March 2026">
      <div className="space-y-6 text-[#8A94A6] text-sm leading-relaxed">
        <p>
          At The Athletic Zone, we maintain a strict, transparent policy
          regarding purchases, subscriptions, and attendance. Please read this
          policy carefully before committing to a digital course or training
          deployment.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          1. Digital Video Courses (Content Vault)
        </h2>
        <p>
          Video courses available in our Marketplace are classified as digital
          goods. Because digital assets are instantly accessible and cannot be
          "returned,"{" "}
          <strong>all course purchases are strictly non-refundable.</strong>{" "}
          Once a transaction is successfully processed via Razorpay and access
          is granted to your account, the sale is final.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          2. Live Training Subscriptions
        </h2>
        <p>
          Subscriptions for Live Group and One-on-One coaching (1-month,
          3-month, 6-month, or yearly plans) reserve dedicated server time,
          coaching resources, and grouping slots. Therefore,{" "}
          <strong>
            active live training subscriptions are non-refundable.
          </strong>
        </p>
        <p>
          You may choose not to renew your subscription at the end of your
          billing cycle, but we do not provide prorated refunds for partially
          unused months.
        </p>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          3. Missed Sessions & Absences
        </h2>
        <p>
          Our platform operates on strict scheduling algorithms based on the
          availability window (5:00 PM – 9:30 PM IST).
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            If you fail to join a scheduled session, arrive late past the grace
            period, or fail to submit your availability, the session is
            categorized as a <strong>CRITICAL MISS</strong>.
          </li>
          <li>
            Missed sessions are{" "}
            <strong>
              non-refundable and cannot be rescheduled, reclaimed, or rolled
              over
            </strong>{" "}
            to future dates. You are responsible for managing your attendance.
          </li>
        </ul>

        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter mt-10 mb-4">
          4. Exceptions (Gateway Errors)
        </h2>
        <p>
          The only exceptions to this strictly non-refundable policy are
          instances of technical payment failures. If you experience a duplicate
          charge due to a Razorpay gateway error or network timeout, you are
          entitled to a full refund of the duplicate amount.
        </p>
        <p>
          To claim an exception refund, you must contact our support team within
          72 hours of the duplicate charge with your Razorpay transaction ID.
        </p>

        <p className="mt-8 border-t border-white/10 pt-6">
          <strong>Refund Resolution Contact:</strong>
          <br />
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
