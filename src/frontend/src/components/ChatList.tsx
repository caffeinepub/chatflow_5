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

interface UserEntry {
  username: string;
  displayName: string;
}

async function fetchAllUsers(actor: any): Promise<UserEntry[]> {
  return actor.getAllUsers() as Promise<UserEntry[]>;
}

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
  const [searchFocused, setSearchFocused] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserEntry[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { actor } = useActor();
  const loadedRef = useRef(false);

  // Load all registered users on mount and when actor becomes available
  useEffect(() => {
    if (!actor || loadedRef.current) return;
    loadedRef.current = true;
    setIsLoadingUsers(true);
    fetchAllUsers(actor)
      .then((users) => setAllUsers(users))
      .catch(() => setAllUsers([]))
      .finally(() => setIsLoadingUsers(false));
  }, [actor]);

  // Refresh user list periodically so newly registered users appear
  useEffect(() => {
    if (!actor) return;
    const interval = setInterval(() => {
      fetchAllUsers(actor)
        .then((users) => setAllUsers(users))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [actor]);

  const allItems: ListItem[] = [
    ...groups.map((g): ListItem => ({ kind: "group", data: g })),
    ...contacts.map((c): ListItem => ({ kind: "contact", data: c })),
  ];

  const filteredConversations = allItems.filter((item) => {
    if (!search.trim()) return true;
    const name = item.data.name.toLowerCase();
    const msg = item.data.lastMessage.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  // People section: all users excluding current user, filtered by search
  const peopleResults = allUsers.filter((u) => {
    if (u.username.toLowerCase() === currentUsername.toLowerCase())
      return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const showPeople = searchFocused || search.trim().length > 0;
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
              placeholder="Search people\u2026"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl glass-input h-9"
              data-ocid="chat.search_input"
            />
            {isLoadingUsers && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-500" />
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 chat-scroll">
          <div className="py-1">
            {/* Conversations */}
            {!search.trim() &&
              filteredConversations.length === 0 &&
              !showPeople && (
                <div
                  className="text-center text-sm text-gray-500 py-6 px-4"
                  data-ocid="chat.empty_state"
                >
                  No chats yet. Tap a person below to start chatting.
                </div>
              )}

            {filteredConversations.map((item, idx) => {
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

            {/* People section \u2014 shown when search bar is focused or has text */}
            {showPeople && (
              <div className="mt-1">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                    People
                  </span>
                  {isLoadingUsers && (
                    <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
                  )}
                </div>

                {peopleResults.length === 0 && !isLoadingUsers && (
                  <div
                    className="text-center text-xs text-gray-600 py-4 px-4"
                    data-ocid="people.empty_state"
                  >
                    {search.trim()
                      ? `No users matching "${search}"`
                      : "No other users registered yet."}
                  </div>
                )}

                {peopleResults.map((user, idx) => {
                  const alreadyAdded = existingContactNames.has(
                    user.displayName.toLowerCase(),
                  );
                  return (
                    <button
                      key={user.username}
                      type="button"
                      onClick={() => {
                        onStartChat(user.username);
                        setSearch("");
                        setSearchFocused(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(255,255,255,0.05)";
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
                          {user.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate block">
                          {user.displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          @{user.username}
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

            {/* Default view: show all registered users when not searching */}
            {!showPeople && (
              <div className="px-4 pt-2">
                <div className="px-4 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    All Users
                  </span>
                </div>

                {isLoadingUsers && (
                  <div
                    className="flex items-center justify-center py-4"
                    data-ocid="allusers.loading_state"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  </div>
                )}

                {!isLoadingUsers &&
                  allUsers.filter(
                    (u) =>
                      u.username.toLowerCase() !==
                      currentUsername.toLowerCase(),
                  ).length === 0 && (
                    <div
                      className="text-center text-xs text-gray-600 py-4"
                      data-ocid="allusers.empty_state"
                    >
                      No other users registered yet.
                    </div>
                  )}

                {allUsers
                  .filter(
                    (u) =>
                      u.username.toLowerCase() !==
                      currentUsername.toLowerCase(),
                  )
                  .map((user, idx) => (
                    <button
                      key={user.username}
                      type="button"
                      onClick={() => onStartChat(user.username)}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 text-left mb-0.5"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(255,255,255,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                      }}
                      data-ocid={`allusers.item.${idx + 1}`}
                    >
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback
                          className="text-white text-xs font-semibold"
                          style={{ background: "oklch(0.45 0.18 200)" }}
                        >
                          {user.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate block">
                          {user.displayName}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          @{user.username}
                        </span>
                      </div>
                      <MessageSquarePlus
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "#444" }}
                      />
                    </button>
                  ))}
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
