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

// Comprehensive Bootstrap Icons list
const BOOTSTRAP_ICONS = [
  "house", "house-fill", "gear", "gear-fill", "person", "person-fill",
  "search", "cart", "cart-fill", "heart", "heart-fill", "star", "star-fill",
  "envelope", "envelope-fill", "bell", "bell-fill", "bookmark", "bookmark-fill",
  "calendar", "clock", "cloud", "cloud-sun", "download", "upload", "trash",
  "trash-fill", "pencil", "eye", "eye-fill", "lock", "lock-fill", "unlock", "unlock-fill",
  "check", "check-lg", "check-circle", "check-circle-fill",
  "x", "x-lg", "x-circle", "x-circle-fill",
  "plus", "plus-lg", "plus-circle", "plus-circle-fill",
  "dash", "dash-lg", "dash-circle", "dash-circle-fill",
  "arrow-right", "arrow-left", "arrow-up", "arrow-down",
  "chevron-down", "chevron-up", "chevron-left", "chevron-right",
  "info-circle", "info-circle-fill", "info", "info-fill",
  "exclamation-triangle", "exclamation-triangle-fill", "exclamation-circle", "exclamation-circle-fill",
  "question-circle", "question-circle-fill",
  "link", "link-45deg", "link-break",
  "image", "image-fill", "images", "camera", "camera-fill",
  "music", "music-note", "play", "play-fill", "play-circle", "play-circle-fill",
  "pause", "pause-fill", "stop", "stop-fill",
  "volume-up", "volume-mute", "mic", "mic-fill",
  "wifi", "bluetooth", "battery", "battery-full", "lightning",
  "sun", "sun-fill", "moon", "moon-fill", "moon-stars",
  "snow", "thermometer", "droplet", "droplet-fill", "fire", "fire-fill",
  "tree", "tree-fill", "globe", "globe-americas", "globe-europe-africa",
  "map", "map-fill", "geo-alt", "geo-alt-fill", "pin-map",
  "building", "building-fill", "shop", "briefcase", "tools", "wrench",
  "cog", "sliders", "palette", "fonts", "code", "code-slash", "terminal",
  "database", "database-fill", "server", "cloud-upload", "cloud-download", "share",
  "chat", "chat-fill", "chat-dots", "chat-dots-fill",
  "people", "people-fill", "person-plus", "person-plus-fill",
  "shield", "shield-fill", "shield-check", "shield-lock",
  "key", "key-fill",
  "box", "box-fill", "box-arrow-down", "box-arrow-up", "boxes",
  "folder", "folder-fill", "folder2", "folder2-open", "folder-plus",
  "file", "file-fill", "file-earmark", "file-text", "file-code", "file-image", "file-pdf",
  "layers", "grid", "grid-fill", "list", "list-ul", "list-ol",
  "skip-forward", "skip-backward", "rewind", "fast-forward",
  "skip-forward-btn", "skip-backward-btn",
  "speaker", "speedometer", "cpu", "laptop", "phone", "phone-fill",
  "display", "display-fill", "keyboard", "keyboard-fill", "printer",
  "headphones", "headset", "router",
  "sort-up", "sort-down", "filter", "funnel",
  "clipboard", "clipboard-check", "clipboard-plus",
  "scissors", "eraser", "hammer", "screwdriver",
  "zoom-in", "zoom-out", "search-heart",
  "bookmark-star", "bookmarks", "bookmarks-fill",
  "journal", "journal-text", "journal-code",
  "book", "book-fill", "book-half",
  "award", "award-fill", "trophy", "trophy-fill", "medal", "medal-fill",
  "flag", "flag-fill", "flag-checkered",
  "gem", "diamond", "diamond-fill", "star-half", "heartbreak",
  "emoji-smile", "emoji-heart-eyes", "emoji-laughing", "emoji-neutral", "emoji-frown",
  "emoji-dizzy", "emoji-grin", "emoji-sunglasses", "emoji-wink",
  "hand-thumbs-up", "hand-thumbs-down", "hand-index", "hand-index-thumb",
  "bag", "bag-fill", "bag-check", "bag-plus", "bag-x",
  "basket", "basket-fill", "basket2", "basket3",
  "cash", "cash-stack", "credit-card", "credit-card-fill", "wallet", "wallet2",
  "tag", "tag-fill", "tags", "tags-fill", "gift", "gift-fill",
  "graph-up", "graph-down", "bar-chart", "bar-chart-fill",
  "pie-chart", "pie-chart-fill", "activity", "percent", "calculator",
  "home", "home-fill", "door-closed", "door-open",
  "mountain", "water", "umbrella", "compass",
  "signpost", "pin", "thumbtack", "paperclip",
  "send", "send-fill", "reply", "reply-all", "forward",
  "megaphone", "broadcast", "rss",
  "twitter", "github", "gitlab", "linkedin", "facebook", "instagram", "youtube",
  "slack", "discord", "reddit", "twitch", "telegram", "whatsapp",
  "mastodon", "threads", "medium", "wordpress",
  "qr-code", "barcode",
  "fingerprint", "robot", "incognito",
  "password", "passkey", "person-lock",
  "safe", "safe-fill",
  "bug", "bug-fill", "spider",
  "magic", "magic-wand",
  "controller", "joystick",
  "car", "truck", "bicycle", "scooter", "airplane", "airplane-fill",
  "train-front", "bus-front",
  "rocket", "rocket-fill",
  "life-preserver", "buoy",
  "cup-hot", "cake", "egg-fried",
  "chess", "dice-1", "dice-2", "dice-3", "dice-4", "dice-5", "dice-6",
  "puzzle", "puzzle-piece",
  "toggle-on", "toggle-off",
  "circle", "circle-fill", "circle-half", "square", "square-fill", "square-half",
  "hexagon", "hexagon-fill", "octagon", "octagon-fill", "triangle", "triangle-fill",
  "dot", "three-dots", "three-dots-vertical", "more",
  "type-bold", "type-italic", "type-underline",
  "text-left", "text-center", "text-right",
  "justify", "paragraph",
  "border-all", "border-none", "border-style",
  "layout-sidebar", "layout-split", "layout-three-columns",
  "table", "table-fill", "table-cells",
  "diagram-2", "diagram-3", "node-plus", "node-minus",
  "stack", "columns", "layers", "layer-group",
  "vector-pen", "brush", "paint-roller",
  "fullscreen", "aspect-ratio",
  "caret-up", "caret-down", "caret-left", "caret-right",
  "hand-pointer", "cursor",
  "arrow-clockwise", "arrow-counterclockwise", "arrow-repeat",
  "check2", "check2-all", "check2-circle",
  "circle-dashed", "record", "record-circle",
  "app-indicator", "brightness-high", "brightness-low",
  "lightbulb", "lightbulb-fill", "oil-can", "palette2",
  "file-earmark-text", "file-earmark-code", "file-earmark-image", "file-earmark-pdf",
  "file-earmark-plus", "file-earmark-check",
  "input-cursor", "font-size",
  "hdd", "hdd-fill", "hdd-network", "hdd-rack",
  "motherboard", "memory", "gpu-card",
  "usb-drive", "usb-plug", "sim", "sd-card",
  "modem", "smartwatch", "bandaid",
  "signpost-2", "signpost-split",
  "person-badge", "person-check", "person-dash",
  "person-gear", "person-lines-fill", "person-vcard",
  "person-standing", "person-walking", "person-running", "person-bounding-box",
  "person-workspace",
  "envelope-open", "envelope-heart", "envelope-paper",
  "chat-left", "chat-right", "chat-square",
  "chat-left-dots", "chat-right-dots", "chat-square-dots",
  "chat-heart", "chat-left-text", "chat-right-text", "chat-square-text",
  "telephone", "telephone-fill", "telephone-forward",
  "cart-plus", "cart-check", "cart-x", "cart-dash",
  "cart2", "cart3", "cart4",
  "storefront", "shop-window",
  "graph-up-arrow", "graph-down-arrow",
  "bar-chart-line", "pie-chart-fill",
  "house-door", "house-door-fill", "house-heart", "house-add",
  "house-check", "house-dash", "house-exclamation",
  "house-gear", "house-lock", "house-person", "house-plus", "house-x",
  "flower1", "flower2", "flower3", "forest", "pine-tree",
  "cloud-rain", "cloud-snow", "cloud-lightning",
  "cloud-fog", "cloud-moon",
  "wind", "tornado", "hurricane", "volcano", "flood",
  "database-add", "database-check", "database-dash", "database-gear",
  "database-lock", "database-minus", "database-plus", "database-x",
  "hard-drive", "hard-drive-fill", "box-seam",
  "shield-exclamation", "shield-minus", "shield-plus", "shield-slash", "shield-x",
  "eye-slash", "eye-slash-fill",
  "alarm", "alarm-fill", "clock-history", "hourglass", "timer", "stopwatch",
  "sort-alpha-down", "sort-alpha-up", "sort-numeric-down", "sort-numeric-up",
  "filter-left", "filter-right",
  "clipboard2", "clipboard2-check", "clipboard2-plus", "clipboard2-x",
  "sliders2", "gear-wide",
  "binoculars", "sunglasses",
  "mortarboard", "gender-male", "gender-female",
  "cloud-check", "cloud-minus", "cloud-plus", "cloud-slash",
  "battery-half", "battery-quarter", "battery-charging", "battery-empty",
  "lightning-charge", "power", "plug",
  "thermometer-half", "fan",
  "snow2", "snow3",
  "fuel-pump", "ev-station",
  "easel", "receipt",
  "badge-cc", "badge-sd", "badge-tm",
  "boss", "servicestack",
  "speedometer2", "gauge",
  "landing", "takeoff",
  "broadcast-pin",
  "menu-app", "menu-button", "menu-down", "menu-up",
  "back", "forward",
  "collection", "collection-fill",
  "kanban", "kanban-fill",
  "bar-chart-steps",
  "bezier", "bezier2",
  "braces", "braces-asterisk",
  "bucket", "bucket-fill",
  "capslock", "capslock-fill",
  "card-heading", "card-text", "card-checklist", "card-image", "card-list",
  "chat-quote",
  "clipboard-data", "clipboard-minus", "clipboard-x",
  "code-square",
  "cone", "cone-striped",
  "cup", "cup-fill", "cup-straw",
  "cursor-text",
  "dash-square", "dash-circle-dotted",
  "dice-1-fill", "dice-2-fill", "dice-3-fill", "dice-4-fill", "dice-5-fill", "dice-6-fill",
  "disc", "disc-fill",
  "distribute-horizontal", "distribute-vertical",
  "door-closed-fill", "door-open-fill",
  "download", "upload",
  "egg", "egg-fill",
  "eject", "eject-fill",
  "emoji-angry", "emoji-angry-fill", "emoji-dizzy-fill", "emoji-expressionless",
  "emoji-frown-fill", "emoji-heart-eyes-fill", "emoji-laughing-fill",
  "emoji-neutral-fill", "emoji-smile-fill", "emoji-smile-upside-down",
  "emoji-smile-upside-down-fill", "emoji-sunglasses-fill", "emoji-wink-fill",
  "file-arrow-down", "file-arrow-up", "file-check", "file-minus", "file-plus", "file-x",
  "file-earmark-arrow-down", "file-earmark-arrow-up",
  "file-earmark-check", "file-earmark-excel", "file-earmark-lock",
  "file-earmark-minus", "file-earmark-play", "file-earmark-slides",
  "file-earmark-word", "file-earmark-zip", "file-earmark-x",
  "file-music", "file-play",
  "film",
  "folder2-fill", "folder2-plus",
  "funnel-fill",
  "gear-wide-connected",
  "grip-horizontal", "grip-vertical",
  "handbag", "handbag-fill",
  "heptagon", "heptagon-fill", "heptagon-half",
  "hourglass-bottom", "hourglass-top",
  "hr",
  "image-alt",
  "inbox",
  "info-square", "info-square-fill",
  "intersect", "union",
  "journal-album", "journal-arrow-down", "journal-arrow-up",
  "journal-check", "journal-medical", "journal-minus", "journal-plus",
  "journal-richtext", "journal-x", "journals",
  "kanban",
  "ladder", "lamp", "lamp-fill",
  "lightning-charge-fill", "lightning-fill",
  "list-check", "list-nested", "list-stars", "list-task",
  "mailbox", "mailbox2",
  "markdown",
  "menu-button-wide", "menu-button-wide-fill",
  "minecart",
  "mouse", "mouse-fill", "mouse2", "mouse2-fill",
  "music-note-beamed", "music-note-list", "music-player",
  "newspaper",
  "node-minus-fill", "node-plus-fill",
  "nut", "nut-fill",
  "option",
  "outlet",
  "paint-bucket",
  "palette-fill", "palette2",
  "patch-check", "patch-exclamation", "patch-minus", "patch-plus", "patch-question",
  "peace", "peace-fill",
  "pen", "pen-fill",
  "pencil-square",
  "pentagon", "pentagon-fill", "pentagon-half",
  "pie-chart",
  "pip",
  "plus-square", "plus-square-fill", "plus-circle-dotted", "plus-square-dotted",
  "print", "print-fill",
  "question-diamond", "question-square",
  "rainbow",
  "reception-0", "reception-1", "reception-2", "reception-3", "reception-4",
  "record-btn", "record-btn-fill", "record-circle-fill", "record-fill",
  "reply-fill", "reply-all-fill",
  "rss-fill",
  "rulers",
  "save", "save-fill", "save2", "save2-fill",
  "segmented-nav",
  "shift",
  "shop",
  "shuffle",
  "skip-end", "skip-end-btn", "skip-end-btn-fill", "skip-end-circle",
  "skip-start", "skip-start-btn", "skip-start-btn-fill", "skip-start-circle",
  "slash", "slash-circle", "slash-square",
  "soundwave",
  "spellcheck",
  "stack",
  "star-fill", "stars",
  "stickies", "sticky",
  "stop-btn", "stop-circle", "stop-circle-fill", "stoplights",
  "subtract",
  "suit-club", "suit-club-fill", "suit-diamond-fill", "suit-heart", "suit-heart-fill", "suit-spade", "suit-spade-fill",
  "ticket-perforated", "ticket-perforated-fill",
  "tropical-storm",
  "window", "window-dock", "window-sidebar",
  "wireless",
  "wrench-adjustable", "wrench-adjustable-circle", "wrench-adjustable-circle-fill",
  "x-diamond", "x-octagon", "x-square",
  "yaml",
];

// Deduplicate while preserving order
const UNIQUE_ICONS = [...new Set(BOOTSTRAP_ICONS)];

interface IconPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentValue?: string;
}

export function IconPicker({ open, onClose, onSelect, currentValue }: IconPickerProps) {
  const [search, setSearch] = useState("");
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
    if (!search.trim()) return UNIQUE_ICONS;
    const q = search.toLowerCase().replace(/^bi-?/, "").trim();
    return UNIQUE_ICONS.filter((icon) => icon.includes(q));
  }, [search]);

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
            {filteredIcons.length} icone Bootstrap disponibili
          </DialogDescription>
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca icona... (es. house, gear, star)"
            className="h-8 text-xs"
          />
        </div>

        {/* Scrollable Grid */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-3 pb-3"
          style={{ maxHeight: "calc(75vh - 120px)" }}
        >
          {filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-xs text-muted-foreground">Nessuna icona trovata</p>
              <p className="text-[10px] text-muted-foreground/60">
                Prova un termine diverso
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
