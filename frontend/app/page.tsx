'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Stars
    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5,
      });
    }

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      // Draw particles
      particles.forEach((particle) => {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{background: '#0A0E14'}}>
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />

      {/* Space Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Planets */}
        <div className="planet planet-1" />
        <div className="planet planet-2" />
        <div className="planet planet-3" />

        {/* Nebulae */}
        <div className="nebula nebula-1" />
        <div className="nebula nebula-2" />

        {/* Grid Overlay */}
        <div className="grid-overlay" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-32 pb-32">
          <div className="flex flex-col items-center text-center">
            {/* Holographic Header */}
            <div className="holo-border mb-8 inline-block">
              <div className="scan-line" />
              <h1 className="hologram-text text-5xl md:text-7xl font-bold tracking-tight">
                Engagement With
                <span className="text-[#3AE8FF]"> Integrity</span>
              </h1>
            </div>

            <p className="max-w-3xl text-lg md:text-xl text-[#B8C2CC] mb-6 leading-relaxed">
              Go Buzz empowers social engagement contributors to help campaigns grow through measurable, verified actions.
            </p>
            <p className="max-w-2xl text-base md:text-lg text-[#B8C2CC] mb-12 leading-relaxed">
              <span className="text-[#3AE8FF]">Engage, verify, earn.</span> Every action is validated with zero-knowledge proof technology, ensuring transparency and fairness for all participants.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <Link href="/app">
                <button className="glass-button group">
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="orbit-icon"></span>
                    Create Campaign
                  </span>
                  <div className="button-glow" />
                </button>
              </Link>
              <Link href="/app">
                <button className="glass-button-secondary group">
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="signal-icon"></span>
                    View Active Campaigns
                  </span>
                </button>
              </Link>
            </div>

            {/* Orbit Ring Decoration */}
            <div className="orbit-ring">
              <div className="orbit-dot orbit-dot-1" />
              <div className="orbit-dot orbit-dot-2" />
              <div className="orbit-dot orbit-dot-3" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="hologram-text-sm">Why Go Buzz?</span>
            </h2>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#3AE8FF] to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="feature-card group">
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-tr" />
              <div className="card-corner card-corner-bl" />
              <div className="card-corner card-corner-br" />

              <div className="mb-6 text-[#3AE8FF] text-5xl"></div>
              <h3 className="text-2xl font-bold text-white mb-4">Verified & Transparent</h3>
              <p className="text-[#B8C2CC] leading-relaxed">
                Every action is verified with zero-knowledge proof technology. Your privacy is protected while campaign results remain fully transparent and measurable.
              </p>
              <div className="card-pulse" />
            </div>

            {/* Feature Card 2 */}
            <div className="feature-card group">
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-tr" />
              <div className="card-corner card-corner-bl" />
              <div className="card-corner card-corner-br" />

              <div className="mb-6 text-[#7CD2FF] text-5xl"></div>
              <h3 className="text-2xl font-bold text-white mb-4">Fair & Transparent Rewards</h3>
              <p className="text-[#B8C2CC] leading-relaxed">
                Earn rewards based on genuine engagement metrics. Every participant has equal opportunity, with compensation directly tied to verified actions and real interactions.
              </p>
              <div className="card-pulse" />
            </div>

            {/* Feature Card 3 */}
            <div className="feature-card group">
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-tr" />
              <div className="card-corner card-corner-bl" />
              <div className="card-corner card-corner-br" />

              <div className="mb-6 text-[#3AE8FF] text-5xl"></div>
              <h3 className="text-2xl font-bold text-white mb-4">No Fake Engagement</h3>
              <p className="text-[#B8C2CC] leading-relaxed">
                Advanced verification system ensures every contribution comes from authentic accounts with real engagement. No spam, no manipulation—only verified, meaningful actions.
              </p>
              <div className="card-pulse" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="hologram-text-sm">How It Works</span>
            </h2>
            <p className="text-[#B8C2CC] max-w-2xl mx-auto">
              Four simple steps to earn rewards from verified social media contributions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="feature-card group text-center">
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-tr" />
              <div className="card-corner card-corner-bl" />
              <div className="card-corner card-corner-br" />

              <div className="mb-4">
                <div className="text-6xl font-bold text-[#3AE8FF] mb-2">01</div>
                <div className="text-4xl mb-4"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Create Campaign</h3>
              <p className="text-[#B8C2CC] text-sm leading-relaxed">
                Define engagement tasks and allocate rewards for your campaign goals
              </p>
              <div className="card-pulse" />
            </div>

            {/* Step 2 */}
            <div className="feature-card group text-center">
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-tr" />
              <div className="card-corner card-corner-bl" />
              <div className="card-corner card-corner-br" />

              <div className="mb-4">
                <div className="text-6xl font-bold text-[#7CD2FF] mb-2">02</div>
                <div className="text-4xl mb-4"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Complete Tasks</h3>
              <p className="text-[#B8C2CC] text-sm leading-relaxed">
                Select a campaign and contribute through verified engagement actions on social platforms
              </p>
              <div className="card-pulse" />
            </div>

            {/* Step 3 */}
            <div className="feature-card group text-center">
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-tr" />
              <div className="card-corner card-corner-bl" />
              <div className="card-corner card-corner-br" />

              <div className="mb-4">
                <div className="text-6xl font-bold text-[#3AE8FF] mb-2">03</div>
                <div className="text-4xl mb-4"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Verified</h3>
              <p className="text-[#B8C2CC] text-sm leading-relaxed">
                Submit your contribution link for automatic zero-knowledge verification through Reclaim Protocol
              </p>
              <div className="card-pulse" />
            </div>

            {/* Step 4 */}
            <div className="feature-card group text-center">
              <div className="card-corner card-corner-tl" />
              <div className="card-corner card-corner-tr" />
              <div className="card-corner card-corner-bl" />
              <div className="card-corner card-corner-br" />

              <div className="mb-4">
                <div className="text-6xl font-bold text-[#7CD2FF] mb-2">04</div>
                <div className="text-4xl mb-4"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Earn Rewards</h3>
              <p className="text-[#B8C2CC] text-sm leading-relaxed">
                Receive fair compensation based on verified engagement metrics and authentic interactions
              </p>
              <div className="card-pulse" />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="holo-panel">
            <div className="hex-pattern" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              <div className="stat-item">
                <div className="text-4xl md:text-5xl font-bold text-[#3AE8FF] mb-2">1000+</div>
                <div className="text-sm text-[#B8C2CC] uppercase tracking-wider">Active Campaigns</div>
              </div>
              <div className="stat-item">
                <div className="text-4xl md:text-5xl font-bold text-[#7CD2FF] mb-2">50K+</div>
                <div className="text-sm text-[#B8C2CC] uppercase tracking-wider">Contributors</div>
              </div>
              <div className="stat-item">
                <div className="text-4xl md:text-5xl font-bold text-[#3AE8FF] mb-2">100%</div>
                <div className="text-sm text-[#B8C2CC] uppercase tracking-wider">Verified</div>
              </div>
              <div className="stat-item">
                <div className="text-4xl md:text-5xl font-bold text-[#7CD2FF] mb-2">$500K</div>
                <div className="text-sm text-[#B8C2CC] uppercase tracking-wider">Total Rewards</div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="data-stream-panel">
            <div className="data-line" />
            <div className="relative z-10 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-2 bg-[#3AE8FF] rounded-full animate-pulse" />
                <span className="text-[#3AE8FF] font-mono text-sm">POWERED_BY_RECLAIM</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Powered by Zero-Knowledge Technology
              </h2>
              <p className="text-[#B8C2CC] max-w-2xl mb-6">
                Go Buzz leverages zero-knowledge proof technology from Reclaim Protocol to verify all contributions without compromising personal data. Every engagement is authenticated from genuine accounts, ensuring complete transparency and measurability.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded text-[#3AE8FF] text-sm font-mono">
                  Zero Knowledge Proof
                </div>
                <div className="px-4 py-2 bg-[#7CD2FF]/10 border border-[#7CD2FF]/30 rounded text-[#7CD2FF] text-sm font-mono">
                  Reclaim Protocol
                </div>
                <div className="px-4 py-2 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded text-[#3AE8FF] text-sm font-mono">
                  On-chain Settlement
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
