import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import { useState } from "react";
import type { Contact } from "../types/chat";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  contacts: Contact[];
  onCreateGroup: (name: string, memberIds: string[]) => void;
}

export function CreateGroupModal({
  open,
  onClose,
  contacts,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleMember(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleCreate() {
    if (!groupName.trim() || selectedIds.length === 0) return;
    onCreateGroup(groupName.trim(), selectedIds);
    setGroupName("");
    setSelectedIds([]);
    onClose();
  }

  const canCreate = groupName.trim().length > 0 && selectedIds.length >= 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm rounded-2xl border p-0 overflow-hidden"
        style={{
          background: "rgba(12,14,28,0.95)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 0 60px oklch(0.65 0.25 240 / 0.15), 0 8px 40px rgba(0,0,0,0.8)",
        }}
        data-ocid="group.dialog"
      >
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "oklch(0.6 0.22 290 / 0.25)",
                border: "1px solid oklch(0.6 0.22 290 / 0.4)",
              }}
            >
              <Users
                className="w-4 h-4"
                style={{ color: "oklch(0.75 0.18 290)" }}
              />
            </div>
            New Group
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-2">
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
            GROUP NAME
          </p>
          <input
            id="group-name-input"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Project Team, Friends..."
            className="w-full rounded-xl px-3 py-2.5 text-sm glass-input"
            maxLength={50}
            data-ocid="group.input"
          />
        </div>

        <div className="px-5 pb-2">
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
            ADD MEMBERS ({selectedIds.length} selected)
          </p>
        </div>

        <ScrollArea className="max-h-52 chat-scroll">
          <div className="px-5 pb-3 flex flex-col gap-1">
            {contacts.map((contact) => {
              const checked = selectedIds.includes(contact.id);
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => toggleMember(contact.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left w-full"
                  style={{
                    background: checked
                      ? "oklch(0.65 0.25 240 / 0.1)"
                      : "transparent",
                    border: checked
                      ? "1px solid oklch(0.65 0.25 240 / 0.3)"
                      : "1px solid transparent",
                  }}
                  data-ocid="group.checkbox"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleMember(contact.id)}
                    className="flex-shrink-0"
                    style={{
                      borderColor: checked ? "oklch(0.65 0.25 240)" : undefined,
                      background: checked ? "oklch(0.65 0.25 240)" : undefined,
                    }}
                  />
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className="text-white text-xs font-semibold"
                      style={{ background: contact.avatarColor }}
                    >
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.bio.slice(0, 40)}...
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10"
              data-ocid="group.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate}
              className="flex-1 rounded-xl text-white font-semibold disabled:opacity-40"
              style={{
                background: canCreate
                  ? "linear-gradient(135deg, oklch(0.65 0.25 240), oklch(0.60 0.27 250))"
                  : undefined,
                border: "none",
              }}
              data-ocid="group.confirm_button"
            >
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
