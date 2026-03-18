"use client"

interface AvatarProps {
  username: string
  src?: string
}

export const Avatar = ({ username, src }: AvatarProps) => {
  const inner = src ? (
    <img src={src} alt={username} className="w-full h-full object-cover" />
  ) : (
    <span className="text-stone-500 font-medium text-lg select-none">
      {username.charAt(0).toUpperCase()}
    </span>
  )

  return (
    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center shrink-0 overflow-hidden">
      {inner}
    </div>
  )
}
