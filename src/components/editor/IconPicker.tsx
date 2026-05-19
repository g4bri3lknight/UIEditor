"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Categorized Bootstrap Icons
const ICON_CATEGORIES: Record<string, { label: string; icons: string[] }> = {
  "ui": {
    label: "Interfaccia",
    icons: ["house", "house-fill", "gear", "gear-fill", "search", "menu-app", "menu-button", "menu-down", "menu-up", "sliders", "sliders2", "toggle-on", "toggle-off", "fullscreen", "aspect-ratio", "grip-horizontal", "grip-vertical", "layout-sidebar", "layout-split", "layout-three-columns", "columns", "layers", "layer-group", "grid", "grid-fill", "list", "list-ul", "list-ol", "filter", "funnel", "sort-up", "sort-down", "app-indicator", "three-dots", "three-dots-vertical", "more", "dot"],
  },
  "arrows": {
    label: "Frecce",
    icons: ["arrow-right", "arrow-left", "arrow-up", "arrow-down", "arrow-clockwise", "arrow-counterclockwise", "arrow-repeat", "chevron-down", "chevron-up", "chevron-left", "chevron-right", "caret-up", "caret-down", "caret-left", "caret-right", "back", "forward", "rewind", "fast-forward", "skip-forward", "skip-backward", "expand", "collapse"],
  },
  "actions": {
    label: "Azioni",
    icons: ["plus", "plus-lg", "plus-circle", "plus-circle-fill", "dash", "dash-lg", "dash-circle", "dash-circle-fill", "check", "check-lg", "check-circle", "check-circle-fill", "check2", "check2-all", "check2-circle", "x", "x-lg", "x-circle", "x-circle-fill", "pencil", "pen", "pen-fill", "pencil-square", "eraser", "scissors", "trash", "trash-fill", "download", "upload", "save", "save-fill", "clipboard", "clipboard-check", "clipboard-plus", "clipboard2-check", "copy", "paste"],
  },
  "communication": {
    label: "Comunicazione",
    icons: ["envelope", "envelope-fill", "envelope-open", "bell", "bell-fill", "chat", "chat-fill", "chat-dots", "chat-dots-fill", "telephone", "telephone-fill", "megaphone", "broadcast", "rss", "send", "send-fill", "reply", "reply-all", "forward", "share"],
  },
  "media": {
    label: "Media",
    icons: ["play", "play-fill", "play-circle", "play-circle-fill", "pause", "pause-fill", "stop", "stop-fill", "music", "music-note", "volume-up", "volume-mute", "mic", "mic-fill", "camera", "camera-fill", "image", "image-fill", "images", "film", "record", "record-circle", "headphones", "headset", "speaker", "speedometer"],
  },
  "objects": {
    label: "Oggetti",
    icons: ["folder", "folder-fill", "folder2", "folder2-open", "folder-plus", "file", "file-fill", "file-earmark", "file-text", "file-code", "file-image", "file-pdf", "box", "box-fill", "box-arrow-down", "box-arrow-up", "boxes", "lock", "lock-fill", "unlock", "unlock-fill", "key", "key-fill", "shield", "shield-fill", "shield-check", "bookmark", "bookmark-fill", "tag", "tag-fill", "tags", "gift", "gift-fill", "trophy", "trophy-fill", "award", "award-fill"],
  },
  "people": {
    label: "Persone",
    icons: ["person", "person-fill", "people", "people-fill", "person-plus", "person-plus-fill", "person-badge", "person-check", "person-gear", "hand-thumbs-up", "hand-thumbs-down", "hand-index", "emoji-smile", "emoji-heart-eyes", "emoji-laughing", "emoji-neutral", "emoji-frown"],
  },
  "devices": {
    label: "Dispositivi",
    icons: ["laptop", "phone", "phone-fill", "display", "display-fill", "keyboard", "keyboard-fill", "printer", "mouse", "monitor", "smartwatch", "cpu", "hard-drive", "hdd", "router", "usb-drive", "battery", "battery-full", "wifi", "bluetooth"],
  },
  "weather": {
    label: "Meteo",
    icons: ["sun", "sun-fill", "moon", "moon-fill", "moon-stars", "cloud", "cloud-sun", "cloud-rain", "cloud-snow", "cloud-lightning", "cloud-fog", "snow", "thermometer", "droplet", "droplet-fill", "fire", "fire-fill", "wind", "lightning", "umbrella", "rainbow"],
  },
  "transport": {
    label: "Trasporti",
    icons: ["car", "truck", "bicycle", "scooter", "airplane", "airplane-fill", "train-front", "bus-front", "rocket", "rocket-fill", "fuel-pump"],
  },
  "commerce": {
    label: "Commercio",
    icons: ["cart", "cart-fill", "cart-plus", "cart-check", "bag", "bag-fill", "bag-check", "basket", "basket-fill", "shop", "storefront", "cash", "cash-stack", "credit-card", "credit-card-fill", "wallet", "receipt", "percent", "calculator", "graph-up", "graph-down", "bar-chart", "bar-chart-fill", "pie-chart", "pie-chart-fill"],
  },
  "social": {
    label: "Social",
    icons: ["twitter", "github", "gitlab", "linkedin", "facebook", "instagram", "youtube", "slack", "discord", "reddit", "twitch", "telegram", "whatsapp", "mastodon", "threads", "medium", "wordpress"],
  },
  "shapes": {
    label: "Forme",
    icons: ["circle", "circle-fill", "circle-half", "square", "square-fill", "square-half", "triangle", "triangle-fill", "hexagon", "hexagon-fill", "octagon", "octagon-fill", "star", "star-fill", "star-half", "heart", "heart-fill", "diamond", "diamond-fill", "gem"],
  },
  "nature": {
    label: "Natura",
    icons: ["tree", "tree-fill", "flower1", "flower2", "flower3", "forest", "pine-tree", "mountain", "water"],
  },
  "text": {
    label: "Testo",
    icons: ["type-bold", "type-italic", "type-underline", "text-left", "text-center", "text-right", "justify", "paragraph", "fonts", "font-size", "input-cursor", "cursor-text", "code", "code-slash", "terminal", "code-square", "braces"],
  },
  "security": {
    label: "Sicurezza",
    icons: ["shield", "shield-fill", "shield-check", "shield-lock", "shield-exclamation", "key", "key-fill", "lock", "lock-fill", "unlock", "unlock-fill", "fingerprint", "password", "eye", "eye-fill", "eye-slash", "eye-slash-fill", "incognito"],
  },
  "signs": {
    label: "Segnali",
    icons: ["info-circle", "info-circle-fill", "exclamation-triangle", "exclamation-triangle-fill", "exclamation-circle", "exclamation-circle-fill", "question-circle", "question-circle-fill", "check-circle", "check-circle-fill", "x-circle", "x-circle-fill", "plus-circle", "plus-circle-fill", "dash-circle", "dash-circle-fill"],
  },
  "maps": {
    label: "Mappe",
    icons: ["geo-alt", "geo-alt-fill", "globe", "globe-americas", "globe-europe-africa", "map", "map-fill", "pin-map", "compass", "signpost", "signpost-2", "pin", "thumbtack", "paperclip"],
  },
  "time": {
    label: "Tempo",
    icons: ["clock", "clock-history", "alarm", "alarm-fill", "hourglass", "timer", "stopwatch", "calendar"],
  },
  "medical": {
    label: "Medico",
    icons: ["heart", "heart-fill", "heartbreak", "bandaid", "hospital", "capsule", "prescription", "syringe"],
  },
};

