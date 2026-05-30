import { resolveUsername } from '@/lib/data/profiles'
import SubmissionForm from '@/components/SubmissionForm'

interface PageProps {
  params: { username: string }
}

export default async function RecommendPage({ params }: PageProps) {
  const userId = await resolveUsername(params.username)

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-gray-600">
            The user &ldquo;{params.username}&rdquo; does not exist.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Send a Recommendation to {params.username}
        </h1>
        <SubmissionForm username={params.username} userId={userId} />
      </div>
    </main>
  )
}
