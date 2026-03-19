import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { useState } from "react";

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "😢",
  "😡",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "🎉",
  "🙏",
  "💯",
  "😊",
  "😅",
  "🤣",
  "😘",
  "😱",
  "🤩",
  "😴",
  "🤗",
  "😤",
  "👏",
  "🎊",
  "✨",
  "💪",
  "🙌",
  "😏",
];

interface EmojiPickerPopoverProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerPopover({ onEmojiSelect }: EmojiPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(emoji: string) {
    onEmojiSelect(emoji);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
          data-ocid="chat.open_modal_button"
          aria-label="Open emoji picker"
        >
          <Smile className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-3 shadow-popover rounded-2xl border border-border"
        data-ocid="chat.popover"
      >
        <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">
          Emoji
        </p>
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              className="w-8 h-8 text-lg flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
