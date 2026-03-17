export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center py-18">
      <div className="flex">
        <div className="w-40 shrink-0" />
        <div className="flex flex-col gap-8 w-96">
          {children}
        </div>
      </div>
    </div>
  )
}
