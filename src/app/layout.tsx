import type { Metadata } from "next";
import { Cascadia_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Importe o Footer
import { ThemeProvider } from "./components/ThemeProvider";

// Fonte monoespaçada que dá o tom minimalista de todo o site
const cascadia = Cascadia_Mono({
  subsets: ["latin"],
  variable: "--font-cascadia",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ronald Math",
  description: "Portfólio de Matemática e Data Science",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* ADICIONE suppressHydrationWarning AQUI NA TAG HTML */
    <html lang="pt-BR" className={cascadia.variable} suppressHydrationWarning>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow flex flex-col items-center w-full">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
