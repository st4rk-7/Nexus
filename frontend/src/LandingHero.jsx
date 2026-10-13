import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Brand, Icon } from "./Icons.jsx";
import Login from "./Login.jsx";

gsap.registerPlugin(useGSAP);

export default function LandingHero({ onLogin, notice }) {
  const [showLogin, setShowLogin] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (showLogin) return;

      // Animate from an already-visible default (0.6 -> 1) so content is never blank
      gsap.fromTo(
        ".telemetry-row:not(.header-row)",
        { x: -6, opacity: 0.6 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.4,
          ease: "power2.out",
        },
      );
    },
    { scope: containerRef, dependencies: [showLogin] },
  );

  function copyInstall() {
    navigator.clipboard?.writeText("curl -fsSL https://get.nexus.sh | sh");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="landing-root" ref={containerRef}>
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Brand />
          <div className="nav-controls">
            <span className="live-pill">
              <span className="pulsing-dot" />
              FLEET ONLINE
            </span>
            <button
              type="button"
              className="button nav-login-btn"
              onClick={() => setShowLogin((prev) => !prev)}
            >
              {showLogin ? "Overview" : "Sign In"}
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        {showLogin ? (
          <div className="login-modal-wrapper">
            <div className="login-card-dark">
              <Login onLogin={onLogin} notice={notice} />
            </div>
          </div>
        ) : (
          <div className="landing-flow">
            <section className="hero-section">
              <div className="hero-copy">
                <h1 className="hero-title">
                  Continuous firmware delivery for connected hardware.
                </h1>
                <p className="hero-subtitle">
                  Deploy cryptographic binary updates, track device health in real-time,
                  and automate staged rollouts across distributed microcontrollers.
                </p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="button primary hero-btn"
                    onClick={() => setShowLogin(true)}
                  >
                    Enter Console
                    <Icon name="arrow" size={16} />
                  </button>
                  <a
                    href="#integration"
                    className="button secondary hero-btn-subtle mono"
                  >
                    <Icon name="chip" size={16} />
                    View Device SDK
                  </a>
                </div>
              </div>

              <div id="telemetry" className="hero-telemetry-frame">
                <div className="telemetry-header mono">
                  <div className="frame-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="frame-title">telemetry://nexus.cluster/eu-west-1</span>
                  <span className="telemetry-status">STABLE</span>
                </div>
                <div className="telemetry-body mono">
                  <div className="telemetry-row header-row">
                    <span>DEVICE_ID</span>
                    <span>ARCH</span>
                    <span>FIRMWARE</span>
                    <span>STATUS</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="cyan-text">DEV-09A4</span>
                    <span>ESP32-S3</span>
                    <span className="dim-text">v1.2.4 → v1.3.0</span>
                    <span className="status-badge sync">UPDATING 74%</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="cyan-text">DEV-08B1</span>
                    <span>STM32F4</span>
                    <span>v2.0.1</span>
                    <span className="status-badge ok">ONLINE</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="cyan-text">DEV-11C2</span>
                    <span>RP2040</span>
                    <span>v0.9.8</span>
                    <span className="status-badge idle">IDLE</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="cyan-text">DEV-04F8</span>
                    <span>NRF52840</span>
                    <span>v1.0.4</span>
                    <span className="status-badge ok">ONLINE</span>
                  </div>
                </div>
                <div className="telemetry-footer mono">
                  <span>ACTIVE NODES: 4</span>
                  <span>PACKET LOSS: 0.00%</span>
                  <span className="cyan-text">SYNC: NOMINAL</span>
                </div>
              </div>
            </section>

            {/* Section 2: Architecture Pillars */}
            <section id="architecture" className="pillars-section">
              <div className="section-header">
                <h2 className="section-title">Built for mission-critical edge fleets</h2>
                <p className="section-lede">
                  Zero external runtime bloat. Direct binary streams and deterministic state machines.
                </p>
              </div>

              <div className="pillars-grid">
                <div className="pillar-card">
                  <div className="pillar-icon">
                    <Icon name="layers" size={20} />
                  </div>
                  <h3 className="pillar-heading">Atomic Binary Staging</h3>
                  <p className="pillar-desc">
                    Strict semantic version parsing protects nodes from downgrades. Binaries stream directly to flash with SHA-256 payload verification.
                  </p>
                  <div className="pillar-terminal mono">
                    <span className="dim-text">$ nexus-cli deploy --ver 1.3.0</span>
                    <span className="cyan-text">✓ Verified 248.6KB [OTA Ready]</span>
                  </div>
                </div>

                <div className="pillar-card">
                  <div className="pillar-icon">
                    <Icon name="signal" size={20} />
                  </div>
                  <h3 className="pillar-heading">Heartbeat Telemetry</h3>
                  <p className="pillar-desc">
                    Low-overhead keepalives record signal status, IP address, hardware MAC, and runtime metrics without exhausting device battery.
                  </p>
                  <div className="pillar-terminal mono">
                    <span className="dim-text">PING DEV-08B1 (38ms)</span>
                    <span className="green-text">● Heartbeat ack: 200 OK</span>
                  </div>
                </div>

                <div className="pillar-card">
                  <div className="pillar-icon">
                    <Icon name="lock" size={20} />
                  </div>
                  <h3 className="pillar-heading">Hardware-Bound Auth</h3>
                  <p className="pillar-desc">
                    Devices authenticate with pre-shared hardware secrets. Unregistered nodes are rejected at the edge before payload delivery.
                  </p>
                  <div className="pillar-terminal mono">
                    <span className="dim-text">AUTH Bearer sec_live_...</span>
                    <span className="cyan-text">✓ Token accepted [Scope: read]</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Delightful Developer Experience (Code Integration Peek) */}
            <section id="integration" className="code-peek-section">
              <div className="section-header">
                <h2 className="section-title">Integrate with two lines in embedded C</h2>
                <p className="section-lede">
                  Zero complex dependencies. Works out of the box with ESP-IDF, FreeRTOS, and Zephyr.
                </p>
              </div>

              <div className="code-card">
                <div className="code-card-header mono">
                  <span className="dim-text">main.c</span>
                  <button
                    type="button"
                    className="copy-btn mono"
                    onClick={copyInstall}
                  >
                    {copied ? "COPIED" : "COPY INSTALL"}
                  </button>
                </div>
                <pre className="code-pre mono">
                  <code>
{`// 1. Initialize Nexus Client
nexus_client_t client = nexus_init("https://api.nexus.sh", DEVICE_SECRET);

// 2. Poll for cryptographic OTA update on check-in
if (nexus_check_update(&client, FIRMWARE_CURRENT_VERSION)) {
    nexus_ota_stream_to_flash(&client);
}`}
                  </code>
                </pre>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="landing-footer mono">
        <span>Nexus Systems · Distributed Hardware Control Plane</span>
        <span>Secure Protocol · TLS 1.3 / ECDSA</span>
      </footer>
    </div>
  );
}
