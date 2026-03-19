import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PasswordHash = string;
export type Time = bigint;
export interface Message {
    text: string;
    senderUsername: string;
    timestamp: Time;
}
export interface ConversationSummary {
    lastMessageTime: Time;
    otherUsername: string;
    lastMessage: string;
    unreadCount: bigint;
}
export type AuthResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "error";
    error: string;
};
export interface UserProfile {
    username: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    findUsersByPrefix(prefix: string): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessagesInConversation(user1: string, user2: string): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listConversationsForUser(username: string): Promise<Array<ConversationSummary>>;
    registerUser(username: string, passwordHash: PasswordHash): Promise<AuthResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(sender: string, recipient: string, text: string): Promise<AuthResult>;
    markConversationRead(username: string, otherUsername: string): Promise<void>;
}
