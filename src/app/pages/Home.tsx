import { Container, Main } from "@/app/ui-components"

export const DashboardPage = ({ username }: { username: string }) => {
  return (
    <Main username={username}>
      <Container>
        <p className="text-gray-500">Welcome back, {username} 👋🏼</p>
      </Container>
    </Main>
  )
}
