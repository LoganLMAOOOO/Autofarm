import { storage } from '../storage';
import { InsertPrediction, Prediction, InsertActivityLog } from '@shared/schema';
import { getRandomInt } from '../../client/src/lib/utils';
import { discordService } from './discord';

interface PredictionOptions {
  userId: number;
  channelId: number;
  title: string;
  amount: number;
}

interface PredictionStats {
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  netProfit: number;
}

export class PredictionService {
  private static instance: PredictionService;
  
  // Singleton pattern
  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }
  
  private constructor() {
    // Initialize service
  }
  
  // Calculate a probability based on various factors
  private calculateProbability(title: string, channelName: string): number {
    // This is a simplistic AI prediction model - in a real application this would be
    // based on historical data, machine learning models, etc.
    
    // Base probability
    let probability = 50; // 50% chance by default
    
    // Adjust based on keywords in the title
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('win')) probability += 5;
    if (lowerTitle.includes('lose') || lowerTitle.includes('loss')) probability -= 5;
    if (lowerTitle.includes('clutch')) probability += 3;
    if (lowerTitle.includes('fail')) probability -= 3;
    if (lowerTitle.includes('easy')) probability += 7;
    if (lowerTitle.includes('hard') || lowerTitle.includes('difficult')) probability -= 7;
    
    // Add some randomness
    probability += getRandomInt(-10, 10);
    
    // Ensure probability is within bounds
    return Math.max(5, Math.min(95, probability));
  }
  
  // Make a prediction
  public async makePrediction(options: PredictionOptions): Promise<Prediction> {
    const { userId, channelId, title, amount } = options;
    
    // Get channel information
    const channel = await storage.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel with id ${channelId} not found`);
    }
    
    // Calculate prediction probability
    const probability = this.calculateProbability(title, channel.name);
    
    // Create prediction
    const predictionData: InsertPrediction = {
      userId,
      channelId,
      title,
      amount,
      probability
    };
    
    // Create the prediction
    const prediction = await storage.createPrediction(predictionData);
    
    // Create log entry
    const logData: InsertActivityLog = {
      userId,
      type: 'System Event',
      details: `New prediction placed: ${title}`,
      channel: channel.name,
      amount
    };
    await storage.createLog(logData);
    
    // Simulate the prediction outcome after a delay
    this.simulatePredictionOutcome(prediction.id);
    
    return prediction;
  }
  
  // Simulate a prediction outcome after some time
  private async simulatePredictionOutcome(predictionId: number): Promise<void> {
    // Simulate a delay before resolving prediction (5-15 seconds)
    const delay = getRandomInt(5000, 15000);
    
    setTimeout(async () => {
      try {
        const prediction = await storage.getPredictions(undefined as any)
          .then(predictions => predictions.find(p => p.id === predictionId));
        
        if (!prediction) {
          console.error(`Prediction with id ${predictionId} not found`);
          return;
        }
        
        // Get the channel
        const channel = await storage.getChannel(prediction.channelId);
        if (!channel) {
          console.error(`Channel with id ${prediction.channelId} not found`);
          return;
        }
        
        // Get settings for risk threshold
        const settings = await storage.getSettings(prediction.userId);
        const riskThreshold = settings?.riskThreshold || 65;
        
        // Determine outcome based on probability and risk threshold
        const isWin = prediction.probability >= riskThreshold && Math.random() <= (prediction.probability / 100);
        const outcome = isWin ? 'win' : 'loss';
        
        // Calculate profit/loss
        const profit = isWin ? Math.floor(prediction.amount * 1.5) : -prediction.amount;
        
        // Update the prediction
        await storage.updatePrediction(predictionId, {
          outcome,
          profit
        });
        
        // Update analytics
        const analytics = await storage.getAnalytics(prediction.userId);
        if (analytics) {
          // Get all predictions to calculate overall stats
          const predictions = await storage.getPredictions(prediction.userId);
          const totalBets = predictions.length;
          const completedBets = predictions.filter(p => p.outcome !== 'pending').length;
          const wins = predictions.filter(p => p.outcome === 'win').length;
          
          // Calculate win rate
          const winRate = completedBets > 0 ? (wins / completedBets) * 100 : 0;
          
          await storage.updateAnalytics(prediction.userId, {
            winRate
          });
        }
        
        // Create log for prediction outcome
        const logData: InsertActivityLog = {
          userId: prediction.userId,
          type: isWin ? 'Prediction Win' : 'Prediction Loss',
          details: `${channel.name} | ${isWin ? 'Profit' : 'Loss'}: ${Math.abs(profit)} points`,
          channel: channel.name,
          amount: profit
        };
        await storage.createLog(logData);
        
        // Send to Discord if enabled
        const shouldLogPredictions = settings?.logPredictions !== false;
        if (shouldLogPredictions) {
          await discordService.sendPredictionResult(
            prediction.userId,
            channel.name,
            prediction.amount,
            outcome,
            profit
          );
        }
        
      } catch (error) {
        console.error(`Error simulating prediction outcome for ${predictionId}:`, error);
      }
    }, delay);
  }
  
  // Get statistics for a user's predictions
  public async getPredictionStats(userId: number): Promise<PredictionStats> {
    const predictions = await storage.getPredictions(userId);
    
    const totalBets = predictions.length;
    const completedBets = predictions.filter(p => p.outcome !== 'pending');
    const wins = completedBets.filter(p => p.outcome === 'win').length;
    const losses = completedBets.length - wins;
    
    const winRate = completedBets.length > 0 
      ? (wins / completedBets.length) * 100 
      : 0;
      
    const netProfit = predictions.reduce((total, p) => total + p.profit, 0);
    
    return {
      totalBets,
      wins,
      losses,
      winRate,
      netProfit
    };
  }
  
  // Check if a bet should be placed based on settings and probability
  public async shouldPlaceBet(
    userId: number, 
    probability: number
  ): Promise<boolean> {
    const settings = await storage.getSettings(userId);
    
    // If AI betting is disabled or probability is below threshold, don't bet
    if (!settings?.aiEnabled || probability < (settings?.riskThreshold || 65)) {
      return false;
    }
    
    return true;
  }
  
  // Calculate bet amount based on settings
  public async calculateBetAmount(
    userId: number, 
    totalAvailable: number
  ): Promise<number> {
    const settings = await storage.getSettings(userId);
    
    // Use settings or default to 20% of available points
    const percentage = settings?.betPercentage || 20;
    
    // Calculate amount but ensure it's at least 50 points
    return Math.max(50, Math.floor(totalAvailable * (percentage / 100)));
  }
}

// Export a single instance
export const predictionService = PredictionService.getInstance();
