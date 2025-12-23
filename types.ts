
export type Role = "customer" | "influencer" | "seller" | "all";
export type TargetPage = "home" | "customer" | "influencer" | "seller";
export type UserType = "user" | "admin";

export interface AppSettings {
  logoUrl: string;
}

export interface User {
  phone: string;
  username: string;
  email: string;
  role: "customer" | "influencer" | "seller";
  cards: {
    premium?: boolean;
    platinum?: boolean;
    gold?: boolean;
  };
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  roleVisibility: Role;
  targetPage: TargetPage;
  createdAt: string;
  source?: 'upload' | 'url';
  fileName?: string;
}

export interface ChatMessage {
  id: string;
  page: TargetPage;
  userType: UserType;
  username: string;
  phone?: string;
  text: string;
  createdAt: number;
}

export interface SpinResult {
  id: string;
  phone: string;
  result: "premium" | "platinum" | "gold" | "3more" | "try" | "bad" | "mystery";
  createdAt: string;
}

export interface InfluencerApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  profession: string;
  followers: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface SellerApplication {
  id: string;
  name: string;
  address: string;
  phone: string;
  productType: string;
  imageUrls: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
