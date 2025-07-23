import Image from "next/image";
import DataTableDemo from "@/components/DataTableDemo";


async function getMessageFromFlask() {
  try {
    const res = await fetch('http://localhost:5000/api/hello', {
      cache: 'no-store', // SSR: disables Next.js caching
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from Flask');
    }

    const data = await res.json();
    return data.message;
  } catch (error) {
    console.error(error);
    return 'Error fetching from Flask';
  }
}
export default async function Home() {
  const message = await getMessageFromFlask();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <main>
          <h1>Flight Tracker</h1>
          <p>{message}</p>
        </main>
          <DataTableDemo />
      </main>
    </div>
  );
}
