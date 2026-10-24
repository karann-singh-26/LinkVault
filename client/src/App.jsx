
import { useState, useEffect } from "react";
import "./App.css";


const API_URL = "https://linkvault-q3ia.onrender.com";


const scienceFacts = [
  {
    category: "SPACE",
    fact: "A day on Venus is longer than its year.",
  },
  {
    category: "OCEANS",
    fact: "Most of Earth's oceans remain unexplored.",
  },
  {
    category: "HUMAN BODY",
    fact: "Your brain contains billions of neurons.",
  },
  {
    category: "ASTRONOMY",
    fact: "Sunlight takes about 8 minutes to reach Earth.",
  },
  {
    category: "ANIMALS",
    fact: "Octopuses have three hearts.",
  },
  {
    category: "PHYSICS",
    fact: "Light travels at about 300,000 kilometres per second in a vacuum.",
  },
  {
    category: "EARTH",
    fact: "Earth is not a perfect sphere; it bulges slightly at the equator.",
  },
  {
    category: "SPACE",
    fact: "There are more stars in the observable universe than grains of sand on Earth's beaches.",
  },
];

function App() {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    loadLinks();

    const timer = setInterval(() => {
      setFactIndex((index) => (index + 1) % scienceFacts.length);
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  async function loadLinks() {
    try {
      const response = await fetch(`${API_URL}/api/links`);

      if (!response.ok) {
        throw new Error("Could not load links.");
      }

      const data = await response.json();

      // Show only the most recently created link.
      setLinks(data.length > 0 ? [data[0]] : []);
    } catch (err) {
      setError("Could not connect to the server. Make sure your backend is running.");
    }
  }

  async function createShortLink(event) {
    event.preventDefault();
    setError("");
    setCopied(false);

    let parsedUrl;

    try {
      const inputUrl = url.trim();
      parsedUrl = new URL(
        /^https?:\/\//i.test(inputUrl) ? inputUrl : `https://${inputUrl}`
      );

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setError("Enter a valid website URL, such as https://example.com");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: parsedUrl.href }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create your short link.");
      }

      // Replace the displayed link with the newest one.
      setLinks([data]);
      setUrl("");
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyLink(shortUrl) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Please select and copy the link manually.");
    }
  }

  const latestLink = links[0];

  return (
    <div className="app-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <header className="topbar">
        <a className="brand" href="#home" aria-label="LinkVault home">
          <span className="brand-icon">↗</span>
          <span>Link<span className="brand-accent">Vault</span></span>
        </a>

        <div className="topbar-status">
          <span className="status-dot" />
          YOUR LINKS, SIMPLIFIED
        </div>
      </header>

      <main id="home" className="main-content">
        <section className="hero">
          <div className="eyebrow">
            <span>✦</span> THE SMARTER WAY TO SHARE
          </div>

          <h1>
            Long links.
            <br />
            <span>Short story.</span>
          </h1>

          <p className="hero-description">
            Turn long URLs into clean, shareable links.
            <br className="desktop-break" />
            One click to shorten. Simple click tracking.
          </p>

          <form className="shorten-form" onSubmit={createShortLink}>
            <div className="input-wrap">
              <span className="input-icon">↗</span>
              <input
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Paste your long URL here..."
                aria-label="Website URL"
                required
              />
              {url && (
                <button
                  className="clear-input"
                  type="button"
                  onClick={() => setUrl("")}
                  aria-label="Clear URL"
                >
                  ×
                </button>
              )}
            </div>

            <button
              className="shorten-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Shorten link"}
              {!loading && <span>↗</span>}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          <div className="hero-note">
            <span>✧</span> Fast. Simple. Ready to share.
          </div>
        </section>

        {latestLink && (
          <section className="featured-link">
            <div className="featured-topline">
              <div className="featured-label">
                <span className="live-dot" />
                YOUR LATEST SHORT LINK
              </div>
              <span className="featured-sparkle">✦</span>
            </div>

            <h2>Your link is ready.</h2>
            <p className="featured-description">
              Short, clean, and ready to share with the world.
            </p>

            <div className="featured-link-box">
              <a
                className="featured-url"
                href={latestLink.shortUrl}
                target="_blank"
                rel="noreferrer"
              >
                {latestLink.shortUrl}
              </a>

              <button
                className="featured-copy"
                type="button"
                onClick={() => copyLink(latestLink.shortUrl)}
              >
                {copied ? "✓ Copied!" : "Copy link ↗"}
              </button>
            </div>

            <div className="original-row">
              <span className="original-label">DESTINATION</span>
              <span className="original-url" title={latestLink.originalUrl}>
                {latestLink.originalUrl}
              </span>
            </div>
          </section>
        )}

        <section className="dashboard">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">YOUR WORKSPACE</p>
              <h2>Link overview<span>.</span></h2>
            </div>
            <div className="live-badge">
              <span className="status-dot" />
              LIVE STATS
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-card-top">
                <span className="stat-icon purple">↗</span>
                <span className="stat-caption">TOTAL LINKS</span>
              </div>
              <div className="stat-number">{latestLink ? 1 : 0}</div>
              <p className="stat-footnote">Latest link shown</p>
            </article>

            <article className="stat-card">
              <div className="stat-card-top">
                <span className="stat-icon blue">⌁</span>
                <span className="stat-caption">TOTAL CLICKS</span>
              </div>
              <div className="stat-number">{latestLink?.clicks ?? 0}</div>
              <p className="stat-footnote">Visits to your latest link</p>
            </article>

            <article className="stat-card">
              <div className="stat-card-top">
                <span className="stat-icon green">◉</span>
                <span className="stat-caption">STATUS</span>
              </div>
              <div className="stat-number status-number">
                {latestLink ? "Active" : "Ready"}
              </div>
              <p className="stat-footnote">Your link workspace</p>
            </article>
          </div>

          <div className="table-card">
            <div className="table-heading">
              <div>
                <h3>Latest link</h3>
                <p>Your most recently generated URL</p>
              </div>
              <span className="table-count">{latestLink ? "01 LINK" : "0 LINKS"}</span>
            </div>

            {latestLink ? (
              <div className="link-row">
                <div className="link-main">
                  <span className="link-row-icon">↗</span>
                  <div className="link-details">
                    <a
                      className="table-short-url"
                      href={latestLink.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {latestLink.shortUrl}
                    </a>
                    <span className="table-original-url" title={latestLink.originalUrl}>
                      {latestLink.originalUrl}
                    </span>
                  </div>
                </div>

                <div className="link-row-right">
                  <span className="click-count">
                    <strong>{latestLink.clicks}</strong> clicks
                  </span>
                  <button
                    className="small-copy"
                    type="button"
                    onClick={() => copyLink(latestLink.shortUrl)}
                    aria-label="Copy short link"
                  >
                    {copied ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">↗</span>
                <h3>No links yet</h3>
                <p>Your first short link will appear here.</p>
              </div>
            )}
          </div>

          <p className="dashboard-note">
            <span>ⓘ</span> Only the latest link is displayed here. Older links
            remain saved in your database.
          </p>
        </section>

        <section className="science-section">
          <div className="science-heading">
            <div>
              <span className="science-star">✦</span>
              <span className="science-heading-text">A LITTLE SCIENCE</span>
            </div>
            <span className="science-counter">
              {String(factIndex + 1).padStart(2, "0")} /{" "}
              {String(scienceFacts.length).padStart(2, "0")}
            </span>
          </div>

          <div className="science-card" key={factIndex}>
            <div className="science-illustration" aria-hidden="true">
              <span>✳</span>
              <i />
              <b />
            </div>

            <div className="science-copy">
              <p className="science-category">
                DID YOU KNOW? / {scienceFacts[factIndex].category}
              </p>
              <h2>{scienceFacts[factIndex].fact}</h2>
              <p className="science-timing">
                <span className="live-dot" /> A new fact every 12 seconds
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-brand" href="#home">
          <span>↗</span> LinkVault
        </a>
        <p>Make every link count.</p>
        <span className="footer-year">BUILT WITH CURIOSITY ✦</span>
      </footer>
    </div>
  );
}

export default App;
