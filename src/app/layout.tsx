import type { Metadata } from "next";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "UI Editor - Bootstrap GUI Editor",
  description: "Editor visuale per interfaccie Bootstrap",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* Set dark + theme-ios classes immediately from localStorage to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('theme');
              var t = stored || 'dark-ios';
              if (t === 'dark' || t === 'dark-ios') document.documentElement.classList.add('dark');
              if (t === 'light-ios' || t === 'dark-ios') document.documentElement.classList.add('theme-ios');
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark-ios"
          enableSystem={false}
          disableTransitionOnChange
          themes={["light", "light-ios", "dark", "dark-ios"]}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
