import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { ErrorBoundary } from "@/components/error-boundary"

// Use Next.js font optimization for Roboto and Open Sans
import { Roboto, Open_Sans } from "next/font/google"

// Configure the Roboto font
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})

// Configure the Open Sans font
const openSans = Open_Sans({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SQUAADS Project Management",
  description: "Manage your team's projects efficiently",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} ${openSans.variable}`}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex h-screen">
            <Sidebar />
            <ErrorBoundary>
              <main className="flex-1 overflow-auto">{children}</main>
            </ErrorBoundary>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
