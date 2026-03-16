import { Sidebar } from "./sidebar"

export const Main = ({
  children,
  username,
}: {
  children: React.ReactNode
  username: string
}) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar username={username} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