interface IconPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentValue?: string;
}

export function IconPicker({ open, onClose, onSelect, currentValue }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredIcons = useMemo(() => {
    let icons: string[];
    if (selectedCategory === "all") {
      // Gather all unique icons from all categories
      const allIcons = new Set<string>();
      Object.values(ICON_CATEGORIES).forEach(cat => {
        cat.icons.forEach(icon => allIcons.add(icon));
      });
      icons = [...allIcons];
    } else {
      icons = ICON_CATEGORIES[selectedCategory]?.icons || [];
    }

    if (!search.trim()) return icons;
    const q = search.toLowerCase().replace(/^bi-?/, "").trim();
    return icons.filter((icon) => icon.includes(q));
  }, [search, selectedCategory]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  const normalizedCurrent = currentValue?.replace(/^bi-?/, "") || "";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="flex flex-col p-0 gap-0 overflow-hidden"
        style={{ maxHeight: "75vh", width: "min(640px, calc(100vw - 2rem))" }}
      >
        {/* Fixed Header */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <DialogTitle className="text-sm font-semibold mb-0.5">
            Seleziona Icona
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mb-3">
            {filteredIcons.length} icone{selectedCategory !== "all" ? ` in ${ICON_CATEGORIES[selectedCategory]?.label}` : ""}
          </DialogDescription>
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca icona... (es. house, gear, star)"
            className="h-8 text-xs"
          />

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto py-1.5 -mx-1 px-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tutte
            </button>
            {Object.entries(ICON_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedCategory === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Grid */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-3 pb-3"
          style={{ maxHeight: "calc(75vh - 160px)" }}
        >
          {filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-xs text-muted-foreground">Nessuna icona trovata</p>
              <p className="text-[10px] text-muted-foreground/60">
                Prova un termine diverso o cambia categoria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-0.5">
              {filteredIcons.map((icon) => {
                const isSelected = normalizedCurrent === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleSelect(icon)}
                    className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded text-center transition-all duration-100 hover:bg-muted ${
                      isSelected
                        ? "bg-primary/10 ring-1 ring-primary/40"
                        : ""
                    }`}
                    title={`bi-${icon}`}
                  >
                    <i className={`bi bi-${icon}`} style={{ fontSize: "18px" }} />
                    <span className="text-[7px] text-muted-foreground leading-tight truncate w-full max-w-full">
                      {icon.replace(/-/g, " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
