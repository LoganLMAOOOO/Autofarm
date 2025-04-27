import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import MobileNavigation from './MobileNavigation';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="font-inter bg-background text-foreground min-h-screen overflow-x-hidden grid-background">
      <motion.div 
        className="scanline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
      
      <Sidebar />
      <MobileNavigation />
      
      <main className="lg:ml-64 pt-6 pb-20 lg:pb-6 px-4 lg:px-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
