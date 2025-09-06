import { AuthButtons } from "@/components/auth-components";
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Bookmark APpp</h1>
      <AuthButtons />
    </main>
  );
}
