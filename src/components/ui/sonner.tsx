"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { isDarkTheme } from "@/components/theme-provider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  // Map our 4-theme system to sonner's "light" | "dark" | "system"
  const sonnerTheme = isDarkTheme(theme) ? "dark" : "light"

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
