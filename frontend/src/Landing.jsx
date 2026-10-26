// Landing.jsx — the public page shown before login. One action: open the console.
// Scroll reveals and the tagline use IntersectionObserver, never a scroll listener.

import { useEffect, useRef, useState } from "react";
import Wordmark from "./Wordmark.jsx";
import consoleShot from "./assets/console.webp";
import "./landing.css";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#proof", label: "Proof" },
  { href: "#faq", label: "FAQ" },
];

const BENEFITS = [
  ["Devices update themselves", "Each device asks the server for the newest release, downloads it and reports the install. Nobody plugs in a cable."],
  ["Only your devices get firmware", "Every device receives a 64 character API key at registration. A check in without it is refused with a 401."],
  ["Know what every device runs", "Each install is logged with the old version, the new version and the time it happened."],
  ["Silent devices show as offline", "A device that has not checked in for 5 minutes is marked offline, so the fleet count stays honest."],
  ["Runs on any machine with Docker", "One command starts the console, the API and a test device. No Node or Bun install needed."],
];

const STEPS = [
  ["Upload a release", "Pick a version like 1.3.0, add notes and the binary. It becomes the release devices are offered.", "Publish release"],
  ["Devices check in", "A device sends its current version with its API key. The server answers with the newest release and a download link.", "POST /api/devices/check-update"],
  ["Devices install and report", "The device downloads the file, flashes it and confirms. Its version and history update in the console.", "POST /api/devices/report-update"],
];

const FAQ = [
  ["Do I need Node or Bun on my computer?", "No. Docker is enough. Run docker compose up and open localhost:8080."],
  ["How does a device prove who it is?", "It sends the API key it received at registration in a request header. The key is shown once and never listed again."],
  ["Which release does a device get?", "The newest active release. Publishing a new version marks the older ones inactive."],
  ["What if a device fails during the update?", "Nexus only changes a device's recorded version after the device reports the install, so a failed update leaves the old version on record."],
  ["When is a device marked offline?", "After 5 minutes without a check in. The next check in marks it online again."],
  ["Which files can I upload?", "Any firmware binary, such as .bin, .hex or .elf. Nexus stores the file and serves it unchanged."],
  ["Where is the data kept?", "Devices, releases and install history live in MongoDB. Uploaded files live in a Docker volume, so they survive a restart."],
];

const SIM_LOG = `$ docker compose run --rm simulator
1. Registering as "sim-device-1792375594263"
   Registered. API key received.
2. Checking for firmware update (on v1.0.0)
   Update available: v6.0.0
3. Downloading firmware
   Downloaded.
4. Reporting install
   Device is now on v6.0.0
OTA loop complete: v1.0.0 → v6.0.0`;

const TAGLINE = "Every device on the newest firmware. Every install on record.";

