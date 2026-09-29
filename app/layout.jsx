import "./globals.css";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "MyTube",
  description: "A working YouTube clone powered by the YouTube Data API v3.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
