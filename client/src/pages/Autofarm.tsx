import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';

interface Channel {
  id: string;
  name: string;
  autoFarm: boolean;
  collectBonuses: boolean;
  watchHours: number;
}

const Autofarm: React.FC = () => {
  // Fetch channels
  const { data: channels, isLoading } = useQuery({
    queryKey: ['/api/channels'],
  });
  
  const [newChannel, setNewChannel] = React.useState('');
  const [localChannels, setLocalChannels] = React.useState<Channel[]>([]);
  
  React.useEffect(() => {
    if (channels) {
      setLocalChannels(channels);
    } else {
      // Default data until API is connected
      setLocalChannels([
        { id: '1', name: 'xQc', autoFarm: true, collectBonuses: true, watchHours: 156 },
        { id: '2', name: 'Pokimane', autoFarm: true, collectBonuses: true, watchHours: 87 },
        { id: '3', name: 'shroud', autoFarm: true, collectBonuses: false, watchHours: 213 },
        { id: '4', name: 'Ludwig', autoFarm: false, collectBonuses: true, watchHours: 64 },
        { id: '5', name: 'Amouranth', autoFarm: false, collectBonuses: false, watchHours: 92 }
      ]);
    }
  }, [channels]);
  
  const toggleAutoFarm = (id: string) => {
    setLocalChannels(channels => 
      channels.map(channel => 
        channel.id === id ? { ...channel, autoFarm: !channel.autoFarm } : channel
      )
    );
  };
  
  const toggleBonusCollection = (id: string) => {
    setLocalChannels(channels => 
      channels.map(channel => 
        channel.id === id ? { ...channel, collectBonuses: !channel.collectBonuses } : channel
      )
    );
  };
  
  const handleAddChannel = () => {
    if (newChannel.trim()) {
      const newId = (Math.max(...localChannels.map(c => parseInt(c.id))) + 1).toString();
      setLocalChannels([
        ...localChannels,
        { 
          id: newId, 
          name: newChannel, 
          autoFarm: true, 
          collectBonuses: true, 
          watchHours: 0 
        }
      ]);
      setNewChannel('');
    }
  };
  
  return (
    <>
      <motion.header 
        className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-rajdhani font-bold">Autofarm Control</h1>
          <p className="text-white/60">Configure your channel farming settings</p>
        </div>
      </motion.header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Channel Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="new-channel">Add New Channel</Label>
                <div className="flex mt-2">
                  <Input 
                    id="new-channel"
                    placeholder="Enter Twitch channel name" 
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  <Button 
                    variant="neon" 
                    className="ml-2" 
                    onClick={handleAddChannel}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="flex items-end space-x-4">
                <Button variant="outline" className="border-primary/20 text-primary">
                  <i className="ri-refresh-line mr-2"></i>
                  Refresh Status
                </Button>
                <Button variant="gradient">
                  <i className="ri-play-fill mr-2"></i>
                  Start All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {localChannels.map((channel, index) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                >
                  <Card className="glass p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center">
                          <i className="ri-twitch-fill text-[#B537F2]"></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{channel.name}</h3>
                          <p className="text-xs text-white/50">
                            {channel.watchHours} hours watched
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant={channel.autoFarm ? "destructive" : "neon"}
                        size="sm"
                      >
                        {channel.autoFarm ? (
                          <>
                            <i className="ri-stop-line mr-1"></i>
                            Stop
                          </>
                        ) : (
                          <>
                            <i className="ri-play-fill mr-1"></i>
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`autofarm-${channel.id}`} className="cursor-pointer">
                          Auto-farm Points
                        </Label>
                        <Switch 
                          id={`autofarm-${channel.id}`}
                          checked={channel.autoFarm}
                          onCheckedChange={() => toggleAutoFarm(channel.id)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`bonuses-${channel.id}`} className="cursor-pointer">
                          Collect Bonuses
                        </Label>
                        <Switch 
                          id={`bonuses-${channel.id}`}
                          checked={channel.collectBonuses}
                          onCheckedChange={() => toggleBonusCollection(channel.id)}
                        />
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
            <CardTitle className="text-xl">Autofarming Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="stealth-mode">Stealth Mode</Label>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-white/60">Randomize interaction patterns</p>
                <Switch id="stealth-mode" defaultChecked />
              </div>
              
              <Label htmlFor="human-delay" className="mt-4 block">Human-like Delay</Label>
              <div className="mt-2">
                <input 
                  id="human-delay"
                  type="range" 
                  className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" 
                  min="0" 
                  max="100" 
                  defaultValue="70"
                />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>Fast (Riskier)</span>
                <span>Slow (Safer)</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="auto-claim">Auto-claim Settings</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center">
                  <Switch id="claim-channel-points" defaultChecked />
                  <Label htmlFor="claim-channel-points" className="ml-2">
                    Claim channel points
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Switch id="claim-drops" defaultChecked />
                  <Label htmlFor="claim-drops" className="ml-2">
                    Claim drops and rewards
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Switch id="watch-ads" />
                  <Label htmlFor="watch-ads" className="ml-2">
                    Watch ads for bonus points
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <Switch id="auto-follow" />
                  <Label htmlFor="auto-follow" className="ml-2">
                    Auto-follow channels
                  </Label>
                </div>
              </div>
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

export default Autofarm;
