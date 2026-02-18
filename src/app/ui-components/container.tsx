export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center py-18 gap-8 max-w-sm mx-auto">
      {children}
    </div>
  )
}
