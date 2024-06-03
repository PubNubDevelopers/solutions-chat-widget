import { roboto } from '@/app/fonts'
import Avatar from './avatar'
import Message from './message'
import UnreadIndicator from './unreadIndicator'
import Image from 'next/image'
import { CustomQuotedMessage, PresenceIcon } from '@/app/types'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Channel,
  User,
  Message as pnMessage,
  Membership,
  MixedTextTypedElement,
  TimetokenUtils
} from '@pubnub/chat'

export default function MessageList ({
  activeChannel,
  currentUser,
  groupUsers,
  messageActionHandler = (action, vars) => {},
  usersHaveChanged,
  updateUnreadMessagesCounts,
  setChatSettingsScreenVisible,
  quotedMessage,
  setShowPinnedMessages,
  setShowThread
}) {
  const MAX_AVATARS_SHOWN = 9
  const [loadedChannelId, setLoadedChannelId] = useState('')
  const [messages, setMessages] = useState<pnMessage[]>([])
  const [currentMembership, setCurrentMembership] = useState<Membership>()
  const [readReceipts, setReadReceipts] = useState()
  const [pinnedMessage, setPinnedMessage] = useState<pnMessage | null>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  function uniqueById (items) {
    const set = new Set()
    return items.filter(item => {
      const isDuplicate = set.has(item.timetoken)
      set.add(item.timetoken)
      return !isDuplicate
    })
  }

  useEffect(() => {
    //  UseEffect to handle initial configuration of the Message List including reading the historical messages
    console.log(
      'ACTIVE CHANNEL CHANGED from MESSAGE LIST 1: ' + activeChannel?.id
    )
    if (!activeChannel) return
    if (activeChannel.id == loadedChannelId) return
    async function initMessageList () {
      setMessages([])
      setLoadedChannelId(activeChannel.id)
      const result = await currentUser.getMemberships() //  Some issue with filtering on memberships by channel ID, will raise.  I should be able to filter on channel.id == currentChannel.id
      var localCurrentMembership
      for (var i = 0; i < result?.memberships.length; i++) {
        if (result.memberships[i].channel.id == activeChannel.id) {
          localCurrentMembership = result.memberships[i]
          setCurrentMembership(localCurrentMembership)
        }
      }

      //setMessages([])
      activeChannel
        .getHistory({ count: 20 })
        .then(async historicalMessagesObj => {
          //  Run through the historical messages and set the most recently received one (that we were not the sender of) as read
          console.log(historicalMessagesObj.messages)
          if (historicalMessagesObj.messages) {
            for (
              var i = historicalMessagesObj.messages.length - 1;
              i >= 0;
              i--
            ) {
              console.log(historicalMessagesObj.messages[i].userId)
              //if (historicalMessagesObj.messages[i].userId !== currentUser.id) {
              console.log(
                'setting last read token to ' +
                  historicalMessagesObj.messages[i].timetoken
              )
              console.log(localCurrentMembership)
              await localCurrentMembership?.setLastReadMessageTimetoken(
                historicalMessagesObj.messages[i].timetoken
              )
              updateUnreadMessagesCounts()
              break
              //}
            }
          }
          setMessages(messages => {
            return uniqueById([...historicalMessagesObj.messages]) //  Avoid race condition where message was being added twice
          })
        })
      await activeChannel.getPinnedMessage().then(message => {
        setPinnedMessage(message)
      })
    }
    initMessageList()
  }, [activeChannel, currentUser, loadedChannelId])

  useEffect(() => {
    //  UseEffect to stream Read Receipts
    if (!activeChannel) return
    if (activeChannel.type == 'public') return //  Read receipts are not supported on public channels

    activeChannel.streamReadReceipts(receipts => {
      setReadReceipts(receipts)
    })
  }, [activeChannel])

  useEffect(() => {
    //  UseEffect to receive new messages sent on the channel
    if (!activeChannel) return

    return activeChannel.connect(message => {
      //if (message.userId !== currentUser.id) {
      currentMembership?.setLastReadMessageTimetoken(message.timetoken)
      //}
      setMessages(messages => {
        return uniqueById([...messages, message]) //  Avoid race condition where message was being added twice when the channel was launched with historical messages
      })
    })
  }, [activeChannel, currentMembership, currentUser.id])

  useEffect(() => {
    //  UseEffect to receive updates to messages such as reactions.  This does NOT include new messages being received on the channel (which is handled by the connect elsewhere)
    if (!messages || messages.length == 0) return
    return pnMessage.streamUpdatesOn(messages, setMessages)
  }, [messages])

  useEffect(() => {
    console.log('GROUP USERS')
    console.log(groupUsers)
    console.log("END END")

    if (groupUsers && groupUsers.length > 0) {
      return User.streamUpdatesOn(groupUsers, updatedUsers => {
        usersHaveChanged()
      })
    }
  }, [groupUsers])

  useEffect(() => {
    if (!messageListRef.current) return
    if (
      messageListRef.current.scrollTop != 0 &&
      messageListRef.current.scrollHeight - messageListRef.current.scrollTop >
        1000
    ) {
      return //  We aren't scrolled to the bottom
    }
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current?.scrollHeight
      }
    }, 10) //  Some weird timing issue
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
    return (
      <div className='flex flex-col max-h-screen h-screen justify-center items-center w-full'>
        <div className='max-w-96 max-h-96 '>
          <Image
            src='/chat.svg'
            alt='Chat Icon'
            className=''
            width={200}
            height={200}
            priority
          />
        </div>
        <div className='flex mb-5 animate-spin'>
          <Image
            src='/icons/loading.png'
            alt='Chat Icon'
            className=''
            width={50}
            height={50}
            priority
          />
        </div>
        <div className='text-2xl'>Loading...</div>
      </div>
    )

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
                present={PresenceIcon.NOT_SHOWN}
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
                    present={member.active ? PresenceIcon.ONLINE : PresenceIcon.OFFLINE}
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
                        present={member.active ? PresenceIcon.ONLINE : PresenceIcon.OFFLINE}
                      />
                    )
                )}
              </div>
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
        {messages && messages.length == 0 && (
          <div className='flex flex-row items-center justify-center w-full h-screen text-xl'>
            No messages in this chat yet
          </div>
        )}
        {messages.map((message, index) => {
          //seenUserId(message.userId)  //  dcc
          return (
            /*<UnreadIndicator key={index} count={5}>index</UnreadIndicator>*/

            <Message
              key={message.timetoken}
              received={currentUser.id !== message.userId}
              reactions={message.reactions}
              avatarUrl={
                message.userId === currentUser.id
                  ? currentUser.profileUrl
                  : groupUsers?.find(user => user.id === message.userId)
                      ?.profileUrl
              }
              isOnline={message.userId === currentUser.id
                ? currentUser.active
                : groupUsers?.find(user => user.id === message.userId)
                    ?.active}
              isRead={
                //  The message will be assumed read anyone (other than ourselves) has read it
                readReceipts &&
                message.timetoken <=
                  Object.keys(readReceipts).sort().reverse()[0]
                  ? true
                  : false
              }
              readReceipts={readReceipts}
              showReadIndicator={activeChannel.type !== 'public'}
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
              message={message}
              currentUserId={currentUser.id}
              //setMessages={setMessages}
            />
          )
        })}
      </div>
    </div>
  )
}
