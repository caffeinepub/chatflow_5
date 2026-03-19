import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import type { Contact } from "../types/chat";

interface ContactInfoProps {
  contact: Contact | null;
  onClose?: () => void;
}

export function ContactInfo({ contact, onClose }: ContactInfoProps) {
  if (!contact) {
    return (
      <div
        className="hidden xl:flex w-64 flex-col items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-sm text-muted-foreground">Select a contact</p>
      </div>
    );
  }

  return (
    <div
      className="hidden xl:flex w-64 flex-col flex-shrink-0"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="text-sm font-semibold text-foreground">
          Contact Info
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
            data-ocid="contact.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1 chat-scroll">
        <div className="flex flex-col items-center px-4 pt-6 pb-4">
          {/* Avatar */}
          <div className="relative mb-3">
            <Avatar className="w-20 h-20">
              <AvatarFallback
                className="text-white text-2xl font-bold"
                style={{ background: contact.avatarColor }}
              >
                {contact.initials}
              </AvatarFallback>
            </Avatar>
            {contact.isOnline && (
              <span
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full"
                style={{
                  background: "oklch(0.72 0.2 142)",
                  boxShadow: "0 0 8px oklch(0.72 0.2 142 / 0.9)",
                  border: "2px solid oklch(0.08 0.02 258)",
                }}
              />
            )}
          </div>

          {/* Name & status */}
          <h3 className="text-base font-bold text-foreground text-center">
            {contact.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            {contact.isOnline ? (
              <>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "oklch(0.72 0.2 142)",
                    boxShadow: "0 0 5px oklch(0.72 0.2 142 / 0.9)",
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

          {/* Bio */}
          <div className="w-full mt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              About
            </p>
            <p
              className="text-sm text-foreground/80 leading-relaxed p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {contact.bio}
            </p>
          </div>

          {/* Media grid */}
          <div className="w-full mt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Media
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {contact.mediaThumbColors.map((color, i) => (
                <div
                  key={`${contact.id}-media-${i}`}
                  className="aspect-square rounded-lg"
                  style={{
                    background: color,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
