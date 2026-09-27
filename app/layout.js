import { Fredoka, Caveat, Inter } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Birthday Bloom",
  description: "A little universe made just for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${caveat.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
