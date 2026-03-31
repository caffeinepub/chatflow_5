import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
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
  "oklch(0.52 0.22 230)",
  "oklch(0.52 0.22 280)",
  "oklch(0.52 0.22 160)",
  "oklch(0.52 0.22 30)",
  "oklch(0.52 0.22 320)",
  "oklch(0.52 0.22 60)",
];

const CONTACTS_KEY = "chatflow_contacts";

function getSavedContacts(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CONTACTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveContactLocally(uname: string) {
  const existing = getSavedContacts();
  if (!existing.includes(uname)) {
    existing.push(uname);
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(existing));
    } catch {}
  }
}

function bigintToTimeString(ns: bigint): string {
  try {
    const ms = Number(ns / 1_000_000n);
    return new Date(ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatLayout({ username, onLogout }: ChatLayoutProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chats");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const { actor } = useActor();

  useEffect(() => {
    if (!actor || !username) return;
    actor.registerUser(username, username).catch(() => {});
  }, [actor, username]);

  useEffect(() => {
    if (!actor || !username) return;

    async function loadContacts() {
      try {
        if (!actor) return;
        const conversations = await actor.listConversationsForUser(username);
        const backendUsernames = conversations.map((c) => c.otherUsername);
        const localUsernames = getSavedContacts();
        const allUsernames = Array.from(
          new Set([...backendUsernames, ...localUsernames]),
        );

        setContacts((prev) => {
          const existingNames = new Set(prev.map((c) => c.name.toLowerCase()));
          const newContacts: Contact[] = [];
          let colorIdx = prev.length;

          for (const uname of allUsernames) {
            if (existingNames.has(uname.toLowerCase())) continue;
            const initials = uname.slice(0, 2).toUpperCase();
            const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
            colorIdx++;
            const conv = conversations.find((c) => c.otherUsername === uname);
            newContacts.push({
              id: `user-${uname}`,
              name: uname,
              initials,
              avatarColor: color,
              lastMessage: conv?.lastMessage ?? "",
              lastMessageTime: conv?.lastMessageTime
                ? bigintToTimeString(conv.lastMessageTime)
                : "",
              unreadCount: conv ? Number(conv.unreadCount) : 0,
              isOnline: false,
              bio: "",
              mediaThumbColors: [],
            });
          }

          return newContacts.length > 0 ? [...newContacts, ...prev] : prev;
        });
      } catch {
        // silently fail
      }
    }

    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, username]);

  // Poll messages for active chat every 3 seconds
  useEffect(() => {
    if (!actor || !username || !selectedContactId) return;
    if (!selectedContactId.startsWith("user-")) return;

    const contactUsername = selectedContactId.replace(/^user-/, "");

    async function pollMessages() {
      try {
        if (!actor) return;
        const backendMsgs = await actor.getMessagesInConversation(
          username,
          contactUsername,
        );
        const converted: Message[] = backendMsgs.map((m, i) => ({
          id: `backend-${m.timestamp}-${i}`,
          contactId: selectedContactId as string,
          text: m.text,
          timestamp: bigintToTimeString(m.timestamp),
          isOutgoing: m.senderUsername === username,
          type: "text" as const,
          readStatus: "read" as const,
        }));
        setMessages((prev) => [
          ...prev.filter((m) => m.contactId !== selectedContactId),
          ...converted,
        ]);
      } catch {
        // silently fail
      }
    }

    pollMessages();
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [actor, username, selectedContactId]);

  // Poll conversations every 5 seconds to update lastMessage/unreadCount
  useEffect(() => {
    if (!actor || !username) return;

    const interval = setInterval(async () => {
      try {
        if (!actor) return;
        const conversations = await actor.listConversationsForUser(username);
        setContacts((prev) =>
          prev.map((c) => {
            const conv = conversations.find(
              (cv) => cv.otherUsername.toLowerCase() === c.name.toLowerCase(),
            );
            if (!conv) return c;
            return {
              ...c,
              lastMessage: conv.lastMessage,
              lastMessageTime: bigintToTimeString(conv.lastMessageTime),
              unreadCount:
                c.id === selectedContactId ? 0 : Number(conv.unreadCount),
            };
          }),
        );
      } catch {
        // silently fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [actor, username, selectedContactId]);

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

    // Load messages from backend when selecting a real user contact
    if (!id.startsWith("group-") && actor) {
      const contactUsername = id.replace(/^user-/, "");
      actor
        .getMessagesInConversation(username, contactUsername)
        .then((backendMsgs) => {
          const converted: Message[] = backendMsgs.map((m, i) => ({
            id: `backend-${m.timestamp}-${i}`,
            contactId: id,
            text: m.text,
            timestamp: bigintToTimeString(m.timestamp),
            isOutgoing: m.senderUsername === username,
            type: "text" as const,
            readStatus: "read" as const,
          }));
          setMessages((prev) => [
            ...prev.filter((msg) => msg.contactId !== id),
            ...converted,
          ]);
        })
        .catch(() => {});
    }
  }

  function handleStartChat(newUsername: string) {
    const contactId = `user-${newUsername}`;

    setContacts((prev) => {
      if (prev.some((c) => c.id === contactId)) return prev;
      const color = AVATAR_COLORS[prev.length % AVATAR_COLORS.length];
      const newContact: Contact = {
        id: contactId,
        name: newUsername,
        initials: newUsername.slice(0, 2).toUpperCase(),
        avatarColor: color,
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
        isOnline: false,
        bio: "",
        mediaThumbColors: [],
      };
      return [newContact, ...prev];
    });

    saveContactLocally(newUsername);

    if (actor) {
      (actor as any).addContact?.(username, newUsername)?.catch?.(() => {});
    }

    handleSelectContact(contactId);
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
      // Persist to backend (fire and forget)
      if (actor) {
        const recipientUsername = selectedContactId.replace(/^user-/, "");
        actor.sendMessage(username, recipientUsername, text).catch(() => {});
      }
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
      avatarColor: "oklch(0.52 0.22 290)",
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
    <div className="h-screen flex flex-col relative overflow-hidden bg-black md:items-center md:justify-center md:p-4">
      {/* Main app container */}
      <div
        className="w-full flex flex-col flex-1 overflow-hidden md:rounded-2xl md:max-w-6xl"
        style={{
          height: "100%",
          background: "#111111",
          border: "1px solid #333",
          boxShadow: "0 4px 48px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        {/* App header */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 sm:gap-4 sm:px-5 sm:py-3"
          style={{
            background: "#0d0d0d",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 250))",
              }}
            >
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              ChatFlow
            </span>
          </div>

          <div className="flex-1 text-center min-w-0">
            <span className="text-sm font-semibold text-gray-400 truncate block">
              {showSettings
                ? "Profile Settings"
                : windowContact
                  ? windowContact.name
                  : "Select a chat"}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 sm:gap-2">
            <button
              type="button"
              className="hidden sm:flex p-2 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative hidden sm:block">
              <button
                type="button"
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
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
              style={{ borderLeft: "1px solid #333" }}
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback
                  className="font-semibold text-xs text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 250))",
                  }}
                >
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-gray-300 hidden sm:block">
                {username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
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

          {/* Chat List */}
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
              onStartChat={handleStartChat}
            />
          </div>

          {/* Right panel */}
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
      <p className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
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
