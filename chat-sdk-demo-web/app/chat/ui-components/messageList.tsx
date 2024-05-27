import { roboto } from '@/app/fonts'
import Avatar from './avatar'
import Message from './message'
import UnreadIndicator from './unreadIndicator'
import Image from 'next/image'
import { CustomQuotedMessage } from '../types'

import { useState, useEffect, useCallback } from 'react'
import { Channel, User, Message as pnMessage, MixedTextTypedElement, TimetokenUtils } from '@pubnub/chat'

export default function MessageList ({
  activeChannel,
  messageActionHandler = (action, vars) => {},
  setChatSettingsScreenVisible,
  quotedMessage,
  setShowPinnedMessages,
  setShowThread
}) {
  const [messages, setMessages] = useState<pnMessage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  const days = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ]

  useEffect(() => {
    if (!activeChannel) return
    console.log('connecting')
    return activeChannel.connect(message => {
      console.log(message)
      setMessages(messages => [...messages, message])
    })
  }, [activeChannel])

  //useEffect(() => {
  //  console.log(`Message List: active channel updated: ${activeChannel}`)
  //}), [activeChannel]

  const renderMessagePart = useCallback((messagePart: MixedTextTypedElement) => {
    if (messagePart.type === "text") {
      return messagePart.content.text
    }
    if (messagePart.type === "plainLink") {
      return <a href={messagePart.content.link}>{messagePart.content.link}</a>
    }
    if (messagePart.type === "textLink") {
      return <a href={messagePart.content.link}>{messagePart.content.text}</a>
    }
    if (messagePart.type === "mention") {
      return <a href={`https://pubnub.com/${messagePart.content.id}`}>{messagePart.content.name}</a>
    }

    return ""
  }, [])

  if (!activeChannel)
    return <div className='flex flex-col max-h-screen'>...</div>

  return (
    <div className='flex flex-col max-h-screen'>
      <div
        id='chats-header'
        className='flex flex-row items-center h-16 min-h-16 border border-navy-200 select-none'
      >
        <div
          className={`${roboto.className} text-base font-medium flex flex-row grow justify-center items-center gap-3`}
        >
          {activeChannel.type == 'public' && (
            <div className='flex flex-row justify-center items-center gap-3'>
              <Avatar
                present={-1}
                avatarUrl={activeChannel.custom.profileUrl}
              />
              {activeChannel.name}
            </div>
          )}
          {activeChannel.type == 'direct' && (
            <div className='flex flex-row justify-center items-center gap-3'>
              <Avatar present={1} avatarUrl={'/avatars/avatar01.png'} />
              Sarah Johannsen
            </div>
          )}
          {activeChannel.type == 'group' && (
            <div className='flex flex-row justify-center items-center gap-3'>
              <Avatar present={1} avatarUrl={'/avatars/avatar01.png'} />
              Sarah Johannsen
            </div>
          )}
        </div>

        <div className='flex flex-row'>
          {/* Icons on the top right of a chat screen */}
          <div className='flex flex-row'>
            {/* Pin with number of pinned messages */}
            <div className='flex justify-center items-center rounded min-w-6 px-2 my-2 border text-xs font-normal border-navy50 bg-neutral-100'>
              3
            </div>
            <div
              className='p-3 py-3 cursor-pointer hover:bg-neutral-100 hover:rounded-md'
              onClick={() => {
                setShowPinnedMessages(true)
                setShowThread(false)
              }}
            >
              <Image
                src='/icons/pin.svg'
                alt='Pin'
                className=''
                width={24}
                height={24}
                priority
              />
            </div>
          </div>
          <div
            className='p-3 py-3 cursor-pointer hover:bg-neutral-100 hover:rounded-md'
            onClick={() => setChatSettingsScreenVisible(true)}
          >
            <Image
              src='/icons/settings.svg'
              alt='Settings'
              className=''
              width={24}
              height={24}
              priority
            />
          </div>
        </div>
      </div>

      {/* This section hard-codes the bottom of the message list to accommodate the height of the message input Div, whose height will vary depending on whether there is a quoted message displayed or not */}
      <div
        id='chats-bubbles'
        className={`flex flex-col overflow-y-auto overscroll-none pb-6 ${
          quotedMessage ? 'mb-[234px]' : 'mb-[178px]'
        }`}
      >
        {messages.map((message, index) => {
          //const user = users.find(user => user.id === message.userId)
          //  todo this probably best belongs in the method itself
          const date = TimetokenUtils.timetokenToDate(message.timetoken)
          const datetime = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${(date.getHours() + "").padStart(2, '0')}:${(date.getMinutes() + "").padStart(2, '0')}`
          return (
            //  todo do the proper test for a read message being from myself
            //  todo need a way of finding the user
              
              /*<UnreadIndicator key={index} count={5}>index</UnreadIndicator>*/
              
              <Message
              key={index}
              received={false}
              avatarUrl='/avatars/avatar01.png'
              isRead={false}
              sender="TBD"
              dateTime={datetime}
              pinned={false}
              messageActionHandler={(action, vars) =>
                messageActionHandler(action, vars)
              }
              messageText={message.content.text}
            />
            )
        })}

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          pinned={true}
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='1Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={false}
          avatarUrl='/avatars/avatar02.png'
          isRead={true}
          sender='Default Text'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Augue sit et aenean non tortor senectus sed. Sagittis eget in ut magna semper urna felis velit cursus. Enim nunc leo quis volutpat dis.'
        />

        <Message
          received={false}
          avatarUrl='/avatars/avatar02.png'
          isRead={false}
          containsQuote={true}
          sender='Default Text'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          reactions={['😆', '😗', '😋']}
          messageText='Augue sit et aenean non tortor senectus sed. Sagittis eget in ut magna semper urna felis velit cursus. Enim nunc leo quis volutpat dis.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          reactions={['🐕', '🐶']}
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          reactions={[
            '🐕',
            '🐶',
            '🐶',
            '🐶',
            '🐶',
            '🐶',
            '🐶',
            '🐶',
            '🐶',
            '🐶'
          ]}
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          containsQuote={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />
      </div>
    </div>
  )
}
