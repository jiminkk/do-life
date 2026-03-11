export interface LifeEventRecord {
  id?: string
  title: string
  description?: string
  startDate: string
  endDate?: string
}

export interface ProfileData {
  handle: string
  bio: string
  lifeEvents: LifeEventRecord[]
}
