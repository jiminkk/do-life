function errorMessage(code: string): string {
  switch (code) {
    case "missing_handle":
      return "Please enter your Bluesky handle."
    case "authorize_failed":
      return "Could not start sign in. Check your handle and try again."
    case "callback_failed":
      return "Sign in failed. Please try again."
    default:
      return "Something went wrong. Please try again."
  }
}

export function LoginPage({ error }: { error?: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm space-y-6 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-800">Sign in</h1>
          <p className="mt-2 text-sm text-stone-500">
            Enter your Bluesky handle to continue
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorMessage(error)}
          </div>
        )}

        <form method="POST" action="/login/authorize" className="space-y-4">
          <div>
            <label
              htmlFor="handle"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Bluesky handle
            </label>
            <input
              id="handle"
              name="handle"
              type="text"
              placeholder="you.bsky.social"
              autoComplete="username"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
          >
            Sign in with Bluesky
          </button>
        </form>
      </div>
    </div>
  )
}
