import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-cocoa-900 to-cocoa-950 px-6 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-orange-50 sm:text-6xl">
          MyReccBox
        </h1>
        <p className="mt-6 text-lg leading-8 text-orange-200/80">
          Your friends recommend books, movies, shows, restaurants, and more
          across texts, DMs, and conversations — and those recommendations get
          lost. MyReccBox gives you one place to collect them all.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/recommend/aisha"
            className="inline-block rounded-lg bg-flame-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-flame-600 focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-2 focus:ring-offset-cocoa-950"
          >
            Send a Recommendation (demo)
          </Link>
          <Link
            href="/user"
            className="inline-block rounded-lg border border-flame-500/60 bg-cocoa-850 px-6 py-3 text-base font-semibold text-flame-300 shadow-sm transition-colors hover:bg-cocoa-800 focus:outline-none focus:ring-2 focus:ring-flame-500 focus:ring-offset-2 focus:ring-offset-cocoa-950"
          >
            My Recommendations
          </Link>
        </div>
      </div>
    </main>
  );
}
