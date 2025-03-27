import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoCards",
  description: "Flashcard application for spaced repetition learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Critical CSS to prevent flash of light theme - applied immediately */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { color-scheme: dark; }
          html { background-color: #111827 !important; }
          body { background-color: #111827 !important; color: #f9fafb !important; }
        `}} />
        
        {/* Highest priority script to set dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force dark mode immediately to prevent any flash of light theme
              document.documentElement.classList.add('dark');
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
