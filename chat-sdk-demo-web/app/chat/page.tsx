"use client"

import { useSearchParams } from 'next/navigation'
import { ChatContext } from "./context"
import { useState, useEffect, useContext } from 'react'
import {loadEnvConfig } from '@next/env'
import { Channel, Chat, Membership, User } from "@pubnub/chat"
import Image from "next/image";
import { roboto } from '@/app/fonts';

export default function Page() {

  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<String | null>("")
  const [chat, setChat] = useState<Chat | null>(null)
  
  useEffect(() => {
    async function init() {
      setUserId(searchParams.get('userId'))
      if (userId == null || userId === "") return;
      /*const chat = await Chat.init({
        publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
        userId: userId,
        typingTimeout: 2000,
        storeUserActivityTimestamps: true,
        storeUserActivityInterval: 60000,
      })*/

      //  todo text should not be selectable

      setChat(chat)
    }
    init()
  }, [userId, setChat])


  if (!chat && false) {
    return (
      //  TODO DETECT IF THE PUB / SUB KEYS ARE MISSING
      <main>Chat is initializing</main>
    )
  }

  return (
    <main>
      <div id='header' className="flex flex-row justify-between h-16 bg-sky-950">
        <div id='room-selector' className="flex items-center justify-center gap-2.5 ml-2.5">
          <div id='room-avatar' className="flex justify-center w-12 h-12 rounded-full bg-pubnublightnavy">
            <Image
                src="/pn-logo-red-tint.svg"
                alt="PubNub Logo"
                className="flex self-center"
                width={23.81}
                height={17.07}
                priority
            />
          </div>
          <div id='room-name' className="text-pubnubtextlight text-base">PubNub</div>
        </div>
        <div id='header-actions' className="flex items-center mr-2.5">
          <div id='btn-message-new' className={`${roboto.className} flex flex-row justify-between items-center font-medium text-sm px-4 mx-2.5 h-10 rounded-lg bg-pubnubbabyblue`}>
          <Image
                  src="/icons/plus.svg"
                  alt="New Message icon"
                  className="flex self-center mr-3"
                  width={12}
                  height={12}
                  priority
              />
            New message
          </div>
          <Image
                  src="/icons/notifications_none.svg"
                  alt="Notifications"
                  className="flex self-center m-3"
                  width={24}
                  height={24}
                  priority
              />
          <Image
                  src="/icons/alternate_email.svg"
                  alt="Mentions"
                  className="flex self-center m-3"
                  width={24}
                  height={24}
                  priority
              />
          <Image
                  src="/icons/person_outline.svg"
                  alt="My Profile"
                  className="flex self-center m-3"
                  width={24}
                  height={24}
                  priority
              />
        </div>
      </div>
    </main>


  );
  
}