import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { handleError } from '@/lib/errors'

export function useErrorHandler() {
  const { toast } = useToast()

  const handleErrorWithToast = useCallback((error: unknown, defaultMessage?: string) => {
    const { message, type } = handleError(error)
    
    toast({
      title: 'Error',
      description: defaultMessage || message,
      variant: 'destructive',
    })
    
    return { message, type }
  }, [toast])

  return { handleErrorWithToast }
}