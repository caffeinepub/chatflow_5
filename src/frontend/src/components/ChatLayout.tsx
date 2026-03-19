import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, MessageSquare, Search } from "lucide-react";
import { useState } from "react";
import {
  contacts as initialContacts,
  messages as initialMessages,
} from "../data/mockData";
import type { ActiveTab, Contact, Group, Message } from "../types/chat";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { ContactInfo } from "./ContactInfo";
import { IconRail } from "./IconRail";
import { ProfileSettings } from "./ProfileSettings";

interface ChatLayoutProps {
  username: string;
  onLogout: () => void;
}

type MobileView = "list" | "chat";

const AVATAR_COLORS = [
  "oklch(0.55 0.22 230)",
  "oklch(0.55 0.22 280)",
  "oklch(0.55 0.22 160)",
  "oklch(0.55 0.22 30)",
  "oklch(0.55 0.22 320)",
  "oklch(0.55 0.22 60)",
];

export function ChatLayout({ username, onLogout }: ChatLayoutProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chats");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    "1",
  );
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const isGroup = selectedContactId?.startsWith("group-") ?? false;
  const selectedContact = isGroup
    ? null
    : (contacts.find((c) => c.id === selectedContactId) ?? null);
  const selectedGroup = isGroup
    ? (groups.find((g) => g.id === selectedContactId) ?? null)
    : null;

  const chatMessages = messages.filter(
    (m) => m.contactId === selectedContactId,
  );
  const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  function handleSelectContact(id: string) {
    setSelectedContactId(id);
    setMessages((prev) =>
      prev.map((m) =>
        m.contactId === id && !m.isOutgoing
          ? { ...m, readStatus: "read" as const }
          : m,
      ),
    );
    if (id.startsWith("group-")) {
      setGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, unreadCount: 0 } : g)),
      );
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
      );
    }
    setMobileView("chat");
    setActiveTab("chats");
  }

  function handleAddUser(newUsername: string) {
    const color = AVATAR_COLORS[contacts.length % AVATAR_COLORS.length];
    const newContact: Contact = {
      id: `user-${Date.now()}`,
      name: newUsername,
      initials: newUsername.slice(0, 2).toUpperCase(),
      avatarColor: color,
      lastMessage: "",
      lastMessageTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unreadCount: 0,
      isOnline: false,
      bio: "",
      mediaThumbColors: [],
    };
    setContacts((prev) => [newContact, ...prev]);
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
      type: "text",
      readStatus: "sent",
    };
    setMessages((prev) => [...prev, newMsg]);
    if (isGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedContactId
            ? { ...g, lastMessage: text, lastMessageTime: newMsg.timestamp }
            : g,
        ),
      );
    } else {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContactId
            ? { ...c, lastMessage: text, lastMessageTime: newMsg.timestamp }
            : c,
        ),
      );
    }
  }

  function handleSendVoice(audioUrl: string, duration: number) {
    if (!selectedContactId) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      contactId: selectedContactId,
      text: "",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOutgoing: true,
      type: "voice",
      readStatus: "sent",
      audioUrl,
      audioDuration: duration,
    };
    setMessages((prev) => [...prev, newMsg]);
    const label = `🎙 Voice message (${duration}s)`;
    if (isGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedContactId
            ? { ...g, lastMessage: label, lastMessageTime: newMsg.timestamp }
            : g,
        ),
      );
    } else {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContactId
            ? { ...c, lastMessage: label, lastMessageTime: newMsg.timestamp }
            : c,
        ),
      );
    }
  }

  function handleSendFile(file: File) {
    if (!selectedContactId) return;
    const sizeKb = Math.round(file.size / 1024);
    const sizeLabel =
      sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      contactId: selectedContactId,
      text: "",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOutgoing: true,
      type: "file",
      readStatus: "sent",
      fileAttachment: { name: file.name, size: sizeLabel, fileType: ext },
    };
    setMessages((prev) => [...prev, newMsg]);
    const label = `📎 ${file.name}`;
    if (isGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedContactId
            ? { ...g, lastMessage: label, lastMessageTime: newMsg.timestamp }
            : g,
        ),
      );
    } else {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContactId
            ? { ...c, lastMessage: label, lastMessageTime: newMsg.timestamp }
            : c,
        ),
      );
    }
  }

  function handleReactToMessage(messageId: string, emoji: string) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions ?? [];
        const idx = existing.findIndex((r) => r.emoji === emoji);
        if (idx === -1) {
          return {
            ...m,
            reactions: [...existing, { emoji, count: 1, reactedByMe: true }],
          };
        }
        const updated = existing
          .map((r, i) => {
            if (i !== idx) return r;
            const toggled = !r.reactedByMe;
            return {
              ...r,
              reactedByMe: toggled,
              count: toggled ? r.count + 1 : Math.max(0, r.count - 1),
            };
          })
          .filter((r) => r.count > 0);
        return { ...m, reactions: updated };
      }),
    );
  }

  function handleCreateGroup(name: string, memberIds: string[]) {
    const initials = name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      initials,
      avatarColor: "oklch(0.6 0.22 290)",
      members: memberIds,
      lastMessage: "Group created",
      lastMessageTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unreadCount: 0,
    };
    setGroups((prev) => [newGroup, ...prev]);
  }

  const windowContact =
    selectedContact ??
    (selectedGroup
      ? ({
          id: selectedGroup.id,
          name: selectedGroup.name,
          initials: selectedGroup.initials,
          avatarColor: selectedGroup.avatarColor,
          isOnline: false,
          bio: `${selectedGroup.members.length} members`,
          lastMessage: selectedGroup.lastMessage,
          lastMessageTime: selectedGroup.lastMessageTime,
          unreadCount: selectedGroup.unreadCount,
          mediaThumbColors: [],
        } satisfies Contact)
      : null);

  const showSettings = activeTab === "settings";

  return (
    <div className="h-screen flex flex-col relative overflow-hidden md:items-center md:justify-center md:p-4">
      {/* Radial neon glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.65 0.25 240 / 0.07) 0%, transparent 65%)",
        }}
      />

      {/* Main app container */}
      <div
        className="w-full flex flex-col flex-1 overflow-hidden md:rounded-2xl md:max-w-6xl md:animate-neon-pulse"
        style={{
          height: "100%",
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
          className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 sm:gap-4 sm:px-5 sm:py-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-2 flex-shrink-0">
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

          <div className="flex-1 text-center min-w-0">
            <span className="text-sm font-semibold text-muted-foreground truncate block">
              {showSettings
                ? "Profile Settings"
                : windowContact
                  ? windowContact.name
                  : "Chat Window"}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 sm:gap-2">
            <button
              type="button"
              className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative hidden sm:block">
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
              className="flex items-center gap-1.5 pl-2 sm:gap-2"
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
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Icon Rail — desktop only */}
          <div className="hidden md:flex">
            <IconRail
              activeTab={activeTab}
              onTabChange={setActiveTab}
              username={username}
            />
          </div>

          {/* Chat List — always visible on desktop; hidden on mobile when in chat view */}
          <div
            className={`${
              mobileView === "list" && !showSettings ? "flex" : "hidden"
            } md:flex flex-col w-full md:w-72 flex-shrink-0`}
          >
            <ChatList
              contacts={contacts}
              groups={groups}
              selectedContactId={selectedContactId}
              onSelectContact={handleSelectContact}
              onCreateGroup={handleCreateGroup}
              currentUsername={username}
              onAddUser={handleAddUser}
            />
          </div>

          {/* Right panel: Settings or Chat Window */}
          {showSettings ? (
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <ProfileSettings username={username} />
            </div>
          ) : (
            <div
              className={`${
                mobileView === "chat" ? "flex" : "hidden"
              } md:flex flex-col flex-1 min-w-0`}
            >
              <ChatWindow
                contact={windowContact}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onSendVoice={handleSendVoice}
                onSendFile={handleSendFile}
                onReactToMessage={handleReactToMessage}
                onBack={() => setMobileView("list")}
              />
            </div>
          )}

          {/* Contact Info — large screens only */}
          {!showSettings && (
            <div className="hidden lg:flex">
              <ContactInfo contact={selectedContact} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
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
