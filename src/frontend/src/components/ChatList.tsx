import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import type { Contact, Group } from "../types/chat";
import { CreateGroupModal } from "./CreateGroupModal";

interface ChatListProps {
  contacts: Contact[];
  groups: Group[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
}

type ListItem =
  | { kind: "contact"; data: Contact }
  | { kind: "group"; data: Group };

export function ChatList({
  contacts,
  groups,
  selectedContactId,
  onSelectContact,
  onCreateGroup,
}: ChatListProps) {
  const [search, setSearch] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const allItems: ListItem[] = [
    ...groups.map((g): ListItem => ({ kind: "group", data: g })),
    ...contacts.map((c): ListItem => ({ kind: "contact", data: c })),
  ];

  const filtered = allItems.filter((item) => {
    const name = item.data.name.toLowerCase();
    const msg = item.data.lastMessage.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  return (
    <>
      <div
        className="flex flex-col w-full md:w-72 flex-shrink-0 h-full"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Messages</h2>
            <button
              type="button"
              onClick={() => setGroupModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: "oklch(0.6 0.22 290 / 0.15)",
                border: "1px solid oklch(0.6 0.22 290 / 0.35)",
                color: "oklch(0.78 0.16 290)",
              }}
              data-ocid="group.open_modal_button"
            >
              <Users className="w-3.5 h-3.5" />
              New Group
            </button>
          </div>
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

        {/* List */}
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
            {filtered.map((item, idx) => {
              const id = item.data.id;
              const isSelected = selectedContactId === id;
              const isGroup = item.kind === "group";
              const contact = isGroup ? null : (item.data as Contact);
              const group = isGroup ? (item.data as Group) : null;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectContact(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left relative ${
                    isSelected ? "border-r-2" : "hover:bg-white/[0.05]"
                  }`}
                  style={
                    isSelected
                      ? {
                          background:
                            "linear-gradient(90deg, oklch(0.65 0.25 240 / 0.12), oklch(0.65 0.25 240 / 0.05))",
                          borderRightColor: "oklch(0.65 0.25 240)",
                        }
                      : {}
                  }
                  data-ocid={`chat.item.${idx + 1}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-11 h-11">
                      <AvatarFallback
                        className="text-white text-sm font-semibold"
                        style={{
                          background: isGroup
                            ? (group?.avatarColor ?? "oklch(0.6 0.22 290)")
                            : contact?.avatarColor,
                        }}
                      >
                        {isGroup ? (
                          <Users className="w-5 h-5 text-white" />
                        ) : (
                          contact?.initials
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {!isGroup && contact?.isOnline && (
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                        style={{
                          background: "oklch(0.72 0.2 142)",
                          boxShadow: "0 0 6px oklch(0.72 0.2 142 / 0.9)",
                          border: "2px solid oklch(0.08 0.02 258)",
                        }}
                      />
                    )}
                    {isGroup && (
                      <span
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{
                          background: "oklch(0.6 0.22 290)",
                          border: "2px solid oklch(0.08 0.02 258)",
                        }}
                      >
                        <Users className="w-2 h-2 text-white" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {item.data.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">
                        {item.data.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {item.data.lastMessage}
                      </p>
                      {item.data.unreadCount > 0 && (
                        <Badge
                          className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
                          style={{
                            background: "oklch(0.65 0.25 240)",
                            color: "white",
                            boxShadow: "0 0 8px oklch(0.65 0.25 240 / 0.5)",
                          }}
                        >
                          {item.data.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <CreateGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        contacts={contacts}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
}
