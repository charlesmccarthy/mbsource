import InputForm from "@/components/MaskedImageInput";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div
      className={`flex min-h-screen flex-col px-4 lg:px-24 items-center ${inter.className}`}
    >
      <Head>
        <title>Motion Brush</title>
      </Head>

      <div className="text-2xl w-full text-center py-3 font-semibold text-slate-800">
        Motion Brush
      </div>
      <InputForm />
    </div>
  );
}
