'use client'

import { useSearchParams } from 'next/navigation'
//import { ChatContext } from './context'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useContext } from 'react'
import { loadEnvConfig } from '@next/env'
import { Channel, Chat, Membership, User } from '@pubnub/chat'
import Image from 'next/image'
import { roboto } from '@/app/fonts'
import Header from './ui-components/header'
import ChatMenuHeader from './ui-components/chatMenuHeader'
import ChatMenuItem from './ui-components/chatMenuItem'
import Avatar from './ui-components/avatar'
import UnreadIndicator from './ui-components/unreadIndicator'
import Message from './ui-components/message'
import MessageList from './ui-components/messageList'
import MessageListThread from './ui-components/messageListThread'
import MessageListPinned from './ui-components/messageListPinned'
import MessageInput from './ui-components/messageInput'
import NewMessageGroup from './ui-components/newMessageGroup'
import UserMessage from './ui-components/userMessage'
import RoomSelector from './ui-components/roomSelector'
import ProfileScreen from './ui-components/profileScreen'
import TypingIndicator from './ui-components/typingIndicator'
import ChatSettingsScreen from './ui-components/chatSettingsScreen'
import ModalChangeName from './ui-components/modalChangeName'
import ModalManageMembers from './ui-components/modalManageMembers'
import searchImg from '@/public/icons/search.svg'
import {
  ChatNameModals,
  MessageActionsTypes,
  CustomQuotedMessage,
  ChatHeaderActionIcon,
  ToastType
} from './types'

