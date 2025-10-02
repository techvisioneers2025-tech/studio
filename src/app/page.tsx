import { Header } from "@/components/header";
import { Translator } from "@/components/translator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <Translator />
      </main>
    </div>
  );
}
