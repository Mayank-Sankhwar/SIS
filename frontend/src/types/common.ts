export type ApiResponse<T> = {
  data: T
  message?: string
  success: boolean
}

export type EmptyState = {
  title: string
  description?: string
}
