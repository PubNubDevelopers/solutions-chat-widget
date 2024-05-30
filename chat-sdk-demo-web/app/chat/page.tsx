'use client'

import { useSearchParams } from 'next/navigation'
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
  ToastType,
  ChatEventTypes
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
  const [refreshMembersTimeoutId, setRefreshMembersTimeoutId] = useState(0)
  //  const [forceUpdate, setForceUpdate] = useState(0)

  const [quotedMessage, setQuotedMessage] =
    useState<CustomQuotedMessage | null>(null)
  const [typingUsers, setTypingUsers] = useState<String | null>(null)

  //  State of the channels I'm a member of (left hand pane)
  const [publicChannels, setPublicChannels] = useState<Channel[]>()
  const [privateGroups, setPrivateGroups] = useState<Channel[]>()
  const [directChats, setDirectChats] = useState<Channel[]>()
  const [publicChannelsMemberships, setPublicChannelsMemberships] =
    useState<Membership[]>()
  const [privateGroupsMemberships, setPrivateGroupsMemberships] =
    useState<Membership[]>()
  const [directChatsMemberships, setDirectChatsMemberships] =
    useState<Membership[]>()
  const [publicChannelsUsers, setPublicChannelsUsers] = useState<User[][]>([])
  const [privateGroupsUsers, setPrivateGroupsUsers] = useState<User[][]>([])
  const [directChatsUsers, setDirectChatsUsers] = useState<User[][]>([])

  //  State of the currently active Channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [activeChannelGroupIndex, setActiveChannelGroupIndex] = useState(-1)

  /* Bootstrap the application if it is run in an empty keyset */
  async function keysetInit (chat) {
    if (!chat) return
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

  /*  Initialize or Update all the state arrays related to public groups */
  async function updateChannelMembershipsForPublic (chat) {
    if (!chat) return
    chat.currentUser.getMemberships({}).then(async membershipResponse => {
      const currentMemberOfThesePublicChannels = membershipResponse.memberships
        .map(m => m.channel)
        .filter(c => c.type === 'public')
      setPublicChannels(currentMemberOfThesePublicChannels)
      const publicChannelMemberships = membershipResponse.memberships.filter(
        m => m.channel.type === 'public'
      )
      setPublicChannelsMemberships(publicChannelMemberships)

      //  Get the users for every public group I am a member of
      let tempPublicUsers: User[][] = []
      for (
        var indexGroup = 0;
        indexGroup < currentMemberOfThesePublicChannels.length;
        indexGroup++
      ) {
        var tempIndex = indexGroup
        const response = await currentMemberOfThesePublicChannels[
          indexGroup
        ].getMembers({ sort: { updated: 'desc' }, limit: 100 })
        //.then(function (response) {
        if (response.members) {
          //  response contains the most recent 100 members
          const channelUsers = response.members.map((membership, index) => {
            return membership.user
          })
          tempPublicUsers[tempIndex] = channelUsers
        }
        //            }, tempIndex)
      }
      setPublicChannelsUsers(tempPublicUsers)
      //})
    })
  }

  /* Initialize or Update all the state arrays related to private groups */
  async function updateChannelMembershipsForGroups (chat) {
    if (!chat) return
    chat.currentUser
      .getMemberships({ sort: { updated: 'desc' } })
      .then(async membershipResponse => {
        const currentMemberOfTheseGroupChannels = membershipResponse.memberships
          .map(m => m.channel)
          .filter(c => c.type === 'group')
        setPrivateGroups(currentMemberOfTheseGroupChannels)
        const groupChannelMemberships = membershipResponse.memberships.filter(
          m => m.channel.type === 'group'
        )
        setPrivateGroupsMemberships(groupChannelMemberships)

        //  Get the users for every private group I am a member of
        let tempGroupUsers: User[][] = []
        for (
          var indexGroup = 0;
          indexGroup < currentMemberOfTheseGroupChannels.length;
          indexGroup++
        ) {
          //currentMemberOfTheseGroupChannels.forEach((channel, index) => {
          var tempIndex = indexGroup
          const response = await currentMemberOfTheseGroupChannels[
            indexGroup
          ].getMembers({ sort: { updated: 'desc' }, limit: 100 })
          if (response.members) {
            const channelUsers = response.members.map((membership, index) => {
              return membership.user
            })
            tempGroupUsers[tempIndex] = channelUsers
          }
        }
        setPrivateGroupsUsers(tempGroupUsers)
      })
  }

  /* Initialize or Update all the state arrays related to Direct message pairs */
  async function updateChannelMembershipsForDirects (chat) {
    if (!chat) return
    chat.currentUser
      .getMemberships({ sort: { updated: 'desc' } })
      .then(async membershipResponse => {
        const currentMemberOfTheseDirectChannels =
          membershipResponse.memberships
            .map(m => m.channel)
            .filter(c => c.type === 'direct')
        setDirectChats(currentMemberOfTheseDirectChannels)
        const directChannelMemberships = membershipResponse.memberships.filter(
          m => m.channel.type === 'direct'
        )
        setDirectChatsMemberships(directChannelMemberships)

        //  Get the users for every direct message pair I am a member of
        let tempDirectUsers: User[][] = []
        for (
          var indexDirects = 0;
          indexDirects < currentMemberOfTheseDirectChannels.length;
          indexDirects++
        ) {
          //currentMemberOfTheseDirectChannels.forEach(channel => {
          var tempIndex = indexDirects
          const response = await currentMemberOfTheseDirectChannels[
            indexDirects
          ].getMembers({ sort: { updated: 'desc' }, limit: 100 })
          //.then(function (response) {

          if (response.members) {
            //  response contains the most recent 100 members
            const channelUsers = response.members.map((membership, index) => {
              return membership.user
            })
            tempDirectUsers[tempIndex] = channelUsers
          }
        }
        setDirectChatsUsers(tempDirectUsers)
      })
  }

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
        setName('' + chat.currentUser.name)
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
            //  Join public channels
            if (channelsResponse.channels.length > 0) {
              //  Join each of the public channels
              channelsResponse.channels.forEach(channel => {
                channel.join(message => {
                  //  todo populate unread messages pane with messages if required (think there is an API to get unread messages on a channel)
                  console.log(message.content.text)
                  //  todo send a message to everyone else in this public channel that I have joined (they can then update their channel users)
                })
              })
            }
          }
        })

      //  Initialization for private groups and direct messages
      updateChannelMembershipsForPublic(chat)
      updateChannelMembershipsForGroups(chat)
      updateChannelMembershipsForDirects(chat)
      //  A useEffect below is responsible for setting the initial channel
    }
    init()
    //updateChannelMembershipsForDirects()
  }, [userId, setChat, searchParams, router])

  useEffect(() => {
    if (
      chat &&
      publicChannels?.length > 0 &&
      publicChannelsUsers?.length > 0 &&
      !activeChannel
    ) {
      console.log('Setting active channel on init')
      setActiveChannelGroupIndex(0)
      setActiveChannel(publicChannels[0])
    }
  }, [activeChannel, chat, publicChannels, publicChannelsUsers])

  useEffect(() => {
    if (!chat) return
    console.log('streaming updates current user: ' + chat.currentUser.id)
    return chat.currentUser.streamUpdates(updatedUser => {
      console.log('received update')
      if (updatedUser.name) {
        setName(updatedUser.name)
      }
      if (updatedUser.profileUrl) {
        setProfileUrl(updatedUser.profileUrl)
      }
    })
  }, [chat])

  /* Handle updates to the Public Channels */
  useEffect(() => {
    if (chat && publicChannels && publicChannels.length > 0) {
      return Channel.streamUpdatesOn(publicChannels, channels => {
        const updatedPublicChannels = publicChannels.map(
          (publicChannel, index) => {
            if (channels[index].name) {
              ;(publicChannel as any).name = channels[index].name
            }
            if (channels[index].custom?.profileUrl) {
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

  /* Handle updates to the Private Groups */
  useEffect(() => {
    if (chat && privateGroups && privateGroups.length > 0) {
      return Channel.streamUpdatesOn(privateGroups, channels => {
        const updatedPrivateGroups = privateGroups.map(
          (privateGroup, index) => {
            if (channels[index].name) {
              ;(privateGroup as any).name = channels[index].name
            }
            return privateGroup
          }
        )
        setPrivateGroups(updatedPrivateGroups)
      })
    }
  }, [chat, privateGroups])

  /* Handle updates to the Direct Message Groups */
  useEffect(() => {
    if (chat && directChats && directChats.length > 0) {
      //  Note: We do not need to stream updates on direct chats since we do not use the channel name, only the user info (name, avatar)
    }
  }, [chat, directChats])

  /* Listen for  */
  useEffect(() => {
    if (!chat) return
    //  todo Handle received custom events, sent as a result of users joining or leaving channels I'm part of
    const removeCustomListener = chat.listenForEvents({
      channel: chat.currentUser.id,
      type: 'custom',
      method: 'publish',
      callback: async evt => {
        console.log('RECEIVED EVENT')
        console.log(evt.payload.action)
        console.log(evt.payload.custom)
      }
    })

    //  todo other listeners go here

    return () => {
      removeCustomListener()
      //  todo remove other listeners
    }
  }, [chat])

  /* 
  Will refresh all of the users and channels associated with this user's memberships
  You could do this using the objects from the StreamUpdatesOn() callbacks, but 
  this way is expedient for a proof of concept.  The Channel name updates use the StreamUpdatesOn() callback directly.
  */
  const refreshMembersFromServer = useCallback(async () => {
    if (!chat) return
    return //  TODO REMOVE THIS TO ENABLE OBJECT UPDATES.  IT'S JUST A PAIN WHEN DEBUGGING

    clearTimeout(refreshMembersTimeoutId)
    let setTimeoutId = setTimeout(() => {
      console.log('timeout fired')
      updateChannelMembershipsForPublic(chat)
      updateChannelMembershipsForDirects(chat)
      updateChannelMembershipsForGroups(chat)
    }, '3000')
    setRefreshMembersTimeoutId(setTimeoutId)

    return
  }, [chat, refreshMembersTimeoutId])

  /* Detect when the user switches channel and update our membership variables */
  useEffect(() => {
    if (!chat || !activeChannel) return
    console.log('ACTIVE CHANNEL CHANGED ' + activeChannel.id)

    //  Retrieve the members of this channel
    //getActiveChannelMembers()
  }, [chat, activeChannel /*, getActiveChannelMembers*/])

  function handleChatSearch (term: string) {
    console.log(term)
  }

  function handleMessageDraftChanged (draft: string) {
    console.log(draft)
  }

  function sendChatEvent (
    eventType: ChatEventType,
    recipients: User[],
    payload
  ) {
    recipients.forEach(async recipient => {
      //  Don't send the message to myself
      console.log('sending event: ' + eventType)
      if (recipient.id !== chat.currentUser.id) {
        await chat.emitEvent({
          channel: recipient.id,
          type: 'custom',
          method: 'publish',
          payload: {
            action: eventType,
            body: payload
          }
        })
      }
    })
  }

  async function messageActionHandler (action, data) {
    switch (action) {
      case MessageActionsTypes.REPLY_IN_THREAD:
        //  todo this is test code

        //console.log("Sending custom event")
        //await chat.emitEvent({
        //  channel: 'test-darryn-2', //  Sending to other test user
        //  type: 'custom',
        //  method: "publish",
        //  payload: {
        //    action: "Event Action",   //  Both of these are received
        //    custom: "Some custom data"  //  Both of these are received
        //  },
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
        activeChannelUsers={
          activeChannel?.type == 'group' && activeChannelGroupIndex > -1
            ? privateGroupsUsers[activeChannelGroupIndex]
            : activeChannel?.type == 'direct' && activeChannelGroupIndex > -1
            ? directChatsUsers[activeChannelGroupIndex]
            : publicChannelsUsers[activeChannelGroupIndex]
        }
        buttonAction={async () => {
          sendChatEvent(
            ChatEventTypes.LEAVE,
            activeChannel.type == 'group'
              ? privateGroupsUsers[activeChannelGroupIndex]
              : directChatsUsers[activeChannelGroupIndex],
            { userLeaving: chat.currentUser.id }
          )
          //  todo uncomment this - I commented it out until I build up my test harness for joining a channel
          //await activeChannel.leave()
          showUserMessage(
            'You Left:',
            'You have left this group, please select a different channel or create a new group / DM',
            'https://www.pubnub.com/docs/chat/chat-sdk/build/features/channels/updates#update-channel-details'
          )
          if (publicChannels.length > 0) {
            setActiveChannel(publicChannels[0])
          }
          setChatSettingsScreenVisible(false)
          refreshMembersFromServer()
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
        name={null}
        activeChannel={activeChannel}
        modalType={ChatNameModals.CHANNEL}
        showUserMessage={showUserMessage}
        saveAction={async newName => {
          await activeChannel?.update({
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
        activeChannelUsers={
          activeChannel?.type == 'group' && activeChannelGroupIndex > -1
            ? privateGroupsUsers[activeChannelGroupIndex]
            : activeChannel?.type == 'direct' && activeChannelGroupIndex > -1
            ? directChatsUsers[activeChannelGroupIndex]
            : publicChannelsUsers[activeChannelGroupIndex]
        }
        currentUserId={chat.currentUser.id}
        activeChannel={activeChannel}
        saveAction={() => {
          setManageMembersModalVisible(false)
        }}
        sendChatEvent={(eventType, recipients, payload) => {
          sendChatEvent(eventType, recipients, payload)
        }}
        manageMembersModalVisible={manageMembersModalVisible}
        setManageMembersModalVisible={setManageMembersModalVisible}
      />
      {/* Modal to change the user name */}
      <ModalChangeName
        name={name}
        activeChannel={null}
        modalType={ChatNameModals.USER}
        saveAction={async newName => {
          await chat.currentUser.update({
            name: newName
          })
          setName(newName)
        }}
        showUserMessage={showUserMessage}
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
                  avatarUrl={
                    publicChannel.custom.profileUrl
                      ? publicChannel.custom.profileUrl
                      : '/avatars/placeholder.png'
                  }
                  text={publicChannel.name}
                  present={-1}
                  setActiveChannel={() => {
                    setActiveChannel(publicChannels[index])
                    setActiveChannelGroupIndex(index)
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
              {privateGroups?.map((privateGroup, index) => (
                <ChatMenuItem
                  key={index}
                  avatarUrl={
                    chat?.currentUser.profileUrl
                      ? chat?.currentUser.profileUrl
                      : '/avatars/placeholder.png'
                  }
                  text={privateGroup.name}
                  present={-1}
                  avatarBubblePrecedent={
                    privateGroupsUsers[index]?.map(
                      user => user.id !== chat.currentUser.id
                    )
                      ? `+${
                          privateGroupsUsers[index]?.map(
                            user => user.id !== chat.currentUser.id
                          ).length - 1
                        }`
                      : ''
                  }
                  setActiveChannel={() => {
                    setActiveChannel(privateGroups[index])
                    setActiveChannelGroupIndex(index)
                  }}
                />
              ))}
              {/*<ChatMenuItem
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
          />*/}
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
              {directChats?.map((directChat, index) => (
                <ChatMenuItem
                  key={index}
                  avatarUrl={
                    directChatsUsers[index]?.find(
                      user => user.id !== chat.currentUser.id
                    ).profileUrl
                      ? directChatsUsers[index]?.find(
                          user => user.id !== chat.currentUser.id
                        ).profileUrl
                      : '/avatars/placeholder.png'
                  }
                  text={
                    directChatsUsers[index]?.find(
                      user => user.id !== chat.currentUser.id
                    ).name
                  }
                  present={1}
                  setActiveChannel={() => {
                    setActiveChannel(directChats[index])
                    setActiveChannelGroupIndex(index)
                  }}
                />
              ))}
              {/*<ChatMenuItem
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
          />*/}
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
                //users={channelStreamedUsers} //  channelStreamedUsers activeChannelUsers .  todo can I reuse what I'm doing for private groups and dms?
                groupUsers={
                  activeChannel?.type == 'group' && activeChannelGroupIndex > -1
                    ? privateGroupsUsers[activeChannelGroupIndex]
                    : activeChannel?.type == 'direct' &&
                      activeChannelGroupIndex > -1
                    ? directChatsUsers[activeChannelGroupIndex]
                    : publicChannelsUsers[activeChannelGroupIndex]
                }
                messageActionHandler={(action, vars) =>
                  messageActionHandler(action, vars)
                }
                usersHaveChanged={() => {
                  refreshMembersFromServer()
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
            <div
              className={`${
                creatingNewMessage && 'hidden'
              } absolute bottom-0 left-0 right-0`}
            >
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
