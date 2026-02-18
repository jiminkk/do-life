import { Container, Sidebar } from "@/app/ui-components"

export const Home = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Container>
          <p className="text-gray-500">This is the home page</p>
          <button className="bg-blue-300 text-white p-2 rounded-md hover:bg-blue-400">
            Go to about page
          </button>
        </Container>
      </main>
    </div>
  )
}
