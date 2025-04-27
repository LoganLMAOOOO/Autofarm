import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PredictionStatsProps {
  winRate: number;
  roi: number;
  barData?: Array<{
    value: number;
    isWin: boolean;
  }>;
}

const PredictionStats: React.FC<PredictionStatsProps> = ({ 
  winRate = 68.2, 
  roi = 24.7,
  barData = [
    { value: 40, isWin: false },
    { value: 70, isWin: true },
    { value: 100, isWin: true },
    { value: 80, isWin: true },
    { value: 110, isWin: false },
    { value: 60, isWin: true },
    { value: 50, isWin: true }
  ]
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="glass rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Prediction Performance</CardTitle>
          <Button variant="ghost" size="icon">
            <i className="ri-more-2-fill text-white/50 hover:text-white"></i>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/60">Win Rate</span>
              <span className="text-sm text-[#3CF582] font-medium">{winRate}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-[#3CF582] rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/60">Average ROI</span>
              <span className="text-sm text-[#3CF582] font-medium">+{roi}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-[#FF2E63] rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(roi * 3, 100)}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
          
          <div className="h-40 relative mb-3">
            <svg width="100%" height="100%">
              <line x1="0" y1="30" x2="100%" y2="30" stroke="#ffffff10" strokeWidth="1"></line>
              <line x1="0" y1="60" x2="100%" y2="60" stroke="#ffffff10" strokeWidth="1"></line>
              <line x1="0" y1="90" x2="100%" y2="90" stroke="#ffffff10" strokeWidth="1"></line>
              <line x1="0" y1="120" x2="100%" y2="120" stroke="#ffffff10" strokeWidth="1"></line>
              
              {/* Bar chart */}
              {barData.map((bar, index) => {
                const maxHeight = 120;
                const barWidth = 30;
                const spacing = 10;
                const containerWidth = 300;
                const totalBars = barData.length;
                const availableWidth = containerWidth - (barWidth * totalBars);
                const gap = availableWidth / (totalBars - 1);
                const x = index * (barWidth + gap) + 20;
                
                return (
                  <motion.rect 
                    key={index}
                    x={x}
                    y={maxHeight - bar.value}
                    width={barWidth}
                    height={bar.value}
                    rx="2"
                    fill={bar.isWin ? "#3CF582" : "#FF2E63"}
                    initial={{ height: 0, y: maxHeight }}
                    animate={{ height: bar.value, y: maxHeight - bar.value }}
                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  />
                );
              })}
            </svg>
          </div>
          
          <div className="flex justify-between text-xs text-white/40">
            <div className="flex items-center space-x-1">
              <span className="block w-3 h-3 bg-[#3CF582] rounded-sm"></span>
              <span>Wins</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="block w-3 h-3 bg-[#FF2E63] rounded-sm"></span>
              <span>Losses</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PredictionStats;
