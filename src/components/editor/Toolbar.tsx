"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";
import { cycleTheme, isDarkTheme, isIosTheme } from "@/components/theme-provider";

export function Toolbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b ios-border-subtle ios-satin-toolbar flex items-center px-4 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-primary/90 flex items-center justify-center shadow-sm shadow-primary/20">
          <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-foreground tracking-tight">
            Bootstrap Editor
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal rounded-md ios-border-subtle">
            Bootstrap 5.3
          </Badge>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme cycle — top right — 4 variants */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(cycleTheme(theme))}
          className="h-9 w-9 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title={
            !isDarkTheme(theme) && !isIosTheme(theme) ? "Bianco semplice → Bianco iOS"
            : !isDarkTheme(theme) && isIosTheme(theme) ? "Bianco iOS → Nero iOS"
            : isDarkTheme(theme) && isIosTheme(theme) ? "Nero iOS → Nero semplice"
            : "Nero semplice → Bianco semplice"
          }
        >
          {!isDarkTheme(theme) && !isIosTheme(theme) && <Sun className="w-4 h-4" />}
          {!isDarkTheme(theme) && isIosTheme(theme) && <Sparkles className="w-4 h-4 text-amber-500" />}
          {isDarkTheme(theme) && isIosTheme(theme) && <Sparkles className="w-4 h-4 text-violet-400" />}
          {isDarkTheme(theme) && !isIosTheme(theme) && <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  );
}
