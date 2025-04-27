import { 
  User, InsertUser, Channel, InsertChannel, 
  Prediction, InsertPrediction, ActivityLog, InsertActivityLog,
  Settings, InsertSettings, Analytics, InsertAnalytics,
  Session, InsertSession
} from "@shared/schema";

// Interface for all storage methods
import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Channel management
  getChannels(userId: number): Promise<Channel[]>;
  getChannel(id: number): Promise<Channel | undefined>;
  getChannelByName(userId: number, name: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, data: Partial<Channel>): Promise<Channel>;
  deleteChannel(id: number): Promise<boolean>;
  getActiveChannels(userId: number): Promise<Channel[]>;
  
  // Prediction management
  getPredictions(userId: number): Promise<Prediction[]>;
  getPredictionsByChannel(channelId: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: number, data: Partial<Prediction>): Promise<Prediction>;
  getRecentPredictions(userId: number, limit: number): Promise<Prediction[]>;
  
  // Activity logs
  getLogs(userId: number): Promise<ActivityLog[]>;
  getRecentLogs(userId: number, limit: number): Promise<ActivityLog[]>;
  createLog(log: InsertActivityLog): Promise<ActivityLog>;
  getUnsentLogs(userId: number): Promise<ActivityLog[]>;
  markLogAsSent(id: number): Promise<ActivityLog>;
  
  // Settings
  getSettings(userId: number): Promise<Settings | undefined>;
  updateSettings(userId: number, data: Partial<InsertSettings>): Promise<Settings>;
  
  // Analytics
  getAnalytics(userId: number): Promise<Analytics | undefined>;
  updateAnalytics(userId: number, data: Partial<InsertAnalytics>): Promise<Analytics>;
  
  // Session management
  startSession(userId: number): Promise<Session>;
  endSession(id: number): Promise<Session>;
  getCurrentSession(userId: number): Promise<Session | undefined>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private channels: Map<number, Channel>;
  private predictions: Map<number, Prediction>;
  private logs: Map<number, ActivityLog>;
  private settings: Map<number, Settings>;
  private analytics: Map<number, Analytics>;
  private sessions: Map<number, Session>;
  sessionStore: session.Store;
  
  private userIdCounter = 1;
  private channelIdCounter = 1;
  private predictionIdCounter = 1;
  private logIdCounter = 1;
  private settingsIdCounter = 1;
  private analyticsIdCounter = 1;
  private sessionIdCounter = 1;
  
  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.predictions = new Map();
    this.logs = new Map();
    this.settings = new Map();
    this.analytics = new Map();
    this.sessions = new Map();
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Channel management
  async getChannels(userId: number): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      (channel) => channel.userId === userId
    );
  }
  
  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }
  
  async getChannelByName(userId: number, name: string): Promise<Channel | undefined> {
    return Array.from(this.channels.values()).find(
      (channel) => channel.userId === userId && channel.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = this.channelIdCounter++;
    const channel: Channel = {
      ...insertChannel,
      id,
      watchHours: 0,
      pointsEarned: 0,
      status: "Offline",
      lastActive: null
    };
    this.channels.set(id, channel);
    return channel;
  }
  
  async updateChannel(id: number, data: Partial<Channel>): Promise<Channel> {
    const channel = this.channels.get(id);
    if (!channel) {
      throw new Error(`Channel with id ${id} not found`);
    }
    
    const updatedChannel = { ...channel, ...data };
    this.channels.set(id, updatedChannel);
    return updatedChannel;
  }
  
  async deleteChannel(id: number): Promise<boolean> {
    return this.channels.delete(id);
  }
  
  async getActiveChannels(userId: number): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      (channel) => channel.userId === userId && channel.status === "Active"
    );
  }
  
  // Prediction management
  async getPredictions(userId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(
      (prediction) => prediction.userId === userId
    );
  }
  
  async getPredictionsByChannel(channelId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(
      (prediction) => prediction.channelId === channelId
    );
  }
  
  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.predictionIdCounter++;
    const timestamp = new Date();
    
    const prediction: Prediction = {
      ...insertPrediction,
      id,
      outcome: "pending",
      profit: 0,
      timestamp
    };
    
    this.predictions.set(id, prediction);
    return prediction;
  }
  
  async updatePrediction(id: number, data: Partial<Prediction>): Promise<Prediction> {
    const prediction = this.predictions.get(id);
    if (!prediction) {
      throw new Error(`Prediction with id ${id} not found`);
    }
    
    const updatedPrediction = { ...prediction, ...data };
    this.predictions.set(id, updatedPrediction);
    return updatedPrediction;
  }
  
  async getRecentPredictions(userId: number, limit: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .filter((prediction) => prediction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Activity logs
  async getLogs(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.logs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getRecentLogs(userId: number, limit: number): Promise<ActivityLog[]> {
    return Array.from(this.logs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.logIdCounter++;
    const timestamp = new Date();
    
    // Ensure channel and amount are set to null if not provided
    const log: ActivityLog = {
      ...insertLog,
      id,
      timestamp,
      sent: false,
      channel: insertLog.channel || null,
      amount: insertLog.amount || null
    };
    
    this.logs.set(id, log);
    return log;
  }
  
  async getUnsentLogs(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.logs.values())
      .filter((log) => log.userId === userId && !log.sent);
  }
  
  async markLogAsSent(id: number): Promise<ActivityLog> {
    const log = this.logs.get(id);
    if (!log) {
      throw new Error(`Log with id ${id} not found`);
    }
    
    const updatedLog = { ...log, sent: true };
    this.logs.set(id, updatedLog);
    return updatedLog;
  }
  
  // Settings
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }
  
  async updateSettings(userId: number, data: Partial<InsertSettings>): Promise<Settings> {
    let settings = Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
    
    if (!settings) {
      // Create default settings if none exist
      const id = this.settingsIdCounter++;
      settings = {
        id,
        userId,
        discordWebhook: "https://discord.com/api/webhooks/1366060653726404739/tDHOL9pRRmFrYXPUQCfg5Itu9mTWZsi0ROtyLEi7yn8tokyQXtzNcMBTslMClV47tD61",
        webhookName: "Twitch Farm Pro",
        aiEnabled: true,
        riskThreshold: 65,
        betPercentage: 20,
        aiModel: "advanced",
        stealthMode: true,
        minDelay: 1000,
        maxDelay: 3000,
        logPoints: true,
        logPredictions: true,
        logErrors: true,
        logSessions: true
      };
      this.settings.set(id, settings);
    }
    
    const updatedSettings = { ...settings, ...data };
    this.settings.set(updatedSettings.id, updatedSettings);
    return updatedSettings;
  }
  
  // Analytics
  async getAnalytics(userId: number): Promise<Analytics | undefined> {
    return Array.from(this.analytics.values()).find(
      (analytics) => analytics.userId === userId
    );
  }
  
  async updateAnalytics(userId: number, data: Partial<InsertAnalytics>): Promise<Analytics> {
    let analytics = Array.from(this.analytics.values()).find(
      (analytics) => analytics.userId === userId
    );
    
    if (!analytics) {
      // Create default analytics if none exist
      const id = this.analyticsIdCounter++;
      const date = new Date();
      const lastReset = new Date();
      
      analytics = {
        id,
        userId,
        date: new Date(),
        totalPoints: 0,
        dailyPoints: 0,
        activeChannels: 0,
        winRate: "0",
        uptime: 0,
        lastReset: new Date()
      };
      this.analytics.set(id, analytics);
    }
    
    // Make sure we have an analytics object with all required fields
    const defaultAnalytics: Analytics = {
      id: analytics.id,
      userId: analytics.userId,
      date: analytics.date,
      totalPoints: analytics.totalPoints,
      dailyPoints: analytics.dailyPoints,
      activeChannels: analytics.activeChannels,
      winRate: analytics.winRate,
      uptime: analytics.uptime,
      lastReset: analytics.lastReset
    };
    
    const updatedAnalytics = { ...defaultAnalytics, ...data };
    this.analytics.set(updatedAnalytics.id, updatedAnalytics);
    return updatedAnalytics;
  }
  
  // Session management
  async startSession(userId: number): Promise<Session> {
    // End any active sessions first
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.active);
    
    for (const session of activeSessions) {
      await this.endSession(session.id);
    }
    
    // Create new session
    const id = this.sessionIdCounter++;
    const startTime = new Date();
    
    const session: Session = {
      id,
      userId,
      startTime,
      endTime: null,
      active: true
    };
    
    this.sessions.set(id, session);
    return session;
  }
  
  async endSession(id: number): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    const endTime = new Date();
    const updatedSession = { ...session, endTime, active: false };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async getCurrentSession(userId: number): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.userId === userId && session.active
    );
  }
}

// Note: We've removed the database implementation and are using MemStorage exclusively
// to reduce costs as requested by the user

export const storage = new MemStorage();
