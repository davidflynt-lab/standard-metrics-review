import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Financial review | Standard Metrics",
  description: "Synthetic reporting review workflow prototype",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
