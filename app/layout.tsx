import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hidden Cost Game",
  description: "A research-oriented decision-making game about decisions and outcome interpretation under incomplete information.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
