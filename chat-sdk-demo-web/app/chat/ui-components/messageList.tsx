import { roboto } from '@/app/fonts'
import Avatar from './avatar'
import Message from './message'
import UnreadIndicator from './unreadIndicator'
import Image from 'next/image'
import { CustomQuotedMessage } from '@/app/types'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Channel,
  User,
  Message as pnMessage,
  MixedTextTypedElement,
  TimetokenUtils
} from '@pubnub/chat'

export default function MessageList ({
  activeChannel,
  currentUser,
  groupUsers,
  messageActionHandler = (action, vars) => {},
  usersHaveChanged,
  setChatSettingsScreenVisible,
  quotedMessage,
  setShowPinnedMessages,
  setShowThread
}) {
  const MAX_AVATARS_SHOWN = 9
  const [loadedChannelId, setLoadedChannelId] = useState('')
  const [messages, setMessages] = useState<pnMessage[]>([])
  const [pinnedMessage, setPinnedMessage] = useState<pnMessage | null>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log(
      'ACTIVE CHANNEL CHANGED from MESSAGE LIST: ' + activeChannel?.id
    )
    if (!activeChannel) return
    if (activeChannel.id !== loadedChannelId) {
      //  Connect wasn't being called with this applied
      setLoadedChannelId(activeChannel.id)

      setMessages([])
      activeChannel.getHistory({ count: 20 }).then(historicalMessagesObj => {
        setMessages(messages => [...historicalMessagesObj.messages])
      })
      activeChannel.getPinnedMessage().then(message => {
        setPinnedMessage(message)
      })
    }
    return activeChannel.connect(message => {
      setMessages(messages => [...messages, message])
    })
  }, [activeChannel, loadedChannelId])

  useEffect(() => {
    if (!messages || messages.length == 0) return
    return pnMessage.streamUpdatesOn(messages, setMessages)
  }, [messages])

  useEffect(() => {
    console.log('GROUP USERS')
    console.log(groupUsers)

    //  todo disconnect as needed

    if (groupUsers) {
      return User.streamUpdatesOn(groupUsers, updatedUsers => {
        usersHaveChanged()
      })
    }
  }, [groupUsers])

  useEffect(() => {
    if (!messageListRef.current) return
    console.log(messageListRef.current.scrollHeight - messageListRef.current.scrollTop)
    console.log(messageListRef.current.scrollTop)
    if (
      messageListRef.current.scrollTop != 0 && messageListRef.current.scrollHeight - messageListRef.current.scrollTop >
      1000
    ){

      console.log('NOT scrolling')
      return //  We aren't scrolled to the bottom
    }
    console.log('scrolling')
    setTimeout(() => {
      if (messageListRef.current)
        {
          messageListRef.current.scrollTop = messageListRef.current?.scrollHeight
        }
    }, 10)  //  Some weird timing issue
  }, [messages])

  const renderMessagePart = useCallback(
    (messagePart: MixedTextTypedElement) => {
      if (messagePart.type === 'text') {
        return messagePart.content.text
      }
      if (messagePart.type === 'plainLink') {
        return <a href={messagePart.content.link}>{messagePart.content.link}</a>
      }
      if (messagePart.type === 'textLink') {
        return <a href={messagePart.content.link}>{messagePart.content.text}</a>
      }
      if (messagePart.type === 'mention') {
        return (
          <a href={`https://pubnub.com/${messagePart.content.id}`}>
            {messagePart.content.name}
          </a>
        )
      }

      return ''
    },
    []
  )

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
              {activeChannel.name}{' '}
              {activeChannel.type == 'public' && <div>(Public)</div>}
            </div>
          )}
          {activeChannel.type == 'direct' && (
            <div className='flex flex-row justify-center items-center gap-3'>
              <div className='flex flex-row -space-x-2.0'>
                {groupUsers?.map((member, index) => (
                  <Avatar
                    key={index}
                    avatarUrl={member.profileUrl}
                    present={1}
                  />
                ))}
              </div>
              1:1 between{' '}
              {groupUsers?.map(
                (member, index) =>
                  `${member.name}${
                    groupUsers.length - 1 != index ? ' and ' : ''
                  }`
              )}
            </div>
          )}
          {activeChannel.type == 'group' && (
            <div className='flex flex-row justify-center items-center gap-3'>
              <div className='flex flex-row -space-x-2.0'>
                {groupUsers?.map(
                  (member, index) =>
                    index < MAX_AVATARS_SHOWN && (
                      <Avatar
                        key={index}
                        avatarUrl={member.profileUrl}
                        present={1}
                      />
                    )
                )}
              </div>
              {/*<Avatar present={1} avatarUrl={'/avatars/avatar01.png'} />*/}
              {activeChannel.name} (Private Group)
            </div>
          )}
        </div>

        <div className='flex flex-row'>
          {/* Icons on the top right of a chat screen */}
          <div className='flex flex-row'>
            {/* Pin with number of pinned messages */}
            <div className='flex justify-center items-center rounded min-w-6 px-2 my-2 border text-xs font-normal border-navy50 bg-neutral-100'>
              0
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
        className={`flex flex-col overflow-y-auto pb-8 ${
          quotedMessage ? 'mb-[234px]' : 'mb-[178px]'
        }`}
        ref={messageListRef}
      >
        {/*<Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          timetoken={'17179544908908795'}
          pinned={true}
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Very short message.'
        />

        <Message
          received={false}
          avatarUrl='/avatars/avatar02.png'
          isRead={true}
          sender='Default Text'
          timetoken={'17179544908908795'}
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Augue sit et aenean non tortor senectus.'
        />

        <Message
          received={false}
          avatarUrl='/avatars/avatar02.png'
          isRead={false}
          containsQuote={true}
          sender='Default Text'
          timetoken={'17179544908908795'}
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Augue sit et aenean non tortor senectus sed. Sagittis eget in ut magna semper urna felis velit cursus. Enim nunc leo quis volutpat dis.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          timetoken={'17179544908908795'}
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
          timetoken={'17179544908908795'}
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          containsQuote={true}
          sender='Sarah Johannsen'
          timetoken={'17179544908908795'}
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
          timetoken={'17179544908908795'}
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
          timetoken={'17179544908908795'}
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />*/}

        {messages.map((message, index) => {
          //seenUserId(message.userId)  //  dcc
          return (
            /*<UnreadIndicator key={index} count={5}>index</UnreadIndicator>*/

            <Message
              key={index}
              received={currentUser.id !== message.userId}
              reactions={message.reactions}
              avatarUrl={
                message.userId === currentUser.id
                  ? currentUser.profileUrl
                  : groupUsers?.find(user => user.id === message.userId)
                      ?.profileUrl
              }
              isRead={false} //  todo - read receipts
              showReadIndicator={false} //  todo - probably a better way to convey this information when I implement receipts (setting false since this is a public channel)
              sender={
                message.userId === currentUser.id
                  ? currentUser.name
                  : groupUsers?.find(user => user.id === message.userId)?.name
              }
              timetoken={message.timetoken}
              pinned={pinnedMessage?.timetoken === message.timetoken} //  todo - message pinning
              messageActionHandler={(action, vars) =>
                messageActionHandler(action, vars)
              }
              messageText={message.content.text}
              //activeChannel={activeChannel}
              messages={messages}
              //setMessages={setMessages}
            />
          )
        })}
      </div>
    </div>
  )
}
