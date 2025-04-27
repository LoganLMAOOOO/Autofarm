import * as React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => {
    const [location] = useLocation();

    return (
      <aside
        ref={ref}
        className={cn(
          "hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-white/5 flex-col z-40",
          className
        )}
        {...props}
      >
        <div className="p-6 flex items-center space-x-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center">
            <i className="ri-tv-line text-primary text-xl"></i>
          </div>
          <div>
            <h1 className="font-rajdhani font-bold text-xl">
              TwitchFarm<span className="text-primary">Pro</span>
            </h1>
            <div className="flex items-center space-x-1 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3CF582] animate-pulse"></span>
              <span className="text-[#3CF582]/80">System Online</span>
            </div>
          </div>
        </div>

        <nav className="py-6 flex-1 overflow-y-auto">
          <ul className="space-y-1 px-3">
            <li className="mb-6 px-3">
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Main Menu
              </p>
            </li>

            <SidebarItem 
              icon="ri-dashboard-line" 
              label="Dashboard" 
              href="/" 
              active={location === '/'} 
            />
            
            <SidebarItem 
              icon="ri-robot-line" 
              label="Autofarm Control" 
              href="/autofarm" 
              active={location === '/autofarm'} 
            />
            
            <SidebarItem 
              icon="ri-coin-line" 
              label="Predictions" 
              href="/predictions" 
              active={location === '/predictions'} 
            />
            
            <SidebarItem 
              icon="ri-bar-chart-line" 
              label="Analytics" 
              href="/analytics" 
              active={location === '/analytics'} 
            />
            
            <SidebarItem 
              icon="ri-discord-line" 
              label="Discord Logs" 
              href="/logs" 
              active={location === '/logs'} 
            />

            <li className="my-6 px-3">
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Configuration
              </p>
            </li>
            
            <SidebarItem 
              icon="ri-user-settings-line" 
              label="Accounts" 
              href="/accounts" 
              active={location === '/accounts'} 
            />
            
            <SidebarItem 
              icon="ri-settings-4-line" 
              label="Settings" 
              href="/settings" 
              active={location === '/settings'} 
            />
          </ul>
        </nav>

        <StealthModeToggle />
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

interface SidebarItemProps {
  icon: string;
  label: string;
  href: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, active }) => {
  return (
    <li>
      <Link href={href}>
        <a className={cn(
          "flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors",
          active 
            ? "bg-gradient-to-r from-primary/20 to-transparent text-primary" 
            : "hover:bg-white/5 text-white/70 hover:text-white"
        )}>
          <i className={`${icon} text-xl`}></i>
          <span>{label}</span>
        </a>
      </Link>
    </li>
  );
};

const StealthModeToggle = () => {
  const [active, setActive] = React.useState(true);
  
  return (
    <div className="p-4 border-t border-white/5">
      <div className="glass neon-border rounded-lg p-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#B537F2]/20 flex items-center justify-center">
            <i className="ri-rocket-line text-[#B537F2]"></i>
          </div>
          <div>
            <h3 className="font-medium">Stealth Mode</h3>
            <p className="text-xs text-white/50">Human-like behavior active</p>
          </div>
          <div className="ml-auto">
            <div 
              className={cn(
                "w-11 h-6 rounded-full relative cursor-pointer",
                active ? "bg-[#B537F2]/20" : "bg-white/10"
              )}
              onClick={() => setActive(!active)}
            >
              <motion.div 
                className="absolute inset-y-1 w-4 h-4 rounded-full shadow-lg"
                animate={{ 
                  left: active ? "calc(100% - 20px)" : "4px",
                  backgroundColor: active ? "#B537F2" : "#888"
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
