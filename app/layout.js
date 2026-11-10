import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-playfair",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Honey Lab — Pure Golden Honey",
  description: "Raw, organic honey straight from the hive.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="bg-honey-cream font-sans text-honey-dark antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
