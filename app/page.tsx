import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="p-10 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">It works.</h1>
      <Button>Primary</Button>
      <Button variant="outline">Outline</Button>
    </main>
  );
}

