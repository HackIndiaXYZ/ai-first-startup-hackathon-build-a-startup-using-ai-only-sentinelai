import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/component/SettingsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "SentinelAI",
    template: "%s | SentinelAI",
  },
  description:
    "AI-powered security analysis platform for identifying and understanding application security issues.",
  applicationName: "SentinelAI",
  keywords: [
    "SentinelAI",
    "AI security",
    "security analysis",
    "application security",
    "code security",
  ],
  authors: [
    {
      name: "SentinelAI",
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#050608] font-sans text-white antialiased">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}