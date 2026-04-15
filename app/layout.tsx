import type { Metadata } from "next";
import { Manrope, Lora } from "next/font/google";
import "@/app/globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ShortlistProvider } from "@/components/shortlist-context";
import { ShortlistTray } from "@/components/shortlist-tray";
import { SchemaScript } from "@/components/schema-script";
import { homeMetadata, organizationSchema } from "@/lib/seo";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const serif = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  ...homeMetadata(),
  metadataBase: new URL("https://www.mktiq.ca")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-[var(--font-sans)] text-ink antialiased">
        <SchemaScript data={organizationSchema()} />
        <ShortlistProvider>
          <Navbar />
          <main className="pb-10">{children}</main>
          <Footer />
          <ShortlistTray />
        </ShortlistProvider>
      </body>
    </html>
  );
}
