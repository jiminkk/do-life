import { Container, Main } from "@/app/ui-components"

export const DashboardPage = ({ username }: { username: string }) => {
  return (
    <Main>
      <Container>
        <p className="text-gray-500">Welcome back, {username} 👋🏼</p>
      </Container>
    </Main>
  )
}
