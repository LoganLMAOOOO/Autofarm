import React from 'react';
import { motion } from 'framer-motion';
import StatusCard from '@/components/dashboard/StatusCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import PredictionStats from '@/components/dashboard/PredictionStats';
import ActiveChannels from '@/components/dashboard/ActiveChannels';
import DiscordLogs from '@/components/dashboard/DiscordLogs';
import AISettings from '@/components/dashboard/AISettings';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000,
  });

  return (
    <>
      <motion.header 
        className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-rajdhani font-bold">Dashboard</h1>
          <p className="text-white/60">Monitor your Twitch farming operations</p>
        </div>
        
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="glass rounded-lg p-2 flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md">
              <i className="ri-notification-3-line"></i>
            </Button>
            <Button variant="secondary" size="icon" className="w-8 h-8 rounded-md relative">
              <i className="ri-notification-3-fill text-[#FF2E63]"></i>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FF2E63]"></span>
            </Button>
          </div>
          
          <div className="glass neon-border rounded-lg px-4 py-2 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <i className="ri-user-line text-primary"></i>
            </div>
            <div className="hidden md:block">
              <h3 className="font-medium text-sm">CyberFarmer</h3>
              <p className="text-xs text-white/50">Premium User</p>
            </div>
            <i className="ri-arrow-down-s-line text-white/50"></i>
          </div>
        </div>
      </motion.header>
      
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard 
          title="Total Points" 
          value={dashboardStats?.totalPoints || 127465}
          icon="ri-coins-line" 
          iconColor="text-primary"
          iconBgColor="bg-primary/20"
          change={{
            value: "24%",
            isPositive: true,
            label: "vs. last week"
          }}
          accentColor="primary"
          delay={0.1}
        />
        
        <StatusCard 
          title="Active Channels" 
          value={dashboardStats?.activeChannels || 7}
          icon="ri-tv-line" 
          iconColor="text-[#3CF582]"
          iconBgColor="bg-[#3CF582]/20"
          change={{
            value: "2 new",
            isPositive: true,
            label: "since yesterday"
          }}
          accentColor="[#3CF582]"
          delay={0.2}
        />
        
        <StatusCard 
          title="Prediction Win Rate" 
          value={`${dashboardStats?.winRate || 68.2}%`}
          icon="ri-line-chart-line" 
          iconColor="text-[#FF2E63]"
          iconBgColor="bg-[#FF2E63]/20"
          change={{
            value: "3.8%",
            isPositive: true,
            label: "vs. last week"
          }}
          accentColor="[#FF2E63]"
          delay={0.3}
        />
        
        <StatusCard 
          title="Uptime" 
          value={dashboardStats?.uptime || "23h 14m"}
          icon="ri-timer-line" 
          iconColor="text-[#B537F2]"
          iconBgColor="bg-[#B537F2]/20"
          change={{
            value: "Running",
            isPositive: true,
            label: "since Apr 12, 08:46 AM"
          }}
          accentColor="[#B537F2]"
          delay={0.4}
        />
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <ActivityChart title="Point Farming Activity" />
        </div>
        
        <div>
          <PredictionStats 
            winRate={dashboardStats?.winRate || 68.2}
            roi={dashboardStats?.roi || 24.7}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <ActiveChannels channels={dashboardStats?.channels} />
        </div>
        
        <div>
          <DiscordLogs logs={dashboardStats?.recentLogs} />
        </div>
      </div>
      
      <AISettings />
      
      <motion.footer 
        className="mt-auto pt-6 pb-4 text-center text-xs text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>TwitchFarm Pro v1.2.4 | © 2023 All rights reserved</p>
      </motion.footer>
    </>
  );
};

export default Dashboard;
