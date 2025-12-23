
import { 
  User, Video, ChatMessage, SpinResult, 
  InfluencerApplication, SellerApplication, Role, TargetPage, AppSettings
} from '../types';
import { db, storage } from '../firebase';
import { ref as dbRef, push, set, get } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// In-memory data structures for local persistence (non-firebase features)
let users: User[] = JSON.parse(localStorage.getItem('eagle_users') || '[]');
let videos: Video[] = JSON.parse(localStorage.getItem('eagle_videos') || '[]');
let spins: SpinResult[] = JSON.parse(localStorage.getItem('eagle_spins') || '[]');
let influencerApplications: InfluencerApplication[] = JSON.parse(localStorage.getItem('eagle_inf_apps') || '[]');
let sellerApplications: SellerApplication[] = JSON.parse(localStorage.getItem('eagle_sel_apps') || '[]');
let appSettings: AppSettings = JSON.parse(localStorage.getItem('eagle_settings') || '{"logoUrl": ""}');

// Local fallback for chat when offline/unconfigured
let localChatMessages: ChatMessage[] = JSON.parse(localStorage.getItem('eagle_chat') || '[]');

if (!appSettings.logoUrl) {
  appSettings.logoUrl = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=200';
}

const saveLocal = () => {
  localStorage.setItem('eagle_users', JSON.stringify(users));
  localStorage.setItem('eagle_videos', JSON.stringify(videos));
  localStorage.setItem('eagle_chat', JSON.stringify(localChatMessages));
  localStorage.setItem('eagle_spins', JSON.stringify(spins));
  localStorage.setItem('eagle_inf_apps', JSON.stringify(influencerApplications));
  localStorage.setItem('eagle_sel_apps', JSON.stringify(sellerApplications));
  localStorage.setItem('eagle_settings', JSON.stringify(appSettings));
  
  window.dispatchEvent(new CustomEvent('eagle_settings_updated', { detail: appSettings }));
  window.dispatchEvent(new CustomEvent('eagle_chat_updated'));
};

