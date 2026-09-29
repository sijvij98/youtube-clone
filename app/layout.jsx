import { Roboto } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"] });

export const metadata = {
  title: "MyTube",
  description: "A working YouTube clone powered by the YouTube Data API v3.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
