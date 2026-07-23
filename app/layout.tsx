import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "BaseBadge Daily",
  description: "Claim proof. Build your streak."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="6a6189b4426d14cfbad57a24" />
        <meta name="base:builder_code" content="bc_29s8yo05" />
        <meta
          name="talentapp:project_verification"
          content="bf7b2519ea691d2d8e34974ca30a4d7e86169f7a87c189ed655baadeaad0bcbd63a82ebffaa2c2b5c647018697e530421729345170585eb362dad0dafd12761a"
        />
      </head>
      <body className={`${inter.variable} ${lora.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
