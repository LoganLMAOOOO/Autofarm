import fetch from 'node-fetch';
import { storage } from '../storage';
import { ActivityLog } from '@shared/schema';

interface DiscordWebhookPayload {
  username: string;
  avatar_url?: string;
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number; // Decimal color value
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer?: {
      text: string;
      icon_url?: string;
    };
    timestamp?: string; // ISO string
  }>;
}

export class DiscordService {
  private static instance: DiscordService;
  private defaultWebhookUrl: string = 'https://discord.com/api/webhooks/1366060653726404739/tDHOL9pRRmFrYXPUQCfg5Itu9mTWZsi0ROtyLEi7yn8tokyQXtzNcMBTslMClV47tD61';
  private defaultAvatarUrl: string = 'https://cdn.discordapp.com/attachments/1136593556159103026/1136593722706214942/twitch-pixel-logo.png';
  
  // Singleton pattern
  public static getInstance(): DiscordService {
    if (!DiscordService.instance) {
      DiscordService.instance = new DiscordService();
    }
    return DiscordService.instance;
  }
  
  private constructor() {
    // Initialize service
    this.startLogProcessing();
  }
  
  // Send a message to Discord webhook
  public async sendWebhook(
    webhookUrl: string, 
    payload: DiscordWebhookPayload
  ): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Discord webhook error: ${response.status} ${errorText}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send Discord webhook:', error);
      return false;
    }
  }
  
  // Send a test message to verify webhook configuration
  public async sendTestMessage(
    webhookUrl: string = this.defaultWebhookUrl, 
    webhookName: string = 'Twitch Farm Pro'
  ): Promise<boolean> {
    const payload: DiscordWebhookPayload = {
      username: webhookName,
      avatar_url: this.defaultAvatarUrl,
      embeds: [{
        title: 'Webhook Test',
        description: 'Your Discord webhook integration is working correctly!',
        color: 0x00F0FF, // Neon blue in decimal
        fields: [
          {
            name: 'Status',
            value: '✅ Connected',
            inline: true
          },
          {
            name: 'Test Time',
            value: new Date().toLocaleString(),
            inline: true
          }
        ],
        footer: {
          text: 'TwitchFarm Pro'
        },
        timestamp: new Date().toISOString()
      }]
    };
    
    return this.sendWebhook(webhookUrl, payload);
  }
  
  // Format and send activity log to Discord
  public async sendActivityLog(log: ActivityLog): Promise<boolean> {
    // Get user settings for webhook configuration
    const settings = await storage.getSettings(log.userId);
    if (!settings || !settings.discordWebhook) {
      return false;
    }
    
    // Determine if this type of log should be sent based on settings
    if (
      (log.type === 'Points Claimed' && !settings.logPoints) ||
      ((log.type === 'Prediction Win' || log.type === 'Prediction Loss') && !settings.logPredictions) ||
      ((log.type === 'Warning' || log.type.includes('Error')) && !settings.logErrors) ||
      (log.type === 'System Event' && !settings.logSessions)
    ) {
      return false;
    }
    
    // Determine color based on log type
    let color = 0x00F0FF; // default neon blue
    if (log.type === 'Prediction Win' || log.type.includes('Claimed')) {
      color = 0x3CF582; // neon green
    } else if (log.type === 'Prediction Loss') {
      color = 0xFF2E63; // neon pink
    } else if (log.type === 'Warning' || log.type.includes('Error')) {
      color = 0xE67E22; // amber
    } else if (log.type === 'System Event') {
      color = 0xB537F2; // neon purple
    }
    
    // Create the payload
    const payload: DiscordWebhookPayload = {
      username: settings.webhookName || 'Twitch Farm Pro',
      avatar_url: this.defaultAvatarUrl,
      embeds: [{
        title: log.type,
        description: log.details,
        color,
        fields: [],
        footer: {
          text: 'TwitchFarm Pro'
        },
        timestamp: log.timestamp.toISOString()
      }]
    };
    
    // Add channel field if present
    if (log.channel) {
      payload.embeds![0].fields!.push({
        name: 'Channel',
        value: log.channel,
        inline: true
      });
    }
    
    // Add amount field if present
    if (log.amount !== undefined && log.amount !== null) {
      payload.embeds![0].fields!.push({
        name: 'Amount',
        value: log.amount.toString(),
        inline: true
      });
    }
    
    // Send the webhook
    const success = await this.sendWebhook(settings.discordWebhook, payload);
    
    // Update log as sent if successful
    if (success) {
      await storage.markLogAsSent(log.id);
    }
    
    return success;
  }
  
  // Process unsent logs in background
  private async processUnsentLogs(userId: number): Promise<void> {
    try {
      const unsentLogs = await storage.getUnsentLogs(userId);
      
      for (const log of unsentLogs) {
        await this.sendActivityLog(log);
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error processing unsent logs:', error);
    }
  }
  
  // Start background processing of logs
  private startLogProcessing(): void {
    // Process logs every minute
    setInterval(async () => {
      // Get all users
      const users = Array.from(new Set(
        Array.from(storage['users'].values()).map(user => user.id)
      ));
      
      // Process logs for each user
      for (const userId of users) {
        await this.processUnsentLogs(userId);
      }
    }, 60000); // 1 minute
  }
  
  // Format prediction data for Discord
  public async sendPredictionResult(
    userId: number,
    channel: string,
    amount: number,
    outcome: string,
    profit: number
  ): Promise<boolean> {
    // Create and send log through the regular log pipeline
    const logData = {
      userId,
      type: outcome === 'win' ? 'Prediction Win' : 'Prediction Loss',
      details: `${channel} | ${outcome === 'win' ? 'Profit' : 'Loss'}: ${Math.abs(profit)} points`,
      channel,
      amount: profit
    };
    
    const log = await storage.createLog(logData);
    return this.sendActivityLog(log);
  }
}

// Export a single instance
export const discordService = DiscordService.getInstance();
