import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, MessageSquare, Search } from "lucide-react";
import { useState } from "react";
import {
  contacts as initialContacts,
  messages as initialMessages,
} from "../data/mockData";
import type { ActiveTab, Contact, Message } from "../types/chat";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { ContactInfo } from "./ContactInfo";
import { IconRail } from "./IconRail";

interface ChatLayoutProps {
  username: string;
  onLogout: () => void;
}

export function ChatLayout({ username, onLogout }: ChatLayoutProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chats");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    "1",
  );

  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) ?? null;
  const chatMessages = messages.filter(
    (m) => m.contactId === selectedContactId,
  );

  const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  function handleSelectContact(id: string) {
    setSelectedContactId(id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    );
  }

  function handleSendMessage(text: string) {
    if (!selectedContactId) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      contactId: selectedContactId,
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOutgoing: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, lastMessage: text, lastMessageTime: newMsg.timestamp }
          : c,
      ),
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial neon glow behind container */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.65 0.25 240 / 0.07) 0%, transparent 65%)",
        }}
      />

      {/* Main app container */}
      <div
        className="w-full max-w-6xl rounded-2xl overflow-hidden flex flex-col animate-neon-pulse"
        style={{
          height: "calc(100vh - 2rem)",
          maxHeight: "800px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 80px oklch(0.65 0.25 240 / 0.15), 0 8px 48px rgba(0,0,0,0.7)",
        }}
      >
        {/* App header */}
        <div
          className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.25 240), oklch(0.55 0.28 250))",
              }}
            >
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-sm tracking-tight">
              ChatFlow
            </span>
          </div>

          {/* Center label */}
          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-muted-foreground">
              {selectedContact ? selectedContact.name : "Chat Window"}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
            <button
              type="button"
              className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              {totalUnread > 0 && (
                <Badge className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <div
              className="flex items-center gap-2 pl-2"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback
                  className="font-semibold text-xs text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.25 240 / 0.6), oklch(0.55 0.28 250 / 0.6))",
                  }}
                >
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-foreground hidden sm:block">
                {username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                title="Logout"
                data-ocid="nav.button"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          className="flex min-h-0 flex-1"
          style={{ height: "calc(100% - 53px)" }}
        >
          <IconRail
            activeTab={activeTab}
            onTabChange={setActiveTab}
            username={username}
          />
          <ChatList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
          />
          <ChatWindow
            contact={selectedContact}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
          <ContactInfo contact={selectedContact} />
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-primary"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
