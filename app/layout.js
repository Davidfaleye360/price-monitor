import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Zenith Price Monitor | Track and Monitor Product Prices",
  description: "A premium automated price tracking dashboard. Track product price telemetry, monitor market trends, and receive secure email alerts.",
  keywords: ["price monitor", "e-commerce scraper", "price alerts", "web scraping", "price tracker"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