export const dataService = {
  async getAppSettings(): Promise<AppSettings> {
    return { ...appSettings };
  },

  async updateLogo(file: File): Promise<AppSettings> {
    let finalLogoUrl = '';

    if (storage) {
      try {
        const logoPath = `branding/logo_${Date.now()}`;
        const fileRef = storageRef(storage, logoPath);
        const uploadResult = await uploadBytes(fileRef, file);
        finalLogoUrl = await getDownloadURL(uploadResult.ref);
      } catch (err) {
        console.warn("Firebase Storage upload failed, falling back to placeholder:", err);
      }
    }

    if (!finalLogoUrl) {
      // FIX: Replace blob URL with placeholder to prevent 404s on refresh/Vercel
      console.log("Using placeholder - Firebase Storage pending");
      finalLogoUrl = "https://via.placeholder.com/320x180?text=Logo";
    }

    appSettings.logoUrl = finalLogoUrl;
    saveLocal();
    return appSettings;
  },

  // CHAT SERVICES (Realtime Database with Fallback)
  async getChatForPage(page: TargetPage): Promise<ChatMessage[]> {
    if (db) {
      try {
        const chatRefNode = dbRef(db, `chats/${page}`);
        const snapshot = await get(chatRefNode);
        if (snapshot.exists()) {
          const val = snapshot.val();
          return Object.keys(val)
            .map(id => ({ id, ...val[id] }))
            .sort((a, b) => a.createdAt - b.createdAt);
        }
        return [];
      } catch (err) {
        console.warn("Firebase get failed, falling back to local storage:", err);
      }
    }
    return localChatMessages
      .filter(m => m.page === page)
      .sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
  },

  async sendUserMessage(page: TargetPage, payload: { username: string, phone: string, text: string }): Promise<ChatMessage> {
    const messageData = {
      page,
      userType: "user" as const,
      username: payload.username,
      phone: payload.phone,
      text: payload.text,
      createdAt: Date.now()
    };

    if (db) {
      try {
        const chatRefNode = dbRef(db, `chats/${page}`);
        const newMsgRef = push(chatRefNode);
        await set(newMsgRef, messageData);
        const result = { id: newMsgRef.key!, ...messageData };
        window.dispatchEvent(new CustomEvent('eagle_chat_updated'));
        return result;
      } catch (err) {
        console.warn("Firebase push failed, saving locally instead:", err);
      }
    }

    const localMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      ...messageData
    };
    localChatMessages.push(localMsg);
    saveLocal();
    return localMsg;
  },

  async sendAdminReply(page: TargetPage, text: string, userPhone?: string): Promise<ChatMessage> {
    const messageData = {
      page,
      userType: "admin" as const,
      username: "Eagle Admin",
      phone: userPhone,
      text: text,
      createdAt: Date.now()
    };

    if (db) {
      try {
        const chatRefNode = dbRef(db, `chats/${page}`);
        const newMsgRef = push(chatRefNode);
        await set(newMsgRef, messageData);
        const result = { id: newMsgRef.key!, ...messageData };
        window.dispatchEvent(new CustomEvent('eagle_chat_updated'));
        return result;
      } catch (err) {
        console.warn("Firebase push failed, saving locally instead:", err);
      }
    }

    const localMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      ...messageData
    };
    localChatMessages.push(localMsg);
    saveLocal();
    return localMsg;
  },

  async getAllConversations() {
    const pages: TargetPage[] = ["home", "customer", "influencer", "seller"];
    let allMessages: ChatMessage[] = [];

    if (db) {
      try {
        const results = await Promise.all(pages.map(p => this.getChatForPage(p)));
        allMessages = results.flat();
      } catch (err) {
        console.warn("Firebase fetch all failed, reading from local:", err);
        allMessages = localChatMessages;
      }
    } else {
      allMessages = localChatMessages;
    }

    const userMsgs = allMessages.filter(m => m.userType === "user");
    const uniqueConvos = new Map<string, { page: TargetPage, phone: string, username: string, lastMsg: string, time: number }>();
    
    userMsgs.forEach(m => {
      const key = `${m.page}_${m.phone}`;
      const existing = uniqueConvos.get(key);
      if (!existing || Number(m.createdAt) > Number(existing.time)) {
        uniqueConvos.set(key, {
          page: m.page,
          phone: m.phone || '',
          username: m.username,
          lastMsg: m.text,
          time: Number(m.createdAt)
        });
      }
    });

    return Array.from(uniqueConvos.values()).sort((a, b) => b.time - a.time);
  },

  async getConversationMessages(page: TargetPage, phone: string): Promise<ChatMessage[]> {
    const pageMessages = await this.getChatForPage(page);
    return pageMessages
      .filter(m => m.phone === phone || m.userType === 'admin')
      .sort((a, b) => a.createdAt - b.createdAt);
  },

  // USER SERVICES
  async signInOrRegisterUser(payload: { phone: string; username: string; email?: string; role?: User['role'] }): Promise<User> {
    let user = users.find(u => u.phone === payload.phone);
    if (!user) {
      user = {
        phone: payload.phone,
        username: payload.username,
        email: payload.email || '',
        role: payload.role || 'customer',
        cards: {},
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveLocal();
    }
    return user;
  },

  async getVideosForRole(role: Role): Promise<Video[]> {
    return videos
      .filter(v => v.roleVisibility === 'all' || v.roleVisibility === role)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getLatestVideoForRole(role: Role): Promise<Video | null> {
    const roleVideos = await this.getVideosForRole(role);
    return roleVideos.length > 0 ? roleVideos[0] : null;
  },

  async getLatestVideoForPage(page: TargetPage): Promise<Video | null> {
    const pageVideos = videos
      .filter(v => v.targetPage === page)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return pageVideos.length > 0 ? pageVideos[0] : null;
  },

  async submitInfluencerApplication(payload: Omit<InfluencerApplication, 'id' | 'status' | 'createdAt'>): Promise<InfluencerApplication> {
    const app: InfluencerApplication = {
      ...payload,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    influencerApplications.push(app);
    saveLocal();
    return app;
  },

  async submitSellerApplication(payload: Omit<SellerApplication, 'id' | 'status' | 'createdAt'>): Promise<SellerApplication> {
    const app: SellerApplication = {
      ...payload,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    sellerApplications.push(app);
    saveLocal();
    return app;
  },

  async spinWheelForUser(phone: string): Promise<{ result: SpinResult["result"]; cards: User["cards"] }> {
    const results: SpinResult["result"][] = ["premium", "platinum", "gold", "3more", "try", "bad", "mystery", "bad"];
    const result = results[Math.floor(Math.random() * results.length)];
    
    const spin: SpinResult = {
      id: Math.random().toString(36).substr(2, 9),
      phone,
      result,
      createdAt: new Date().toISOString()
    };
    spins.push(spin);

    const userIndex = users.findIndex(u => u.phone === phone);
    if (userIndex !== -1) {
      if (result === 'premium') users[userIndex].cards.premium = true;
      if (result === 'platinum') users[userIndex].cards.platinum = true;
      if (result === 'gold') users[userIndex].cards.gold = true;
    }

    saveLocal();
    return { result, cards: userIndex !== -1 ? users[userIndex].cards : {} };
  },

  async getProfile(phone: string) {
    const user = users.find(u => u.phone === phone) || null;
    const userSpins = spins.filter(s => s.phone === phone).slice(-5);
    const iApps = influencerApplications.filter(a => a.phone === phone);
    const sApps = sellerApplications.filter(a => a.phone === phone);
    return { user, spins: userSpins, applications: [...iApps, ...sApps] };
  },

  async getAllInfluencerApplications(): Promise<InfluencerApplication[]> {
    return influencerApplications;
  },

  async getAllSellerApplications(): Promise<SellerApplication[]> {
    return sellerApplications;
  },

  async updateApplicationStatus(type: 'influencer' | 'seller', id: string, status: 'approved' | 'rejected'): Promise<void> {
    if (type === 'influencer') {
      const idx = influencerApplications.findIndex(a => a.id === id);
      if (idx !== -1) influencerApplications[idx].status = status;
    } else {
      const idx = sellerApplications.findIndex(a => a.id === id);
      if (idx !== -1) sellerApplications[idx].status = status;
    }
    saveLocal();
  },

  async getAllVideos(): Promise<Video[]> {
    return videos;
  },

  async createOrUpdateVideo(video: Partial<Video> & { file?: File }): Promise<Video> {
    let finalUrl = video.url || '';
    let finalSource = video.source || 'url';
    let finalFileName = video.fileName;

    if (video.file) {
      if (storage) {
        try {
          const videoPath = `assets/v_${Date.now()}_${video.file.name.replace(/\s+/g, '_')}`;
          const fileRef = storageRef(storage, videoPath);
          const uploadResult = await uploadBytes(fileRef, video.file);
          finalUrl = await getDownloadURL(uploadResult.ref);
          finalSource = 'upload';
          finalFileName = video.file.name;
        } catch (err) {
          console.warn("Firebase Storage upload failed for video, using placeholder fallback:", err);
          // FIX: Replace blob URL with placeholder to prevent 404s on refresh/Vercel
          console.log("Using placeholder - Firebase Storage pending");
          finalUrl = "https://via.placeholder.com/320x180?text=Video";
          finalSource = 'upload';
          finalFileName = video.file.name;
        }
      } else {
        // FIX: Replace blob URL with placeholder to prevent 404s on refresh/Vercel
        console.log("Using placeholder - Firebase Storage pending");
        finalUrl = "https://via.placeholder.com/320x180?text=Video";
        finalSource = 'upload';
        finalFileName = video.file.name;
      }
    }

    if (video.id) {
      const idx = videos.findIndex(v => v.id === video.id);
      if (idx !== -1) {
        videos[idx] = { 
          ...videos[idx], 
          ...video, 
          url: finalUrl, 
          source: finalSource,
          fileName: finalFileName
        };
        saveLocal();
        return videos[idx];
      }
    }

    const newVideo: Video = {
      id: Math.random().toString(36).substr(2, 9),
      title: video.title || 'Untitled',
      url: finalUrl,
      roleVisibility: video.roleVisibility || 'all',
      targetPage: video.targetPage || 'home',
      createdAt: new Date().toISOString(),
      source: finalSource,
      fileName: finalFileName
    };
    videos.push(newVideo);
    saveLocal();
    return newVideo;
  },

  async deleteVideo(id: string): Promise<void> {
    videos = videos.filter(v => v.id !== id);
    saveLocal();
  },

  async getAllUsers(): Promise<User[]> {
    return users;
  },

  async updateUserCards(phone: string, cards: User["cards"]): Promise<void> {
    const idx = users.findIndex(u => u.phone === phone);
    if (idx !== -1) {
      users[idx].cards = cards;
      saveLocal();
    }
  }
};
