import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  FileText,
  MessageCircle,
  Mic,
  MoreVertical,
  Paperclip,
  Pause,
  Phone,
  Play,
  Search,
  Send,
  Square,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Contact, Message } from "../types/chat";
import { EmojiPickerPopover } from "./EmojiPickerPopover";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
const WAVEFORM_BARS = [
  3, 5, 8, 6, 10, 7, 4, 9, 6, 5, 8, 4, 7, 5, 9, 6, 4, 8, 5, 7,
];

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendVoice?: (audioUrl: string, duration: number) => void;
  onSendFile?: (file: File) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  onBack?: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VoiceBubble({
  msg,
  isOutgoing,
}: { msg: Message; isOutgoing: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function togglePlay() {
    if (!msg.audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(msg.audioUrl);
      audioRef.current.ontimeupdate = () => {
        const dur = audioRef.current?.duration ?? 0;
        const cur = audioRef.current?.currentTime ?? 0;
        if (dur > 0) setProgress((cur / dur) * 100);
      };
      audioRef.current.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-2.5 min-w-[160px] max-w-[220px]">
      <button
        type="button"
        onClick={togglePlay}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: isOutgoing
            ? "rgba(255,255,255,0.2)"
            : "oklch(0.65 0.25 240 / 0.3)",
        }}
      >
        {playing ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white" />
        )}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-end gap-0.5 h-6">
          {WAVEFORM_BARS.map((h, i) => (
            <div
              key={`bar-${i}-${h}`}
              className="w-0.5 rounded-full flex-shrink-0 transition-all"
              style={{
                height: `${h * 2}px`,
                background:
                  progress > (i / WAVEFORM_BARS.length) * 100
                    ? isOutgoing
                      ? "rgba(255,255,255,0.9)"
                      : "oklch(0.65 0.25 240)"
                    : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
        <span className="text-[10px] opacity-60">
          {formatDuration(msg.audioDuration ?? 0)}
        </span>
      </div>
      <Mic className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
    </div>
  );
}

function FileBubble({ msg }: { msg: Message }) {
  const ext = msg.fileAttachment?.fileType ?? "FILE";
  return (
    <div className="flex items-center gap-3 min-w-[180px] max-w-[240px] px-1 py-0.5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: "oklch(0.65 0.25 240 / 0.25)",
          border: "1px solid oklch(0.65 0.25 240 / 0.4)",
        }}
      >
        <FileText
          className="w-5 h-5"
          style={{ color: "oklch(0.75 0.2 240)" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-tight">
          {msg.fileAttachment?.name}
        </p>
        <p className="text-[11px] opacity-50">
          {ext} · {msg.fileAttachment?.size}
        </p>
      </div>
    </div>
  );
}

export function ChatWindow({
  contact,
  messages,
  onSendMessage,
  onSendVoice,
  onSendFile,
  onReactToMessage,
  onBack,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgCount = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: msgCount triggers scroll-to-bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onSendVoice?.(url, recordingSeconds);
        for (const track of stream.getTracks()) {
          track.stop();
        }
        setRecordingSeconds(0);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access denied or unavailable");
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }

  function cancelRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.ondataavailable = null;
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onSendFile?.(file);
    e.target.value = "";
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
      className="flex-1 flex flex-col min-w-0 h-full"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      {/* Chat header */}
      <div
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0 sm:gap-3 sm:px-5 sm:py-3.5"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors mr-1 flex-shrink-0"
            aria-label="Back"
            data-ocid="chat.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative flex-shrink-0">
          <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
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
              <span className="text-xs text-muted-foreground">
                {contact.bio?.includes("members") ? contact.bio : "Offline"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            type="button"
            className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
            aria-label="Search in chat"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
            aria-label="Voice call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
            aria-label="Video call"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 chat-scroll">
        <div className="px-3 py-4 flex flex-col gap-3 sm:px-5">
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
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
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
                  className="flex flex-col gap-1"
                  style={{ maxWidth: "75%" }}
                >
                  {/* Reaction picker on hover */}
                  <AnimatePresence>
                    {hoveredMsgId === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className={`flex items-center gap-0.5 px-2 py-1 rounded-full self-${
                          msg.isOutgoing ? "end" : "start"
                        }`}
                        style={{
                          background: "rgba(0,0,0,0.82)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        data-ocid="chat.popover"
                      >
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onReactToMessage?.(msg.id, emoji)}
                            className="text-base w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      msg.isOutgoing
                        ? "bubble-out rounded-br-sm"
                        : "bubble-in rounded-bl-sm"
                    }`}
                    data-ocid={`chat.item.${idx + 1}`}
                  >
                    {msg.type === "voice" ? (
                      <VoiceBubble msg={msg} isOutgoing={msg.isOutgoing} />
                    ) : msg.type === "file" ? (
                      <FileBubble msg={msg} />
                    ) : (
                      <p className="text-sm leading-relaxed break-words">
                        {msg.text}
                      </p>
                    )}

                    {/* Timestamp + read receipt */}
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        msg.isOutgoing ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className={`text-[10px] ${
                          msg.isOutgoing
                            ? "text-white/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                      {msg.isOutgoing && (
                        <span className="flex-shrink-0">
                          {msg.readStatus === "read" ? (
                            <CheckCheck
                              className="w-3.5 h-3.5"
                              style={{ color: "oklch(0.85 0.18 90)" }}
                            />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-white/40" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      className={`flex flex-wrap gap-1 ${
                        msg.isOutgoing ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          type="button"
                          onClick={() => onReactToMessage?.(msg.id, r.emoji)}
                          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs transition-all"
                          style={{
                            background: r.reactedByMe
                              ? "oklch(0.65 0.25 240 / 0.2)"
                              : "rgba(255,255,255,0.08)",
                            border: r.reactedByMe
                              ? "1px solid oklch(0.65 0.25 240 / 0.5)"
                              : "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          <span>{r.emoji}</span>
                          <span className="text-[10px] text-white/70">
                            {r.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Composer */}
      <div
        className="flex items-center gap-1.5 px-3 py-3 flex-shrink-0 sm:gap-2 sm:px-4"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {isRecording ? (
          <>
            <div className="flex items-center gap-2 flex-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <span className="text-sm text-red-400 font-medium">
                Recording {formatDuration(recordingSeconds)}
              </span>
            </div>
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Cancel recording"
              data-ocid="chat.cancel_button"
            >
              <Square className="w-4 h-4" />
            </button>
            <Button
              type="button"
              size="icon"
              onClick={stopRecording}
              className="rounded-xl w-10 h-10 flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.25 25), oklch(0.50 0.27 15))",
                border: "none",
                color: "white",
              }}
              data-ocid="chat.primary_button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <EmojiPickerPopover onEmojiSelect={handleEmojiSelect} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Attach file"
              data-ocid="chat.upload_button"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-sm glass-input sm:px-4"
              data-ocid="chat.input"
            />
            {input.trim() ? (
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                className="rounded-xl w-10 h-10 flex-shrink-0 shadow-neon-btn"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.25 240), oklch(0.60 0.27 250))",
                  border: "none",
                  color: "white",
                }}
                data-ocid="chat.primary_button"
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "oklch(0.65 0.25 240)",
                }}
                aria-label="Record voice message"
                data-ocid="chat.secondary_button"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
