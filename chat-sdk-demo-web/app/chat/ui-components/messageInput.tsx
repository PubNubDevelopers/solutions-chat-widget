import Image from 'next/image'
import { CustomQuotedMessage } from '@/app/types'
import QuotedMessage from './quotedMessage'
import { useState, useEffect } from 'react'
import {ToastType} from '@/app/types'

export default function MessageInput ({
  activeChannel,
  replyInThread,
  quotedMessage,
  setQuotedMessage = any => {},
  creatingNewMessage=false,
  showUserMessage=(a, b, c, d) => {},
  plusAction =() => {}
}) {
  function handleMessageDraftChanged (draft) {}

  const [text, setText] = useState("") //  todo Will be replaced by message draft
  async function handleSend(event: React.SyntheticEvent) {
    event.preventDefault()
    if (!text || !activeChannel) return
    if (replyInThread)
      {
        //  This demo only supports text replies in the thread UI
        await activeChannel.sendText(text, {storeInHistory: true})
        setText("")
          }
          else
          {
            //  ToDo support message draft in non-threaded channels
            await activeChannel.sendText(text, {storeInHistory: true})
            setText("")
        
          }
  }

  async function handleTyping(e)
  {
    if (activeChannel.type !== 'public')
      {
        activeChannel.startTyping()
      }
    setText(e.target.value)
    //handleMessageDraftChanged(e.target.value)
  }

  async function addAttachment()
  {
    showUserMessage(
      "Demo Limitation",
      'Though supported by the Chat SDK, this demo does not support adding attachments to messages',
      'https://www.pubnub.com/docs/chat/chat-sdk/build/features/messages/files',
      ToastType.INFO
    )
  }

  async function addEmoji()
  {
    showUserMessage(
      "Demo Limitation",
      'You can send any Unicode data through the Chat SDK, the emoji window just isn`t implemented in this demo yet',
      'https://www.pubnub.com/docs/chat/chat-sdk/build/features/messages/send-receive',
      ToastType.INFO
    )    
  }

  return (
    <div
      className={`flex flex-col w-full items-center border border-navy200 select-none ${
        quotedMessage ? 'h-[170px]' : ''
      } pr-6`}
    >

      {/* The sections around here hard-code the height of the message input Div, which will vary depending on whether there is a quoted message displayed or not.  Without a quoted message it is 114px, but with a quoted message it is 170px */}
      {quotedMessage && (
        <div className='flex flex-row w-full h-[100px]'>
          <QuotedMessage
            quotedMessage={quotedMessage}
            setQuotedMessage={setQuotedMessage}
            displayedWithMesageInput={true}
          />
        </div>
      )}
      <div
        className={`flex flex-row w-full items-center ${
          quotedMessage ? 'h-[70px]' : 'h-[114px] -mt-[1px]'
        }`}
      >
        <form className={`flex grow`} onSubmit={(e) => handleSend(e)}>
        <input
          className={`flex grow rounded-md border border-neutral-300 h-[50px] mr-1 ${
            quotedMessage ? '' : 'my-8'
          } ml-6 px-6 text-sm focus:ring-1 focus:ring-inputring outline-none placeholder:text-neutral-500`}
          placeholder='Type message'
          value={text}
          onChange={e => {handleTyping(e)}}
        /></form>
        {!replyInThread && (
          <div className='cursor-pointer hover:bg-neutral-100 hover:rounded-md' onClick={(e) => handleSend(e)}>
            <Image
              src='/icons/send.svg'
              alt='Send'
              className='m-3 cursor-pointer'
              width={24}
              height={24}
              priority
            />
          </div>
        )}
        {!replyInThread && (
          <div className='cursor-pointer hover:bg-neutral-100 hover:rounded-md' onClick={() => {addEmoji()}}>
            <Image
              src='/icons/smile.svg'
              alt='Smile'
              className='m-3 cursor-pointer'
              width={24}
              height={24}
              priority
            />
          </div>
        )}
        {!replyInThread && (
          <div className='cursor-pointer hover:bg-neutral-100 hover:rounded-md' onClick={() => {addAttachment()}}>
            <Image
              src='/icons/attachment.svg'
              alt='Attachment'
              className='m-3 cursor-pointer'
              width={24}
              height={24}
              priority
            />
          </div>
        )}
        {replyInThread && (
          <div className='cursor-pointer hover:bg-neutral-100 hover:rounded-md' onClick={(e) => handleSend(e)}>
            <Image
              src='/icons/plus.svg'
              alt='Plus'
              className='m-3'
              width={14}
              height={14}
              priority
            />
          </div>
        )}
      </div>
    </div>
  )
}
