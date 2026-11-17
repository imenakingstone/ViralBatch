import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ViralBatch — Create more. Post consistently.", description: "Turn one script into a batch of short-form hooks and social captions." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
