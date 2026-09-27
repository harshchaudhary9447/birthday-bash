import { useEffect, useState, useRef, useMemo } from "react";
import "./CakePhase.css";

export default function CakePhase({ person }) {
  const [scene, setScene] = useState(0);
  const [micEnabled, setMicEnabled] = useState(false);
  const [blownOut, setBlownOut] = useState(false);
  const [isBuilt, setIsBuilt] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    if (scene === 0) {
      const t = setTimeout(() => setScene(2), 3500);
      return () => clearTimeout(t);
    } else if (scene === 2) {
      const tBuild = setTimeout(() => setIsBuilt(true), 3500);
      let streamGrabbed = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            streamGrabbed = stream;
            setMicEnabled(true);
            const AudioContext =
              window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current =
              audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const startTime = Date.now();
            const checkAudio = () => {
              if (blownOut) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
              const average = sum / bufferLength;

              // Only allow blowout after 3500ms (once cake is fully built)
              if (average > 40 && Date.now() - startTime > 3500) {
                handleBlowOut();
              } else {
                reqRef.current = requestAnimationFrame(checkAudio);
              }
            };
            checkAudio();
          })
          .catch((err) => {
            console.log("Mic access denied or error:", err);
            setMicEnabled(false);
          });
      }
      return () => {
        if (reqRef.current) cancelAnimationFrame(reqRef.current);
        if (
          audioContextRef.current &&
          audioContextRef.current.state !== "closed"
        ) {
          audioContextRef.current.close().catch(console.error);
        }
        if (streamGrabbed)
          streamGrabbed.getTracks().forEach((track) => track.stop());
      };
    }
  }, [scene, blownOut]);

  const handleBlowOut = () => {
    if (blownOut) return;
    setBlownOut(true);
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
  };

  const confetti = Array.from({ length: 50 }).map((_, i) => (
    <div
      key={i}
      className={`confetti-piece c-${i % 4}`}
      style={{
        "--delay": `${Math.random() * 0.4}s`,
        "--x": `${(Math.random() - 0.5) * 400}px`,
        "--y": `${(Math.random() - 0.5) * 400 - 150}px`,
        "--rot": `${Math.random() * 720}deg`,
        "--scale": `${Math.random() * 0.6 + 0.4}`,
      }}
    />
  ));

  const sparks = Array.from({ length: 80 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 20 + Math.random() * 100;
    const vz = 40 + Math.random() * 150;
    const dx = Math.cos(angle) * velocity;
    const dy = -vz + Math.sin(angle) * velocity * 0.3;
    const rot = Math.random() * 360;
    return (
      <div
        key={`sp2-${i}`}
        className="epic-spark"
        style={{
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
          "--rot": `${rot}deg`,
          "--delay": `${1 + Math.random() * 0.4}s`,
          "--scale": `${0.5 + Math.random() * 0.8}`,
          background: Math.random() > 0.6 ? "#fff" : "#f5d471",
          boxShadow: `0 0 15px ${Math.random() > 0.5 ? "#ff9d00" : "#f5d471"}`,
        }}
      />
    );
  });

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

  return (
    <section className="interactive-cake-phase">
      <div className="cake-gradient-bg">
        {ambientBackground.map((p) => (
          <div
            key={`amb-${p.id}`}
            className={`ambient-part ${p.type}`}
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
      <div className={`shelf-line ${scene === 0 ? "visible" : "hidden"}`}></div>

      <div
        className={`scene-container epic-gift-scene ${scene === 0 ? "scene-active" : ""}`}>
        <div className="epic-gift-wrapper">
          <div className="epic-base">
            <div className="e-face base-inside"></div>
            <div className="e-face base-left"></div>
            <div className="e-face base-right"></div>
            <div className="e-face ribbon-bl"></div>
            <div className="e-face ribbon-br"></div>
          </div>

          <div className="epic-lid">
            <div className="e-face lid-top-wrapper">
              <div className="e-face lid-top"></div>
              <div className="lid-ribbon-x"></div>
              <div className="lid-ribbon-y"></div>
            </div>
            <div className="e-face lid-left"></div>
            <div className="e-face lid-right"></div>
            <div className="e-face ribbon-ll"></div>
            <div className="e-face ribbon-lr"></div>
            <div className="epic-bow">
              <div className="sbl sbl-1"></div>
              <div className="sbl sbl-2"></div>
              <div className="sbl sbl-3"></div>
              <div className="sbl sbl-4"></div>
              <div className="sbl sbl-5"></div>
              <div className="sbl-center"></div>
            </div>
          </div>

          <div className="explosion-flash"></div>
          <div className="epic-sparks-container">{scene === 0 && sparks}</div>
        </div>
      </div>

      <div
        className={`scene-container candle-scene ${scene === 2 ? "scene-active" : ""}`}>
        <div className="top-title">First things first 🎂</div>
        <div
          className="interactive-cake"
          onClick={() => {
            if (isBuilt) handleBlowOut();
          }}>
          <div className="layer level-one"></div>
          <div className="layer level-two"></div>
          <div className="layer level-three">
            <div className="icing-blob i1"></div>
            <div className="icing-blob i2"></div>
            <div className="icing-blob i3"></div>
            <div className="icing-blob i4"></div>
            <div className="icing-blob i5"></div>
            <div className="icing-blob i6"></div>
          </div>
          <div className={`candle-stick ${blownOut ? "extinguished" : ""}`}>
            {!blownOut && (
              <div className="flame-wrapper">
                <div className="flame"></div>
                <div className="flame-glow"></div>
              </div>
            )}
            {blownOut && <div className="smoke-wisp"></div>}
          </div>

          {isBuilt && !blownOut && (
            <div className="candle-instruction">
              <span className="text">please blow it</span>
              <svg
                className="arrow-drawn"
                viewBox="0 0 50 50"
                width="30"
                height="30">
                <path
                  d="M 40,10 C 30,30 20,40 5,45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <polyline
                  points="15,40 5,45 10,35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
        {blownOut && (
          <div className="bottom-title">
            <div className="hbd-text">Happy Birthday, Rancho!</div>
          </div>
        )}
        {blownOut && scene === 2 && (
          <div className="celebration-confetti">{confetti}</div>
        )}
      </div>
    </section>
  );
}
