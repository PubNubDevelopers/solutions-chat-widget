'use client'

import { useSearchParams } from 'next/navigation'
//import { ChatContext } from './context'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useContext, useCallback, useRef } from 'react'
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
import { testData } from './data/user-data'
import {
  ChatNameModals,
  MessageActionsTypes,
  CustomQuotedMessage,
  ChatHeaderActionIcon,
  ToastType
} from '@/app/types'

export default function Page () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userId, setUserId] = useState<String | null>('')
  const [chat, setChat] = useState<Chat | null>(null)
  const [loadMessage, setLoadMessage] = useState('Chat is initializing...')

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

  const [name, setName] = useState('')
  const [profileUrl, setProfileUrl] = useState('')

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

  //const [activeChannelId, setActiveChannelId] = useState<string>('')
  const [previousChannelId, setPreviousChannelId] = useState(0)
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [activeChannelMemberships, setActiveChannelMemberships] = useState<
    User[]
  >([]) //  Not yet used
  const [publicChannels, setPublicChannels] = useState<Channel[]>()
  //const [users, setUsers] = useState<User[]>([])
  const [activeChannelUsers, setActiveChannelUsers] = useState<User[]>([])
  const [channelStreamedUsers, setChannelStreamedUsers] = useState<User[]>([])
  const tempUsers = useRef<User[]>([])

  /* Initialization logic */
  useEffect(() => {
    async function init () {
      setUserId(searchParams.get('userId'))
      if (userId == null || userId === '') {
        setLoadMessage('Retrieving User ID')
        return
      }
      if (!process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY) {
        setLoadMessage('No Publish Key Found')
        return
      }
      if (!process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY) {
        setLoadMessage('No Subscribe Key Found')
        return
      }
      const chat = await Chat.init({
        publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
        userId: userId,
        typingTimeout: 2000,
        storeUserActivityTimestamps: true,
        storeUserActivityInterval: 60000
      })

      setChat(chat)
      console.log(chat.currentUser)
      console.log(testData.avatars)

      if (!chat.currentUser.profileUrl) {
        //  This is the first time this user has logged in, generate them a random name and profile image
        //  todo
        const randomProfileUrl = Math.floor(
          Math.random() * testData.avatars.length
        )
        chat.currentUser.update({
          name: '' + userId,
          profileUrl: testData.avatars[randomProfileUrl]
        })
        setName('' + userId)
        setProfileUrl(testData.avatars[randomProfileUrl])
      } else {
        setName(chat.currentUser.name)
        setProfileUrl(chat.currentUser.profileUrl)
      }

      chat
        .getChannels({ filter: `type == 'public'` })
        .then(async channelsResponse => {
          if (channelsResponse.channels.length < 2) {
            //  There are fewer than the expected number of public channels on this keyset, do any required Keyset initialization
            await keysetInit()
            router.refresh()
          } else {
            //console.log(channelsResponse.channels)
            console.log('SETTING PUBLIC CHANNELS')
            if (channelsResponse.channels.length > 0) {
              //  Join each of the public channels
              channelsResponse.channels.forEach(channel => {
                channel.join(message => {
                  //  todo populate unread messages pane with messages if required (think there is an API to get unread messages on a channel)
                  console.log(message.content.text)
                })
              })
              //  Keep a local reference to these public channels
              await setPublicChannels(channelsResponse.channels)
              //  By default, show the first public channel
              console.log('setting active channel')
              setActiveChannel(channelsResponse.channels[0])
            }
          }
        })

        //  todo Put this into a useCallback
      chat.currentUser.getMemberships().then(membershipResponse => {
        console.log(membershipResponse)
        const currentMemberOfTheseDirectChannels = membershipResponse.memberships.map((m) => m.channel).filter((c) => c.type === 'direct')
        const currentMemberOfTheseGroupChannels = membershipResponse.memberships.map((m) => m.channel).filter((c) => c.type === 'group')
        const directChannelMemberships = membershipResponse.memberships.filter((m) => m.channel.type === 'direct')
        const groupChannelMemberships = membershipResponse.memberships.filter((m) => m.channel.type === 'group')
        console.log("Direct:")
        console.log(currentMemberOfTheseDirectChannels)
        console.log("Group:")
        console.log(currentMemberOfTheseGroupChannels)
        //console.log(currentMemberOfTheseGroupChannels[0].id)
        console.log("Direct Memberships")
        console.log(directChannelMemberships)
      })
    }
    init()
  }, [userId, setChat, searchParams, router])

  useEffect(() => {
    if (!chat?.currentUser) return
    return chat.currentUser.streamUpdates(updatedUser => {
      //console.log('PROFILE SCREEN STREAM UPDATES: ')
      //console.log(updatedUser)
      if (updatedUser.name) {
        setName(updatedUser.name)
      }
      if (updatedUser.profileUrl) {
        setProfileUrl(updatedUser.profileUrl)
      }
    })
  }, [chat?.currentUser])

  /* Handle updates to the Public Channels */
  useEffect(() => {
    if (chat && publicChannels) {
      return Channel.streamUpdatesOn(publicChannels, channels => {
        const updatedPublicChannels = publicChannels.map(
          (publicChannel, index) => {
            if (channels[index].name) {
              //console.log('name changed')
              ;(publicChannel as any).name = channels[index].name
            }
            if (channels[index].custom?.profileUrl) {
              console.log('profile changed')
              publicChannel.custom.profileUrl =
                channels[index].custom.profileUrl
            }
            return publicChannel
          }
        )
        setPublicChannels(updatedPublicChannels)
      })
    }
  }, [chat, publicChannels])

  /* Register for updates for user streams */
  useEffect(() => {
    //console.log('streaming updates on users 1')
    if (chat && activeChannelUsers && activeChannelUsers.length > 0) {
      //  Streaming Updates on users
      console.log('Streaming updates on users')
      console.log(activeChannelUsers)
      setChannelStreamedUsers([...activeChannelUsers])
      console.log(channelStreamedUsers)
      const unstream = User.streamUpdatesOn(
        activeChannelUsers,
        updatedUsers => {
          //console.log('RECEIVED an update on Streamed users: ')
          //console.log(updatedUsers)
          const updatedUsersArr = activeChannelUsers.map((user, index) => {
            if (updatedUsers[index].name) {
              ;(user as any).name = updatedUsers[index].name
            }
            if (updatedUsers[index].profileUrl) {
              ;(user as any).profileUrl = updatedUsers[index].profileUrl
            }
            return user
          })
          //console.log('setting to:')
          //console.log(updatedUsersArr)
          setChannelStreamedUsers(updatedUsersArr)
        }
      )
      return unstream
    }
  }, [chat, activeChannelUsers])

  /* Retrieve the members of the active channel & update state variables for users and memberships */
  const getActiveChannelMembers = useCallback(
    async (newUserId: string) => {
      console.log('CALLBACK: New user')
      activeChannel
        .getMembers({ sort: { updated: 'desc' }, limit: 100 })
        .then(response => {
          if (response.members) {
            setActiveChannelMemberships(response.members)
            //  response contains the most recent 100 members
            const localChannelUsers = response.members.map(
              (membership, index) => {
                return membership.user
              }
            )
            console.log('setting channel users')
            setActiveChannelUsers(localChannelUsers)

            //Membership.streamUpdatesOn(response.members, updatedMemberships => {
            //  console.log('updated memberships')
            //  console.log(updatedMemberships)
            //})
          }
        })
      return
    },
    [activeChannel]
  )

  /* Detect when the user switches channel and update our membership variables */
  useEffect(() => {
    if (!chat || !activeChannel) return
    console.log('ACTIVE CHANNEL CHANGED ' + activeChannel.id)

    //  Retrieve the members of this channel
    getActiveChannelMembers()
  }, [chat, activeChannel, previousChannelId, getActiveChannelMembers])

  /* Bootstrap the application if it is run in an empty keyset */
  async function keysetInit () {
    try {
      await chat?.createPublicConversation({
        channelId: 'public-general',
        channelData: {
          name: 'General Chat',
          description: 'Public group for general conversation',
          custom: {
            profileUrl: '/group/globe1.svg'
          }
        }
      })
    } catch (e) {}

    try {
      await chat?.createPublicConversation({
        channelId: 'public-work',
        channelData: {
          name: 'Work Chat',
          description: 'Public group for conversation about work',
          custom: {
            profileUrl: '/group/globe2.svg'
          }
        }
      })
    } catch (e) {}
  }

  function handleChatSearch (term: string) {
    console.log(term)
  }

  function handleMessageDraftChanged (draft: string) {
    console.log(draft)
  }

  async function messageActionHandler (action, data) {
    switch (action) {
      case MessageActionsTypes.REPLY_IN_THREAD:
        //  todo this is test code
        //chat.getChannels().then(channelsResponse => {
        //  console.log("CHANNELS RESPONSE")
        //  console.log(channelsResponse)
        //})
        //break;
        //  todo end test code

        setShowThread(true)
        setShowPinnedMessages(false)
        showUserMessage(
          'Please Note:',
          'Work in progress: Though supported by the Chat SDK, this demo does not yet support threaded messages',
          ''
        )
        break
      case MessageActionsTypes.QUOTE:
        //  todo this is test code
        //const other = await chat.getUser('test-darryn-2')
        //await chat.createGroupConversation({users: [other]})
        //break;
        //  todo end test code

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
          'Please Note:',
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
        showUserMessage('Copied', `${data.text}`, '', ToastType.CHECK)
        break
    }
  }
  /*
  function uniqueByUserId (users) {
    const set = new Set()
    return users.filter(user => {
      const isDuplicate = set.has(user.id)
      set.add(user.id)
      return !isDuplicate
    })
  }



  const getUser = useCallback(
    async (userId: string) => {
      if (!chat || !users) return
      console.log('useCallback called for ' + userId)
      console.log(users)
      //const existingUser = users.find(user => user.id === userId)
      //console.log('existing user: ' + existingUser)
      console.log(tempUsers)
      const existingUserTemp = tempUsers?.current.find(user => user.id === userId)
      console.log('existing user temp: ' + existingUserTemp)
      if (!existingUserTemp) {
        console.log('FETCHING USER INFO')
        const fetchedUser = await chat?.getUser(userId)
        if (fetchedUser)
          {
            console.log('calling set users')
            tempUsers?.current.push(fetchedUser)
            console.log(tempUsers.current)
            //setUsers([...users, fetchedUser])
          }
        //chat?.getUser(userId).then(fetchedUser => {
        //  if (fetchedUser) {
        //    //console.log('Calling set Users')
        //    setUsers(users => {
        //      return uniqueByUserId([...users, fetchedUser])
        //    })
        //  }
        //})
        return null
      }
      
      return existingUserTemp
    }, [tempUsers]
  )
  */

  /*
  function seenUserId (userId) {
    if (userId == chat?.currentUser.id) {
      //  No action, this is our own ID
      return
    } else {
      getUser(userId)
    }
  }
  */

  function logout () {
    router.replace(`/`)
  }

  function showUserMessage (
    title: string,
    message: string,
    href: string,
    type = ToastType.INFO
  ) {
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
          <div className='text-2xl'>{loadMessage}</div>
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
        //currentUser={chat.currentUser}
        name={name}
        profileUrl={profileUrl}
        logout={() => logout()}
        changeName={() => {
          setChangeUserNameModalVisible(true)
        }}
        showUserMessage={showUserMessage}
      />
      <ChatSettingsScreen
        chatSettingsScreenVisible={chatSettingsScreenVisible}
        setChatSettingsScreenVisible={setChatSettingsScreenVisible}
        changeChatNameScreenVisible={changeChatNameModalVisible}
        manageMembersModalVisible={manageMembersModalVisible}
        isDirectChat={false}
        activeChannel={activeChannel}
        activeChannelUsers={activeChannelUsers}
        //users={users}
        //currentChannel='Presumably this will be a PN Channel object'
        buttonAction={() => {
          console.log('ToDo: Either delete or leave conversation')
          showUserMessage(
            'Please Note:',
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
        showUserMessage={showUserMessage}
      />
      {/* Modal to change the Chat group name*/}
      <ModalChangeName
        activeChannel={activeChannel}
        modalType={ChatNameModals.CHANNEL}
        showUserMessage={showUserMessage}
        saveAction={async newName => {
          await activeChannel.update({
            name: newName
          })
          setName(newName)
          showUserMessage(
            'Channel Name Changed',
            'The channel name has been successfully updated',
            'https://www.pubnub.com/docs/chat/chat-sdk/build/features/channels/updates#update-channel-details'
          )
        }}
        changeNameModalVisible={changeChatNameModalVisible}
        setChangeNameModalVisible={setChangeChatNameModalVisible}
      />
      <ModalManageMembers
        activeChannelUsers={activeChannelUsers}
        saveAction={() => {
          setManageMembersModalVisible(false)
        }}
        manageMembersModalVisible={manageMembersModalVisible}
        setManageMembersModalVisible={setManageMembersModalVisible}
      />
      {/* Modal to change the user name */}
      <ModalChangeName
        name={name}
        modalType={ChatNameModals.USER}
        saveAction={async newName => {
          await chat.currentUser.update({
            name: newName
          })
          setName(newName)
          showUserMessage(
            'Name Changed',
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
                'Please Note:',
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
                    'Please Note:',
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
                    'Please Note:',
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
                    'Please Note:',
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
              {publicChannels?.map((publicChannel, index) => (
                <ChatMenuItem
                  key={index}
                  avatarUrl={publicChannel.custom.profileUrl}
                  text={publicChannel.name}
                  present={-1}
                  setActiveChannel={() => {
                    setActiveChannel(publicChannels[index])
                  }}
                ></ChatMenuItem>
              ))}
              {/*<ChatMenuItem
                avatarUrl='/group/globe1.svg'
                text='General Chat'
                present={-1}
              />
              <ChatMenuItem
                avatarUrl='/group/globe2.svg'
                text='Work Chat'
                present={-1}
          />*/}
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
                activeChannel={activeChannel}
                currentUser={chat.currentUser}
                users={channelStreamedUsers} //  channelStreamedUsers activeChannelUsers
                messageActionHandler={(action, vars) =>
                  messageActionHandler(action, vars)
                }
                seenUserId={newUserId => {
                  console.log('new user: ' + newUserId)
                  getActiveChannelMembers()
                }}
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
                activeChannel={activeChannel}
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
