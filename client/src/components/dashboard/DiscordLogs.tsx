import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getLogTypeColor } from '@/lib/utils';

interface LogEntry {
  id: string;
  type: string;
  timestamp: string;
  channel?: string;
  details: string;
  tags: string[];
}

interface DiscordLogsProps {
  logs?: LogEntry[];
}

const DiscordLogs: React.FC<DiscordLogsProps> = ({ 
  logs = [
    {
      id: '1',
      type: 'Prediction Win',
      timestamp: '2 min ago',
      channel: 'xQc',
      details: 'Profit: 750 points',
      tags: ['Game Prediction', '+750']
    },
    {
      id: '2',
      type: 'Points Claimed',
      timestamp: '17 min ago',
      channel: 'Pokimane',
      details: 'Amount: 250 points',
      tags: ['Bonus Chest', 'Auto-claim']
    },
    {
      id: '3',
      type: 'Prediction Loss',
      timestamp: '34 min ago',
      channel: 'shroud',
      details: 'Loss: 250 points',
      tags: ['Game Prediction', '-250']
    },
    {
      id: '4',
      type: 'System Event',
      timestamp: '1h 12m ago',
      details: 'Auto-farm started across 7 channels',
      tags: ['System', 'Auto-start']
    },
    {
      id: '5',
      type: 'Warning',
      timestamp: '2h 3m ago',
      channel: 'Ludwig',
      details: 'Stream went offline',
      tags: ['Status', 'Auto-paused']
    }
  ]
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="glass rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Discord Logs</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <i className="ri-refresh-line"></i>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <i className="ri-settings-line"></i>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  className={cn(
                    "glass p-3 rounded-md border-l-2",
                    getLogTypeColor(log.type)
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium">{log.type}</p>
                    <span className="text-xs text-white/40">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-white/60 mb-2">
                    {log.channel && `Channel: ${log.channel} | `}{log.details}
                  </p>
                  <div className="flex items-center text-xs space-x-1">
                    {log.tags.map((tag, i) => {
                      if (tag.startsWith('+')) {
                        return (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[#3CF582]/20 text-[#3CF582]">
                            {tag}
                          </span>
                        );
                      } else if (tag.startsWith('-')) {
                        return (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[#FF2E63]/20 text-[#FF2E63]">
                            {tag}
                          </span>
                        );
                      } else if (tag === 'Auto-claim') {
                        return (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            {tag}
                          </span>
                        );
                      } else if (tag === 'Auto-start') {
                        return (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[#B537F2]/20 text-[#B537F2]">
                            {tag}
                          </span>
                        );
                      } else if (tag === 'Auto-paused') {
                        return (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">
                            {tag}
                          </span>
                        );
                      } else {
                        return (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                            {tag}
                          </span>
                        );
                      }
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-white/40">
            Webhook Status: <span className="text-[#3CF582]">Connected</span>
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            View All
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DiscordLogs;
