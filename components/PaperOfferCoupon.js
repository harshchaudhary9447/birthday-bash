"use client";

import { useState, useEffect } from "react";
import { getCurrentMonthOffer } from "../lib/monthlyOffer";

export default function PaperOfferCoupon({
  currency = "INR",
}) {
  const [offer, setOffer] = useState(() => getCurrentMonthOffer(null, currency));

  useEffect(() => {
    // Keep dynamic with client date and detected currency
    setOffer(getCurrentMonthOffer(null, currency));
  }, [currency]);

  const pricing = offer.pricing || offer.inr;

  return (
    <div className="paper-coupon-container">
      {/* Real hole-punch cutouts on left and right */}
      <div className="paper-punch-notch notch-left" aria-hidden="true" />
      <div className="paper-punch-notch notch-right" aria-hidden="true" />

      <div className="paper-coupon-card">
        {/* Dashed Inset Boundary (like a real clipped paper coupon) */}
        <div className="paper-coupon-dashed-border">
          {/* Main Voucher Body */}
          <div className="paper-coupon-main">
            {/* Header row */}
            <div className="paper-header-row">
              <div className="paper-voucher-badge">
                <span className="voucher-star">✦</span>
                <span className="voucher-title-text">GIFT VOUCHER</span>
                <span className="voucher-star">✦</span>
              </div>
              <div className="paper-dynamic-month">
                <span className="month-icon">🗓️</span>
                <span className="month-text">{offer.fullMonthYear} Special</span>
              </div>
            </div>

            {/* Price & Discount Row */}
            <div className="paper-pricing-section">
              <div className="paper-discount-pill">
                <span className="discount-pct">{pricing.discountPct}</span>
                <span className="discount-sub">{pricing.savingsText}</span>
              </div>

              <div className="paper-price-numbers">
                <div className="regular-price-row">
                  <span className="regular-label">Regular:</span>
                  <span className="regular-value-crossed">{pricing.displayOriginal}</span>
                </div>
                <div className="fair-price-row">
                  <span className="fair-label">Fair Price:</span>
                  <span className="fair-amount">{pricing.displayPrice}</span>
                  <span className="fair-only">only</span>
                </div>
              </div>
            </div>

            {/* Dynamic Monthly Quote printed on paper */}
            <div className="paper-quote-container">
              <p className="paper-quote-text">
                &ldquo;{offer.quote}&rdquo;
              </p>
            </div>
          </div>

          {/* Perforated Tear Line with Scissors Icon */}
          <div className="paper-perforation-divider" aria-hidden="true">
            <div className="perforation-dashed-line" />
            <div className="perforation-scissors-badge" title="Tear along dotted line">
              <span className="perforation-scissors">✂</span>
            </div>
          </div>

          {/* Ticket Stub (Without QR/Barcode and without currency chooser) */}
          <div className="paper-coupon-stub">
            <div className="stub-header-line">
              <span className="stub-title">COUPON PASS</span>
              <span className="stub-verified-pill">VERIFIED</span>
            </div>

            <div className="stub-code-display">
              <span className="stub-code-label">COUPON CODE</span>
              <span className="stub-code-val">{offer.couponCode}</span>
            </div>

            <div className="stub-region-badge">
              <span className="stub-region-icon">📍</span>
              <span className="stub-region-text">{pricing.regionName}</span>
            </div>

            <div className="stub-status-pill">
              <span>✓ Auto-Applied</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
