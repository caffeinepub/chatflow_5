import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AuthResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "error";
    error: string;
};
export interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    registerUser(username: string, displayName: string): Promise<{__kind__: "ok"; ok: null} | {__kind__: "err"; err: string}>;
    findUsersByPrefix(prefix: string): Promise<Array<string>>;
    addContact(callerUsername: string, targetUsername: string): Promise<{__kind__: "ok"; ok: null} | {__kind__: "err"; err: string}>;
    listConversationsForUser(username: string): Promise<Array<{otherUsername: string; lastMessage: string; lastMessageTime: bigint; unreadCount: bigint}>>;
    sendMessage(sender: string, recipient: string, text: string): Promise<{__kind__: "ok"; ok: null} | {__kind__: "err"; err: string}>;
    getMessagesInConversation(user1: string, user2: string): Promise<Array<{text: string; senderUsername: string; timestamp: bigint}>>;
    markConversationRead(username: string, otherUsername: string): Promise<void>;
}
