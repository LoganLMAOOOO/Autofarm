import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const [discordWebhook, setDiscordWebhook] = React.useState('https://discord.com/api/webhooks/1366060653726404739/tDHOL9pRRmFrYXPUQCfg5Itu9mTWZsi0ROtyLEi7yn8tokyQXtzNcMBTslMClV47tD61');
  const [webhookName, setWebhookName] = React.useState('Twitch Farm Pro');
  
  const [twitchUsername, setTwitchUsername] = React.useState('');
  const [twitchPassword, setTwitchPassword] = React.useState('');
  
  const [isSaving, setIsSaving] = React.useState(false);
  
  const handleSaveWebhook = async () => {
    setIsSaving(true);
    try {
      await apiRequest('POST', '/api/settings/discord', {
        webhookUrl: discordWebhook,
        webhookName: webhookName
      });
      toast({
        title: "Settings saved",
        description: "Discord webhook has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Discord webhook settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTestWebhook = async () => {
    try {
      await apiRequest('POST', '/api/settings/discord/test', {
        webhookUrl: discordWebhook,
        webhookName: webhookName
      });
      toast({
        title: "Test successful",
        description: "Webhook test message sent to Discord."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test message to Discord.",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveTwitchAccount = async () => {
    setIsSaving(true);
    try {
      await apiRequest('POST', '/api/settings/twitch', {
        username: twitchUsername,
        password: twitchPassword
      });
      setTwitchPassword('');
      toast({
        title: "Account saved",
        description: "Twitch account has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Twitch account.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
          <h1 className="text-3xl font-rajdhani font-bold">Settings</h1>
          <p className="text-white/60">Configure application behavior</p>
        </div>
      </motion.header>
      
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-4 md:w-[400px] mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="twitch">Twitch</TabsTrigger>
          <TabsTrigger value="discord">Discord</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="app-theme">Application Theme</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <Card className="glass p-3 border-primary cursor-pointer">
                      <div className="h-20 rounded bg-[#0F0E17] mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded bg-primary/20"></div>
                      </div>
                      <p className="text-center text-sm">Cyberpunk</p>
                    </Card>
                    <Card className="glass p-3 cursor-pointer">
                      <div className="h-20 rounded bg-[#0B1222] mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded bg-blue-500/20"></div>
                      </div>
                      <p className="text-center text-sm">Midnight</p>
                    </Card>
                    <Card className="glass p-3 cursor-pointer">
                      <div className="h-20 rounded bg-[#1F1D2B] mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded bg-purple-500/20"></div>
                      </div>
                      <p className="text-center text-sm">Techno</p>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="animation-setting">Animation Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Enable animations</span>
                      <Switch id="enable-animations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Reduced motion</span>
                      <Switch id="reduced-motion" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Show scanline effect</span>
                      <Switch id="scanline-effect" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notification-settings">Notification Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Prediction results</span>
                      <Switch id="prediction-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Points earned</span>
                      <Switch id="points-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">System alerts</span>
                      <Switch id="system-notifications" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Button variant="neon" className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="twitch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl">Twitch Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="twitch-username">Twitch Username</Label>
                    <Input 
                      id="twitch-username" 
                      placeholder="Enter your Twitch username"
                      value={twitchUsername}
                      onChange={(e) => setTwitchUsername(e.target.value)}
                      className="mt-1 bg-white/5 border-white/10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="twitch-password">Twitch Password</Label>
                    <Input 
                      id="twitch-password" 
                      type="password"
                      placeholder="Enter your Twitch password"
                      value={twitchPassword}
                      onChange={(e) => setTwitchPassword(e.target.value)}
                      className="mt-1 bg-white/5 border-white/10"
                    />
                    <p className="text-xs text-white/40 mt-1">Your credentials are encrypted and stored securely.</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Auto-login on startup</span>
                    <Switch id="auto-login" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Use browser cookies</span>
                    <Switch id="use-cookies" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Secure mode (headless)</span>
                    <Switch id="headless-mode" defaultChecked />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-primary/20 text-primary">
                    Test Connection
                  </Button>
                  <Button 
                    variant="gradient" 
                    className="flex-1"
                    onClick={handleSaveTwitchAccount}
                    loading={isSaving}
                  >
                    Save Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="discord">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl">Discord Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                    <Input 
                      id="discord-webhook" 
                      placeholder="https://discord.com/api/webhooks/..."
                      value={discordWebhook}
                      onChange={(e) => setDiscordWebhook(e.target.value)}
                      className="mt-1 bg-white/5 border-white/10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="webhook-name">Webhook Display Name</Label>
                    <Input 
                      id="webhook-name" 
                      placeholder="Twitch Farm Pro"
                      value={webhookName}
                      onChange={(e) => setWebhookName(e.target.value)}
                      className="mt-1 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Log Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Switch id="log-points" defaultChecked />
                      <Label htmlFor="log-points" className="ml-2 text-sm">
                        Points earned
                      </Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Switch id="log-predictions" defaultChecked />
                      <Label htmlFor="log-predictions" className="ml-2 text-sm">
                        Prediction bets
                      </Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Switch id="log-errors" defaultChecked />
                      <Label htmlFor="log-errors" className="ml-2 text-sm">
                        Errors
                      </Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Switch id="log-sessions" defaultChecked />
                      <Label htmlFor="log-sessions" className="ml-2 text-sm">
                        Session start/end
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="webhook-message-format">Message Format</Label>
                  <Textarea 
                    id="webhook-message-format" 
                    className="mt-1 bg-white/5 border-white/10 h-32 font-mono text-xs"
                    defaultValue={`{
  "event": "{{event_type}}",
  "channel": "{{channel_name}}",
  "amount": {{amount}},
  "outcome": "{{outcome}}",
  "profit": {{profit}}
}`}
                  />
                  <p className="text-xs text-white/40 mt-1">Use {'{'}{'{variable}'}{'}'}  syntax for dynamic values.</p>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-primary/20 text-primary"
                    onClick={handleTestWebhook}
                  >
                    Test Webhook
                  </Button>
                  <Button 
                    variant="gradient" 
                    className="flex-1"
                    onClick={handleSaveWebhook}
                    loading={isSaving}
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="stealth-settings">Stealth Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Randomize delays</span>
                      <Switch id="randomize-delays" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Simulate human behavior</span>
                      <Switch id="human-behavior" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Anti-detection measures</span>
                      <Switch id="anti-detection" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="delay-range">Delay Range (ms)</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input 
                      id="min-delay" 
                      type="number"
                      placeholder="Min"
                      defaultValue="1000"
                      className="bg-white/5 border-white/10"
                    />
                    <span className="text-white/40">-</span>
                    <Input 
                      id="max-delay" 
                      type="number"
                      placeholder="Max"
                      defaultValue="3000"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="performance-settings">Performance Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Low resource mode</span>
                      <Switch id="low-resource" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Run in background</span>
                      <Switch id="background-run" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Auto-reconnect</span>
                      <Switch id="auto-reconnect" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="browser-path">Custom Browser Path</Label>
                  <Input 
                    id="browser-path" 
                    placeholder="/path/to/browser"
                    className="mt-1 bg-white/5 border-white/10"
                  />
                  <p className="text-xs text-white/40 mt-1">Leave empty to use default browser.</p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <Switch id="debug-mode" />
                  </div>
                  <Card className="bg-black/30 border-white/10 font-mono text-xs h-32 overflow-auto p-3">
                    <div className="text-white/60">&gt; System initialized</div>
                    <div className="text-white/60">&gt; Connecting to Twitch services...</div>
                    <div className="text-white/60">&gt; Connected</div>
                    <div className="text-white/60">&gt; Discord webhook active</div>
                    <div className="text-primary">&gt; Ready</div>
                  </Card>
                </div>
                
                <Button variant="neon" className="w-full">
                  Save Advanced Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      
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

export default Settings;
