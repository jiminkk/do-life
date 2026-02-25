import { Sidebar } from "./Sidebar"

export const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
