import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircle, Settings, Users } from "lucide-react";
import type { ActiveTab } from "../types/chat";

interface IconRailProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  username: string;
}

const navItems: { tab: ActiveTab; icon: React.ReactNode; label: string }[] = [
  { tab: "chats", icon: <MessageCircle className="w-5 h-5" />, label: "Chats" },
  { tab: "contacts", icon: <Users className="w-5 h-5" />, label: "Contacts" },
  {
    tab: "settings",
    icon: <Settings className="w-5 h-5" />,
    label: "Settings",
  },
];

export function IconRail({ activeTab, onTabChange, username }: IconRailProps) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="hidden md:flex flex-col items-center w-14 py-4 gap-2 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.25 240), oklch(0.55 0.28 250))",
          }}
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(({ tab, icon, label }) => (
            <Tooltip key={tab}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    activeTab === tab
                      ? "text-white neon-glow-sm"
                      : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                  style={
                    activeTab === tab
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.25 240 / 0.8), oklch(0.55 0.28 250 / 0.8))",
                        }
                      : {}
                  }
                  data-ocid={`nav.${tab}.tab`}
                >
                  {icon}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="glass-card text-foreground border-white/10"
              >
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* User avatar at bottom */}
        <Avatar className="w-8 h-8 text-xs">
          <AvatarFallback
            className="font-semibold text-xs text-white"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.25 240 / 0.5), oklch(0.55 0.28 250 / 0.5))",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </TooltipProvider>
  );
}
