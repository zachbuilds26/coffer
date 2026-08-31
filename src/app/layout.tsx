import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coffer — Private grants, public accountability",
  description:
    "A private grant-distribution workspace for onchain communities using STRK20 on Starknet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
