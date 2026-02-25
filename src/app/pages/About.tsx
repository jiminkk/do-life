import { Container, Main } from "@/app/ui-components"

export const About = () => {
  return (
    <Main>
      <Container>
        <h1 className="text-2xl font-bold">About</h1>
        <p className="text-gray-500">This is the about page</p>

        <button className="bg-blue-300 text-white p-2 rounded-md hover:bg-blue-400">
          Go back
        </button>
      </Container>
    </Main>
  )
}
