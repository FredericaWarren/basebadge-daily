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
          content="8453674fc821f1bd5ff38b53adc1df5570e2f871eb89a25dd9f5c9f586d51ed13ba482023127ccbd11742868876fbfaed8ccbecba8ea6306fea3657e1aa2bfd5"
        />
      </head>
      <body className={`${inter.variable} ${lora.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
