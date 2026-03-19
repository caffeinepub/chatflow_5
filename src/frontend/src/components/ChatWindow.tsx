import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Contact, Message } from "../types/chat";
import { EmojiPickerPopover } from "./EmojiPickerPopover";

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function ChatWindow({
  contact,
  messages,
  onSendMessage,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgCount = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: msgCount triggers scroll-to-bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleEmojiSelect(emoji: string) {
    setInput((prev) => prev + emoji);
  }

  if (!contact) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-4"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "oklch(0.65 0.25 240 / 0.12)",
            border: "1px solid oklch(0.65 0.25 240 / 0.3)",
            boxShadow: "0 0 20px oklch(0.65 0.25 240 / 0.15)",
          }}
        >
          <MessageCircle
            className="w-10 h-10"
            style={{ color: "oklch(0.65 0.25 240)" }}
          />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">
            Select a conversation
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Choose from your chats to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col min-w-0"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      {/* Chat header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarFallback
              className="text-white text-sm font-semibold"
              style={{ background: contact.avatarColor }}
            >
              {contact.initials}
            </AvatarFallback>
          </Avatar>
          {contact.isOnline && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
              style={{
                background: "oklch(0.72 0.2 142)",
                boxShadow: "0 0 5px oklch(0.72 0.2 142 / 0.9)",
                border: "2px solid oklch(0.08 0.02 258)",
              }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">
            {contact.name}
          </p>
          <div className="flex items-center gap-1.5">
            {contact.isOnline ? (
              <>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "oklch(0.72 0.2 142)",
                    boxShadow: "0 0 4px oklch(0.72 0.2 142 / 0.9)",
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.72 0.2 142)" }}
                >
                  Online
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Offline</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[
            { icon: <Search className="w-4 h-4" />, label: "Search in chat" },
            { icon: <Phone className="w-4 h-4" />, label: "Voice call" },
            { icon: <Video className="w-4 h-4" />, label: "Video call" },
            {
              icon: <MoreVertical className="w-4 h-4" />,
              label: "More options",
            },
          ].map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              aria-label={label}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 chat-scroll">
        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Date separator */}
          <div className="flex items-center gap-3 my-2">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <span className="text-xs text-muted-foreground font-medium px-2">
              Today
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex items-end gap-2 ${
                  msg.isOutgoing ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!msg.isOutgoing && (
                  <Avatar className="w-7 h-7 flex-shrink-0 mb-1">
                    <AvatarFallback
                      className="text-white text-xs font-semibold"
                      style={{ background: contact.avatarColor }}
                    >
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                    msg.isOutgoing
                      ? "bubble-out rounded-br-sm"
                      : "bubble-in rounded-bl-sm"
                  }`}
                  data-ocid={`chat.item.${idx + 1}`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {msg.text}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.isOutgoing ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <EmojiPickerPopover onEmojiSelect={handleEmojiSelect} />
        <button
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-white/10 transition-colors"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm glass-input min-w-0"
          data-ocid="chat.input"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!input.trim()}
          className="rounded-xl w-10 h-10 flex-shrink-0 shadow-neon-btn disabled:opacity-40 disabled:shadow-none"
          style={{
            background: input.trim()
              ? "linear-gradient(135deg, oklch(0.65 0.25 240), oklch(0.60 0.27 250))"
              : undefined,
            border: "none",
            color: "white",
          }}
          data-ocid="chat.primary_button"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
