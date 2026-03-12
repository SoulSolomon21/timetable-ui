import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { queryClient } from '@/lib/query.ts'

interface Props {
  children: React.ReactNode
}

function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default QueryProvider
