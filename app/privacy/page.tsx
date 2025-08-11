"use client";

import StickyHeader from "@/app/components/StickyHeader";
import styles from "../claim/Claim.module.css";

export default function Privacy() {
  return (
    <div className="bg-white d-flex flex-column align-items-center px-3">
      <StickyHeader
        right={
          <a
            href="/emailclaim"
            className="btn btn-outline-primary btn-sm fw-bold"
            style={{ minWidth: 120 }}
          >
            Claim My Bottle
          </a>
        }
      />
      <div className={styles.mainContent}>
        <h1 className="mb-4">H2All Privacy Policy</h1>
        <p className="text-muted mb-4">
          <strong>Effective Date:</strong> August 11, 2025
        </p>

        <section className="mb-4">
          <h3>1. Introduction</h3>
          <p>
            H2All is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and safeguard your information when
            you use our website, specifically the /claim, /emailclaim, and
            /track pages.
          </p>
        </section>

        <section className="mb-4">
          <h3>2. What Data We Collect</h3>
          <ul>
            <li>
              <strong>Email Address:</strong> When you submit your email on the
              /emailclaim page, we collect your email address to track your
              bottle’s impact and provide updates.
            </li>
            <li>
              <strong>Analytics Data:</strong> We use Google Analytics to
              collect anonymized usage data on the /claim, /emailclaim, and
              /track pages. This includes information such as page views, device
              type, browser, and general location (city/country), but does not
              include your name or precise address.
            </li>
            <li>
              <strong>Claim Activity:</strong> We record when a bottle is
              claimed and track the impact associated with your email address.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h3>3. How We Use Your Data</h3>
          <ul>
            <li>
              To allow you to track your impact in real time as each bottle
              provides access to clean and safe water.
            </li>
            <li>To send you updates about your impact (if you opt in).</li>
            <li>
              To improve our website and understand how users interact with our
              campaign.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h3>4. Data Sharing</h3>
          <ul>
            <li>
              We do <strong>not</strong> sell or rent your personal information
              to third parties.
            </li>
            <li>
              Your email and claim data are only used internally by H2All for
              campaign tracking and impact reporting.
            </li>
            <li>
              Analytics data is shared with Google Analytics in accordance with
              their privacy policy.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h3>5. Data Security</h3>
          <p>
            We use industry-standard security measures to protect your
            information. However, no method of transmission over the Internet is
            100% secure.
          </p>
        </section>

        <section className="mb-4">
          <h3>6. Your Choices</h3>
          <ul>
            <li>
              You may request deletion of your email and claim data by
              contacting us at{" "}
              <a href="mailto:privacy@h2all.org">privacy@h2all.org</a>.
            </li>
            <li>
              You can opt out of Google Analytics tracking by using browser
              privacy settings or extensions.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h3>7. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date.
          </p>
        </section>

        <section className="mb-4">
          <h3>8. Contact Us</h3>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            your data, please contact us at{" "}
            <a href="mailto:privacy@h2all.org">privacy@h2all.org</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
