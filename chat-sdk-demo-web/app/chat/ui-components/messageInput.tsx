import Image from 'next/image'
import { CustomQuotedMessage } from '../types'
import QuotedMessage from './quotedMessage'

export default function MessageInput ({
  replyInThread,
  quotedMessage,
  setQuotedMessage = any => {}
}) {
  function handleMessageDraftChanged (draft) {}

  return (
    <div
      className={`flex flex-col w-full items-center border border-navy200 ${
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
        <input
          className={`flex grow rounded-md border border-neutral-300 h-[50px] mr-1 ${
            quotedMessage ? '' : 'my-8'
          } ml-6 px-6 text-sm focus:ring-1 focus:ring-inputring outline-none placeholder:text-neutral-500`}
          placeholder='Type message'
          onChange={e => {
            handleMessageDraftChanged(e.target.value)
          }}
        />
        {!replyInThread && (
          <div className='cursor-pointer hover:bg-neutral-100 hover:rounded-md'>
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
          <div className='cursor-pointer hover:bg-neutral-100 hover:rounded-md'>
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
          <div className='cursor-pointer hover:bg-neutral-100 hover:rounded-md'>
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