function useReveal(rootRef) {
  useEffect(() => {
    const items = rootRef.current.querySelectorAll(".lp-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target); // reveal once
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

// Words light up one at a time as they cross a line 55% down the viewport.
function useWordReveal(ref) {
  useEffect(() => {
    const words = [...ref.current.querySelectorAll(".lp-word")];
    const queue = [];
    let timer = null;
    const drain = () => {
      const next = queue.shift();
      if (!next) return (timer = null);
      next.classList.add("is-on");
      timer = setTimeout(drain, 70);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => words.indexOf(a.target) - words.indexOf(b.target))
          .forEach((e) => {
            queue.push(e.target);
            io.unobserve(e.target);
          });
        if (queue.length && !timer) drain();
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    words.forEach((w) => io.observe(w));
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [ref]);
}

function Landing({ onStart }) {
  const rootRef = useRef(null);
  const taglineRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal(rootRef);
  useWordReveal(taglineRef);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const cta = (
    <button type="button" className="lp-btn" onClick={onStart}>
      Open the console
    </button>
  );

  return (
    <div className="lp" ref={rootRef} id="top">
      <a className="lp-skip" href="#main">Skip to content</a>

      <nav className="lp-nav" aria-label="Main">
        <a href="#top" className="lp-brand" aria-label="Nexus home">
          <Wordmark />
        </a>
        <ul className="lp-links">
          {NAV.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
        <button type="button" className="lp-btn lp-btn-sm lp-nav-cta" onClick={onStart}>
          Open the console
        </button>
        <button
          type="button"
          className={`lp-toggle ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="lp-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </nav>

      <div id="lp-menu" className={`lp-menu ${menuOpen ? "is-open" : ""}`}>
        <ul>
          {NAV.map((l, i) => (
            <li key={l.href} style={{ transitionDelay: `${i * 60}ms` }}>
              <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            </li>
          ))}
          <li style={{ transitionDelay: `${NAV.length * 60}ms` }}>
            <button type="button" className="lp-btn" onClick={onStart}>Open the console</button>
          </li>
        </ul>
      </div>

      <main id="main">
        <section className="lp-hero">
          <h1 className="lp-reveal">
            Ship firmware to every device
            <br />
            without touching a cable
          </h1>
          <p className="lp-sub lp-reveal">
            Nexus stores your firmware releases and lets each IoT device check in, download the
            newest version and confirm the install on its own.
          </p>
          <div className="lp-hero-cta lp-reveal">
            {cta}
            <p className="lp-proof">Tested end to end: register, check, download, report.</p>
          </div>
          <figure className="lp-shot lp-reveal">
            <img
              src={consoleShot}
              width="1263"
              height="800"
              alt="The Nexus console: a fleet table of 15 devices with firmware versions and status, next to the firmware upload form and the releases list."
            />
          </figure>
        </section>

        <section className="lp-section lp-reveal" aria-labelledby="problem-title">
          <h2 id="problem-title">Updating devices by hand does not scale</h2>
          <div className="lp-compare">
            <div className="lp-card">
              <h3>Without Nexus</h3>
              <p>Collect each device, connect a cable, flash it, write down the version, put it back. Repeat for every device and every release.</p>
            </div>
            <div className="lp-card">
              <h3>With Nexus</h3>
              <p>Publish the release once. Devices pick it up on their next check in and the console shows who has installed it.</p>
            </div>
          </div>
        </section>

        <section className="lp-section" id="features" aria-labelledby="benefits-title">
          <h2 id="benefits-title" className="lp-reveal">What you get</h2>
          <div className="lp-grid">
            {BENEFITS.map(([title, text], i) => (
              <article className="lp-card lp-reveal" key={title}>
                <span className="lp-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section lp-tagline" aria-label="Summary">
          <p ref={taglineRef}>
            {TAGLINE.split(" ").map((w, i, all) => (
              // The second sentence ("Every install on record.") lights up red.
              <span className={`lp-word${i >= all.length - 4 ? " is-red" : ""}`} key={i}>{w} </span>
            ))}
          </p>
        </section>

        <section className="lp-section" id="how" aria-labelledby="how-title">
          <h2 id="how-title" className="lp-reveal">How it works</h2>
          <ol className="lp-steps">
            {STEPS.map(([title, text, code], i) => (
              <li className="lp-card lp-reveal" key={title}>
                <span className="lp-index">Step {i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <code>{code}</code>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-section lp-proof-section" id="proof" aria-labelledby="proof-title">
          <div className="lp-reveal">
            <h2 id="proof-title">Verified on a simulated device</h2>
            <p className="lp-lead">
              This is a real run of the simulator against the Docker stack. It registers, finds release
              6.0.0, downloads it and reports the install in four requests.
            </p>
            <p className="lp-lead">Run the same check yourself on any machine with Docker.</p>
          </div>
          <figure className="lp-terminal lp-reveal">
            <figcaption>simulator output</figcaption>
            <pre>{SIM_LOG}</pre>
          </figure>
        </section>

        <section className="lp-section" id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title" className="lp-reveal">Questions</h2>
          <div className="lp-faq lp-reveal">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="lp-section lp-final lp-reveal" aria-labelledby="final-title">
          <h2 id="final-title">Start with one release and one device</h2>
          <p className="lp-lead">Runs on your own machine. One command to start it, one command to stop it.</p>
          {cta}
        </section>
      </main>

      <footer className="lp-footer">
        <span>Nexus · EC5207 DevOps · Group 72</span>
        <a href="#top">Back to top</a>
      </footer>
    </div>
  );
}

export default Landing;
