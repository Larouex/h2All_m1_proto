"use client";

import Image from "next/image";
import { Container, Card, Button, ProgressBar } from "react-bootstrap";
import styles from "./Claimed2.module.css";

export default function Claimed2Page() {
  const raisedAmount = 412.05;
  const goalAmount = 5000;
  const progressPercentage = (raisedAmount / goalAmount) * 100;

  return (
    <div className="min-vh-100 bg-white">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-bottom">
        <h1 className="fs-2 fw-bold text-black mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </header>

      {/* Success Message */}
      <div className="bg-primary bg-opacity-25 px-4 py-3 d-flex align-items-center gap-2">
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
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-4">
            <h2 className="text-white fs-1 fw-bold text-center lh-base">
              Thanks for your help to bring clean water to Kodema Village.
            </h2>
          </div>
        </div>
      </div>

      <Container fluid className="px-4">
        {/* Campaign Progress */}
        <Card className="mt-4 shadow">
          <Card.Body className="p-4">
            <h3 className="fs-4 fw-bold text-black mb-2">Campaign Progress</h3>
            <p className="text-muted mb-4">
              Our goal: clean water within 5 minutes of every home in Kodema
              Village.
            </p>

            <div className="mb-4">
              <div className="d-flex align-items-baseline gap-2 mb-2">
                <span className="display-6 fw-bold text-black">
                  ${raisedAmount.toFixed(2)}
                </span>
                <span className="text-muted">
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
        <Card className="mt-4 shadow">
          <Card.Body className="p-4">
            <h3 className="fs-4 fw-bold text-black mb-4">My Impact</h3>

            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-people-fill text-muted fs-5"></i>
                  <span className="text-muted">Claimed Bottle</span>
                </div>
                <span className="fw-bold text-black">1</span>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-droplet-fill text-primary fs-5"></i>
                  <span className="text-muted">Clean Water Funded</span>
                </div>
                <span className="fw-bold text-black">10L</span>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-currency-dollar text-success fs-5"></i>
                  <span className="text-muted">Contribution</span>
                </div>
                <span className="fw-bold text-black">$0.05</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Tell a Friend Button */}
        <div className="mt-4">
          <Button
            className={`w-100 py-3 fs-5 fw-semibold rounded ${styles.orangeButton}`}
          >
            Tell a Friend About H2ALL
          </Button>
        </div>

        {/* About Section */}
        <div className="mt-5 pb-5">
          <h3 className="fs-2 fw-bold text-black mb-4">About Kodema Village</h3>

          <div className="d-flex flex-column gap-4 text-dark lh-base">
            <p>
              Kodema Village, located in the Busia District of Uganda, is home
              to over 5,000 people. Today, the only available water source in
              Kodema is a shallow, unprotected well—a place where animals and
              humans share the same water.
            </p>

            <p>
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
          <div className="mt-4 rounded overflow-hidden">
            <Image
              src="/village.png"
              alt="People collecting water from contaminated source in Kodema Village"
              width={350}
              height={400}
              className={`w-100 object-fit-cover ${styles.bottomImage}`}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
