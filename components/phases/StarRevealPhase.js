"use client";
import React, { useEffect, useState, useMemo } from "react";
import "./StarRevealPhase.css";

export default function StarRevealPhase({ popped, onPop, reasons }) {
  const safeReasons = reasons || [];
  const starData = [
    {
      id: 0,
      id: 0,
      top: "40%",
      left: "35%",
      label: "REASON NO.1",
      text: safeReasons[0] || "Your laugh is my favourite sound",
      color: "#f96f92",
    },
    {
      id: 1,
      top: "50%",
      left: "45%",
      label: "REASON NO.2",
      text: safeReasons[1] || "The world is kinder with you in it",
      color: "#fccb6c",
    },
    {
      id: 2,
      top: "30%",
      left: "50%",
      label: "REASON NO.3",
      text: safeReasons[2] || "You remember the little things I forget",
      color: "#a27bf7",
    },
    {
      id: 3,
      top: "45%",
      left: "58%",
      label: "REASON NO.4",
      text: safeReasons[3] || "You believed in me when I didn't",
      color: "#48d9cc",
    },
    {
      id: 4,
      top: "35%",
      left: "65%",
      label: "REASON NO.5",
      text: safeReasons[4] || "You make ordinary days magic",
      color: "#f5a363",
    },
  ];

  const ambientBackground = useMemo(() => {
    const items = [];
    for (let i = 0; i < 90; i++) {
      const type =
        Math.random() > 0.6 ? "rect" : Math.random() > 0.5 ? "circle" : "star";
      items.push({
        id: i,
        type,
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        animDuration: `${5 + Math.random() * 10}s`,
        animDelay: `-${Math.random() * 10}s`,
        size: type === "star" ? "12px" : `${3 + Math.random() * 6}px`,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }
    return items;
  }, []);

  const allFound = popped.length === starData.length;

  return (
    <section className="star-reveal-page">
      <div className="sr-gradient-bg">
        {ambientBackground.map((p) => (
          <div
            key={`amb-${p.id}`}
            className={`sr-ambient-part ${p.type}`}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: p.animDuration,
              animationDelay: p.animDelay,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      <div className="sr-header-area">
        <h1 className={allFound ? "complete" : ""}>
          {allFound ? "You found them all ✨" : "Find the stars ✦"}
        </h1>
        <p className="sr-subheading">
          {allFound
            ? "Every star is a reminder of how special you are to me."
            : "5 hidden stars. Each one holds a reason you're loved. Tap them all ✨"}
        </p>
      </div>

      <div className="sr-sky-area">
        {starData.map((star, i) => {
          const isPopped = popped.includes(star.id);
          return (
            <div
              key={star.id}
              className={`sr-star-wrapper ${isPopped ? "tapped" : ""}`}
              style={{
                top: star.top,
                left: star.left,
                "--delay": `${i * 0.7}s`,
                "--accent": star.color,
              }}>
              <button
                className="sr-star-btn"
                onClick={() => !isPopped && onPop(star.id)}
                disabled={isPopped}
                aria-label={`Reveal reason ${star.id + 1}`}>
                <span className="sr-star-icon">
                  <svg
                    viewBox="0 0 100 100"
                    width="1em"
                    height="1em"
                    fill="currentColor">
                    <path d="M50 0 C55 40 60 45 100 50 C60 55 55 60 50 100 C45 60 40 55 0 50 C40 45 45 40 50 0 Z" />
                  </svg>
                </span>
              </button>

              <div className="sr-thread"></div>

              {isPopped && (
                <div className="sr-confetti-drop">
                  {[...Array(25)].map((_, c) => {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 60 + Math.random() * 120;
                    return (
                      <div
                        key={`cnf-${c}`}
                        className="sr-cnf-piece"
                        style={{
                          "--tx": `${Math.cos(angle) * velocity}px`,
                          "--ty": `${Math.sin(angle) * velocity}px`,
                          "--rot": `${(Math.random() - 0.5) * 720}deg`,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sr-cards-stack">
        {popped.map((id, index) => {
          const star = starData.find((s) => s.id === id);
          if (!star) return null;
          return (
            <div
              key={id}
              className="sr-reason-card"
              style={{ "--accent": star.color, "--stack-index": index }}>
              <div className="sr-card-label">
                {star.label} <span className="sr-heart">❦</span>
              </div>
              <div className="sr-card-text">
                <span>{star.text}</span>
                <span className="sr-sparkle">✦</span>
              </div>
            </div>
          );
        })}
      </div>

      {allFound && (
        <div className="sr-celebration">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={`cel-${i}`}
              className="sr-cel-spark"
              style={{
                "--x": `${(Math.random() - 0.5) * 100}vw`,
                "--y": `${(Math.random() - 0.5) * 100}vh`,
                "--delay": `${Math.random() * 2}s`,
                "--scale": 0.5 + Math.random() * 1.5,
              }}>
              ✦
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
