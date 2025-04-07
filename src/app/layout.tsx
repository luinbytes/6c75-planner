import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "6C75 Planner",
  description: "A multipurpose planner for tasks, routines, and habits",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen relative">
            <main className="min-h-screen bg-background">
              {children}
            </main>
            <div className="fixed bottom-4 right-4">
              <ThemeToggle className="h-10" />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
