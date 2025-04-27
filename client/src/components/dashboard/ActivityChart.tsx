import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ActivityChartProps {
  title: string;
  data?: {
    values: number[];
    labels: string[];
  };
}

const ActivityChart: React.FC<ActivityChartProps> = ({ 
  title, 
  data = {
    values: [180, 160, 150, 100, 120, 70, 90, 60, 40, 20, 50, 30, 20],
    labels: weekDays
  }
}) => {
  const [timeRange, setTimeRange] = React.useState<'day' | 'week' | 'month'>('week');
  
  // Calculate points for SVG path
  const generatePathData = () => {
    const maxValue = Math.max(...data.values);
    const height = 180;
    const points = data.values.map((value, index) => {
      const x = (index * 600) / (data.values.length - 1);
      const y = height - (value / maxValue) * height;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };

  // Calculate area fill
  const generateAreaData = () => {
    const pathData = generatePathData();
    const lastPoint = 600;
    const height = 200;
    return `${pathData} L${lastPoint},${height} L0,${height} Z`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="glass rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === 'day' ? 'neon' : 'ghost'} 
              size="sm"
              onClick={() => setTimeRange('day')}
            >
              Day
            </Button>
            <Button 
              variant={timeRange === 'week' ? 'neon' : 'ghost'} 
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'neon' : 'ghost'} 
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            <svg width="100%" height="100%">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4"></stop>
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <line x1="0" y1="20" x2="100%" y2="20" stroke="#ffffff10" strokeWidth="1"></line>
              <line x1="0" y1="60" x2="100%" y2="60" stroke="#ffffff10" strokeWidth="1"></line>
              <line x1="0" y1="100" x2="100%" y2="100" stroke="#ffffff10" strokeWidth="1"></line>
              <line x1="0" y1="140" x2="100%" y2="140" stroke="#ffffff10" strokeWidth="1"></line>
              <line x1="0" y1="180" x2="100%" y2="180" stroke="#ffffff10" strokeWidth="1"></line>
              
              {/* Chart line */}
              <motion.path 
                className="chart-line" 
                d={generatePathData()} 
                fill="none" 
                stroke="#00F0FF" 
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              
              {/* Area fill */}
              <path d={generateAreaData()} fill="url(#gradient)" />
              
              {/* Data points */}
              {data.values.map((value, index) => {
                const maxValue = Math.max(...data.values);
                const x = (index * 600) / (data.values.length - 1);
                const y = 180 - (value / maxValue) * 180;
                
                return (
                  <motion.circle 
                    key={index} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="#0F0E17" 
                    stroke="#00F0FF" 
                    strokeWidth="2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + (index * 0.05), duration: 0.3 }}
                  />
                );
              })}
            </svg>
            
            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/40 px-2">
              {data.labels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityChart;
