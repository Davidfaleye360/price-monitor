'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(to right, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Zenith Monitor
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {loading ? (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Checking session...</span>
          ) : user ? (
            <Link href="/dashboard" className="btn" style={{ padding: '10px 20px', borderRadius: '10px' }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500' }}>
                Login
              </Link>
              <Link href="/register" className="btn" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <main style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        gap: '2.5rem'
      }}>
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignSelf: 'center',
            padding: '6px 16px',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            color: 'var(--accent-purple)',
            fontSize: '0.85rem',
            fontWeight: '600',
            borderRadius: '100px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '0.5rem'
          }}>
            Automated Serverless Telemetry
          </div>
          <h1 style={{ fontSize: '3.6rem', lineHeight: '1.1', fontWeight: '800', tracking: '-1px' }}>
            Smart Price Monitoring <br/>
            <span style={{ background: 'linear-gradient(to right, #3b82f6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Made Effortless
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Paste any product link, set your target price, and let our secure cloud engine track market fluctuations. Get instant email notifications when prices hit your threshold.
          </p>
        </div>

        {/* CTA area */}
        <div className="animate-slide-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', animationDelay: '0.1s' }}>
          {user ? (
            <Link href="/dashboard" className="btn" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>
              Go to Your Dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>
                Create Free Account
              </Link>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="animate-slide-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          marginTop: '3rem',
          animationDelay: '0.2s'
        }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ fontSize: '1.8rem' }}>🔗</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Paste Any URL</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Scrape Amazon, eBay, Shopify, and more. Our smart metadata parser extracts product titles, current prices, and images on the fly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ fontSize: '1.8rem' }}>📈</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Visual Chart History</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Understand pricing trends with smooth, glowing interactive charts. Track hourly or daily price telemetry per item.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ fontSize: '1.8rem' }}>📧</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Instant Alerts</h3>
            <p style={{ fontSize: '0.9rem' }}>
              We track target price boundaries in the background. Get secure, transactional HTML email updates the second prices drop.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem 1rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: 'auto'
      }}>
        © {new Date().getFullYear()} Zenith Price Monitor. Built with Next.js, SQLite, and Prisma.
      </footer>
    </div>
  );
}
