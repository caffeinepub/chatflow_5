import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquarePlus, Search, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import type { Contact, Group } from "../types/chat";
import { CreateGroupModal } from "./CreateGroupModal";

interface ChatListProps {
  contacts: Contact[];
  groups: Group[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
  currentUsername: string;
  onStartChat: (username: string) => void;
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
  currentUsername,
  onStartChat,
}: ChatListProps) {
  const [search, setSearch] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { actor } = useActor();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        if (!actor) {
          const raw = localStorage.getItem("chatflow_accounts");
          if (!raw) {
            setSearchResults([]);
            setIsSearching(false);
            return;
          }
          const accounts: Record<string, string> = JSON.parse(raw);
          const q = search.toLowerCase();
          const existingNames = new Set([
            currentUsername.toLowerCase(),
            ...contacts.map((c) => c.name.toLowerCase()),
          ]);
          const results = Object.keys(accounts).filter(
            (u) =>
              u !== currentUsername &&
              !existingNames.has(u.toLowerCase()) &&
              u.toLowerCase().includes(q),
          );
          setSearchResults(results);
        } else {
          const results = await actor.findUsersByPrefix(search.trim());
          const filtered = results.filter(
            (u) => u.toLowerCase() !== currentUsername.toLowerCase(),
          );
          setSearchResults(filtered);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, actor, currentUsername, contacts]);

  const allItems: ListItem[] = [
    ...groups.map((g): ListItem => ({ kind: "group", data: g })),
    ...contacts.map((c): ListItem => ({ kind: "contact", data: c })),
  ];

  const filtered = allItems.filter((item) => {
    if (!search.trim() || searchResults.length > 0) return !search.trim();
    const name = item.data.name.toLowerCase();
    const msg = item.data.lastMessage.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  const existingContactNames = new Set(
    contacts.map((c) => c.name.toLowerCase()),
  );

  return (
    <>
      <div
        className="flex flex-col w-full md:w-72 flex-shrink-0 h-full"
        style={{ background: "#0d0d0d", borderRight: "1px solid #2a2a2a" }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Messages</h2>
            <button
              type="button"
              onClick={() => setGroupModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#c4b5fd",
              }}
              data-ocid="group.open_modal_button"
            >
              <Users className="w-3.5 h-3.5" />
              New Group
            </button>
          </div>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search or find people…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl glass-input h-9"
              data-ocid="chat.search_input"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-500" />
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 chat-scroll">
          <div className="py-1">
            {filtered.length === 0 &&
              searchResults.length === 0 &&
              !isSearching && (
                <div
                  className="text-center text-sm text-gray-500 py-8"
                  data-ocid="chat.empty_state"
                >
                  {search.trim()
                    ? "No users found."
                    : "No chats yet. Search for a user to start chatting."}
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
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left relative"
                  style={{
                    background: isSelected
                      ? "rgba(59,130,246,0.15)"
                      : "transparent",
                    borderRight: isSelected
                      ? "2px solid oklch(0.52 0.22 240)"
                      : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                  }}
                  data-ocid={`chat.item.${idx + 1}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-11 h-11">
                      {!isGroup && contact?.avatarUrl && (
                        <AvatarImage
                          src={contact.avatarUrl}
                          alt={contact.name}
                        />
                      )}
                      <AvatarFallback
                        className="text-white text-sm font-semibold"
                        style={{
                          background: isGroup
                            ? (group?.avatarColor ?? "oklch(0.52 0.22 290)")
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
                          background: "oklch(0.62 0.2 142)",
                          border: "2px solid #0d0d0d",
                        }}
                      />
                    )}
                    {isGroup && (
                      <span
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{
                          background: "oklch(0.52 0.22 290)",
                          border: "2px solid #0d0d0d",
                        }}
                      >
                        <Users className="w-2 h-2 text-white" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white truncate">
                        {item.data.name}
                      </span>
                      <span className="text-[11px] text-gray-500 ml-2 flex-shrink-0">
                        {item.data.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-400 truncate flex-1">
                        {item.data.lastMessage}
                      </p>
                      {item.data.unreadCount > 0 && (
                        <Badge
                          className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
                          style={{
                            background: "oklch(0.52 0.22 240)",
                            color: "white",
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

            {/* People section */}
            {searchResults.length > 0 && (
              <div className="mt-2">
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                    People
                  </span>
                </div>
                {searchResults.map((uname, idx) => {
                  const alreadyAdded = existingContactNames.has(
                    uname.toLowerCase(),
                  );
                  return (
                    <button
                      key={uname}
                      type="button"
                      onClick={() => {
                        onStartChat(uname);
                        setSearch("");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }}
                      data-ocid={`people.item.${idx + 1}`}
                    >
                      <Avatar className="w-11 h-11 flex-shrink-0">
                        <AvatarFallback
                          className="text-white text-sm font-semibold"
                          style={{ background: "oklch(0.52 0.18 200)" }}
                        >
                          {uname.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate block">
                          {uname}
                        </span>
                        <span className="text-xs text-gray-500">
                          {alreadyAdded
                            ? "In your contacts"
                            : "Tap to start chatting"}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
                        style={{
                          background: alreadyAdded
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(59,130,246,0.15)",
                          border: alreadyAdded
                            ? "1px solid rgba(34,197,94,0.35)"
                            : "1px solid rgba(59,130,246,0.35)",
                          color: alreadyAdded ? "#86efac" : "#93c5fd",
                        }}
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        {alreadyAdded ? "Open" : "Chat"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading state */}
            {isSearching && search.trim() && (
              <div
                className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500"
                data-ocid="chat.loading_state"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching users…
              </div>
            )}
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
