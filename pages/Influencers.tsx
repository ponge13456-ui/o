
import React, { useState, useEffect } from 'react';
import CommentSection from '../components/CommentSection';
import { dataService } from '../services/dataService';
import { Video } from '../types';

const Influencers: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', profession: '', followers: 0
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadFeaturedVideo();
  }, []);

  const loadFeaturedVideo = async () => {
    // Fetch the latest video intended for 'influencer' target page
    const video = await dataService.getLatestVideoForPage('influencer');
    setFeaturedVideo(video);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.followers < 200) {
      setError('Signal Low: Minimum 200 reach required for node enrollment.');
      return;
    }
    setError('');
    await dataService.submitInfluencerApplication(formData);
    setSubmitted(true);
  };

  return (
    <div className="pb-24">
      <div className="h-[45vh] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=1200')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] to-transparent" />
        <div className="relative z-10 text-center px-6 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary-gold)] block">Elite Program</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">CREATOR NEXUS</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        {/* Featured Video Block */}
        <div className="eagle-card p-8 md:p-12 mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row-reverse gap-10 items-center">
            <div className="flex-1 w-full">
              {featuredVideo ? (
                <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <video src={featuredVideo.url} className="w-full h-full object-contain" controls />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center p-8 text-center bg-white/5">
                   <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Admin has not added an influencer video yet.</p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <span className="gold-text font-black uppercase text-[10px] tracking-widest">Program Spotlight</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {featuredVideo ? featuredVideo.title : 'INFLUENCER ADVANTAGE'}
              </h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Watch how our top creators are scaling their influence in Nagpur through the Eagle Hub ecosystem.
              </p>
            </div>
          </div>
        </div>

        <div className="eagle-card p-1 lg:p-12 mb-20 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-stretch">
            <div className="p-10 space-y-8">
              <h2 className="text-4xl font-black gold-text tracking-tighter">AMPLIFY YOUR REACH.</h2>
              <p className="text-[var(--text-muted)] leading-relaxed font-medium">
                The Creator Nexus connects Nagpur's highest-tier influencers with the city's most prestigious merchants. Join the circle.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-4 group">
                  <div className="w-10 h-10 rounded-full bg-[var(--royal-blue)] flex items-center justify-center text-[var(--primary-gold)] font-bold transition group-hover:scale-110">1</div>
                  <span className="text-white font-bold text-sm tracking-wide">Premium Merchant Drops</span>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="w-10 h-10 rounded-full bg-[var(--royal-blue)] flex items-center justify-center text-[var(--primary-gold)] font-bold transition group-hover:scale-110">2</div>
                  <span className="text-white font-bold text-sm tracking-wide">Elite Commission Nodes</span>
                </div>
              </div>
            </div>

            <div className="bg-[#050814] m-4 rounded-2xl border border-white/5 p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="text-center mb-8">
                    <h4 className="font-black text-white uppercase tracking-[0.2em] text-sm mb-1">Node Enrollment</h4>
                    <div className="h-[1px] w-12 bg-[var(--primary-gold)] mx-auto opacity-50"></div>
                  </div>
                  
                  {error && <p className="text-[var(--danger)] text-[10px] font-black uppercase tracking-widest bg-[var(--danger)]/10 p-4 rounded-xl border border-[var(--danger)]/20 text-center">{error}</p>}
                  
                  <div className="space-y-4">
                    <input 
                      required 
                      type="text" 
                      placeholder="Identity (Full Name)" 
                      className="w-full text-sm"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                      required 
                      type="email" 
                      placeholder="Email Endpoint" 
                      className="w-full text-sm"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input 
                      required 
                      type="tel" 
                      placeholder="Comm Link (Phone)" 
                      className="w-full text-sm"
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        required 
                        type="text" 
                        placeholder="Niche" 
                        className="w-full text-sm"
                        onChange={(e) => setFormData({...formData, profession: e.target.value})}
                      />
                      <input 
                        required 
                        type="number" 
                        placeholder="Reach (Followers)" 
                        className="w-full text-sm"
                        onChange={(e) => setFormData({...formData, followers: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 mt-4 font-black">Submit Signal</button>
                </form>
              ) : (
                <div className="text-center py-20 animate-in zoom-in duration-500">
                  <div className="gold-text text-6xl mb-6">✓</div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Signal Synchronized</h3>
                  <p className="text-[var(--text-muted)] text-sm font-medium">Node verification status: Pending. <br/> We will establish comms within 48h.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CommentSection videoId="influencer-hub" />
      </div>
    </div>
  );
};

export default Influencers;
