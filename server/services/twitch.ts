import { storage } from '../storage';
import { getRandomInt } from '../../client/src/lib/utils';
import { InsertChannel, InsertActivityLog, Channel } from '@shared/schema';

interface PointsResponse {
  success: boolean;
  points?: number;
  error?: string;
}

// Main TwitchService to handle all Twitch-related functionality
export class TwitchService {
  private static instance: TwitchService;
  private activeFarmingSessions: Map<number, NodeJS.Timeout> = new Map();
  
  // Singleton pattern
  public static getInstance(): TwitchService {
    if (!TwitchService.instance) {
      TwitchService.instance = new TwitchService();
    }
    return TwitchService.instance;
  }
  
  private constructor() {
    // Initialize service
  }
  
  // Start auto-farming for a channel
  public async startAutofarm(channelId: number): Promise<Channel> {
    const channel = await storage.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel with id ${channelId} not found`);
    }
    
    // If already farming, clear the existing interval
    if (this.activeFarmingSessions.has(channelId)) {
      clearInterval(this.activeFarmingSessions.get(channelId)!);
      this.activeFarmingSessions.delete(channelId);
    }
    
    // Update channel status to Active
    const updatedChannel = await storage.updateChannel(channelId, { 
      status: "Active",
      lastActive: new Date()
    });
    
    // Get user settings for stealth mode
    const settings = await storage.getSettings(channel.userId);
    const minDelay = settings?.minDelay || 1000;
    const maxDelay = settings?.maxDelay || 3000;
    
    // Create log for session start
    if (settings?.logSessions) {
      const logData: InsertActivityLog = {
        userId: channel.userId,
        type: "System Event",
        details: `Auto-farm started for channel: ${channel.name}`,
        channel: channel.name,
      };
      await storage.createLog(logData);
    }
    
    // Set up interval for farming points
    const farmInterval = setInterval(async () => {
      try {
        // Simulate farming points with stealth behavior
        const randomPoints = getRandomInt(20, 50); // Random points between 20-50
        
        // Update channel with earned points
        const updatedPoints = channel.pointsEarned + randomPoints;
        await storage.updateChannel(channelId, { pointsEarned: updatedPoints });
        
        // Update analytics
        const analytics = await storage.getAnalytics(channel.userId);
        if (analytics) {
          await storage.updateAnalytics(channel.userId, {
            totalPoints: analytics.totalPoints + randomPoints,
            dailyPoints: analytics.dailyPoints + randomPoints
          });
        }
        
        // Create log for points earned if enabled
        if (settings?.logPoints) {
          const logData: InsertActivityLog = {
            userId: channel.userId,
            type: "Points Claimed",
            details: `Amount: ${randomPoints} points`,
            channel: channel.name,
            amount: randomPoints
          };
          await storage.createLog(logData);
        }
        
        // Randomly collect bonus chest if enabled
        if (channel.collectBonuses && Math.random() < 0.1) { // 10% chance
          const bonusPoints = getRandomInt(200, 500);
          
          // Update channel and analytics with bonus points
          await storage.updateChannel(channelId, { 
            pointsEarned: updatedPoints + bonusPoints 
          });
          
          if (analytics) {
            await storage.updateAnalytics(channel.userId, {
              totalPoints: analytics.totalPoints + bonusPoints,
              dailyPoints: analytics.dailyPoints + bonusPoints
            });
          }
          
          // Create log for bonus points
          if (settings?.logPoints) {
            const logData: InsertActivityLog = {
              userId: channel.userId,
              type: "Points Claimed",
              details: `Bonus Chest: ${bonusPoints} points`,
              channel: channel.name,
              amount: bonusPoints
            };
            await storage.createLog(logData);
          }
        }
        
        // Update watch hours
        const updatedWatchHours = channel.watchHours + (15 / 3600); // Add 15 seconds in hours
        await storage.updateChannel(channelId, { watchHours: updatedWatchHours });
        
      } catch (error) {
        console.error(`Error farming points for channel ${channelId}:`, error);
        
        // Create log for error if enabled
        if (settings?.logErrors) {
          const logData: InsertActivityLog = {
            userId: channel.userId,
            type: "Warning",
            details: `Error farming points: ${(error as Error).message}`,
            channel: channel.name,
          };
          await storage.createLog(logData);
        }
      }
    }, getRandomInt(minDelay, maxDelay)); // Random interval for stealth
    
    // Store the interval for later cleanup
    this.activeFarmingSessions.set(channelId, farmInterval);
    
    return updatedChannel;
  }
  
  // Stop auto-farming for a channel
  public async stopAutofarm(channelId: number): Promise<Channel> {
    // Clear the interval if it exists
    if (this.activeFarmingSessions.has(channelId)) {
      clearInterval(this.activeFarmingSessions.get(channelId)!);
      this.activeFarmingSessions.delete(channelId);
    }
    
    const channel = await storage.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel with id ${channelId} not found`);
    }
    
    // Update channel status to Paused
    const updatedChannel = await storage.updateChannel(channelId, { 
      status: "Paused" 
    });
    
    // Create log for session end
    const settings = await storage.getSettings(channel.userId);
    if (settings?.logSessions) {
      const logData: InsertActivityLog = {
        userId: channel.userId,
        type: "System Event",
        details: `Auto-farm stopped for channel: ${channel.name}`,
        channel: channel.name,
      };
      await storage.createLog(logData);
    }
    
    return updatedChannel;
  }
  
  // Add a new channel to farm
  public async addChannel(userId: number, channelName: string): Promise<Channel> {
    // Check if channel already exists
    const existingChannel = await storage.getChannelByName(userId, channelName);
    if (existingChannel) {
      throw new Error(`Channel ${channelName} already exists for this user`);
    }
    
    // Create the new channel
    const channelData: InsertChannel = {
      userId,
      name: channelName,
      autoFarm: true,
      collectBonuses: true
    };
    
    const newChannel = await storage.createChannel(channelData);
    
    // Update analytics for active channels count
    const analytics = await storage.getAnalytics(userId);
    if (analytics) {
      const allChannels = await storage.getChannels(userId);
      await storage.updateAnalytics(userId, {
        activeChannels: allChannels.length
      });
    }
    
    return newChannel;
  }
  
  // Start auto-farming for all channels of a user
  public async startAllChannels(userId: number): Promise<Channel[]> {
    const channels = await storage.getChannels(userId);
    const updatedChannels: Channel[] = [];
    
    for (const channel of channels) {
      if (channel.autoFarm) {
        const updatedChannel = await this.startAutofarm(channel.id);
        updatedChannels.push(updatedChannel);
      }
    }
    
    // Update analytics for active channels count
    const activeChannels = updatedChannels.length;
    const analytics = await storage.getAnalytics(userId);
    if (analytics) {
      await storage.updateAnalytics(userId, { activeChannels });
    }
    
    // Create log for starting all channels
    const settings = await storage.getSettings(userId);
    if (settings?.logSessions) {
      const logData: InsertActivityLog = {
        userId,
        type: "System Event",
        details: `Auto-farm started across ${activeChannels} channels`,
      };
      await storage.createLog(logData);
    }
    
    return updatedChannels;
  }
  
  // Stop auto-farming for all channels of a user
  public async stopAllChannels(userId: number): Promise<Channel[]> {
    const channels = await storage.getChannels(userId);
    const updatedChannels: Channel[] = [];
    
    for (const channel of channels) {
      if (channel.status === "Active") {
        const updatedChannel = await this.stopAutofarm(channel.id);
        updatedChannels.push(updatedChannel);
      }
    }
    
    // Update analytics for active channels count
    const analytics = await storage.getAnalytics(userId);
    if (analytics) {
      await storage.updateAnalytics(userId, { activeChannels: 0 });
    }
    
    // Create log for stopping all channels
    const settings = await storage.getSettings(userId);
    if (settings?.logSessions) {
      const logData: InsertActivityLog = {
        userId,
        type: "System Event",
        details: `Auto-farm stopped for all channels`,
      };
      await storage.createLog(logData);
    }
    
    return updatedChannels;
  }
  
  // Simulate getting total earned points for a user
  public async getTotalPoints(userId: number): Promise<number> {
    const channels = await storage.getChannels(userId);
    return channels.reduce((total, channel) => total + channel.pointsEarned, 0);
  }
  
  // Get all active channels count
  public async getActiveChannelsCount(userId: number): Promise<number> {
    const channels = await storage.getChannels(userId);
    return channels.filter(channel => channel.status === "Active").length;
  }
  
  // Clean up resources when shutting down
  public cleanup(): void {
    // Clear all intervals
    for (const intervalId of this.activeFarmingSessions.values()) {
      clearInterval(intervalId);
    }
    this.activeFarmingSessions.clear();
  }
}

// Export a single instance
export const twitchService = TwitchService.getInstance();
