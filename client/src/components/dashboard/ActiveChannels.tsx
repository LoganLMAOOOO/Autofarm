import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn, getStatusColor } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  duration: string;
  points: number;
  status: 'Active' | 'Paused' | 'Offline';
}

interface ActiveChannelsProps {
  channels?: Channel[];
  onDeleteChannel?: (channelId: string) => void; // Added for delete functionality
}

const ActiveChannels: React.FC<ActiveChannelsProps> = ({ 
  channels = [
    { id: '1', name: 'xQc', duration: '4h 12m', points: 34271, status: 'Active' },
    { id: '2', name: 'Pokimane', duration: '2h 35m', points: 21087, status: 'Active' },
    { id: '3', name: 'shroud', duration: '6h 47m', points: 42890, status: 'Active' },
    { id: '4', name: 'Ludwig', duration: '3h 22m', points: 15423, status: 'Paused' },
    { id: '5', name: 'Amouranth', duration: '5h 51m', points: 29745, status: 'Offline' }
  ],
  onDeleteChannel
}) => {
  const addChannel = () => {
    // Placeholder for addChannel functionality
    console.log("Add Channel Clicked");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="glass rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Active Channels</CardTitle>
          <Button variant="neon" size="sm" onClick={() => addChannel()}>
            <i className="ri-add-line mr-1"></i>
            Add Channel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-white/60 text-sm">
                  <th className="text-left font-medium pb-3">Channel</th>
                  <th className="text-center font-medium pb-3">Points</th>
                  <th className="text-center font-medium pb-3">Status</th>
                  <th className="text-right font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel, index) => (
                  <motion.tr 
                    key={channel.id}
                    className={cn(
                      index !== channels.length - 1 && "border-b border-white/5"
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                  >
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                          <i className="ri-twitch-fill text-[#B537F2]"></i>
                        </div>
                        <div>
                          <p className="font-medium">{channel.name}</p>
                          <p className="text-xs text-white/40">{channel.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-medium">
                        {channel.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={channel.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onDeleteChannel && onDeleteChannel(channel.id)}> {/* Added delete button */}
                        <i className="ri-delete-bin-line text-white/40 hover:text-red-500"></i>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface StatusBadgeProps {
  status: 'Active' | 'Paused' | 'Offline';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
      getStatusColor(status)
    )}>
      {status === "Active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#3CF582] mr-1 animate-pulse"></span>
      )}
      {status === "Paused" && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
      )}
      {status === "Offline" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E63] mr-1"></span>
      )}
      {status}
    </span>
  );
};

export default ActiveChannels;