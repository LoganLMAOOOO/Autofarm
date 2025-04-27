import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Channels to farm points from
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  autoFarm: boolean("auto_farm").default(true).notNull(),
  collectBonuses: boolean("collect_bonuses").default(true).notNull(),
  watchHours: numeric("watch_hours").default(0).notNull(),
  pointsEarned: integer("points_earned").default(0).notNull(),
  status: text("status").default("Offline").notNull(), // Active, Paused, Offline
  lastActive: timestamp("last_active"),
});

export const insertChannelSchema = createInsertSchema(channels).pick({
  userId: true,
  name: true,
  autoFarm: true,
  collectBonuses: true,
});

// Predictions made on channels
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  channelId: integer("channel_id").references(() => channels.id).notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  outcome: text("outcome").default("pending").notNull(), // win, loss, pending
  profit: integer("profit").default(0).notNull(),
  probability: numeric("probability").notNull(), // AI confidence percentage
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertPredictionSchema = createInsertSchema(predictions).pick({
  userId: true,
  channelId: true,
  title: true,
  amount: true,
  probability: true,
});

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // Prediction Win, Points Claimed, Warning, etc.
  details: text("details").notNull(),
  channel: text("channel"),
  amount: integer("amount"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sent: boolean("sent").default(false).notNull(), // Whether log was sent to Discord
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  userId: true,
  type: true,
  details: true,
  channel: true,
  amount: true,
});

// Settings for the application
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  discordWebhook: text("discord_webhook"),
  webhookName: text("webhook_name").default("Twitch Farm Pro"),
  aiEnabled: boolean("ai_enabled").default(true),
  riskThreshold: integer("risk_threshold").default(65),
  betPercentage: integer("bet_percentage").default(20),
  aiModel: text("ai_model").default("advanced"),
  stealthMode: boolean("stealth_mode").default(true),
  minDelay: integer("min_delay").default(1000),
  maxDelay: integer("max_delay").default(3000),
  logPoints: boolean("log_points").default(true),
  logPredictions: boolean("log_predictions").default(true),
  logErrors: boolean("log_errors").default(true),
  logSessions: boolean("log_sessions").default(true),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  discordWebhook: true,
  webhookName: true,
  aiEnabled: true,
  riskThreshold: true,
  betPercentage: true,
  aiModel: true,
  stealthMode: true,
  minDelay: true,
  maxDelay: true,
  logPoints: true,
  logPredictions: true,
  logErrors: true,
  logSessions: true,
});

// Analytics data for dashboard
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  dailyPoints: integer("daily_points").default(0).notNull(),
  activeChannels: integer("active_channels").default(0).notNull(),
  winRate: numeric("win_rate").default(0).notNull(),
  uptime: integer("uptime").default(0).notNull(), // in minutes
  lastReset: timestamp("last_reset").defaultNow().notNull(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  userId: true,
  totalPoints: true,
  dailyPoints: true,
  activeChannels: true,
  winRate: true,
  uptime: true,
});

// Uptime tracking 
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  active: boolean("active").default(true).notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
});

// Type definitions for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
