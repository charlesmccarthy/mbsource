import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";

import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <main className="absolute top-0 bottom-0 left-0 right-0 min-h-screen max-h-screen">
        <Component {...pageProps} />
      </main>
      <ToastContainer />
      <Analytics />
    </>
  );
}
