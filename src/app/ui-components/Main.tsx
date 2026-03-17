import { Navbar } from "./navbar"

export const Main = ({
  children,
  username,
}: {
  children: React.ReactNode
  username: string
}) => {
  return (
    <div className="min-h-screen">
      <Navbar username={username} />
      <main>{children}</main>
    </div>
  )
}
