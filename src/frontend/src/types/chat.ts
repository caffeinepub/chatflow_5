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
  type?: "text" | "voice" | "file";
  readStatus?: "sent" | "read";
  reactions?: { emoji: string; count: number; reactedByMe: boolean }[];
  audioUrl?: string;
  audioDuration?: number;
  fileAttachment?: { name: string; size: string; fileType: string };
}

export interface Group {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  members: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export type ActiveTab = "chats" | "contacts" | "settings";
