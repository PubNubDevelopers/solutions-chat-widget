import Avatar from './avatar'
import Image from 'next/image'
import { roboto } from '@/app/fonts'
import { useState } from 'react'
import MessageActions from './messageActions'
import PinnedMessagePill from './pinnedMessagePill'
import QuotedMessage from './quotedMessage'
import { MessageActionsTypes } from '../types'
import ToolTip from './toolTip'

export default function Message ({
  received,
  inThread = false,
  inPinned = false,
  avatarUrl,
  isRead,
  containsQuote = false,
  sender,
  messageText,
  dateTime,
  messageActionHandler = (a, b) => {},
  pinned = false,
  unpinMessageHandler = () => {
    console.log('ToDo: Unpin Message')
  },
  reactions = ['']
}) {
  const [showToolTip, setShowToolTip] = useState(false)
  const [actionsShown, setActionsShown] = useState(false)
  let messageHovered = false
  let actionsHovered = false
  const arrayOfEmojiReactions = reactions.map((emoji) => emoji + ' ');

  const handleMessageMouseEnter = e => {
    messageHovered = true
    setActionsShown(true)
  }
  const handleMessageMouseLeave = e => {
    messageHovered = false
    setActionsShown(false)
  }

  function testIfActionsHovered () {
    if (messageHovered) return
    if (!actionsHovered) {
      setActionsShown(false)
    }
  }

  function handleMessageActionsEnter () {
    actionsHovered = true
    setActionsShown(true)
  }

  function handleMessageActionsLeave () {
    //console.log('parent - message actions leave')
    actionsHovered = false
    if (!messageHovered) {
      setActionsShown(false)
      //console.log('setting actions shown false from message actions mouse leave.  messageHovered is ' + messageHovered)
    }
  }

  return (
    <div className='flex flex-col w-full'>
      <div
        className={`flex flex-row ${inThread ? '' : 'w-5/6'} my-4 ${
          inThread ? 'mx-6' : 'mx-8'
        } ${!received && 'self-end'}`}
      >
        {received && !inThread && !inPinned && (
          <div className='min-w-11'>
            {!inThread && <Avatar present={0} avatarUrl={avatarUrl} />}
          </div>
        )}

        <div className='flex flex-col w-full gap-2'>
          <div
            className={`flex flex-row ${
              inThread || inPinned || received
                ? 'justify-between'
                : 'justify-end'
            }`}
          >
            {(inThread || inPinned || received) && (
              <div
                className={`${roboto.className} text-sm font-normal flex text-neutral-600`}
              >
                {sender}
                {(inThread || inPinned) && !received && ' (you)'}
                {pinned && <PinnedMessagePill />}
              </div>
            )}
            <div
              className={`${roboto.className} text-sm font-normal flex text-neutral-600`}
            >
              {dateTime}
            </div>
          </div>

          <div
            className={`${
              roboto.className
            } relative text-base font-normal flex text-black ${
              received ? 'bg-neutral-50' : 'bg-[#e3f1fd]'
            } p-4 rounded-b-lg ${
              received ? 'rounded-tr-lg' : 'rounded-tl-lg'
            } pb-[${!received ? '40px' : '0px'}]`}
            onMouseEnter={handleMessageMouseEnter}
            onMouseMove={handleMessageMouseEnter}
            onMouseLeave={handleMessageMouseLeave}
          >
            {inPinned && (
              <div
                className='cursor-pointer'
                onClick={() => unpinMessageHandler()}
                onMouseEnter={() => {
                  setShowToolTip(true)
                }}
                onMouseLeave={() => {
                  setShowToolTip(false)
                }}
              >
                <div className='absolute right-[10px] top-[10px]'>
                  <div className='relative'>
                    <ToolTip
                      className={`${showToolTip ? 'block' : 'hidden'}`}
                      tip='Unpin'
                      messageActionsTip={false}
                    />
                  </div>
                  <Image
                    src='/icons/close.svg'
                    alt='Close'
                    className=''
                    width={20}
                    height={20}
                    priority
                  />
                </div>
              </div>
            )}
            <div className='flex flex-col'>
              {containsQuote && (
                <QuotedMessage
                  quotedMessage={{
                    sender: 'Sarah Johannsen',
                    message:
                      'Augue sit et aenean non tortor senectus sed. Sagittis eget in ut magna semper urna felis velit cursus. Enim nunc leo quis volutpat dis.'
                  }}
                  setQuotedMessage={null}
                  displayedWithMesageInput={false}
                />
              )}
              {messageText}
            </div>
            {!received && (
              <Image
                src={`${isRead ? '/icons/read.svg' : '/icons/sent.svg'}`}
                alt='Read'
                className='absolute right-[10px] bottom-[14px]'
                width={21}
                height={10}
                priority
              />
            )}
            <div className="absolute right-[10px] -bottom-[14px] text-lg">
            {arrayOfEmojiReactions}
            </div>
            {/* actions go here for received */}
            {received && !inThread && !inPinned && (
              <MessageActions
                received={received}
                actionsShown={actionsShown}
                messageActionsEnter={() => handleMessageActionsEnter()}
                messageActionsLeave={() => handleMessageActionsLeave()}
                replyInThreadClick={() =>
                  messageActionHandler(
                    MessageActionsTypes.REPLY_IN_THREAD,
                    'messageId'
                  )
                }
                quoteMessageClick={() =>
                  messageActionHandler(MessageActionsTypes.QUOTE, '')
                }
                pinMessageClick={() => {
                  messageActionHandler(MessageActionsTypes.PIN, '')
                }}
                reactMessageClick={(data) => {
                  messageActionHandler(MessageActionsTypes.REACT, data)
                }}
                copyMessageClick={() => {
                  messageActionHandler(MessageActionsTypes.COPY, '')
                }}
              />
            )}
          </div>
          {/* actions go here for sent */}
          {!received && !inThread && !inPinned && (
            <MessageActions
              received={received}
              actionsShown={actionsShown}
              messageActionsEnter={() => handleMessageActionsEnter()}
              messageActionsLeave={() => handleMessageActionsLeave()}
              replyInThreadClick={() =>
                messageActionHandler(
                  MessageActionsTypes.REPLY_IN_THREAD,
                  'messageId'
                )
              }
              quoteMessageClick={() =>
                messageActionHandler(MessageActionsTypes.QUOTE, '')
              }
              pinMessageClick={() => {
                messageActionHandler(MessageActionsTypes.PIN, '')
              }}
              reactMessageClick={(data) => {
                messageActionHandler(MessageActionsTypes.REACT, data)
              }}
              copyMessageClick={() => {
                messageActionHandler(MessageActionsTypes.COPY, '')
              }}
            />
          )}
        </div>
      </div>
      {inPinned && (
        <div className='flex flex-row place-self-center mt-2 border border-navy200 w-5/6'></div>
      )}
    </div>
  )
}
