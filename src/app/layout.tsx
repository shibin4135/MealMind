import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import ClientProvider from "@/components/QueryProvider";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Meal Planner | Personalized Meal Planning",
  description: "AI-powered meal planning tailored to your dietary preferences and lifestyle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientProvider>
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "hsl(var(--card))",
                    color: "hsl(var(--card-foreground))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    padding: "12px 16px",
                  },
                  success: {
                    iconTheme: {
                      primary: "hsl(142, 71%, 45%)",
                      secondary: "white",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "hsl(0, 84%, 60%)",
                      secondary: "white",
                    },
                  },
                }}
              />
              <Navbar />
              {children}
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </ClientProvider>
  );
}
