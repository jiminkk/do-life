export const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-stone-50 border-r border-stone-50 p-6">
      <a href="/">
        <h1 className="text-xl font-semibold text-stone-800 mb-6">Dashboard</h1>
      </a>
      <nav className="flex flex-col gap-1">
        <a
          href="/profile"
          className="text-sm font-medium text-stone-600 hover:text-stone-900 px-2 py-1.5 rounded hover:bg-stone-100 transition-colors"
        >
          Your page
        </a>
      </nav>
    </aside>
  )
}
