export const Sidebar = ({ username }: { username: string }) => {
  return (
    <aside className="w-64 min-h-screen bg-stone-50 border-r border-stone-50 p-6 flex flex-col">
      <div className="flex-1">
        <a href="/">
          <h1 className="text-xl font-semibold text-stone-800 mb-6">
            Dashboard
          </h1>
        </a>
        <nav className="flex flex-col gap-1">
          <a
            href="/edit-profile"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 px-2 py-1.5 rounded hover:bg-stone-100 transition-colors"
          >
            Edit page
          </a>
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 px-2 py-1.5 rounded hover:bg-stone-100 transition-colors"
          >
            Your page
          </a>
        </nav>
      </div>
      <a
        href="/logout"
        className="text-sm font-medium text-stone-400 hover:text-stone-600 px-2 py-1.5 rounded hover:bg-stone-100 transition-colors"
      >
        Sign out
      </a>
    </aside>
  )
}
