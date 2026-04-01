import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppinsBody = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins-body",
  display: "swap",
});

const poppinsHeading = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins-heading",
  display: "swap",
});

export const metadata = {
  title: "Gemstone 360° Generator Platform",
  description:
    "Premium platform for creating and managing interactive 360° gemstone models",
  keywords:
    "gemstone, 360 viewer, jewelry, certification, diamond, ruby, sapphire, emerald",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppinsBody.variable} ${poppinsHeading.variable}`}
    >
      <body className="bg-obsidian-dark text-silver antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1a1a",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "0",
              padding: "16px 24px",
            },
            success: {
              style: {
                borderLeft: "3px solid #ffffff",
              },
            },
            error: {
              style: {
                borderLeft: "3px solid #dc3545",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
