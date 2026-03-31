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
        style={{ background: "#0a0a0a", borderRight: "1px solid #222" }}
      >
        {/* Logo */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 250))",
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
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  style={
                    activeTab === tab
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 250))",
                        }
                      : { background: "transparent" }
                  }
                  data-ocid={`nav.${tab}.tab`}
                >
                  {icon}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-gray-800 border border-gray-600 text-gray-100 shadow-md"
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
                "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 250))",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </TooltipProvider>
  );
}
