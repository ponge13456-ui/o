
import React, { useState, useEffect } from 'react';
import CommentSection from '../components/CommentSection';
import { dataService } from '../services/dataService';
import { Video } from '../types';

const Customers: React.FC = () => {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadFeaturedVideo();
  }, []);

  const loadFeaturedVideo = async () => {
    // Fetch the latest video intended for 'customer' target page
    const video = await dataService.getLatestVideoForPage('customer');
    setFeaturedVideo(video);
  };

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="h-[45vh] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] to-transparent" />
        <div className="relative z-10 text-center px-6 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary-gold)] block">Eagle Shopping Hub</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">PRIVILEGED MEMBERS</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        {/* Featured Video Block */}
        <div className="eagle-card p-8 md:p-12 mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 w-full">
              {featuredVideo ? (
                <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <video src={featuredVideo.url} className="w-full h-full object-contain" controls />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center p-8 text-center bg-white/5">
                   <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Admin has not added a customer video yet.</p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <span className="gold-text font-black uppercase text-[10px] tracking-widest">Member Highlight</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {featuredVideo ? featuredVideo.title : 'CUSTOMER EXPERIENCE'}
              </h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                As a privileged member, you get access to the best deals in Nagpur. Watch our guides to maximize your promotional benefits.
              </p>
            </div>
          </div>
        </div>

        <div className="eagle-card p-10 md:p-16 mb-20 text-center space-y-8">
          <p className="text-2xl text-white font-medium leading-relaxed italic opacity-90">
            "Step into Nagpur's most exclusive rewards circle. Our members enjoy elite benefits across the city's finest retailers."
          </p>
          <div className="h-[1px] w-24 bg-[var(--primary-gold)] mx-auto opacity-30"></div>
          <div className="p-10 eagle-card-accent bg-[#050814] rounded-2xl border border-white/5">
            <h3 className="text-[var(--primary-gold)] text-xs font-black uppercase tracking-[0.3em] mb-4">Official Hub Alert</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-lg mx-auto">
              Registration for full member dashboard synchronization will open shortly after our city-wide app launch. 
              Unlock your tier via the homepage today.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Global Feed</h3>
          <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2">Member Signals & Insights</p>
        </div>

        <CommentSection videoId="customer-general" />
      </div>
    </div>
  );
};

export default Customers;
