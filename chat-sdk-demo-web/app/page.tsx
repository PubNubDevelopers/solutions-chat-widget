"use client"

import Image from "next/image";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {

  const [userId, setUserId] = useState("default-user")
  const router = useRouter()

  function login(event) {
    event.preventDefault()
    router.push(`/chat/?userId=${userId}`)
  }

  return (
    <main className="flex min-h-screen flex-row size-full justify-between">
      <div id="login-form" className="flex flex-col min-h-screen items-center justify-center w-full lg:w-1/2 bg-white">
        <div id="login-container" className="flex flex-col max-w-80 gap-16">
          <div className="flex flex-col gap-3">
          <Image
              src="/chat.svg"
              alt="Chat Icon"
              className="self-center"
              width={75}
              height={75}
              priority
          />
            <div className="text-center text-lg text-pubnubtext font-bold">Log in: Sample Chat App</div>
            <div className="flex text-center text-base text-pubnub font-normal">Built with the PubNub Chat SDK for JavaScript and TypeScript.</div>
          </div>
          <form className="flex flex-col gap-16" onSubmit={login}>
          <div className="flex flex-col">
            <label className="text-sm text-pubnubtext">Choose a User ID / Name</label>
            <input type="text" id="txtUserId" value={userId} onChange={(e) => setUserId(e.target.value)} name="userId" className="bg-white border border-pubnublightgray text-pubnubtext rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
          </div>
          
            <button type="button" onClick={login} className="bg-pubnubnavy text-pubnubtextlight text-sm py-3 rounded-md shadow-sm w-full">Log in</button>

          </form>
        </div>
      </div>
      <div id="welcome-graphic" className="hidden lg:flex min-h-screen grow items-center justify-center bg-[#132F47]">

      <div className="static">
      <div className="w-60 h-60 bg-[#E3F1FD] rounded-full blur-[120px] fixed top-[-60px] right-[-70px]"></div>
      <div className="w-60 h-60 bg-[#E3F1FD] rounded-full blur-[120px] fixed bottom-[-80px] right-[43%]"></div>
      </div>
          <Image
              src="/welcome.svg"
              alt="Welcome to the Chat SDK sample app"
              className="dark:invert"
              width={467}
              height={403}
              priority
          />
      </div>
    </main>
  );
}
