"use client"

import { useState } from "react"

export const Navbar = ({ username }: { username: string }) => {
  const [open, setOpen] = useState(false)

  return (
    <header className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
      <a href="/" className="text-sm font-semibold text-stone-800">
        lifepo.st
      </a>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 transition-colors"
        >
          {username}
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-stone-200 rounded-lg shadow-md py-1 z-20">
              <a
                href="/edit-profile"
                className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Edit profile
              </a>
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                View public profile
              </a>
              <a
                href="/logout"
                className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Log out
              </a>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
