import { motion, AnimatePresence } from "framer-motion";
import { Heart, ListMusic, Music, X } from "lucide-react";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  { 
    id: 1, 
    type: "release", 
    title: "New Release from The Weeknd", 
    time: "2h ago", 
    icon: Music, 
    unread: true 
  },
  { 
    id: 2, 
    type: "like", 
    title: "Someone liked your playlist \"Midnight Drive\"", 
    time: "5h ago", 
    icon: Heart, 
    unread: false 
  },
  { 
    id: 3, 
    type: "playlist", 
    title: "New tracks added to Chill Vibes", 
    time: "1d ago", 
    icon: ListMusic, 
    unread: false 
  }
];

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible background click interceptor */}
          <div 
            className="absolute inset-0 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute top-[72px] right-4 z-[70] w-[340px] bg-black/50 backdrop-blur-3xl border border-white/[0.12] rounded-[24px] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] shadow-black/50 overflow-hidden"
          >
            {/* Subtle glass reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none z-10" />
            
            <div className="flex items-center justify-between mb-4 relative z-20">
              <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff 0%, rgba(200,200,220,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} className="pl-1">
                Notifications
              </h3>
              <button 
                onClick={onClose}
                className="text-white/40 hover:text-white transition-all p-1.5 rounded-full hover:bg-white/10 active:scale-95"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex flex-col gap-1 relative z-20">
              {notifications.map((notif, idx) => {
                const Icon = notif.icon;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                    key={notif.id} 
                    className="flex gap-4 p-3 rounded-[18px] hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group relative items-start"
                  >
                    {/* Unread Indicator */}
                    {notif.unread && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white/80 rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                    )}

                    {/* Minimal Icon Frame */}
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.unread ? 'bg-white/10' : 'bg-white/5'} border border-white/[0.08] transition-all group-hover:scale-105 duration-300 ml-1`}>
                      <Icon size={16} className={notif.unread ? 'text-white' : 'text-white/40'} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
                      <div className={`text-[12px] font-semibold tracking-tight ${notif.unread ? 'text-white drop-shadow-sm' : 'text-white/60'} group-hover:text-white transition-colors line-clamp-2 leading-snug`}>
                        {notif.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-white/40 font-medium tracking-wide">{notif.time}</span>
                        {notif.unread && (
                          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            <span className="text-[8px] text-white font-bold uppercase tracking-[0.2em] leading-none mt-[1px]">New</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
