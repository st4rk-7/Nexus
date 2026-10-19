import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Brand } from "./Icons.jsx";
import Login from "./Login.jsx";
import MicrocontrollerCanvas from "./MicrocontrollerCanvas.jsx";

gsap.registerPlugin(useGSAP);

export default function LandingHero({ onLogin, notice }) {
  const [showLogin, setShowLogin] = useState(false);
  const [activeBank, setActiveBank] = useState("A");
  const [flashing, setFlashing] = useState(false);
  const [flashProgress, setFlashProgress] = useState(0);
  const [activeChip, setActiveChip] = useState("ESP32-S3");
  const [copied, setCopied] = useState(false);
  const heroRef = useRef(null);

  // Trigger OTA simulation
  function triggerOtaSimulation() {
    if (flashing) return;
    setFlashing(true);
    setFlashProgress(0);

    const targetBank = activeBank === "A" ? "B" : "A";
    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      if (p >= 100) {
        clearInterval(interval);
        setFlashProgress(100);
        setTimeout(() => {
          setActiveBank(targetBank);
          setFlashing(false);
          setFlashProgress(0);
        }, 500);
      } else {
        setFlashProgress(p);
      }
    }, 35);
  }

  useGSAP(
    () => {
      if (showLogin) return;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".nav-bar", { y: -20, opacity: 0, duration: 0.6 })
        .from(".hero-headline span", { y: 60, opacity: 0, stagger: 0.08, duration: 0.8 }, "-=0.3")
        .from(".hero-subtext", { opacity: 0, y: 15, duration: 0.6 }, "-=0.5")
        .from(".cta-cluster", { opacity: 0, scale: 0.95, duration: 0.6 }, "-=0.4")
        .from(".pcb-viewport", { opacity: 0, scale: 0.92, duration: 1, ease: "expo.out" }, "-=0.6")
        .from(".tech-spec-row", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4");
    },
    { scope: heroRef, dependencies: [showLogin] },
  );

  function copyCli() {
    navigator.clipboard?.writeText("curl -fsSL https://nexus.sh/ota | sh");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="three-landing-root" ref={heroRef}>
      {/* Precision Top Navigation */}
      <nav className="nav-bar">
        <div className="nav-left">
          <Brand />
          <span className="nav-tag mono">OTA_PIPELINE // REV_5</span>
        </div>

        <div className="nav-mid mono">
          <span className="live-dot" />
          <span>NODES: 5/5 ONLINE</span>
          <span className="dim">|</span>
          <span className="accent-color">ZERO_TOUCH_PROVISION</span>
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="btn-console mono"
            onClick={() => setShowLogin((prev) => !prev)}
          >
            {showLogin ? "[ BACK_TO_SHOWCASE ]" : "[ ENTER_DASHBOARD ]"}
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main className="landing-content">
        {showLogin ? (
          <div className="login-modal-stage">
            <div className="login-card-container">
              <Login onLogin={onLogin} notice={notice} />
            </div>
          </div>
        ) : (
          <div className="hero-grid-split">
            {/* Left: Aggressive Editorial Typography & Controls */}
            <div className="hero-editorial">
              <div className="kicker-tag mono">
                <span>01 // DUAL_BANK FLASH ARCHITECTURE</span>
              </div>

              <h1 className="hero-headline">
                <span>SEAMLESS</span>
                <span className="outline-text">FIRMWARE</span>
                <span>STREAMING.</span>
              </h1>

              <p className="hero-subtext">
                Deploy cryptographically signed binary payloads to bare-metal microcontrollers over TLS.
                Dual-bank A/B partitions ensure zero downtime and instant failover rollbacks.
              </p>

              {/* Hardware Selector & Trigger Controls */}
              <div className="cta-cluster">
                <div className="chip-buttons mono">
                  {["ESP32-S3", "STM32F4", "RP2040-W"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`chip-btn ${activeChip === c ? "active" : ""}`}
                      onClick={() => setActiveChip(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="trigger-row">
                  <button
                    type="button"
                    className="btn-trigger mono"
                    onClick={triggerOtaSimulation}
                    disabled={flashing}
                  >
                    {flashing ? (
                      `FLASHING ${activeBank === "A" ? "BANK_B" : "BANK_A"} [${flashProgress}%]...`
                    ) : (
                      <>
                        <span className="btn-indicator" />
                        TRIGGER 3D OTA FLASH SWAP
                      </>
                    )}
                  </button>

                  <button type="button" className="btn-cli-copy mono" onClick={copyCli}>
                    {copied ? "COPIED" : "$ curl -fsSL nexus.sh | sh"}
                  </button>
                </div>
              </div>

              {/* Live Partition Status Bar */}
              <div className="partition-status-bar mono">
                <div className="partition-box">
                  <span className="dim">BANK_A (0x08010000)</span>
                  <strong className={activeBank === "A" ? "active-green" : "dim"}>
                    {activeBank === "A" ? "EXECUTING [v1.2.0]" : "STANDBY"}
                  </strong>
                </div>
                <div className="partition-divider" />
                <div className="partition-box">
                  <span className="dim">BANK_B (0x08110000)</span>
                  <strong className={activeBank === "B" ? "active-cyan" : "dim"}>
                    {activeBank === "B" ? "EXECUTING [v1.3.0]" : "STANDBY"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right: Interactive WebGL 3D Microcontroller Canvas */}
            <div className="pcb-viewport">
              <div className="canvas-header mono">
                <span>INTERACTIVE_3D_TARGET: {activeChip}</span>
                <span className="accent-color">WEBGL_ACCELERATED</span>
              </div>
              <MicrocontrollerCanvas activeBank={activeBank} isFlashing={flashing} />
              <div className="canvas-footer mono">
                <span>SPI_BUS: 80MHz QUAD_IO</span>
                <span>SHA-256: VALIDATED</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Spec Strip */}
      <footer className="tech-spec-row mono">
        <div className="spec-item">
          <span className="spec-num">01</span>
          <span>ATOMIC A/B RECOVERY // ZERO BRICK GUARANTEE</span>
        </div>
        <div className="spec-item">
          <span className="spec-num">02</span>
          <span>SUB-SECOND BINARY HEARTBEATS // 48-BYTE TELEMETRY</span>
        </div>
        <div className="spec-item">
          <span className="spec-num">03</span>
          <span>ECDSA CRYPTOGRAPHIC PAYLOAD AUTHENTICATION</span>
        </div>
      </footer>
    </div>
  );
}
