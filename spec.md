# ChatFlow

## Current State
ChatFlow is a professional real-time messaging app with Dark Glassmorphism UI. It has:
- Login/register with localStorage persistence
- 6 pre-loaded contacts in a scrollable chat list
- Chat window with emoji picker, message sending, timestamps
- Full mobile responsiveness (list/chat toggle)
- Icon rail (desktop), ContactInfo panel (large screens)
- No group chats, no voice messages, no file sharing, no reactions, no read receipts

## Requested Changes (Diff)

### Add
- **Group Chat**: "New Group" button in ChatList header. Modal/dialog to enter group name and select multiple registered users to add. Groups appear in the chat list alongside contacts with a group icon indicator.
- **Voice Messages**: Mic icon in the composer. Press-and-hold (or toggle) to record audio using Web Audio API / MediaRecorder. Recorded voice messages appear as a playable audio bubble in the chat with a waveform/duration indicator.
- **File Sharing**: Functional Paperclip button to open a file picker (PDF, DOCX, etc). Shared files appear as a styled file attachment bubble in the chat (filename + size + file type icon).
- **Emoji Reactions**: Hovering/long-pressing a message shows a reaction picker with 6 common emoji options. Selected reactions appear below messages grouped by emoji with counts.
- **Read Receipts**: Outgoing messages show double tick icons. Yellow double ticks = message read. Single grey tick = sent. Messages are marked as read when the recipient's chat is opened.
- **Message type updates**: Extend Message type to support: text, voice, file attachment subtypes. Add reactions array and readStatus field.

### Modify
- `types/chat.ts`: Extend Message interface with `type`, `reactions`, `readStatus`, `audioUrl/audioDuration`, `fileAttachment` fields. Add Group type extending Contact.
- `data/mockData.ts`: Update messages to include `readStatus` and `type` fields.
- `ChatLayout.tsx`: Add group creation logic, pass groups to ChatList, handle group messaging.
- `ChatList.tsx`: Show groups mixed with contacts, add "New Group" button that opens CreateGroupModal.
- `ChatWindow.tsx`: Add voice recording UI (mic button with recording state), file upload handler, reaction picker on hover, double tick read receipt indicator next to timestamp.

### Remove
- Nothing removed

## Implementation Plan
1. Update `types/chat.ts` with extended Message, Group interfaces
2. Create `CreateGroupModal.tsx` - dialog with group name input + multi-select of contacts
3. Update `ChatList.tsx` - add "New Group" button, render group items with group icon
4. Update `ChatWindow.tsx`:
   - Voice recording using MediaRecorder API (mic button, recording state, audio playback bubble)
   - File sharing via input[type=file] (file bubble with icon, name, size)
   - Emoji reaction picker on message hover (6 emoji options, reaction counts below message)
   - Read receipt double ticks (grey=sent, yellow=read) shown at message timestamp
5. Update `ChatLayout.tsx` with group state management
6. Update `data/mockData.ts` with readStatus on existing messages
