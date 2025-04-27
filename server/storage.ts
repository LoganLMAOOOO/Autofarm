import { 
  User, InsertUser, Channel, InsertChannel, 
  Prediction, InsertPrediction, ActivityLog, InsertActivityLog,
  Settings, InsertSettings, Analytics, InsertAnalytics,
  Session, InsertSession
} from "@shared/schema";

// Interface for all storage methods
import session from "express-session";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.SessionStore;
  
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
    
    const MemoryStore = require("memorystore")(session);
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
      lastActive: undefined
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
    
    const log: ActivityLog = {
      ...insertLog,
      id,
      timestamp,
      sent: false
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
        date,
        totalPoints: 0,
        dailyPoints: 0,
        activeChannels: 0,
        winRate: 0,
        uptime: 0,
        lastReset
      };
      this.analytics.set(id, analytics);
    }
    
    const updatedAnalytics = { ...analytics, ...data };
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
      endTime: undefined,
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

// Export a single instance to be used throughout the application
// Migrate to DatabaseStorage
import { db } from './db';
import { eq } from 'drizzle-orm';
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from './db';
import { 
  users, channels, predictions, 
  activityLogs, settings, analytics, 
  sessions 
} from '@shared/schema';

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getChannels(userId: number): Promise<Channel[]> {
    return await db.select().from(channels).where(eq(channels.userId, userId));
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async getChannelByName(userId: number, name: string): Promise<Channel | undefined> {
    const [channel] = await db.select()
      .from(channels)
      .where(eq(channels.userId, userId) && eq(channels.name, name));
    return channel;
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const [channel] = await db
      .insert(channels)
      .values(insertChannel)
      .returning();
    return channel;
  }

  async updateChannel(id: number, data: Partial<Channel>): Promise<Channel> {
    const [updated] = await db
      .update(channels)
      .set(data)
      .where(eq(channels.id, id))
      .returning();
    return updated;
  }

  async deleteChannel(id: number): Promise<boolean> {
    await db.delete(channels).where(eq(channels.id, id));
    return true;
  }

  async getActiveChannels(userId: number): Promise<Channel[]> {
    return await db.select()
      .from(channels)
      .where(eq(channels.userId, userId) && eq(channels.active, true));
  }

  async getPredictions(userId: number): Promise<Prediction[]> {
    return await db.select()
      .from(predictions)
      .where(eq(predictions.userId, userId));
  }

  async getPredictionsByChannel(channelId: number): Promise<Prediction[]> {
    return await db.select()
      .from(predictions)
      .where(eq(predictions.channelId, channelId));
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db
      .insert(predictions)
      .values(insertPrediction)
      .returning();
    return prediction;
  }

  async updatePrediction(id: number, data: Partial<Prediction>): Promise<Prediction> {
    const [updated] = await db
      .update(predictions)
      .set(data)
      .where(eq(predictions.id, id))
      .returning();
    return updated;
  }

  async getRecentPredictions(userId: number, limit: number): Promise<Prediction[]> {
    return await db.select()
      .from(predictions)
      .where(eq(predictions.userId, userId))
      .orderBy(predictions.createdAt)
      .limit(limit);
  }

  async getLogs(userId: number): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId));
  }

  async getRecentLogs(userId: number, limit: number): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(activityLogs.timestamp)
      .limit(limit);
  }

  async createLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getUnsentLogs(userId: number): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId) && eq(activityLogs.sent, false));
  }

  async markLogAsSent(id: number): Promise<ActivityLog> {
    const [updated] = await db
      .update(activityLogs)
      .set({ sent: true })
      .where(eq(activityLogs.id, id))
      .returning();
    return updated;
  }

  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db.select()
      .from(settings)
      .where(eq(settings.userId, userId));
    return setting;
  }

  async updateSettings(userId: number, data: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = await this.getSettings(userId);
    
    if (existingSettings) {
      const [updated] = await db
        .update(settings)
        .set(data)
        .where(eq(settings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db
        .insert(settings)
        .values({ ...data, userId } as InsertSettings)
        .returning();
      return newSettings;
    }
  }

  async getAnalytics(userId: number): Promise<Analytics | undefined> {
    const [analytic] = await db.select()
      .from(analytics)
      .where(eq(analytics.userId, userId));
    return analytic;
  }

  async updateAnalytics(userId: number, data: Partial<InsertAnalytics>): Promise<Analytics> {
    const existingAnalytics = await this.getAnalytics(userId);
    
    if (existingAnalytics) {
      const [updated] = await db
        .update(analytics)
        .set(data)
        .where(eq(analytics.id, existingAnalytics.id))
        .returning();
      return updated;
    } else {
      const [newAnalytics] = await db
        .insert(analytics)
        .values({ ...data, userId } as InsertAnalytics)
        .returning();
      return newAnalytics;
    }
  }

  async startSession(userId: number): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values({ 
        userId,
        startTime: new Date(),
        endTime: null
      } as InsertSession)
      .returning();
    return session;
  }

  async endSession(id: number): Promise<Session> {
    const [updated] = await db
      .update(sessions)
      .set({ endTime: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    return updated;
  }

  async getCurrentSession(userId: number): Promise<Session | undefined> {
    const [session] = await db.select()
      .from(sessions)
      .where(eq(sessions.userId, userId) && eq(sessions.endTime, null));
    return session;
  }
}

export const storage = new DatabaseStorage();
