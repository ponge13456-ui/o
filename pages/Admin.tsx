
import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '../services/dataService';
import { User, Video, InfluencerApplication, SellerApplication, TargetPage, AppSettings, ChatMessage } from '../types';
import AppLogo from '../components/AppLogo';
import { testFirebaseConnection } from '../firebase';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'apps' | 'videos' | 'users' | 'branding' | 'chats'>('apps');
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [infApps, setInfApps] = useState<InfluencerApplication[]>([]);
  const [selApps, setSelApps] = useState<SellerApplication[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [convos, setConvos] = useState<any[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<{page: TargetPage, phone: string, username: string} | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  
  const [newVideo, setNewVideo] = useState({ 
    title: '', 
    url: '', 
    roleVisibility: 'all' as Video['roleVisibility'],
    targetPage: 'home' as TargetPage
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState(false);
  
  // Firebase Test state
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const handleChatUpdate = () => {
      loadData();
      if (selectedConvo) {
        loadChatHistory(selectedConvo.page, selectedConvo.phone);
      }
    };
    window.addEventListener('eagle_chat_updated', handleChatUpdate);
    return () => window.removeEventListener('eagle_chat_updated', handleChatUpdate);
  }, [selectedConvo]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const loadData = async () => {
    const [u, v, ia, sa, s, c] = await Promise.all([
      dataService.getAllUsers(),
      dataService.getAllVideos(),
      dataService.getAllInfluencerApplications(),
      dataService.getAllSellerApplications(),
      dataService.getAppSettings(),
      dataService.getAllConversations()
    ]);
    setUsers(u);
    setVideos(v);
    setInfApps(ia);
    setSelApps(sa);
    setAppSettings(s);
    setConvos(c);
  };

  const loadChatHistory = async (page: TargetPage, phone: string) => {
    const history = await dataService.getConversationMessages(page, phone);
    setChatHistory(history);
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvo || !adminReplyText.trim()) return;

    await dataService.sendAdminReply(selectedConvo.page, adminReplyText, selectedConvo.phone);
    setAdminReplyText('');
    loadChatHistory(selectedConvo.page, selectedConvo.phone);
  };

  const handleAppStatus = async (type: 'influencer' | 'seller', id: string, status: 'approved' | 'rejected') => {
    await dataService.updateApplicationStatus(type, id, status);
    loadData();
  };

  const toggleUserCard = async (phone: string, card: 'premium' | 'platinum' | 'gold') => {
    const user = users.find(u => u.phone === phone);
    if (!user) return;
    const newCards = { ...user.cards, [card]: !user.cards[card] };
    await dataService.updateUserCards(phone, newCards);
    loadData();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLogo(e.target.files[0]);
      setBrandingSuccess(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedLogo) return;
    setBrandingLoading(true);
    try {
      await dataService.updateLogo(selectedLogo);
      setBrandingSuccess(true);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setBrandingLoading(false);
    }
  };

  const handleRunFirebaseTest = async () => {
    setTesting(true);
    const res = await testFirebaseConnection();
    setTestResult(res);
    setTesting(false);
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !newVideo.url) {
      setError('Please select a video file or provide a URL.');
      return;
    }
    if (!newVideo.title) {
      setError('Please provide a title for the video.');
      return;
    }

    await dataService.createOrUpdateVideo({
      ...newVideo,
      file: selectedFile || undefined
    });

    setNewVideo({ title: '', url: '', roleVisibility: 'all', targetPage: 'home' });
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadData();
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm('Are you sure you want to purge this asset from the hub?')) {
      await dataService.deleteVideo(id);
      loadData();
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="flex items-center gap-6">
          <AppLogo className="h-16 md:h-20" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary-gold)] mb-2 block">System Command</span>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Eagle Overseer</h1>
          </div>
        </div>
        <div className="flex bg-[var(--bg-surface)] rounded-full p-1.5 border border-white/5 overflow-x-auto">
          {(['apps', 'videos', 'users', 'branding', 'chats'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'gold-bg text-[var(--bg-main)] shadow-xl' : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 h-[700px]">
          {/* Conversation List */}
          <div className="w-full lg:w-1/3 eagle-card flex flex-col overflow-hidden h-full">
            <div className="p-6 bg-[#0a0e1a] border-b border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-gold)]">Conversation Nodes</h3>
            </div>
            <div className="flex-grow overflow-y-auto">
              {convos.map((c) => (
                <button
                  key={`${c.page}_${c.phone}`}
                  onClick={() => {
                    setSelectedConvo(c);
                    loadChatHistory(c.page, c.phone);
                  }}
                  className={`w-full p-6 text-left border-b border-white/5 transition-all hover:bg-white/5 ${
                    selectedConvo?.phone === c.phone && selectedConvo?.page === c.page ? 'bg-[var(--primary-gold)]/5 border-l-4 border-l-[var(--primary-gold)]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-black text-sm uppercase tracking-tighter">{c.username}</span>
                    <span className="bg-[var(--royal-blue)]/20 text-[var(--royal-blue)] px-2 py-0.5 rounded text-[8px] font-black uppercase">{c.page}</span>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs truncate opacity-70 mb-1">{c.lastMsg}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-white/20 font-bold uppercase">{c.phone}</span>
                    <span className="text-[8px] text-white/20 font-bold">{new Date(c.time).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
              {convos.length === 0 && (
                <div className="p-12 text-center opacity-30 italic text-sm">No incoming signals...</div>
              )}
            </div>
          </div>

          {/* Chat Detail View */}
          <div className="w-full lg:w-2/3 eagle-card flex flex-col overflow-hidden h-full bg-[#03060f]">
            {selectedConvo ? (
              <>
                <div className="p-6 bg-[#0a0e1a] border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-gold)] flex items-center justify-center font-black text-[var(--bg-main)]">
                      {selectedConvo.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">{selectedConvo.username}</h4>
                      <p className="text-[var(--text-muted)] text-[8px] uppercase font-bold tracking-widest opacity-60">Identity: {selectedConvo.phone} • Page: {selectedConvo.page}</p>
                    </div>
                  </div>
                </div>

                <div 
                  ref={chatScrollRef}
                  className="flex-grow overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent to-black/20"
                >
                  {chatHistory.map((m) => {
                    const isAdmin = m.userType === 'admin';
                    return (
                      <div 
                        key={m.id} 
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1`}
                      >
                        <div className={`flex items-center gap-3 mb-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'gold-text' : 'text-white'}`}>
                            {isAdmin ? 'System Override (Admin)' : m.username}
                          </span>
                          <span className="text-[9px] text-white/20 font-bold">{new Date(m.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className={`max-w-[75%] px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-xl border ${
                          isAdmin 
                          ? 'bg-[var(--primary-gold)] text-[var(--bg-main)] font-bold rounded-tr-none border-[var(--primary-gold)]' 
                          : 'bg-[#12172b] text-white rounded-tl-none border-white/10'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendAdminReply} className="p-6 border-t border-white/5 bg-[#0a0e1a]">
                  <div className="flex gap-4">
                    <input
                      required
                      type="text"
                      placeholder="Type official hub response..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="flex-grow text-sm py-4 px-6 rounded-2xl"
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyText.trim()}
                      className="btn-primary px-10 rounded-2xl font-black uppercase tracking-widest text-xs"
                    >
                      Transmit Reply
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <div className="w-20 h-20 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.4em]">Select a node to establish comms...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="max-w-xl mx-auto">
            <h3 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-4 text-white">
              <span className="w-8 h-[1px] bg-[var(--primary-gold)]" />
              Global Hub Identity
            </h3>
            <div className="eagle-card p-10 space-y-10">
              <div className="flex flex-col items-center space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Current Hub Logo</span>
                <div className="w-40 h-40 bg-[var(--bg-main)] border border-white/5 rounded-3xl flex items-center justify-center p-4 shadow-inner">
                  <AppLogo className="h-24 w-24" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-1">Upload New Branding (Image)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={logoInputRef}
                      onChange={handleLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-[#12172b] border border-white/10 rounded-xl px-4 py-4 text-xs text-[var(--text-muted)] flex items-center justify-between">
                      <span className="truncate">{selectedLogo ? selectedLogo.name : 'Select Identity File...'}</span>
                      <svg className="w-5 h-5 gold-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveLogo}
                  disabled={!selectedLogo || brandingLoading}
                  className={`btn-primary w-full py-4 text-sm font-black transition-all ${!selectedLogo ? 'opacity-50 grayscale' : ''}`}
                >
                  {brandingLoading ? 'SYNCHRONIZING...' : 'SAVE HUB IDENTITY'}
                </button>

                {brandingSuccess && (
                  <div className="text-center text-[var(--success)] text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Identity Synchronized Successfully
                  </div>
                )}
              </div>

              {/* Firebase Diagnostic */}
              <div className="pt-8 border-t border-white/5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">Cloud Synchronicity Check</h4>
                <button 
                  onClick={handleRunFirebaseTest}
                  disabled={testing}
                  className="btn-secondary w-full py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  {testing ? 'PINGING DATABASE...' : 'CHECK FIREBASE STATUS'}
                </button>
                {testResult && (
                  <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    testResult.success ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'apps' && (
        <div className="space-y-16">
          <section className="animate-in fade-in duration-300">
            <h3 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-4 text-white">
              <span className="w-8 h-[1px] bg-[var(--primary-gold)]" />
              Creator Enrollment
            </h3>
            <div className="eagle-card shadow-2xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#050814] border-b border-white/5 text-[var(--text-muted)]">
                  <tr>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest">Identify</th>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest">Endpoints</th>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest text-center">Reach</th>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest text-center">Nexus Status</th>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest text-right">Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {infApps.map(app => (
                    <tr key={app.id} className="hover:bg-white/5 transition">
                      <td className="px-8 py-6 font-bold text-white">{app.name}</td>
                      <td className="px-8 py-6 text-[var(--text-muted)] leading-tight text-xs">{app.phone}<br/>{app.email}</td>
                      <td className="px-8 py-6 text-center font-bold">{app.followers.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          app.status === 'approved' ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' :
                          app.status === 'rejected' ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20' : 'bg-[var(--royal-blue)]/10 text-[var(--royal-blue)] border border-[var(--royal-blue)]/20'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-3">
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleAppStatus('influencer', app.id, 'approved')} className="bg-[var(--success)] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition">Approve</button>
                            <button onClick={() => handleAppStatus('influencer', app.id, 'rejected')} className="bg-[var(--danger)] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="animate-in fade-in duration-300 delay-100">
            <h3 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-4 text-white">
              <span className="w-8 h-[1px] bg-[var(--primary-gold)]" />
              Merchant Synchronizations
            </h3>
            <div className="eagle-card shadow-2xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#050814] border-b border-white/5 text-[var(--text-muted)]">
                  <tr>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest">Enterprise</th>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest">Hub Details</th>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest text-center">Nexus Status</th>
                    <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest text-right">Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selApps.map(app => (
                    <tr key={app.id} className="hover:bg-white/5 transition">
                      <td className="px-8 py-6 font-bold text-white">{app.name}</td>
                      <td className="px-8 py-6 text-[var(--text-muted)] leading-tight text-xs">{app.phone}<br/>{app.productType}</td>
                      <td className="px-8 py-6 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          app.status === 'approved' ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' :
                          app.status === 'rejected' ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20' : 'bg-[var(--royal-blue)]/10 text-[var(--royal-blue)] border border-[var(--royal-blue)]/20'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleAppStatus('seller', app.id, 'approved')} className="bg-[var(--success)] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition">Approve</button>
                            <button onClick={() => handleAppStatus('seller', app.id, 'rejected')} className="bg-[var(--danger)] text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="space-y-12">
          <form onSubmit={handleCreateVideo} className="eagle-card eagle-card-accent p-10 max-w-2xl animate-in slide-in-from-left-4">
            <h3 className="gold-text mb-8 font-black uppercase tracking-widest text-sm text-center">Broadcast New Hub Asset</h3>
            
            {error && (
              <div className="mb-6 p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl text-[var(--danger)] text-xs font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-1">Asset Title</label>
                <input 
                  required 
                  placeholder="Enter Title" 
                  className="w-full text-sm"
                  value={newVideo.title}
                  onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-1">Video Upload (Preferred)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="video/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-[#12172b] border border-white/10 rounded-xl px-4 py-3 text-xs text-[var(--text-muted)] flex items-center justify-between">
                    <span className="truncate">{selectedFile ? selectedFile.name : 'Choose local file...'}</span>
                    <svg className="w-4 h-4 gold-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-1">OR External URL</label>
                <input 
                  placeholder="Asset URL" 
                  className="w-full text-sm"
                  value={newVideo.url}
                  onChange={e => {
                    setNewVideo({...newVideo, url: e.target.value});
                    if (e.target.value) setSelectedFile(null); // Clear file if URL provided
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-1">Show on Page</label>
                <select 
                  className="w-full text-sm"
                  value={newVideo.targetPage}
                  onChange={e => setNewVideo({...newVideo, targetPage: e.target.value as TargetPage})}
                >
                  <option value="home">Home</option>
                  <option value="customer">Customers</option>
                  <option value="influencer">Influencers</option>
                  <option value="seller">Sellers</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest ml-1">Member Visibility</label>
                <select 
                  className="w-full text-sm"
                  value={newVideo.roleVisibility}
                  onChange={e => setNewVideo({...newVideo, roleVisibility: e.target.value as any})}
                >
                  <option value="all">Global Hub</option>
                  <option value="customer">Member Only</option>
                  <option value="influencer">Creator Only</option>
                  <option value="seller">Merchant Only</option>
                </select>
              </div>

              <div className="flex items-end md:col-span-2">
                <button type="submit" className="btn-primary w-full py-3 font-black">Sync Asset</button>
              </div>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {videos.map(v => (
              <div key={v.id} className="eagle-card group hover:border-[var(--primary-gold)] transition duration-300 flex flex-col">
                <div className="relative h-48 bg-black flex items-center justify-center border-b border-white/5 overflow-hidden">
                  <video 
                    src={v.url} 
                    className="w-full h-full object-cover" 
                    controls 
                    preload="metadata"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black gold-text uppercase tracking-widest border border-white/10">
                    {v.source === 'upload' ? 'Cloud Hosted' : 'External Link'}
                  </div>
                  <div className="absolute top-3 right-3 bg-[var(--primary-gold)] px-3 py-1 rounded-full text-[8px] font-black text-[var(--bg-main)] uppercase tracking-widest">
                    {v.targetPage}
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <h4 className="font-bold text-white mb-2 truncate text-sm">{v.title}</h4>
                  <p className="text-[9px] text-[var(--text-muted)] font-medium mb-4 truncate uppercase tracking-tighter">
                    {v.fileName || v.url}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-[9px] font-black uppercase tracking-widest gold-text bg-[var(--primary-gold)]/10 px-3 py-1 rounded-full">{v.roleVisibility}</span>
                    <button onClick={() => handleDeleteVideo(v.id)} className="text-[var(--danger)] hover:text-white transition text-[10px] font-black uppercase">Purge</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="eagle-card shadow-2xl overflow-x-auto animate-in fade-in duration-300">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#050814] border-b border-white/5 text-[var(--text-muted)]">
              <tr>
                <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest">Node User</th>
                <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest">Identity Link</th>
                <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest text-center">Tier Access</th>
                <th className="px-8 py-6 uppercase text-[10px] font-black tracking-widest text-right">Access Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.phone} className="hover:bg-white/5 transition">
                  <td className="px-8 py-6">
                    <div className="font-bold text-white">{u.username}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">{u.role}</div>
                  </td>
                  <td className="px-8 py-6 text-[var(--text-muted)] font-bold text-xs">{u.phone}</td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center gap-2">
                      {u.cards.premium && <span className="bg-[var(--primary-gold)] text-[var(--bg-main)] px-2 py-0.5 rounded text-[8px] font-black">PREMIUM</span>}
                      {u.cards.platinum && <span className="bg-gray-400 text-black px-2 py-0.5 rounded text-[8px] font-black">PLATINUM</span>}
                      {u.cards.gold && <span className="bg-amber-700 text-white px-2 py-0.5 rounded text-[8px] font-black">GOLD</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleUserCard(u.phone, 'premium')} className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${u.cards.premium ? 'bg-[var(--primary-gold)] border-[var(--primary-gold)] text-[var(--bg-main)] shadow-lg' : 'border-white/10 text-gray-500'}`} title="Premium">P</button>
                      <button onClick={() => toggleUserCard(u.phone, 'platinum')} className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${u.cards.platinum ? 'bg-gray-400 border-gray-400 text-black shadow-lg' : 'border-white/10 text-gray-500'}`} title="Platinum">PL</button>
                      <button onClick={() => toggleUserCard(u.phone, 'gold')} className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${u.cards.gold ? 'bg-amber-700 border-amber-700 text-white shadow-lg' : 'border-white/10 text-gray-500'}`} title="Gold">G</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
