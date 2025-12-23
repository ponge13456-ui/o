
import React, { useState, useEffect } from 'react';
import SpinWheel from '../components/SpinWheel';
import { dataService } from '../services/dataService';
import { SpinResult, Video } from '../types';

const Home: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [recentSpins, setRecentSpins] = useState<SpinResult[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<string | null>(null);
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const savedPhone = localStorage.getItem('eagle_user_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setIsRegistered(true);
      fetchSpins(savedPhone);
    }
    loadFeaturedVideo();
  }, []);

  const loadFeaturedVideo = async () => {
    // Fetch the latest video intended for 'home' target page
    const video = await dataService.getLatestVideoForPage('home');
    setFeaturedVideo(video);
  };

  const fetchSpins = async (p: string) => {
    const profile = await dataService.getProfile(p);
    setRecentSpins(profile.spins);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !username) return;
    await dataService.signInOrRegisterUser({ phone, username });
    localStorage.setItem('eagle_user_phone', phone);
    setIsRegistered(true);
    setShowRegModal(false);
  };

  const onSpinEnd = async (label: string) => {
    setIsSpinning(false);
    setLastWin(label);
    await dataService.spinWheelForUser(phone);
    fetchSpins(phone);
  };

  return (
    <div className="relative pb-24">
      {/* Hero Section - Stacked layout for Mobile, Side-by-Side for Desktop */}
      <section className="relative min-h-[70vh] flex flex-col lg:flex-row items-center justify-center pt-24 pb-12 lg:py-0 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Text Area */}
          <div className="text-center lg:text-left z-10 space-y-8 order-2 lg:order-1">
            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-none">
              <span className="block text-white text-[12vw] lg:text-[6vw]">ELEVATE YOUR</span>
              <span className="block gold-text text-[12vw] lg:text-[6vw]">EXPERIENCE.</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Nagpur's elite hub for smart shopping and promotional rewards. Spin to unlock premium merchant tiers instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button 
                onClick={() => document.getElementById('wheel-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary px-10 py-4"
              >
                Spin & Win Now
              </button>
              <button 
                onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary px-10 py-4"
              >
                Explore Hub
              </button>
            </div>
          </div>
          
          {/* Hero Right Side - The Slanted Video Card */}
          <div className="order-1 lg:order-2 z-10 flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 md:w-[500px] md:h-[500px]">
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-[var(--primary-gold)] opacity-10 blur-[100px] rounded-full"></div>
              
              {/* Slanted Card Container */}
              <div className="w-full h-full rounded-3xl shadow-2xl rotate-3 border border-white/10 overflow-hidden bg-[var(--bg-surface)] relative flex items-center justify-center group transition-transform duration-500 hover:rotate-0">
                {featuredVideo ? (
                  <div className="w-full h-full relative">
                    <video 
                      src={featuredVideo.url} 
                      className="w-full h-full object-cover" 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      preload="metadata"
                    />
                    {/* Overlay Label */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
                      <span className="gold-text font-black text-[10px] uppercase tracking-widest">Featured Node</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--text-muted)] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">
                      Admin will add a<br/>featured video soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Featured Video Section (Detailed View) */}
      <section id="video-section" className="container mx-auto px-6 py-12 relative z-20">
        <div className="eagle-card p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <span className="gold-text font-black uppercase text-[10px] tracking-[0.4em]">Broadcast Nexus</span>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  {featuredVideo ? featuredVideo.title : 'EAGLE HUB SPOTLIGHT'}
                </h2>
              </div>
              <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                Discover why Eagle Hub is the talk of Nagpur. Stay ahead with the latest news, merchant highlights, and exclusive membership reveals through our verified asset stream.
              </p>
            </div>
            <div className="flex-1 w-full">
              {featuredVideo ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <video 
                    src={featuredVideo.url} 
                    className="w-full h-full object-contain" 
                    controls 
                    poster="https://images.unsplash.com/photo-1492619334760-22709bad3044?auto=format&fit=crop&q=80&w=800"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center p-8 text-center bg-white/5">
                  <svg className="w-12 h-12 text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">No featured video yet.<br/><span className="text-[10px] opacity-60 text-center">Add one from the admin panel with target page "Home"</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Spin Section */}
      <section id="wheel-section" className="container mx-auto px-6 py-20 relative z-20">
        <div className="eagle-card eagle-card-accent p-8 md:p-20 shadow-2xl flex flex-col items-center">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Wheel of Fortune</h2>
            <p className="text-[var(--text-muted)] text-sm uppercase tracking-[0.2em] font-bold">Luck favors the dedicated seeker</p>
          </div>
          
          <div className="relative">
            <SpinWheel onSpinEnd={onSpinEnd} isSpinning={isSpinning} />
          </div>

          {lastWin && (
            <div className="mt-12 p-6 bg-[var(--bg-main)] rounded-2xl border-2 gold-border animate-in zoom-in duration-300">
              <span className="gold-text font-black text-2xl uppercase tracking-widest">RESULT: {lastWin}!</span>
            </div>
          )}

          {isRegistered && recentSpins.length > 0 && (
            <div className="mt-24 w-full max-w-md">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-[var(--text-muted)] text-center">Your Recent Node Synchronizations</h4>
              <div className="space-y-3">
                {recentSpins.slice().reverse().map((s) => (
                  <div key={s.id} className="flex justify-between items-center bg-[#050814] p-5 rounded-xl border border-white/5">
                    <span className="capitalize font-bold text-sm">{s.result === 'bad' ? 'Recalibrating...' : s.result}</span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{new Date(s.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="eagle-card eagle-card-accent p-10 w-full max-w-md">
            <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Initialize Access</h3>
            <p className="text-[var(--text-muted)] mb-8 text-sm font-medium">Verify your credentials to synchronize with the Eagle Network.</p>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Identity Tag</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-base"
                  placeholder="e.g. NagpurShopper"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Comms Endpoint (Phone)</label>
                <input 
                  required
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-base"
                  placeholder="+91 000-000-0000"
                />
              </div>
              <button 
                type="submit"
                className="btn-primary w-full py-4 mt-4"
              >
                Establish Link
              </button>
            </form>
            <button 
              onClick={() => setShowRegModal(false)}
              className="w-full mt-6 text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest hover:text-white transition"
            >
              Cancel Linkage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
