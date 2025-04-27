import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertChannelSchema, insertSettingsSchema } from "@shared/schema";
import { twitchService } from "./services/twitch";
import { discordService } from "./services/discord";
import { predictionService } from "./services/prediction";

// Helper function to validate request body against schema
function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: (data: T) => void) => {
    try {
      const validatedData = schema.parse(req.body);
      next(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}

// Temporary user ID for development (this would normally come from auth)
const DEV_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize test user if not exists
  const existingUser = await storage.getUserByUsername("demo");
  if (!existingUser) {
    await storage.createUser({
      username: "demo",
      password: "password123"
    });
    
    // Create a default session for the demo user
    await storage.startSession(DEV_USER_ID);
    
    // Initialize default settings
    await storage.updateSettings(DEV_USER_ID, {
      discordWebhook: "https://discord.com/api/webhooks/1366060653726404739/tDHOL9pRRmFrYXPUQCfg5Itu9mTWZsi0ROtyLEi7yn8tokyQXtzNcMBTslMClV47tD61",
      webhookName: "Twitch Farm Pro"
    });
    
    // Initialize default analytics
    await storage.updateAnalytics(DEV_USER_ID, {
      totalPoints: 127465,
      dailyPoints: 2780,
      activeChannels: 7,
      winRate: 68.2,
      uptime: 1394 // 23h 14m in minutes
    });
    
    // Create some initial channels
    await twitchService.addChannel(DEV_USER_ID, "xQc");
    await twitchService.addChannel(DEV_USER_ID, "Pokimane");
    await twitchService.addChannel(DEV_USER_ID, "shroud");
    await twitchService.addChannel(DEV_USER_ID, "Ludwig");
    await twitchService.addChannel(DEV_USER_ID, "Amouranth");
    
    // Start autofarming on some channels
    const channels = await storage.getChannels(DEV_USER_ID);
    for (let i = 0; i < 3; i++) {
      if (channels[i]) {
        await twitchService.startAutofarm(channels[i].id);
      }
    }
  }
  
  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // Get user analytics
      const analytics = await storage.getAnalytics(DEV_USER_ID);
      
      // Get channels
      const channels = await storage.getChannels(DEV_USER_ID);
      
      // Get recent logs
      const recentLogs = await storage.getRecentLogs(DEV_USER_ID, 5);
      
      // Get current session for uptime
      const currentSession = await storage.getCurrentSession(DEV_USER_ID);
      let uptime = "0h 0m";
      
      if (currentSession) {
        const uptimeMinutes = Math.floor(
          (Date.now() - currentSession.startTime.getTime()) / (1000 * 60)
        );
        
        const hours = Math.floor(uptimeMinutes / 60);
        const minutes = uptimeMinutes % 60;
        uptime = `${hours}h ${minutes}m`;
      }
      
      // Format logs for frontend
      const formattedLogs = recentLogs.map(log => ({
        id: log.id.toString(),
        type: log.type,
        timestamp: getRelativeTimeString(log.timestamp),
        channel: log.channel,
        details: log.details,
        tags: getTagsFromLog(log)
      }));
      
      // Format channels for frontend
      const formattedChannels = channels.map(channel => ({
        id: channel.id.toString(),
        name: channel.name,
        duration: getWatchTimeString(channel.watchHours),
        points: channel.pointsEarned,
        status: channel.status
      }));
      
      res.json({
        totalPoints: analytics?.totalPoints || 0,
        dailyPoints: analytics?.dailyPoints || 0,
        activeChannels: analytics?.activeChannels || 0,
        winRate: analytics?.winRate || 0,
        uptime,
        channels: formattedChannels,
        recentLogs: formattedLogs,
        roi: 24.7 // Mock ROI for now
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  // Channel endpoints
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getChannels(DEV_USER_ID);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });
  
  app.post("/api/channels", validateBody(insertChannelSchema.extend({
    name: z.string().min(1)
  })), async (validatedData, res) => {
    try {
      // Use the validated data with the user ID
      const channelData = {
        ...validatedData,
        userId: DEV_USER_ID
      };
      
      const channel = await twitchService.addChannel(
        channelData.userId,
        channelData.name
      );
      
      res.status(201).json(channel);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/channels/:id/start", async (req, res) => {
    try {
      const channelId = parseInt(req.params.id);
      const channel = await twitchService.startAutofarm(channelId);
      res.json(channel);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/channels/:id/stop", async (req, res) => {
    try {
      const channelId = parseInt(req.params.id);
      const channel = await twitchService.stopAutofarm(channelId);
      res.json(channel);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.delete("/api/channels/:id", async (req, res) => {
    try {
      const channelId = parseInt(req.params.id);
      
      // Stop autofarming first
      await twitchService.stopAutofarm(channelId);
      
      // Then delete the channel
      const success = await storage.deleteChannel(channelId);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/channels/start-all", async (req, res) => {
    try {
      const channels = await twitchService.startAllChannels(DEV_USER_ID);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/channels/stop-all", async (req, res) => {
    try {
      const channels = await twitchService.stopAllChannels(DEV_USER_ID);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Prediction endpoints
  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await storage.getPredictions(DEV_USER_ID);
      const formattedPredictions = await Promise.all(
        predictions.map(async (prediction) => {
          const channel = await storage.getChannel(prediction.channelId);
          return {
            id: prediction.id.toString(),
            channel: channel?.name || "Unknown",
            title: prediction.title,
            outcome: prediction.outcome,
            amount: prediction.amount,
            profit: prediction.profit,
            timestamp: getRelativeTimeString(prediction.timestamp),
            probability: prediction.probability
          };
        })
      );
      res.json(formattedPredictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });
  
  app.post("/api/predictions", async (req, res) => {
    try {
      const { channelId, title, amount } = req.body;
      
      // Validate inputs
      if (!channelId || !title || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const channel = await storage.getChannel(parseInt(channelId));
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      const prediction = await predictionService.makePrediction({
        userId: DEV_USER_ID,
        channelId: parseInt(channelId),
        title,
        amount: parseInt(amount)
      });
      
      res.status(201).json(prediction);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/predictions/stats", async (req, res) => {
    try {
      const stats = await predictionService.getPredictionStats(DEV_USER_ID);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prediction stats" });
    }
  });
  
  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings(DEV_USER_ID);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  app.post("/api/settings", validateBody(insertSettingsSchema), async (validatedData, res) => {
    try {
      const settings = await storage.updateSettings(DEV_USER_ID, validatedData);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/settings/discord", async (req, res) => {
    try {
      const { webhookUrl, webhookName } = req.body;
      
      if (!webhookUrl) {
        return res.status(400).json({ message: "Webhook URL is required" });
      }
      
      const settings = await storage.updateSettings(DEV_USER_ID, {
        discordWebhook: webhookUrl,
        webhookName: webhookName || "Twitch Farm Pro"
      });
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/settings/discord/test", async (req, res) => {
    try {
      const { webhookUrl, webhookName } = req.body;
      
      const success = await discordService.sendTestMessage(
        webhookUrl,
        webhookName
      );
      
      if (success) {
        res.json({ message: "Test message sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test message" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/settings/twitch", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // In a real app, we would update the user's Twitch credentials
      // For this demo, we'll just return success
      res.json({ message: "Twitch account saved" });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Logs endpoint
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getLogs(DEV_USER_ID);
      const formattedLogs = logs.map(log => ({
        id: log.id.toString(),
        type: log.type,
        timestamp: getRelativeTimeString(log.timestamp),
        channel: log.channel,
        details: log.details,
        tags: getTagsFromLog(log)
      }));
      res.json(formattedLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });
  
  // Utility functions for formatting
  function getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    
    if (diffMin < 1) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} min ago`;
    } else if (diffMin < 1440) { // less than a day
      const hours = Math.floor(diffMin / 60);
      return `${hours}h ${diffMin % 60}m ago`;
    } else {
      const days = Math.floor(diffMin / 1440);
      return `${days} days ago`;
    }
  }
  
  function getWatchTimeString(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  }
  
  function getTagsFromLog(log: any): string[] {
    const tags: string[] = [];
    
    // Add log type tag
    if (log.type === "Points Claimed") {
      tags.push("Bonus Chest");
    } else if (log.type === "Prediction Win" || log.type === "Prediction Loss") {
      tags.push("Game Prediction");
    } else if (log.type === "System Event") {
      tags.push("System");
    } else if (log.type === "Warning") {
      tags.push("Status");
    }
    
    // Add amount tag if present
    if (log.amount !== undefined && log.amount !== null) {
      if (log.type === "Points Claimed") {
        tags.push("Auto-claim");
      } else if (log.type === "Prediction Win") {
        tags.push(`+${log.amount}`);
      } else if (log.type === "Prediction Loss") {
        tags.push(`${log.amount}`);
      } else if (log.type === "System Event") {
        tags.push("Auto-start");
      } else if (log.type === "Warning") {
        tags.push("Auto-paused");
      }
    }
    
    return tags;
  }

  return httpServer;
}
