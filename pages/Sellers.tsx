
import React, { useState, useEffect } from 'react';
import CommentSection from '../components/CommentSection';
import { dataService } from '../services/dataService';
import { Video } from '../types';

const Sellers: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', address: '', phone: '', productType: 'Clothes', imageUrls: ['', '', '']
  });
  const [submitted, setSubmitted] = useState(false);
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadFeaturedVideo();
  }, []);

  const loadFeaturedVideo = async () => {
    // Fetch the latest video intended for 'seller' target page
    const video = await dataService.getLatestVideoForPage('seller');
    setFeaturedVideo(video);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.submitSellerApplication(formData);
    setSubmitted(true);
  };

  return (
    <div className="pb-24">
      <div className="h-[45vh] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] to-transparent" />
        <div className="relative z-10 text-center px-6 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary-gold)] block">Business Growth</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter">MERCHANT PORTAL</h1>
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
                   <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Admin has not added a seller video yet.</p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <span className="gold-text font-black uppercase text-[10px] tracking-widest">Merchant Spotlight</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {featuredVideo ? featuredVideo.title : 'GROW YOUR BUSINESS'}
              </h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Discover the tools and network access available to Eagle Hub verified merchants. Scale your reach across Central India.
              </p>
            </div>
          </div>
        </div>

        <div className="eagle-card p-1 lg:p-12 mb-20 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-stretch">
            <div className="p-10 space-y-8">
              <h2 className="text-4xl font-black gold-text tracking-tighter uppercase">SCALE YOUR ENTERPRISE.</h2>
              <p className="text-[var(--text-muted)] leading-relaxed font-medium">
                Eagle Hub provides Nagpur's premier retailers with a high-conversion digital node. Automate your promotional reach today.
              </p>
              <div className="grid grid-cols-1 gap-6 pt-4">
                <div className="p-6 bg-[#050814] border border-white/5 rounded-2xl space-y-2">
                  <span className="gold-text font-black text-xs uppercase tracking-widest">★ Smart Tiers</span>
                  <p className="text-[var(--text-muted)] text-[10px] leading-relaxed">Dynamic customer loyalty designations based on verified shopping nodes.</p>
                </div>
                <div className="p-6 bg-[#050814] border border-white/5 rounded-2xl space-y-2">
                  <span className="gold-text font-black text-xs uppercase tracking-widest">★ Nexus Integration</span>
                  <p className="text-[var(--text-muted)] text-[10px] leading-relaxed">Automatic product distribution to our highest-tier creator network.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#050814] m-4 rounded-2xl border border-white/5 p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="text-center mb-8">
                    <h4 className="font-black text-white uppercase tracking-[0.2em] text-sm mb-1">Merchant Onboarding</h4>
                    <div className="h-[1px] w-12 bg-[var(--primary-gold)] mx-auto opacity-50"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <input 
                      required 
                      type="text" 
                      placeholder="Business Identity" 
                      className="w-full text-sm"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                      required 
                      type="text" 
                      placeholder="Business Address (Nagpur)" 
                      className="w-full text-sm"
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                    <input 
                      required 
                      type="tel" 
                      placeholder="Business Comms Link" 
                      className="w-full text-sm"
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    <select 
                      className="w-full text-sm"
                      onChange={(e) => setFormData({...formData, productType: e.target.value})}
                    >
                      <option>Clothes & Apparel</option>
                      <option>Luxury Footwear</option>
                      <option>Boutique Cosmetics</option>
                      <option>Electronics & Tech</option>
                      <option>Other Premium Goods</option>
                    </select>
                    <div className="pt-4 space-y-3">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest ml-1">Sample Catalog Units (URLs)</p>
                      {formData.imageUrls.map((url, i) => (
                        <input 
                          key={i}
                          required 
                          type="url" 
                          placeholder={`Unit URL ${i+1}`}
                          className="w-full text-xs"
                          onChange={(e) => {
                            const newUrls = [...formData.imageUrls];
                            newUrls[i] = e.target.value;
                            setFormData({...formData, imageUrls: newUrls});
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 mt-6 font-black">Submit Portfolio</button>
                </form>
              ) : (
                <div className="text-center py-20 animate-in zoom-in duration-500">
                  <div className="gold-text text-6xl mb-6">✓</div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Application Logged</h3>
                  <p className="text-[var(--text-muted)] text-sm font-medium">Eagle Business Hub will synchronize <br/> with your node within 72 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CommentSection videoId="seller-hub" />
      </div>
    </div>
  );
};

export default Sellers;
