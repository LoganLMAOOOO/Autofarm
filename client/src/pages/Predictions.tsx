import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  channel: string;
  title: string;
  outcome: 'win' | 'loss' | 'pending';
  amount: number;
  profit: number;
  timestamp: string;
  probability: number;
}

const Predictions: React.FC = () => {
  // Fetch predictions
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['/api/predictions'],
  });
  
  const [localPredictions, setLocalPredictions] = React.useState<Prediction[]>([]);
  
  React.useEffect(() => {
    if (predictions) {
      setLocalPredictions(predictions);
    } else {
      // Default data until API is connected
      setLocalPredictions([
        { 
          id: '1', 
          channel: 'xQc', 
          title: 'Will he win this game?', 
          outcome: 'win', 
          amount: 500, 
          profit: 750, 
          timestamp: '1 hour ago',
          probability: 78
        },
        { 
          id: '2', 
          channel: 'shroud', 
          title: 'Kill streak > 5?', 
          outcome: 'loss', 
          amount: 250, 
          profit: -250, 
          timestamp: '2 hours ago',
          probability: 65
        },
        { 
          id: '3', 
          channel: 'Pokimane', 
          title: 'Will she reach Gold rank?', 
          outcome: 'win', 
          amount: 1000, 
          profit: 1200, 
          timestamp: '3 hours ago',
          probability: 82
        },
        { 
          id: '4', 
          channel: 'Ludwig', 
          title: 'Sub goal reached today?', 
          outcome: 'pending', 
          amount: 500, 
          profit: 0, 
          timestamp: 'Active now',
          probability: 72
        },
        { 
          id: '5', 
          channel: 'xQc', 
          title: 'Rage quit in first hour?', 
          outcome: 'win', 
          amount: 300, 
          profit: 450, 
          timestamp: '5 hours ago',
          probability: 88
        }
      ]);
    }
  }, [predictions]);
  
  return (
    <>
      <motion.header 
        className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-rajdhani font-bold">Predictions</h1>
          <p className="text-white/60">AI-powered betting system</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" className="border-primary/20 text-primary">
            History
          </Button>
          <Button variant="neon">
            <i className="ri-settings-3-line mr-2"></i>
            Configure AI
          </Button>
        </div>
      </motion.header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl">Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localPredictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                  >
                    <Card className={cn(
                      "glass p-4 border-l-4",
                      prediction.outcome === 'win' ? "border-[#3CF582]" : 
                      prediction.outcome === 'loss' ? "border-[#FF2E63]" : 
                      "border-primary"
                    )}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                              <i className="ri-twitch-fill text-[#B537F2] text-sm"></i>
                            </div>
                            <span className="font-medium">{prediction.channel}</span>
                            <span className="text-xs text-white/40">{prediction.timestamp}</span>
                          </div>
                          <h3 className="text-lg font-medium">{prediction.title}</h3>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-xs text-white/60">Bet Amount</p>
                            <p className="font-medium">{prediction.amount}</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-xs text-white/60">AI Confidence</p>
                            <p className="font-medium">{prediction.probability}%</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-xs text-white/60">Outcome</p>
                            {prediction.outcome === 'pending' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1 animate-pulse"></span>
                                Pending
                              </span>
                            ) : prediction.outcome === 'win' ? (
                              <span className="text-[#3CF582] font-medium">+{prediction.profit}</span>
                            ) : (
                              <span className="text-[#FF2E63] font-medium">{prediction.profit}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl">AI Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="ai-betting">AI Betting</Label>
                  <Switch id="ai-betting" defaultChecked />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="min-confidence" className="mb-2 block">Minimum Confidence</Label>
                    <div className="flex items-center space-x-3">
                      <input 
                        id="min-confidence"
                        type="range" 
                        className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" 
                        min="0" 
                        max="100" 
                        defaultValue="65"
                      />
                      <span className="text-sm font-medium w-8">65%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="max-bet" className="mb-2 block">Maximum Bet Size</Label>
                    <div className="flex items-center space-x-3">
                      <input 
                        id="max-bet"
                        type="range" 
                        className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF2E63]" 
                        min="0" 
                        max="100" 
                        defaultValue="30"
                      />
                      <span className="text-sm font-medium w-8">30%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Bet Conditions</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Switch id="bet-on-streamer" defaultChecked />
                    <Label htmlFor="bet-on-streamer" className="ml-2">
                      Bet on streamer's performance
                    </Label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch id="bet-on-games" defaultChecked />
                    <Label htmlFor="bet-on-games" className="ml-2">
                      Bet on game outcomes
                    </Label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch id="bet-on-events" />
                    <Label htmlFor="bet-on-events" className="ml-2">
                      Bet on random events
                    </Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Risk Management</Label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Stop Loss</span>
                  <Input 
                    type="number" 
                    className="w-24 h-8 bg-white/5 border-white/10 text-right" 
                    defaultValue="5000"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Take Profit</span>
                  <Input 
                    type="number" 
                    className="w-24 h-8 bg-white/5 border-white/10 text-right" 
                    defaultValue="25000"
                  />
                </div>
              </div>
              
              <Button variant="gradient" className="w-full">
                Apply Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-xl">Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass p-4">
                <h3 className="text-sm font-medium mb-3">Win Rate by Channel</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">xQc</span>
                      <span className="text-xs text-[#3CF582]">78%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3CF582] rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">shroud</span>
                      <span className="text-xs text-[#3CF582]">65%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3CF582] rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Pokimane</span>
                      <span className="text-xs text-[#3CF582]">82%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3CF582] rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="glass p-4">
                <h3 className="text-sm font-medium mb-3">Profit by Prediction Type</h3>
                <div className="h-32 flex items-end space-x-2">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="h-24 w-full bg-primary/20 rounded-t-sm relative overflow-hidden">
                      <motion.div 
                        className="absolute bottom-0 w-full bg-primary"
                        initial={{ height: 0 }}
                        animate={{ height: '70%' }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                    <span className="text-xs mt-1">Game</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center">
                    <div className="h-24 w-full bg-[#3CF582]/20 rounded-t-sm relative overflow-hidden">
                      <motion.div 
                        className="absolute bottom-0 w-full bg-[#3CF582]"
                        initial={{ height: 0 }}
                        animate={{ height: '85%' }}
                        transition={{ duration: 1, delay: 0.2 }}
                      ></motion.div>
                    </div>
                    <span className="text-xs mt-1">Player</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center">
                    <div className="h-24 w-full bg-[#FF2E63]/20 rounded-t-sm relative overflow-hidden">
                      <motion.div 
                        className="absolute bottom-0 w-full bg-[#FF2E63]"
                        initial={{ height: 0 }}
                        animate={{ height: '40%' }}
                        transition={{ duration: 1, delay: 0.4 }}
                      ></motion.div>
                    </div>
                    <span className="text-xs mt-1">Event</span>
                  </div>
                </div>
              </Card>
              
              <Card className="glass p-4">
                <h3 className="text-sm font-medium mb-3">Overall Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Total Bets</span>
                    <span className="font-medium">124</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Wins</span>
                    <span className="text-[#3CF582] font-medium">84</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Losses</span>
                    <span className="text-[#FF2E63] font-medium">40</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Win Rate</span>
                    <span className="text-primary font-medium">67.7%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Net Profit</span>
                    <span className="text-[#3CF582] font-medium">+15,750</span>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.footer 
        className="mt-6 pt-6 pb-4 text-center text-xs text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>TwitchFarm Pro v1.2.4 | © 2023 All rights reserved</p>
      </motion.footer>
    </>
  );
};

export default Predictions;
