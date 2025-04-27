import React from 'react';
import { Card } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  change?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  accentColor: string;
  delay?: number;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  change,
  accentColor,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="glass rounded-lg p-4 relative overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-white/60 text-sm">{title}</p>
            <h3 className="text-2xl font-rajdhani font-bold">
              {typeof value === 'number' ? formatNumber(value) : value}
            </h3>
          </div>
          <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", iconBgColor)}>
            <i className={cn(`${icon}`, iconColor)}></i>
          </div>
        </div>
        
        {change && (
          <div className="flex items-center space-x-2 text-xs">
            <span className={cn(
              "flex items-center", 
              change.isPositive ? "text-[#3CF582]" : "text-[#FF2E63]"
            )}>
              <i className={cn(
                "mr-1", 
                change.isPositive ? "ri-arrow-up-line" : "ri-arrow-down-line"
              )}></i>
              {change.value}
            </span>
            <span className="text-white/40">{change.label}</span>
          </div>
        )}
        
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
          `from-${accentColor}/5 via-${accentColor} to-${accentColor}/5`
        )}></div>
      </Card>
    </motion.div>
  );
};

export default StatusCard;
