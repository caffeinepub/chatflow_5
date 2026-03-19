# ChatFlow

## Current State
ChatList search bar filters only existing contacts/groups. Settings tab renders nothing. No profile management. Accounts in localStorage chatflow_accounts.

## Requested Changes (Diff)

### Add
- User search against registered localStorage accounts showing non-contacts with Add button
- ProfileSettings: upload picture, change display name, update bio, persisted in localStorage

### Modify
- ChatList: add currentUsername + onAddUser props, extend search to registered users
- ChatLayout: wire new props, show ProfileSettings when settings tab active
- Contact type: add optional avatarUrl field

### Remove
- Nothing

## Implementation Plan
1. Update Contact type with avatarUrl
2. Create ProfileSettings component
3. Update ChatList for user search + add
4. Update ChatLayout to wire everything
