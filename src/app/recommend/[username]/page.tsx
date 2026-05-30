import { resolveUsername } from '@/lib/data/profiles'
import SubmissionForm from '@/components/SubmissionForm'

interface PageProps {
  params: { username: string }
}

export default async function RecommendPage({ params }: PageProps) {
  const userId = await resolveUsername(params.username)

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cocoa-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-orange-50">Page Not Found</h1>
          <p className="mt-2 text-orange-200/80">
            The user &ldquo;{params.username}&rdquo; does not exist.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cocoa-900 to-cocoa-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-flame-400">
            Got something good?
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-orange-50">
            Recommend to {params.username}
          </h1>
          <p className="mt-2 text-base text-orange-200/70">
            Share a book, movie, show, or spot worth their time.
          </p>
        </div>
        <SubmissionForm username={params.username} userId={userId} />
      </div>
    </main>
  )
}
