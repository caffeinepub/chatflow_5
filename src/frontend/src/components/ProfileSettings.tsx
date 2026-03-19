import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

function loadProfile(username: string): ProfileData {
  try {
    const raw = localStorage.getItem(`chatflow_profile_${username}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { displayName: username, bio: "", avatarUrl: "" };
}

interface ProfileSettingsProps {
  username: string;
}

export function ProfileSettings({ username }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<ProfileData>(() =>
    loadProfile(username),
  );
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setProfile((prev) => ({ ...prev, avatarUrl: url }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    setIsSaving(true);
    try {
      localStorage.setItem(
        `chatflow_profile_${username}`,
        JSON.stringify(profile),
      );
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = (profile.displayName || username).slice(0, 2).toUpperCase();
  const bioLength = profile.bio.length;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      data-ocid="settings.panel"
    >
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-1">
          Profile Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Customize how others see you on ChatFlow.
        </p>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            className="relative group cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change profile picture"
            data-ocid="profile.upload_button"
          >
            <Avatar className="w-24 h-24">
              {profile.avatarUrl && (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                />
              )}
              <AvatarFallback
                className="text-white text-2xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.25 240 / 0.8), oklch(0.55 0.28 250 / 0.8))",
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Camera overlay */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <span
            className="mt-3 text-xs font-semibold"
            style={{ color: "oklch(0.72 0.18 240)" }}
          >
            Upload Photo
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            data-ocid="profile.dropzone"
          />
        </div>

        {/* Display Name */}
        <div className="mb-5">
          <Label
            htmlFor="displayName"
            className="text-sm font-semibold text-foreground mb-1.5 block"
          >
            Display Name
          </Label>
          <Input
            id="displayName"
            value={profile.displayName}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, displayName: e.target.value }))
            }
            placeholder="Your display name"
            className="glass-input"
            data-ocid="profile.input"
          />
        </div>

        {/* Bio / Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1.5">
            <Label
              htmlFor="bio"
              className="text-sm font-semibold text-foreground"
            >
              Bio / Status
            </Label>
            <span
              className="text-xs"
              style={{
                color:
                  bioLength > 110
                    ? "oklch(0.72 0.2 30)"
                    : "oklch(0.55 0.04 258)",
              }}
            >
              {bioLength}/120
            </span>
          </div>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => {
              if (e.target.value.length <= 120) {
                setProfile((prev) => ({ ...prev, bio: e.target.value }));
              }
            }}
            placeholder="What's on your mind?"
            rows={3}
            className="glass-input resize-none"
            data-ocid="profile.textarea"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.25 240), oklch(0.55 0.28 250))",
            color: "white",
            boxShadow: "0 0 20px oklch(0.65 0.25 240 / 0.35)",
          }}
          data-ocid="profile.save_button"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving…" : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