export default function Page () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userId, setUserId] = useState<String | null>('')
  const [chat, setChat] = useState<Chat | null>(null)
  const [loadMessage, setLoadMessage] = useState("Chat is initializing...")

  const [unreadExpanded, setUnreadExpanded] = useState(true)
  const [publicExpanded, setPublicExpanded] = useState(true)
  const [groupsExpanded, setGroupsExpanded] = useState(true)
  const [directMessagesExpanded, setDirectMessagesExpanded] = useState(true)
  const [showThread, setShowThread] = useState(false)
  const [showPinnedMessages, setShowPinnedMessages] = useState(false)
  const [roomSelectorVisible, setRoomSelectorVisible] = useState(false)
  const [profileScreenVisible, setProfileScreenVisible] = useState(false)
  const [chatSettingsScreenVisible, setChatSettingsScreenVisible] =
    useState(false)
  const [creatingNewMessage, setCreatingNewMessage] = useState(false)
  const [changeUserNameModalVisible, setChangeUserNameModalVisible] =
    useState(false)
  const [changeChatNameModalVisible, setChangeChatNameModalVisible] =
    useState(false)
  const [manageMembersModalVisible, setManageMembersModalVisible] =
    useState(false)

  const [userMsg, setUserMsg] = useState({
    message: 'Message Text.  Message Text.  ',
    title: 'Please Note:',
    href: 'http://www.pubnub.com',
    type: 0
  })
  const [userMsgShown, setUserMsgShown] = useState(false)
  const [userMsgTimeoutId, setUserMsgTimeoutId] = useState(0)

  const [quotedMessage, setQuotedMessage] =
    useState<CustomQuotedMessage | null>(null)
  const [typingUsers, setTypingUsers] = useState<String | null>(null)

  useEffect(() => {
    async function init () {
      setUserId(searchParams.get('userId'))
      if (userId == null || userId === '') {
        setLoadMessage("Retrieving User ID")
        return
      }
      if (!process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY)
        {
          setLoadMessage("No Publish Key Found")
          return
        }
        if (!process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY)
          {
            setLoadMessage("No Subscribe Key Found")
            return
          }
        const chat = await Chat.init({
        publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
        userId: userId,
        typingTimeout: 2000,
        storeUserActivityTimestamps: true,
        storeUserActivityInterval: 60000,
      })

      setChat(chat)
      console.log(chat.currentUser)
      if (!chat.currentUser.profileUrl)
        {
          //  This is the first time this user has logged in, generate them a random name and profile image
          //  todo
          chat.currentUser.update({
            name: "Darryn Campbell",
            profileUrl: "/avatars/avatar04.png"
          })
        }
    }
    init()
  }, [userId, setChat, searchParams])

  function handleChatSearch (term: string) {
    console.log(term)
  }

  function handleMessageDraftChanged (draft: string) {
    console.log(draft)
  }

  function messageActionHandler (action, data) {
    switch (action) {
      case MessageActionsTypes.REPLY_IN_THREAD:
        setShowThread(true)
        setShowPinnedMessages(false)
        showUserMessage(
          null,
          'Work in progress: Though supported by the Chat SDK, this demo does not yet support threaded messages',
          ''
        )
        break
      case MessageActionsTypes.QUOTE:
        let newQuotedMessage: CustomQuotedMessage = {
          message: 'This is a quoted message. ',
          sender: 'Sarah Johannsen'
        }
        setQuotedMessage(newQuotedMessage)
        break
      case MessageActionsTypes.PIN:
        setShowThread(false)
        setShowPinnedMessages(true)
        showUserMessage(
          null,
          'Work in progress: Though supported by the Chat SDK, this demo does not yet support pinning messages',
          ''
        )
        break
      case MessageActionsTypes.REACT:
        showUserMessage(
          `Selected ${data.native}`,
          'Work in progress: Though supported by the Chat SDK, this demo does not yet support message reactions',
          ''
        )
        break
      case MessageActionsTypes.COPY:
        showUserMessage(
          'WORK IN PROGRESS!',
          'Message not copied',
          '',
          ToastType.ERROR
        )
        break
    }
  }

  function logout () {
    router.replace(`/`)
  }

  function showUserMessage (title, message, href, type = ToastType.INFO) {
    clearTimeout(userMsgTimeoutId)
    setUserMsg({ message: message, href: href, title: title, type: type })
    setUserMsgShown(true)
    let timeoutId = window.setTimeout(setUserMsgShown, 7000, false)
    setUserMsgTimeoutId(timeoutId)
  }

  function closeUserMessage () {
    clearTimeout(userMsgTimeoutId)
    setUserMsgShown(false)
  }

  if (!chat) {
    return (
      <main>
        <div className='flex flex-col w-full h-screen justify-center items-center'>
          <div className='max-w-96 max-h-96 '>
            <Image
              src='/chat.svg'
              alt='Chat Icon'
              className=''
              width={1000}
              height={1000}
              priority
            />
          </div>
          <div className="flex mb-5 animate-spin">
              <Image
                src='/icons/loading.png'
                alt='Chat Icon'
                className=''
                width={50}
                height={50}
                priority
              />
            </div>
            <div className="text-2xl">{loadMessage}</div>
        </div>
      </main>
    )
  }

  return (
    <main className='overscroll-none overflow-y-hidden'>
      <RoomSelector
        roomSelectorVisible={roomSelectorVisible}
        setRoomSelectorVisible={setRoomSelectorVisible}
      />
      <ProfileScreen
        profileScreenVisible={profileScreenVisible}
        setProfileScreenVisible={setProfileScreenVisible}
        changeUserNameScreenVisible={changeUserNameModalVisible}
        currentUser={chat.currentUser}
        logout={() => logout()}
        changeName={() => {setChangeUserNameModalVisible(true)}}
        showUserMessage={showUserMessage}
      />
      <ChatSettingsScreen
        chatSettingsScreenVisible={chatSettingsScreenVisible}
        setChatSettingsScreenVisible={setChatSettingsScreenVisible}
        changeChatNameScreenVisible={changeChatNameModalVisible}
        manageMembersModalVisible={manageMembersModalVisible}
        isDirectChat={false}
        currentChannel='Presumably this will be a PN Channel object'
        buttonAction={() => {
          console.log('ToDo: Either delete or leave conversation')
          showUserMessage(
            null,
            'Work in progress: Though supported by the Chat SDK, this demo does not yet support leaving channels (either 1:1 conversations, or private groups)',
            'https://www.pubnub.com/docs/chat/chat-sdk/build/features/channels/updates#update-channel-details'
          )
        }}
        changeChatNameAction={() => {
          setChangeChatNameModalVisible(true)
        }}
        manageMembershipsAction={() => {
          setManageMembersModalVisible(true)
        }}
      />
      {/* Modal to change the Chat group name*/}
      <ModalChangeName
        name='Bike lovers'
        modalType={ChatNameModals.CHANNEL}
        saveAction={newName => {
          showUserMessage(
            null,
            'Work in progress: Though supported by the Chat SDK, this demo does not yet support changing channel names',
            'https://www.pubnub.com/docs/chat/chat-sdk/build/features/channels/updates#update-channel-details'
          )
        }}
        changeNameModalVisible={changeChatNameModalVisible}
        setChangeNameModalVisible={setChangeChatNameModalVisible}
      />
      <ModalManageMembers
        saveAction={() => {
          showUserMessage(
            null,
            "Work in progress: ToDo: This feature will probably be changed to 'View Members'",
            ''
          )
        }}
        manageMembersModalVisible={manageMembersModalVisible}
        setManageMembersModalVisible={setManageMembersModalVisible}
      />
      {/* Modal to change the user name */}
      <ModalChangeName
        name={chat.currentUser.name}
        modalType={ChatNameModals.USER}
        saveAction={async newName => {
          await chat.currentUser.update({
            name: newName
          })
          showUserMessage(
            "Name Changed",
            'Your name has been successfully updated',
            'https://www.pubnub.com/docs/chat/chat-sdk/build/features/users/updates#update-user-details',
            ToastType.CHECK
          )
        }}
        changeNameModalVisible={changeUserNameModalVisible}
        setChangeNameModalVisible={setChangeUserNameModalVisible}
      />

      <Header
        setRoomSelectorVisible={setRoomSelectorVisible}
        setProfileScreenVisible={setProfileScreenVisible}
        showNotificationBadge={true}
        showMentionsBadge={false}
        creatingNewMessage={creatingNewMessage}
        setCreatingNewMessage={setCreatingNewMessage}
        showUserMessage={showUserMessage}
      />
      <UserMessage
        userMsgShown={userMsgShown}
        title={userMsg.title}
        message={userMsg.message}
        href={userMsg.href}
        type={userMsg.type}
        closeToastAction={() => {
          closeUserMessage()
        }}
      />
      <div
        id='chat-main'
        className={`flex flex-row min-h-screen h-screen overscroll-none  ${
          (roomSelectorVisible ||
            profileScreenVisible ||
            chatSettingsScreenVisible ||
            changeChatNameModalVisible ||
            manageMembersModalVisible) &&
          'blur-sm opacity-40'
        }`}
      >
        <div
          id='chats-menu'
          className='flex flex-col min-w-80 w-80 bg-navy50 py-0 overflow-y-auto overscroll-none mt-[64px] pb-6 select-none'
        >
          <div id='chats-search' className='relative px-4 mt-5'>
            <input
              id='chats-search-input'
              className='flex w-full rounded-md bg-navy50 border  border-neutral-400 py-[9px] pl-9 px-[13px] text-sm focus:ring-1 focus:ring-inputring outline-none placeholder:text-neutral-500'
              placeholder='Search'
              onChange={e => {
                handleChatSearch(e.target.value)
              }}
            />
            <Image
              src='/icons/search.svg'
              alt='Search Icon'
              className='absolute left-6 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900'
              width={20}
              height={20}
              priority
            />
          </div>

          <ChatMenuHeader
            text='UNREAD'
            actionIcon={ChatHeaderActionIcon.MARK_READ}
            expanded={unreadExpanded}
            expandCollapse={() => {
              setUnreadExpanded(!unreadExpanded)
            }}
            action={() => {
              showUserMessage(
                null,
                'Mark all as Read - not yet implemented',
                'https://www.pubnub.com'
              )
            }}
          />
          {unreadExpanded && (
            <div>
              <ChatMenuItem
                avatarUrl='/avatars/avatar01.png'
                text='Label 01'
                present={1}
                count='5'
                markAsRead={true}
                markAsReadAction={() => {
                  showUserMessage(
                    null,
                    'Work in progress: Though supported by the Chat SDK, this demo does not yet support marking messages as read',
                    ''
                  )
                }}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar02.png'
                text='Label 02'
                present={0}
                count='10'
                markAsRead={true}
                markAsReadAction={() => {
                  showUserMessage(
                    null,
                    'Work in progress: Though supported by the Chat SDK, this demo does not yet support marking messages as read',
                    ''
                  )
                }}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar03.png'
                text='Label 03'
                present={1}
                avatarBubblePrecedent='+5'
                count=''
                markAsRead={true}
                markAsReadAction={() => {
                  showUserMessage(
                    null,
                    'Work in progress: Though supported by the Chat SDK, this demo does not yet support marking messages as read',
                    ''
                  )
                }}
              />
            </div>
          )}

          <div className='w-full border border-navy200 mt-4'></div>
          <ChatMenuHeader
            text='PUBLIC CHANNELS'
            expanded={publicExpanded}
            expandCollapse={() => {
              setPublicExpanded(!publicExpanded)
            }}
            actionIcon={ChatHeaderActionIcon.NONE}
            action={() => {}}
          />
          {publicExpanded && (
            <div>
              <ChatMenuItem
                avatarUrl='/group/globe1.svg'
                text='General Chat'
                present={-1}
              />
              <ChatMenuItem
                avatarUrl='/group/globe2.svg'
                text='Work Chat'
                present={-1}
              />
            </div>
          )}

          <div className='w-full border border-navy200 mt-4'></div>
          <ChatMenuHeader
            text='PRIVATE GROUPS'
            expanded={groupsExpanded}
            expandCollapse={() => setGroupsExpanded(!groupsExpanded)}
            actionIcon={ChatHeaderActionIcon.ADD}
            action={setCreatingNewMessage}
          />
          {groupsExpanded && (
            <div>
              <ChatMenuItem
                avatarUrl='/avatars/avatar04.png'
                text='Label 04'
                present={1}
                avatarBubblePrecedent='+2'
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar05.png'
                text='Label 05'
                present={0}
                avatarBubblePrecedent='+5'
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar06.png'
                text='Label 06'
                present={1}
                avatarBubblePrecedent='+1'
              />
            </div>
          )}

          <div className='w-full border border-navy200 mt-4'></div>
          <ChatMenuHeader
            text='DIRECT MESSAGES'
            expanded={directMessagesExpanded}
            expandCollapse={() =>
              setDirectMessagesExpanded(!directMessagesExpanded)
            }
            actionIcon={ChatHeaderActionIcon.ADD}
            action={setCreatingNewMessage}
          />
          {directMessagesExpanded && (
            <div>
              <ChatMenuItem
                avatarUrl='/avatars/avatar07.png'
                text='Label 07'
                present={1}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar08.png'
                text='Label 08'
                present={0}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar09.png'
                text='Label 09'
                present={1}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar08.png'
                text='Label 08'
                present={0}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar09.png'
                text='Label 09'
                present={1}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar08.png'
                text='Label 08'
                present={0}
              />
              <ChatMenuItem
                avatarUrl='/avatars/avatar09.png'
                text='Label 09'
                present={1}
              />
            </div>
          )}
        </div>
        <div className='relative w-full'>
          <div
            id='chats-main'
            className='flex flex-col grow w-full max-h-screen py-0 mt-[64px]'
          >
            {creatingNewMessage ? (
              <NewMessageGroup setCreatingNewMessage={setCreatingNewMessage} />
            ) : (
              <MessageList
                messageActionHandler={(action, vars) =>
                  messageActionHandler(action, vars)
                }
                setChatSettingsScreenVisible={setChatSettingsScreenVisible}
                quotedMessage={quotedMessage}
                setShowPinnedMessages={setShowPinnedMessages}
                setShowThread={setShowThread}
              />
            )}
            {!quotedMessage && typingUsers && (
              <TypingIndicator
                text={typingUsers}
                avatarUrl={'/avatars/avatar02.png'}
              />
            )}
            <div className='absolute bottom-0 left-0 right-0'>
              <MessageInput
                replyInThread={false}
                quotedMessage={quotedMessage}
                setQuotedMessage={setQuotedMessage}
              />
            </div>
          </div>
        </div>
        <MessageListThread
          showThread={showThread}
          setShowThread={setShowThread}
        />
        <MessageListPinned
          showPinnedMessages={showPinnedMessages}
          setShowPinnedMessages={setShowPinnedMessages}
        />
      </div>
    </main>
  )
}
