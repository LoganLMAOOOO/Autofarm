import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: string;
  label: string;
  href: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, active }) => {
  return (
    <Link href={href}>
      <div className={cn(
        "flex flex-col items-center space-y-1 relative cursor-pointer",
        active ? "text-primary" : "text-white/50 hover:text-[#3CF582] transition"
      )}>
        {active && (
          <motion.span
            layoutId="indicator"
            className="absolute -top-1.5 w-1.5 h-1.5 rounded-full bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
        <i className={`${icon} text-xl`}></i>
        <span className="text-xs">{label}</span>
      </div>
    </Link>
  );
};

const MobileNavigation: React.FC = () => {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-primary/20 z-50">
      <nav className="flex justify-around py-3">
        <NavItem 
          icon="ri-dashboard-line" 
          label="Dashboard" 
          href="/" 
          active={location === '/'} 
        />
        <NavItem 
          icon="ri-robot-line" 
          label="Autofarm" 
          href="/autofarm" 
          active={location === '/autofarm'} 
        />
        <NavItem 
          icon="ri-coin-line" 
          label="Predictions" 
          href="/predictions" 
          active={location === '/predictions'} 
        />
        <NavItem 
          icon="ri-settings-4-line" 
          label="Settings" 
          href="/settings" 
          active={location === '/settings'} 
        />
      </nav>
    </div>
  );
};

export default MobileNavigation;
