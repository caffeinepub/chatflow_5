import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Contact } from "../types/chat";

interface ChatListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
}

export function ChatList({
  contacts,
  selectedContactId,
  onSelectContact,
}: ChatListProps) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="flex flex-col w-72 flex-shrink-0"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-base font-bold text-foreground mb-3">Messages</h2>
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl glass-input h-9"
            data-ocid="chat.search_input"
          />
        </div>
      </div>

      {/* Contact list */}
      <ScrollArea className="flex-1 chat-scroll">
        <div className="py-1">
          {filtered.length === 0 && (
            <div
              className="text-center text-sm text-muted-foreground py-8"
              data-ocid="chat.empty_state"
            >
              No chats found.
            </div>
          )}
          {filtered.map((contact, idx) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => onSelectContact(contact.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left relative ${
                selectedContactId === contact.id
                  ? "border-r-2"
                  : "hover:bg-white/[0.05]"
              }`}
              style={
                selectedContactId === contact.id
                  ? {
                      background:
                        "linear-gradient(90deg, oklch(0.65 0.25 240 / 0.12), oklch(0.65 0.25 240 / 0.05))",
                      borderRightColor: "oklch(0.65 0.25 240)",
                    }
                  : {}
              }
              data-ocid={`chat.item.${idx + 1}`}
            >
              {/* Avatar with online dot */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11">
                  <AvatarFallback
                    className="text-white text-sm font-semibold"
                    style={{ background: contact.avatarColor }}
                  >
                    {contact.initials}
                  </AvatarFallback>
                </Avatar>
                {contact.isOnline && (
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                    style={{
                      background: "oklch(0.72 0.2 142)",
                      boxShadow: "0 0 6px oklch(0.72 0.2 142 / 0.9)",
                      border: "2px solid oklch(0.08 0.02 258)",
                    }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {contact.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">
                    {contact.lastMessageTime}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {contact.lastMessage}
                  </p>
                  {contact.unreadCount > 0 && (
                    <Badge
                      className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
                      style={{
                        background: "oklch(0.65 0.25 240)",
                        color: "white",
                        boxShadow: "0 0 8px oklch(0.65 0.25 240 / 0.5)",
                      }}
                      data-ocid={`chat.item.${idx + 1}`}
                    >
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
