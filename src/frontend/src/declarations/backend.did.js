/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const ConversationSummary = IDL.Record({
  otherUsername: IDL.Text,
  lastMessage: IDL.Text,
  lastMessageTime: IDL.Int,
  unreadCount: IDL.Nat,
});

const MessageRecord = IDL.Record({
  text: IDL.Text,
  senderUsername: IDL.Text,
  timestamp: IDL.Int,
});

const UserEntry = IDL.Record({
  username: IDL.Text,
  displayName: IDL.Text,
});

const OkErr = IDL.Variant({ ok: IDL.Null, err: IDL.Text });

export const idlService = IDL.Service({
  _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
  registerUser: IDL.Func([IDL.Text, IDL.Text], [OkErr], []),
  getAllUsers: IDL.Func([], [IDL.Vec(UserEntry)], ['query']),
  findUsersByPrefix: IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
  addContact: IDL.Func([IDL.Text, IDL.Text], [OkErr], []),
  sendMessage: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [OkErr], []),
  getMessagesInConversation: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(MessageRecord)], ['query']),
  listConversationsForUser: IDL.Func([IDL.Text], [IDL.Vec(ConversationSummary)], ['query']),
  markConversationRead: IDL.Func([IDL.Text, IDL.Text], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const ConversationSummary = IDL.Record({
    otherUsername: IDL.Text,
    lastMessage: IDL.Text,
    lastMessageTime: IDL.Int,
    unreadCount: IDL.Nat,
  });
  const MessageRecord = IDL.Record({
    text: IDL.Text,
    senderUsername: IDL.Text,
    timestamp: IDL.Int,
  });
  const UserEntry = IDL.Record({
    username: IDL.Text,
    displayName: IDL.Text,
  });
  const OkErr = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  return IDL.Service({
    _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
    registerUser: IDL.Func([IDL.Text, IDL.Text], [OkErr], []),
    getAllUsers: IDL.Func([], [IDL.Vec(UserEntry)], ['query']),
    findUsersByPrefix: IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    addContact: IDL.Func([IDL.Text, IDL.Text], [OkErr], []),
    sendMessage: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [OkErr], []),
    getMessagesInConversation: IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(MessageRecord)], ['query']),
    listConversationsForUser: IDL.Func([IDL.Text], [IDL.Vec(ConversationSummary)], ['query']),
    markConversationRead: IDL.Func([IDL.Text, IDL.Text], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
