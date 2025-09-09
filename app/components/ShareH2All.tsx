"use client";

import type React from "react";
import { useState } from "react";
import styles from "./ShareH2All.module.css";

const ShareH2All: React.FC = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareText, setShareText] = useState("Share H2ALL");

  const shareData = {
    title: "H2ALL - Clean Water Impact",
    text: "I just gave a gallon of clean water to a community in need by buying a bottle of H2ALL. Check it out!",
    url: "https://www.h2all.com"
  };

  const handleNativeShare = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isSharing) return;
    
    setIsSharing(true);
    setShareText("Sharing...");

    try {
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareText("Shared!");
      } else if (navigator.clipboard && window.isSecureContext) {
        // Fallback to clipboard
        const clipboardText = `${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(clipboardText);
        setShareText("Link Copied!");
      } else {
        // Final fallback - open in new tab (original behavior)
        window.open("https://h2all.com", "_blank", "noopener,noreferrer");
        setShareText("Opening...");
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name === "AbortError") {
        // User cancelled share - no message needed
        setShareText("Share H2ALL");
      } else {
        // Try clipboard as backup
        try {
          const clipboardText = `${shareData.text}\n${shareData.url}`;
          await navigator.clipboard.writeText(clipboardText);
          setShareText("Link Copied!");
        } catch {
          // Final fallback to original behavior
          window.open("https://h2all.com", "_blank", "noopener,noreferrer");
          setShareText("Opening...");
        }
      }
    } finally {
      setIsSharing(false);
      // Reset text after 2 seconds if it's not the default
      if (shareText !== "Share H2ALL") {
        setTimeout(() => setShareText("Share H2ALL"), 2000);
      }
    }
  };

  return (
    <div className={styles.container}>
      <a 
        href="https://h2all.com"
        className={styles.shareButton}
        onClick={handleNativeShare}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#B63A1D";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#D34722";
        }}
      >
        {shareText}
      </a>
    </div>
  );
};

export default ShareH2All;