"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export type EditorTheme = "light" | "light-ios" | "dark" | "dark-ios";

const IOS_THEMES: EditorTheme[] = ["light-ios", "dark-ios"];
const DARK_THEMES: EditorTheme[] = ["dark", "dark-ios"];

export function isIosTheme(theme: string | undefined): boolean {
  return IOS_THEMES.includes(theme as EditorTheme);
}

export function isDarkTheme(theme: string | undefined): boolean {
  return DARK_THEMES.includes(theme as EditorTheme);
}

/**
 * Cycle through the 4 themes in order:
 * light → light-ios → dark-ios → dark → light
 */
export function cycleTheme(current: string | undefined): EditorTheme {
  const order: EditorTheme[] = ["light", "light-ios", "dark-ios", "dark"];
  const idx = order.indexOf((current || "dark") as EditorTheme);
  return order[(idx + 1) % order.length];
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
