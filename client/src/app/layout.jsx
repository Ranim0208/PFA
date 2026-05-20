import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { QueryClientWrapper } from "../contexts/query-client";
import StackProvider from "../contexts/stack";
import RootLayoutWrapper from "../layouts/root-layout-wrapper";
import { Suspense } from "react";
import Loader from "@/components/ui/Loader";

export const metadata = {
  title: "Plateforme Tacir",
  description: "",
  icons: {
    icon: "/images/logoIcone.png",
  },
};

const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <QueryClientWrapper>
          <StackProvider>
            <Suspense fallback={<Loader />}>
              <RootLayoutWrapper>{children}</RootLayoutWrapper>
            </Suspense>
          </StackProvider>
        </QueryClientWrapper>
      </body>
    </html>
  );
}
