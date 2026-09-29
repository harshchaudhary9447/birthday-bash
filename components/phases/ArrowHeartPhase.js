"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import "./ArrowHeartPhase.css";

export default function ArrowHeartPhase({
  person,
  arrowReleased,
  onLaunchArrow,
  onNext,
  nextBalloonPopped,
}) {
  const [stretchProgress, setStretchProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [hasHit, setHasHit] = useState(arrowReleased);
  const [showCelebration, setShowCelebration] = useState(arrowReleased);
  const [flightData, setFlightData] = useState(null);
  const [aimAngle, setAimAngle] = useState(-55);
  const [aimDistance, setAimDistance] = useState(480);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const bowRef = useRef(null);

  // Synchronize with external arrowReleased state if already triggered
  useEffect(() => {
    if (arrowReleased && !hasHit) {
      setHasHit(true);
      setShowCelebration(true);
    }
  }, [arrowReleased, hasHit]);

  // Dynamically compute exact angle & distance from bow to target heart
  const updateAim = useCallback(() => {
    if (typeof window === "undefined") return;
    const bowEl = bowRef.current;
    const heartEl = document.querySelector(".ah-target-zone");
    if (bowEl && heartEl) {
      const bRect = bowEl.getBoundingClientRect();
      const hRect = heartEl.getBoundingClientRect();
      const startX = bRect.left + bRect.width * 0.5;
      const startY = bRect.top + bRect.height * 0.5;
      const endX = hRect.left + hRect.width * 0.5;
      const endY = hRect.top + hRect.height * 0.5;
      const dx = endX - startX;
      const dy = endY - startY;
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const distPx = Math.hypot(dx, dy);
      const scale = 240 / (bRect.width || 175);
      const distSvg = distPx * scale;
      setAimAngle(angleDeg);
      setAimDistance(Math.max(260, distSvg - 80));
    }
  }, []);

  useEffect(() => {
    updateAim();
    const t1 = setTimeout(updateAim, 60);
    const t2 = setTimeout(updateAim, 300);
    window.addEventListener("resize", updateAim);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateAim);
    };
  }, [updateAim]);

  // Handle pointer down (touch or click on the arrow/bow)
  const handlePointerDown = (e) => {
    if (isFlying || hasHit) return;
    updateAim();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Handle pointer move (stretching backwards along direction opposite to aimAngle)
  const handlePointerMove = (e) => {
    if (!isDragging || isFlying || hasHit) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Calculate pull along direction opposite to aimAngle
    const rad = (aimAngle * Math.PI) / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);
    const pullDistance = Math.max(0, -dx * ux - dy * uy, -dx * 0.75, dy * 0.75);
    const maxPullDrag = 60; // px
    const progress = Math.min(1, Math.max(0, pullDistance / maxPullDrag));
    setStretchProgress(progress);
  };

  // Trigger launch of the arrow
  const fireArrow = () => {
    // Calculate flight coordinates from bow to target heart
    const bowEl = bowRef.current;
    const heartEl = typeof document !== "undefined" ? document.querySelector(".ah-target-zone") : null;
    if (bowEl && heartEl) {
      const bRect = bowEl.getBoundingClientRect();
      const hRect = heartEl.getBoundingClientRect();
      const startX = bRect.left + bRect.width * 0.5;
      const startY = bRect.top + bRect.height * 0.5;
      const endX = hRect.left + hRect.width * 0.5;
      const endY = hRect.top + hRect.height * 0.5;
      const angleDeg = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;
      setFlightData({ startX, startY, endX, endY, angleDeg });
    }

    setIsFlying(true);
    setIsDragging(false);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([30, 40]);
      } catch (e) {}
    }

    // Flight takes 520ms
    setTimeout(() => {
      setHasHit(true);
      setIsFlying(false);
      onLaunchArrow();

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([60, 80, 50]);
        } catch (e) {}
      }

      // Show grand celebration
      setTimeout(() => {
        setShowCelebration(true);
      }, 150);
    }, 520);
  };

  // Handle pointer release
  const handlePointerUp = () => {
    if (!isDragging || isFlying || hasHit) return;
    if (stretchProgress > 0.16) {
      // User stretched it sufficiently, fire!
      fireArrow();
    } else {
      // Tap without stretch: auto-stretch smoothly and fire!
      let current = 0;
      const interval = setInterval(() => {
        current += 0.25;
        if (current >= 1) {
          clearInterval(interval);
          setStretchProgress(1);
          setTimeout(fireArrow, 80);
        } else {
          setStretchProgress(current);
        }
      }, 25);
    }
  };

  // Ambient stars in background
  const ambientStars = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        top: `${(i * 37) % 95}%`,
        left: `${(i * 61) % 95}%`,
        delay: `${(i * 0.25) % 3}s`,
        size: `${10 + (i % 6) * 2}px`,
      })),
    [],
  );

  // Celebration burst particles on impact
  const celebrationConfetti = useMemo(() => {
    const colors = ["#ff3366", "#ff9900", "#ffcc00", "#33cc99", "#3399ff", "#cc66ff", "#fff"];
    return Array.from({ length: 55 }).map((_, i) => {
      const angle = (i / 55) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
      const dist = 90 + Math.random() * 180;
      return {
        id: i,
        tx: `${Math.cos(angle) * dist}px`,
        ty: `${Math.sin(angle) * dist - 25}px`,
        color: colors[i % colors.length],
        size: `${6 + Math.random() * 8}px`,
        radius: i % 3 === 0 ? "2px" : "50%",
        rot: `${(Math.random() - 0.5) * 720}deg`,
        scale: 0.5 + Math.random() * 0.8,
      };
    });
  }, []);

  // Geometry calculations for proper recurve bow & arrow
  // Resting nock is at X = 86 (behind the grip at X = 95)
  // Pulling stretches nock back along -X (towards archer)
  const maxPull = 45; // max pull distance in px
  const pullPixels = stretchProgress * maxPull;
  const nockX = 86 - pullPixels;
  // Dynamic limb tip flex when drawn
  const tipFlex = stretchProgress * 4.5;

  return (
    <section className="ah-interactive-scene">
      {/* Background radial glow & sparkles */}
      <div className="ah-ambient-bg">
        <div className="ah-glow-halo" />
        {ambientStars.map((s) => (
          <span
            key={s.id}
            className="ah-bg-sparkle"
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
              fontSize: s.size,
            }}>
            ✦
          </span>
        ))}
      </div>

      {/* Top romantic intro banner */}
      <div className={`ah-top-header ${showCelebration ? "fade-out" : ""}`}>
        <span className="ah-script-title">a little love...</span>
        <p className="ah-sub-title">There&apos;s something I want you to know</p>
      </div>

      {/* Target Glowing Heart at ~36% top */}
      <div className={`ah-target-zone ${hasHit ? "hit" : ""}`}>
        <div className="ah-pulse-ring r1" />
        <div className="ah-pulse-ring r2" />
        <div className="ah-glowing-heart">
          <svg viewBox="0 0 100 90">
            <defs>
              <linearGradient id="heart3dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7b9f" />
                <stop offset="50%" stopColor="#e8386a" />
                <stop offset="100%" stopColor="#b51a44" />
              </linearGradient>
              <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#b51a44" floodOpacity="0.4" />
              </filter>
            </defs>
            <path
              fill="url(#heart3dGrad)"
              filter="url(#heartShadow)"
              d="M 50,85 C 20,60 5,42 5,25 C 5,10 18,2 30,2 C 40,2 47,8 50,15 C 53,8 60,2 70,2 C 82,2 95,10 95,25 C 95,42 80,60 50,85 Z"
            />
            {/* Heart glossy reflection */}
            <path
              fill="rgba(255, 255, 255, 0.4)"
              d="M 22,12 C 16,18 14,26 18,32 C 16,24 22,16 32,12 C 28,10 24,11 22,12 Z"
            />
          </svg>
        </div>
      </div>

      {/* Confetti explosion on impact */}
      {hasHit && (
        <div className="ah-burst-particles">
          {celebrationConfetti.map((p) => (
            <div
              key={p.id}
              className="ah-burst-piece"
              style={{
                "--tx": p.tx,
                "--ty": p.ty,
                "--color": p.color,
                "--size": p.size,
                "--radius": p.radius,
                "--rot": p.rot,
                "--scale": p.scale,
              }}
            />
          ))}
        </div>
      )}

      {/* Grand Celebration & Happy Birthday Reveal */}
      {showCelebration && (
        <div className="ah-celebration-reveal">
          <div className="ah-celebrate-badge">
            <span>✨</span> with all my heart <span>✨</span>
          </div>
          <h1 className="ah-celebrate-hbd">
            HAPPY BIRTHDAY
            <span>{person.name || person.nickname || "You"}!</span>
          </h1>
          <p className="ah-celebrate-desc">
            Today is your day, and you deserve every beautiful thing in this world. 💖
          </p>
        </div>
      )}

      {/* Proper Authentic Bow & Arrow at Left Bottom */}
      {!hasHit && (
        <div className={`ah-launcher-container ${isFlying ? "hidden" : ""}`}>
          <div
            ref={bowRef}
            className={`ah-bow-wrapper ${!isDragging ? "idle-bounce" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            role="button"
            tabIndex={0}
            aria-label="Draw and release the arrow to aim at the heart"
          >
            <svg className="ah-bow-svg" viewBox="0 0 240 240">
              <defs>
                {/* Wood gradient with rich depth and luster */}
                <linearGradient id="bowWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4a180b" />
                  <stop offset="25%" stopColor="#8a3c1b" />
                  <stop offset="50%" stopColor="#cf6f34" />
                  <stop offset="75%" stopColor="#e8985c" />
                  <stop offset="100%" stopColor="#5c1f0d" />
                </linearGradient>

                {/* Golden inlay & trim */}
                <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe899" />
                  <stop offset="50%" stopColor="#f7c244" />
                  <stop offset="100%" stopColor="#b37c12" />
                </linearGradient>

                {/* Grip Leather wrap */}
                <linearGradient id="gripLeather" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#733219" />
                  <stop offset="50%" stopColor="#a8522e" />
                  <stop offset="100%" stopColor="#57220e" />
                </linearGradient>

                {/* Arrow Shaft golden wood */}
                <linearGradient id="arrowShaftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffeaa7" />
                  <stop offset="40%" stopColor="#e0a943" />
                  <stop offset="70%" stopColor="#b87a1d" />
                  <stop offset="100%" stopColor="#7a4e0c" />
                </linearGradient>

                {/* Cupid Ruby Heart Arrowhead */}
                <linearGradient id="rubyHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff527b" />
                  <stop offset="45%" stopColor="#e81d56" />
                  <stop offset="85%" stopColor="#b00b3b" />
                  <stop offset="100%" stopColor="#6e0020" />
                </linearGradient>

                {/* Fletching Feather gradient */}
                <linearGradient id="featherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#ffb3c6" />
                  <stop offset="100%" stopColor="#ff527b" />
                </linearGradient>

                {/* Glow filter for Bowstring */}
                <filter id="stringGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffffff" floodOpacity="0.9" />
                  <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#ff4d79" floodOpacity="0.4" />
                </filter>

                {/* Soft shadow for bow */}
                <filter id="bowShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="rgba(60, 15, 25, 0.35)" />
                </filter>

                {/* Aim line gradient fading towards target heart */}
                <linearGradient id="aimLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4d79" stopOpacity="0.95" />
                  <stop offset="65%" stopColor="#ff7b9f" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffd700" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Rotated group: dynamically aligned with aimAngle straight at the heart */}
              <g transform={`rotate(${aimAngle} 120 120)`}>
                {/* Aiming trajectory line while stretching */}
                {isDragging && stretchProgress > 0.05 && (
                  <g className="ah-aim-group">
                    <line
                      x1={nockX + 125}
                      y1="120"
                      x2={nockX + aimDistance}
                      y2="120"
                      stroke="url(#aimLineGrad)"
                      strokeWidth="2.4"
                      strokeDasharray="6 7"
                      strokeLinecap="round"
                    />
                    <text
                      x={nockX + Math.min(190, aimDistance * 0.3)}
                      y="124"
                      fill="#ff4d79"
                      fontSize="12"
                      fontWeight="bold"
                      opacity={Math.min(1, stretchProgress * 1.5)}
                    >
                      ✦
                    </text>
                    <text
                      x={nockX + Math.min(290, aimDistance * 0.55)}
                      y="124"
                      fill="#ffd700"
                      fontSize="11"
                      opacity={Math.min(1, stretchProgress * 1.5)}
                    >
                      ✧
                    </text>
                    <text
                      x={nockX + Math.min(400, aimDistance * 0.8)}
                      y="124"
                      fill="#ff4d79"
                      fontSize="13"
                      fontWeight="bold"
                      opacity={Math.min(1, stretchProgress * 1.5)}
                    >
                      ✦
                    </text>
                  </g>
                )}

                {/* Recurve Bow Body (Laminated Wood, graceful C-curves) */}
                <path
                  d={`M 105,${18 + tipFlex}
                      C 126,50 128,80 100,107
                      L 100,133
                      C 128,160 126,190 105,${222 - tipFlex}
                      C 99,${225 - tipFlex} 93,${221 - tipFlex} 94,${216 - tipFlex}
                      C 114,188 114,160 90,133
                      L 90,107
                      C 114,80 114,52 94,${24 + tipFlex}
                      C 93,${19 + tipFlex} 99,${15 + tipFlex} 105,${18 + tipFlex} Z`}
                  fill="url(#bowWoodGrad)"
                  stroke="#4a180b"
                  strokeWidth="1.2"
                  filter="url(#bowShadow)"
                />

                {/* Inner Golden Spine trim along limbs */}
                <path
                  d={`M 100,${24 + tipFlex} C 120,55 120,80 96,107`}
                  fill="none"
                  stroke="url(#goldTrim)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d={`M 96,133 C 120,160 120,185 100,${216 - tipFlex}`}
                  fill="none"
                  stroke="url(#goldTrim)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  opacity="0.9"
                />

                {/* Leather Grip Wrap on Riser */}
                <rect
                  x="88"
                  y="105"
                  width="14"
                  height="30"
                  rx="4"
                  fill="url(#gripLeather)"
                  stroke="#f7c244"
                  strokeWidth="1"
                />
                {/* Grip Wrap Cross Ties */}
                <line x1="88" y1="111" x2="102" y2="114" stroke="#ffd980" strokeWidth="1.2" opacity="0.85" />
                <line x1="88" y1="118" x2="102" y2="121" stroke="#ffd980" strokeWidth="1.2" opacity="0.85" />
                <line x1="88" y1="125" x2="102" y2="128" stroke="#ffd980" strokeWidth="1.2" opacity="0.85" />

                {/* Center Cupid Ruby Jewel on Grip */}
                <circle cx="95" cy="120" r="3.2" fill="#ff2d60" stroke="#ffd700" strokeWidth="1" />

                {/* Golden Recurve Tips / Nocks */}
                <circle cx={99 - tipFlex} cy={22 + tipFlex} r="4" fill="#ffd700" stroke="#8a5312" strokeWidth="1" />
                <circle cx={99 - tipFlex} cy={218 - tipFlex} r="4" fill="#ffd700" stroke="#8a5312" strokeWidth="1" />

                {/* Dynamic Bowstring connecting tips through nock */}
                <path
                  d={`M ${99 - tipFlex},${22 + tipFlex} L ${nockX},120 L ${99 - tipFlex},${218 - tipFlex}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#stringGlow)"
                />
                <path
                  d={`M ${99 - tipFlex},${22 + tipFlex} L ${nockX},120 L ${99 - tipFlex},${218 - tipFlex}`}
                  fill="none"
                  stroke="#fff5e6"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* The Arrow (resting on string at nockX, sliding with draw) */}
                <g className="ah-arrow-assembly">
                  {/* Arrow Shaft (length ~96px) */}
                  <line
                    x1={nockX}
                    y1="120"
                    x2={nockX + 96}
                    y2="120"
                    stroke="url(#arrowShaftGrad)"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  {/* Highlight Gleam on Shaft */}
                  <line
                    x1={nockX + 12}
                    y1="119.1"
                    x2={nockX + 94}
                    y2="119.1"
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />

                  {/* Fletching (Cupid Feathers) */}
                  <path
                    d={`M ${nockX + 6},120 C ${nockX + 12},106 ${nockX + 25},105 ${nockX + 30},108 L ${nockX + 24},120 Z`}
                    fill="url(#featherGrad)"
                    stroke="#ff527b"
                    strokeWidth="0.8"
                  />
                  <path
                    d={`M ${nockX + 6},120 C ${nockX + 12},134 ${nockX + 25},135 ${nockX + 30},132 L ${nockX + 24},120 Z`}
                    fill="url(#featherGrad)"
                    stroke="#ff527b"
                    strokeWidth="0.8"
                  />
                  {/* Feather Gold Bindings */}
                  <rect x={nockX + 5} y="118.2" width="2.5" height="3.6" fill="#ffd700" stroke="#8a5312" strokeWidth="0.5" />
                  <rect x={nockX + 25} y="118.2" width="2.5" height="3.6" fill="#ffd700" stroke="#8a5312" strokeWidth="0.5" />

                  {/* Arrow Tail Nock Clasp */}
                  <path
                    d={`M ${nockX + 5},118.5 L ${nockX},118.5 L ${nockX - 2.5},120 L ${nockX},121.5 L ${nockX + 5},121.5 Z`}
                    fill="#ffd700"
                    stroke="#8a5312"
                    strokeWidth="0.7"
                  />

                  {/* Golden Ferrule Collar */}
                  <polygon
                    points={`${nockX + 94},117.2 ${nockX + 99},116.5 ${nockX + 99},123.5 ${nockX + 94},122.8`}
                    fill="#ffd700"
                    stroke="#8a5312"
                    strokeWidth="0.8"
                  />

                  {/* Cupid Ruby Heart Arrowhead */}
                  <path
                    d={`M ${nockX + 124},120
                        C ${nockX + 116},112 ${nockX + 106},107 ${nockX + 101},112
                        C ${nockX + 97},116 ${nockX + 97},119 ${nockX + 99},120
                        C ${nockX + 97},121 ${nockX + 97},124 ${nockX + 101},128
                        C ${nockX + 106},133 ${nockX + 116},128 ${nockX + 124},120 Z`}
                    fill="url(#rubyHeartGrad)"
                    stroke="#ffe599"
                    strokeWidth="1.2"
                    filter="drop-shadow(0 0 5px rgba(255, 45, 96, 0.75))"
                  />
                  {/* Glossy Reflection on Heart Lobe */}
                  <ellipse
                    cx={nockX + 106}
                    cy={114.5}
                    rx="4.5"
                    ry="2.2"
                    fill="rgba(255, 255, 255, 0.85)"
                    transform={`rotate(-20 ${nockX + 106} 114.5)`}
                  />
                  {/* Piercing Diamond Tip */}
                  <polygon
                    points={`${nockX + 120},119.3 ${nockX + 126},120 ${nockX + 120},120.7`}
                    fill="#ffffff"
                  />
                </g>
              </g>
            </svg>
          </div>

          <span className="ah-drag-hint">
            {isDragging ? "release to shoot! 💘" : "🏹 pull arrow & release!"}
          </span>
        </div>
      )}

      {/* Flying Arrow in flight to center heart */}
      {isFlying && (
        <div
          className="ah-flying-arrow"
          style={{
            "--sx": `${flightData?.startX ?? 90}px`,
            "--sy": `${flightData?.startY ?? (typeof window !== "undefined" ? window.innerHeight - 120 : 600)}px`,
            "--ex": `${flightData?.endX ?? (typeof window !== "undefined" ? window.innerWidth * 0.5 : 200)}px`,
            "--ey": `${flightData?.endY ?? (typeof window !== "undefined" ? window.innerHeight * 0.38 : 250)}px`,
            "--angle": `${flightData?.angleDeg ?? -45}deg`,
          }}
        >
          <div className="ah-sparkle-trail" />
          <svg viewBox="0 0 140 40" width="105" height="30" className="ah-flight-arrow-svg">
            <defs>
              <linearGradient id="flyShaft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffeaa7" />
                <stop offset="50%" stopColor="#e0a943" />
                <stop offset="100%" stopColor="#7a4e0c" />
              </linearGradient>
              <linearGradient id="flyRuby" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff527b" />
                <stop offset="60%" stopColor="#e81d56" />
                <stop offset="100%" stopColor="#800020" />
              </linearGradient>
              <linearGradient id="flyFeather" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#ffb3c6" />
                <stop offset="100%" stopColor="#ff527b" />
              </linearGradient>
            </defs>

            {/* Shaft */}
            <line x1="10" y1="20" x2="102" y2="20" stroke="url(#flyShaft)" strokeWidth="4" strokeLinecap="round" />
            <line x1="18" y1="19" x2="100" y2="19" stroke="rgba(255,255,255,0.85)" strokeWidth="1" strokeLinecap="round" />

            {/* Feathers */}
            <path d="M 12,20 C 18,7 32,6 36,9 L 30,20 Z" fill="url(#flyFeather)" stroke="#ff527b" strokeWidth="0.8" />
            <path d="M 12,20 C 18,33 32,34 36,31 L 30,20 Z" fill="url(#flyFeather)" stroke="#ff527b" strokeWidth="0.8" />

            {/* Gold Collar */}
            <polygon points="100,17 105,16.5 105,23.5 100,23" fill="#ffd700" stroke="#8a5312" strokeWidth="0.8" />

            {/* Ruby Heart Arrowhead */}
            <path
              d="M 130,20 C 122,12 112,7 107,12 C 103,16 103,19 105,20 C 103,21 103,24 107,28 C 112,33 122,28 130,20 Z"
              fill="url(#flyRuby)"
              stroke="#ffe599"
              strokeWidth="1.2"
              filter="drop-shadow(0 0 6px rgba(255, 45, 96, 0.9))"
            />
            {/* Gleam */}
            <ellipse cx="112" cy="14.5" rx="4" ry="2" fill="rgba(255,255,255,0.85)" transform="rotate(-20 112 14.5)" />
            <polygon points="126,19.3 132,20 126,20.7" fill="#ffffff" />
          </svg>
        </div>
      )}

      {/* Floating Next Balloon (appears after celebration starts) */}
      {showCelebration && (
        <button
          type="button"
          className={`ah-next-balloon ${nextBalloonPopped ? "popped" : ""}`}
          onClick={onNext}
          aria-label="Pop the balloon to continue"
        >
          <span>next</span>
          <i />
          <b />
          <em className="balloon-piece piece-one" />
          <em className="balloon-piece piece-two" />
          <em className="balloon-piece piece-three" />
          <em className="balloon-piece piece-four" />
        </button>
      )}
    </section>
  );
}
