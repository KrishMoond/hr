import React from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
}

export default function MobileDrawer({ open, onClose, activeTab, setActiveTab, user }: MobileDrawerProps) {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'journey', label: 'My Journey' },
    { id: 'leaves', label: 'Leave Management' },
    { id: 'upskilling', label: 'AI Upskilling' },
    { id: 'hr-management', label: 'HR Management' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'notifications', label: 'Task Updates' },
    { id: 'alerts', label: 'Early Alerts' },
    { id: 'guidance', label: 'Chanakya Chat' },
    { id: 'chat', label: 'Team Chat' },
    { id: 'employees', label: 'Employees' },
    { id: 'analytics', label: 'Power BI' },
    { id: 'helpdesk', label: 'HR Helpdesk' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'settings', label: 'Settings' },
  ];

  const menuItems = allMenuItems.filter(item => !user?.role || (
    // role-based filtering: mimic Sidebar roles
    (item.id === 'employees' || item.id === 'analytics' || item.id === 'alerts' || item.id === 'hr-management')
      ? (user?.role === 'admin' || user?.role === 'hr')
      : true
  ));

  // Close on Escape when open
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Render overlay always so we can animate opening/closing
  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`} aria-hidden={!open}>
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-200" onClick={onClose} />

      <div
        className={`absolute left-0 top-0 w-3/4 max-w-xs h-full bg-[#0F2557] text-white p-4 transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="font-bold text-lg">HR SARTHI</div>
          <button onClick={onClose} className="p-2">
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab(item.id); onClose(); } }}
              className={`w-full text-left px-3 py-3 rounded ${activeTab === item.id ? 'bg-[#4169E1]' : 'hover:bg-[#1a3a7a]'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
