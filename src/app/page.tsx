import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          MyReccBox
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Your friends recommend books, movies, shows, restaurants, and more
          across texts, DMs, and conversations — and those recommendations get
          lost. MyReccBox gives you one place to collect them all.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/recommend/aisha"
            className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send a Recommendation (demo)
          </Link>
          <Link
            href="/user"
            className="inline-block rounded-md border border-indigo-600 bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            My Recommendations
          </Link>
        </div>
      </div>
    </main>
  );
}
