"use client";

import Image from "next/image";
import { Card, Button, ProgressBar } from "react-bootstrap";
import styles from "./Claimed2.module.css";

export default function Claimed2Page() {
  const raisedAmount = 412.05;
  const goalAmount = 5000;
  const progressPercentage = (raisedAmount / goalAmount) * 100;

  return (
    <div className="min-vh-100 bg-white">
      {/* Header */}
      <header className="bg-white px-3 py-3 border-bottom">
        <h1 className="fs-3 fw-bold text-black mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </header>

      {/* Success Message */}
      <div className="bg-primary bg-opacity-25 px-3 py-3 d-flex align-items-center gap-2">
        <i className="bi bi-star-fill text-black"></i>
        <span className="text-black fw-medium">
          Your bottle has been claimed!
        </span>
      </div>

      {/* Hero Section */}
      <div className="position-relative">
        <div
          className={`position-relative overflow-hidden ${styles.heroSection}`}
        >
          <Image
            src="/village.png"
            alt="People in Kodema Village working to access clean water"
            fill
            className="object-fit-cover"
            priority
          />
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3">
            <h2 className="text-white fs-2 fw-bold text-center lh-sm">
              Thanks for your help to bring clean water to Kodema Village.
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="px-3">
        {/* Campaign Progress */}
        <Card className="mt-3 shadow">
          <Card.Body className="p-3">
            <h3 className="fs-5 fw-bold text-black mb-2">Campaign Progress</h3>
            <p className="text-muted mb-3 small">
              Our goal: clean water within 5 minutes of every home in Kodema
              Village.
            </p>

            <div className="mb-3">
              <div className="d-flex align-items-baseline gap-2 mb-2">
                <span className="fs-3 fw-bold text-black">
                  ${raisedAmount.toFixed(2)}
                </span>
                <span className="text-muted small">
                  of ${goalAmount.toLocaleString()} raised
                </span>
              </div>
              <ProgressBar
                now={progressPercentage}
                className={`mb-0 ${styles.progressBarCustom}`}
                variant="primary"
              />
            </div>
          </Card.Body>
        </Card>

        {/* My Impact */}
        <Card className="mt-3 shadow">
          <Card.Body className="p-3">
            <h3 className="fs-5 fw-bold text-black mb-3">My Impact</h3>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people-fill text-muted"></i>
                  <span className="text-muted small">Claimed Bottle</span>
                </div>
                <span className="fw-bold text-black">1</span>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-droplet-fill text-primary"></i>
                  <span className="text-muted small">Clean Water Funded</span>
                </div>
                <span className="fw-bold text-black">10L</span>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-currency-dollar text-success"></i>
                  <span className="text-muted small">Contribution</span>
                </div>
                <span className="fw-bold text-black">$0.05</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Tell a Friend Button */}
        <div className="mt-3">
          <Button
            className={`w-100 py-3 fs-6 fw-semibold rounded ${styles.orangeButton}`}
          >
            Tell a Friend About H2ALL
          </Button>
        </div>

        {/* About Section */}
        <div className="mt-4 pb-4">
          <h3 className="fs-4 fw-bold text-black mb-3">About Kodema Village</h3>

          <div className="d-flex flex-column gap-3 text-dark lh-base">
            <p className="small">
              Kodema Village, located in the Busia District of Uganda, is home
              to over 5,000 people. Today, the only available water source in
              Kodema is a shallow, unprotected well—a place where animals and
              humans share the same water.
            </p>

            <p className="small">
              This contaminated source is causing widespread waterborne
              illnesses, affecting children, families, and the future of the
              community.{" "}
              <span
                className={`text-primary text-decoration-underline ${styles.clickableLink}`}
              >
                Get to Know Kodema Village
              </span>
            </p>
          </div>

          {/* Bottom Image */}
          <div className="mt-3 rounded overflow-hidden">
            <Image
              src="/village.png"
              alt="People collecting water from contaminated source in Kodema Village"
              width={350}
              height={300}
              className={`w-100 object-fit-cover ${styles.bottomImage}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
