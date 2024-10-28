'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Function to generate a random user ID
  function generateRandomUserId() {
    return 'pubnub#' + Math.random().toString(36).substring(2, 15)
  }

  // Function to get the identifier from search params
  function getIdentifier() {
    const searchParamsIdentifier = searchParams.get('identifier')
    return searchParamsIdentifier ? `&identifier=${searchParamsIdentifier}` : ''
  }

  useEffect(() => {
    const randomUserId = generateRandomUserId()
    const identifier = getIdentifier()
    // Redirect to the /chat page with the generated user ID
    router.replace(`/chat/?userId=${randomUserId}${identifier}`)
  }, [])

  return (
    <main className='flex min-h-screen flex-row size-full justify-center items-center'>
      <div className='text-center text-lg text-neutral900 font-bold'>
        Redirecting to chat...
      </div>
    </main>
  )
}