export interface Contact {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  bio: string;
  mediaThumbColors: string[];
}

export interface Message {
  id: string;
  contactId: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
}

export type ActiveTab = "chats" | "contacts" | "settings";
