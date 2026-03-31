/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface ConversationSummary {
  otherUsername: string;
  lastMessage: string;
  lastMessageTime: bigint;
  unreadCount: bigint;
}

export interface MessageRecord {
  text: string;
  senderUsername: string;
  timestamp: bigint;
}

export type OkErr = { ok: null } | { err: string };

export interface _SERVICE {
  _initializeAccessControlWithSecret: ActorMethod<[string], undefined>;
  registerUser: ActorMethod<[string, string], OkErr>;
  findUsersByPrefix: ActorMethod<[string], Array<string>>;
  addContact: ActorMethod<[string, string], OkErr>;
  sendMessage: ActorMethod<[string, string, string], OkErr>;
  getMessagesInConversation: ActorMethod<[string, string], Array<MessageRecord>>;
  listConversationsForUser: ActorMethod<[string], Array<ConversationSummary>>;
  markConversationRead: ActorMethod<[string, string], undefined>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
