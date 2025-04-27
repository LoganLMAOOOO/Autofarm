import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface AISettingsProps {
  enabled?: boolean;
  riskThreshold?: number;
  betPercentage?: number;
  model?: string;
}

const AISettings: React.FC<AISettingsProps> = ({ 
  enabled = true,
  riskThreshold = 65,
  betPercentage = 20,
  model = 'advanced'
}) => {
  const [isEnabled, setIsEnabled] = React.useState(enabled);
  const [risk, setRisk] = React.useState(riskThreshold);
  const [bet, setBet] = React.useState(betPercentage);
  const [selectedModel, setSelectedModel] = React.useState(model);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="glass rounded-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center text-lg">
              <i className="ri-robot-line mr-2 text-primary"></i>
              AI Prediction Settings
            </CardTitle>
            <p className="text-white/60 text-sm">Configure your prediction bot's behavior</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-white/70">AI Betting:</span>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">Risk Threshold</h3>
              <div className="flex items-center space-x-3">
                <input 
                  type="range" 
                  className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" 
                  min="0" 
                  max="100" 
                  value={risk}
                  onChange={(e) => setRisk(parseInt(e.target.value))}
                />
                <span className="text-sm font-medium w-8">{risk}%</span>
              </div>
              <p className="text-xs text-white/40 mt-2">Only bet if win probability is above threshold</p>
            </Card>
            
            <Card className="glass rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">Bet Percentage</h3>
              <div className="flex items-center space-x-3">
                <input 
                  type="range" 
                  className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF2E63]" 
                  min="0" 
                  max="100" 
                  value={bet}
                  onChange={(e) => setBet(parseInt(e.target.value))}
                />
                <span className="text-sm font-medium w-8">{bet}%</span>
              </div>
              <p className="text-xs text-white/40 mt-2">Percentage of available points to bet each time</p>
            </Card>
            
            <Card className="glass rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">AI Model</h3>
              <div className="relative">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full bg-white/5 border border-white/10 rounded-md">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advanced">Advanced (Highest Accuracy)</SelectItem>
                    <SelectItem value="standard">Standard (Balanced)</SelectItem>
                    <SelectItem value="basic">Basic (Low Resource)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-white/40 mt-2">Prediction algorithm complexity</p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AISettings;
