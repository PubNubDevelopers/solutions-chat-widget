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
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { testData } from './data/user-data'
import {
  ChatNameModals,
  MessageActionsTypes,
  CustomQuotedMessage,
  ChatHeaderActionIcon,
  ToastType,
  ChatEventTypes,
  UnreadMessagesOnChannel
} from '@/app/types'

export default function Page () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [userId, setUserId] = useState<String | null>('')
  const [chat, setChat] = useState<Chat | null>(null)
  const [loadMessage, setLoadMessage] = useState('Chat is initializing...')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showEmojiMessageTimetoken, setShowEmojiMessageTimetoken] = useState('')

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
  const [typingData, setTypingData] = useState<string[]>([])

  const [userMsg, setUserMsg] = useState({
    message: 'Message Text.  Message Text.  ',
    title: 'Please Note:',
    href: 'http://www.pubnub.com',
    type: 0
  })
  const [userMsgShown, setUserMsgShown] = useState(false)
  const [userMsgTimeoutId, setUserMsgTimeoutId] = useState(0)
  const [refreshMembersTimeoutId, setRefreshMembersTimeoutId] =
    useState<ReturnType<typeof setTimeout>>()
  const [initOnce, setInitOnce] = useState(0)

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
  const [unreadMessages, setUnreadMessages] = useState<
    UnreadMessagesOnChannel[]
  >([])

  //  State of the currently active Channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)

  async function emojiSelected (data) {
    const message = await activeChannel?.getMessage(showEmojiMessageTimetoken)
    message?.toggleReaction(data.native)
    setShowEmojiPicker(false)
  }

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
    console.log('updating channel memberships public')
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
  async function updateChannelMembershipsForGroups (
    chat,
    desiredChannelId = ''
  ) {
    if (!chat) return
    chat.currentUser
      .getMemberships({ sort: { updated: 'desc' } })
      .then(async membershipResponse => {
        const currentMemberOfTheseGroupChannels = membershipResponse.memberships
          .map(m => m.channel)
          .filter(c => c.type === 'group')
        //  Look for the desired channel ID
        for (var i = 0; i < currentMemberOfTheseGroupChannels.length; i++) {
          if (currentMemberOfTheseGroupChannels[i].id === desiredChannelId) {
            //  We have found the channel we want to focus
            console.log(
              'GROUP: setting active channel: ' +
                currentMemberOfTheseGroupChannels[i].id
            )
            setActiveChannel(currentMemberOfTheseGroupChannels[i])
          }
        }

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
  async function updateChannelMembershipsForDirects (
    chat,
    desiredChannelId = ''
  ) {
    if (!chat) return
    chat.currentUser
      .getMemberships({ sort: { updated: 'desc' } })
      .then(async membershipResponse => {
        const currentMemberOfTheseDirectChannels =
          membershipResponse.memberships
            .map(m => m.channel)
            .filter(c => c.type === 'direct')
        //  Look for the desired channel ID
        for (var i = 0; i < currentMemberOfTheseDirectChannels.length; i++) {
          if (currentMemberOfTheseDirectChannels[i].id === desiredChannelId) {
            //  We have found the channel we want to focus
            console.log(
              'DIRECT: setting active channel: ' +
                currentMemberOfTheseDirectChannels[i].id
            )
            setActiveChannel(currentMemberOfTheseDirectChannels[i])
          }
        }
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
          var tempIndex = indexDirects
          const response = await currentMemberOfTheseDirectChannels[
            indexDirects
          ].getMembers({ sort: { updated: 'desc' }, limit: 100 })

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

  function updateUnreadMessagesCounts () {
    chat?.getUnreadMessagesCounts({}).then(result => {
      let unreadMessagesOnChannel: UnreadMessagesOnChannel[] = []
      result.forEach((element, index) => {
        let newUnreadMessage: UnreadMessagesOnChannel = {
          channel: element.channel,
          count: element.count
        }
        unreadMessagesOnChannel.push(newUnreadMessage)
      })
      console.log(unreadMessagesOnChannel)
      setUnreadMessages(unreadMessagesOnChannel)
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
        typingTimeout: 5000,
        storeUserActivityTimestamps: true,
        storeUserActivityInterval: 60000
      })

      setChat(chat)

      if (!chat.currentUser.profileUrl) {
        const randomProfileUrl = Math.floor(
          Math.random() * testData.avatars.length
        )
        await chat.currentUser.update({
          name: '' + userId,
          profileUrl: testData.avatars[randomProfileUrl]
        })
        setName('' + userId)
        setProfileUrl(testData.avatars[randomProfileUrl])
      } else {
        setName('' + chat.currentUser.name)
        setProfileUrl(chat.currentUser.profileUrl)
      }

      await chat
        .getChannels({ filter: `type == 'public'` })
        .then(async channelsResponse => {
          if (channelsResponse.channels.length < 2) {
            //  There are fewer than the expected number of public channels on this keyset, do any required Keyset initialization
            await keysetInit(chat)
            router.refresh()
          } else {
            //  Join public channels
            if (channelsResponse.channels.length > 0) {
              //  Join each of the public channels
              channelsResponse.channels.forEach(async channel => {
                await channel.join(message => {
                  //  We have a message listener elsewhere for consistency with private and direct chats
                })
              })
            }
          }
        })

      //  Initialization for private groups and direct messages
      //updateChannelMembershipsForPublic(chat)
      //updateChannelMembershipsForGroups(chat)
      //updateChannelMembershipsForDirects(chat)
      //  Calling inside a timeout as there was some timing issue when creating a new user
      let setTimeoutIdInit = setTimeout(() => {
        console.log('timeout fired')
        updateChannelMembershipsForPublic(chat)
        updateChannelMembershipsForDirects(chat)
        updateChannelMembershipsForGroups(chat)
      }, 500)

      //refreshMembersFromServer()
    }
    init()
    //updateChannelMembershipsForDirects()
  }, [userId, setChat, searchParams, router])

  useEffect(() => {
    //  Connect to the direct chats whenever they change so we can keep a track of unread messages
    //  Called once everything is initialized
    if (!chat) return
    if (!publicChannels) return
    if (!directChats) return
    if (!privateGroups) return
    if (!activeChannel) return

    //  todo check ActiveGroupIndex is correct here

    function updateUnreadMessagesCounts () {
      chat?.getUnreadMessagesCounts({}).then(result => {
        console.log(result)
        let unreadMessagesOnChannel: UnreadMessagesOnChannel[] = []
        result.forEach((element, index) => {
          let newUnreadMessage: UnreadMessagesOnChannel = {
            channel: element.channel,
            count: element.count
          }
          unreadMessagesOnChannel.push(newUnreadMessage)
        })
        console.log(unreadMessagesOnChannel)
        setUnreadMessages(unreadMessagesOnChannel)
      })
    }

    var publicHandlers: (() => void)[] = []
    publicChannels.forEach((channel, index) => {
      const disconnectHandler = channel.connect(message => {
        console.log('MESSAGE AT TOP LEVEL PUBLIC: ' + message.content.text)
        if (
          !(
            message.userId == chat.currentUser.id ||
            message.channelId == activeChannel.id
          )
        ) {
          updateUnreadMessagesCounts()
        }
      })
      publicHandlers.push(disconnectHandler)
    })
    var directHandlers: (() => void)[] = []
    directChats.forEach((channel, index) => {
      const disconnectHandler = channel.connect(message => {
        console.log('MESSAGE AT TOP LEVEL DIRECT')
        if (
          !(
            message.userId == chat.currentUser.id ||
            message.channelId == activeChannel.id
          )
        ) {
          updateUnreadMessagesCounts()
        }
      })
      directHandlers.push(disconnectHandler)
    })
    var privateHandlers: (() => void)[] = []
    privateGroups.forEach((channel, index) => {
      const disconnectHandler = channel.connect(message => {
        console.log('MESSAGE AT TOP LEVEL: Private Groups')
        if (
          !(
            message.userId == chat.currentUser.id ||
            message.channelId == activeChannel.id
          )
        ) {
          updateUnreadMessagesCounts()
        }
      })
      privateHandlers.push(disconnectHandler)
    })

    console.log(activeChannel)
    updateUnreadMessagesCounts() //  Update the unread message counts whenever the channel changes

    return () => {
      publicHandlers.forEach(handler => {
        handler()
      })
      directHandlers.forEach(handler => {
        handler()
      })
      privateHandlers.forEach(handler => {
        handler()
      })
    }
  }, [chat, publicChannels, directChats, activeChannel, privateGroups])

  //  Invoked whenever the active channel changes
  useEffect(() => {
    if (!activeChannel) return
    if (activeChannel.type == 'public') return
    return activeChannel.getTyping(value => {
      const findMe = value.indexOf(chat.currentUser.id)
      if (findMe > -1)
        value.splice(findMe, 1)
      setTypingData(value)
    })
  }, [activeChannel])

  useEffect(() => {
    //  This use effect is only called once after the local user cache has been initialized
    if (chat && publicChannelsUsers?.length > 0 && initOnce == 0) {
      setInitOnce(1)
      console.log('Notifying others that I am on the public channels')
      if (publicChannels) {
        setActiveChannel(publicChannels[0])
        sendChatEvent(ChatEventTypes.JOINED, publicChannelsUsers[0], {
          userId: chat.currentUser.id
        })
        updateUnreadMessagesCounts() //  Update the unread message counts whenever the channel changes
      } else {
        console.log('Error: Public Channels was undefined at launch')
      }
    }
  }, [chat, publicChannelsUsers, initOnce])

  useEffect(() => {
    //  Get updates on the current user's name and profile URL
    if (!chat) return
    console.log('streaming updates current user: ' + chat.currentUser.id)
    return chat.currentUser.streamUpdates(updatedUser => {
      //console.log('received update')
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

  /* Listen for events using the Chat event mechanism*/
  useEffect(() => {
    if (!chat) return
    const removeCustomListener = chat.listenForEvents({
      channel: chat.currentUser.id,
      type: 'custom',
      method: 'publish',
      callback: async evt => {
        switch (evt.payload.action) {
          case ChatEventTypes.LEAVE:
            //  Someone is telling us they are leaving a group
            if (evt.payload.body.isDirectChat) {
              //  Our partner left the direct chat, leave it ourselves
              const channel = await chat.getChannel(evt.payload.body.channelId)
              await channel?.leave()
              if (activeChannel?.id === evt.payload.body.channelId) {
                if (publicChannels) {
                  setActiveChannel(publicChannels[0])
                }
              }
            }
            refreshMembersFromServer()
            break
          case ChatEventTypes.INVITED:
            //  Somebody has added us to a new group chat or DM
            refreshMembersFromServer()
            break

          case ChatEventTypes.JOINED:
            //  Someone has joined one of the public channels
            refreshMembersFromServer()
            break
        }
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
  this way is expedient for a proof of concept.  The Channel name updates use the StreamUpdatesOn() 
  callback directly.
  */
  const refreshMembersFromServer = useCallback(
    async (
      forceUpdateDirectChannels = false,
      forceUpdateGroupChannels = false,
      desiredChannelId = ''
    ) => {
      if (!chat) return
      console.log('REMEMBER YOU ARE NOT REFRESHING MEMBERS FROM THE SERVER!!!')
      return //  TODO REMOVE THIS TO ENABLE OBJECT UPDATES.  IT'S JUST A PAIN WHEN DEBUGGING

      console.log('CLEARING TIMEOUT: ' + refreshMembersTimeoutId)
      clearTimeout(refreshMembersTimeoutId)

      if (forceUpdateDirectChannels) {
        //updateChannelMembershipsForPublic(chat)  //  Not needed as we only call this when we create a new group or DM
        console.log('force updating directs')
        updateChannelMembershipsForDirects(chat, desiredChannelId)
      } else if (forceUpdateGroupChannels) {
        console.log('force updating groups')
        updateChannelMembershipsForGroups(chat, desiredChannelId)
      } else {
        console.log('setting timeout')
        let setTimeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
          console.log('timeout fired')
          updateChannelMembershipsForPublic(chat)
          updateChannelMembershipsForDirects(chat)
          updateChannelMembershipsForGroups(chat)
        }, 3000)
        setRefreshMembersTimeoutId(setTimeoutId)
      }

      return
    },
    [chat, refreshMembersTimeoutId]
  )

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
    eventType: ChatEventTypes,
    recipients: User[],
    payload
  ) {
    recipients.forEach(async recipient => {
      //  Don't send the message to myself
      console.log('sending event: ' + eventType)
      if (recipient.id !== chat?.currentUser.id) {
        await chat?.emitEvent({
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
      case MessageActionsTypes.SHOW_EMOJI:
        setShowEmojiMessageTimetoken(data.messageTimetoken)
        //  Avoid interference from the logic that hides the picker when you click outside it
        setTimeout(function () {
          setShowEmojiPicker(data.isShown)
        }, 50)
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
        isDirectChat={activeChannel?.type == 'direct'}
        activeChannel={activeChannel}
        activeChannelUsers={
          activeChannel?.type == 'group' && privateGroups
            ? privateGroupsUsers[
                privateGroups.findIndex(group => group.id == activeChannel?.id)
              ]
            : activeChannel?.type == 'direct' && directChats
            ? directChatsUsers[
                directChats.findIndex(
                  dmChannel => dmChannel.id == activeChannel?.id
                )
              ]
            : publicChannels
            ? publicChannelsUsers[
                publicChannels.findIndex(
                  channel => channel.id == activeChannel?.id
                )
              ]
            : []
        }
        buttonAction={async () => {
          if (activeChannel && publicChannels) {
            sendChatEvent(
              ChatEventTypes.LEAVE,
              activeChannel.type == 'group' && privateGroups
                ? privateGroupsUsers[
                    privateGroups.findIndex(
                      group => group.id == activeChannel?.id
                    )
                  ]
                : activeChannel.type == 'direct' && directChats
                ? directChatsUsers[
                    directChats.findIndex(
                      dmChannel => dmChannel.id == activeChannel?.id
                    )
                  ]
                : [],
              {
                userLeaving: chat.currentUser.id,
                isDirectChat: activeChannel.type != 'group',
                channelId: activeChannel.id
              }
            )
            await activeChannel.leave()
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
          }
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
          activeChannel?.type == 'group' && privateGroups
            ? privateGroupsUsers[
                privateGroups.findIndex(group => group.id == activeChannel?.id)
              ]
            : activeChannel?.type == 'direct' && directChats
            ? directChatsUsers[
                directChats.findIndex(
                  dmChannel => dmChannel.id == activeChannel?.id
                )
              ]
            : activeChannel?.type == 'public' && publicChannels
            ? publicChannelsUsers[
                publicChannels.findIndex(
                  channel => channel.id == activeChannel?.id
                )
              ]
            : []
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
        className={`${
          !showEmojiPicker && 'hidden'
        } absolute left-0 bottom-0 z-50 bg-white`}
      >
        <Picker
          data={data}
          sheetRows={3}
          previewPosition={'none'}
          navPosition={'none'}
          searchPosition={'none'}
          maxFrequentRows={0}
          onEmojiSelect={data => {
            emojiSelected(data)
          }}
          onClickOutside={() => {
            setShowEmojiPicker(false)
          }}
        />
      </div>
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

          {unreadMessages && unreadMessages.length > 0 && (
            <ChatMenuHeader
              text='UNREAD'
              actionIcon={ChatHeaderActionIcon.MARK_READ}
              expanded={unreadExpanded}
              expandCollapse={() => {
                setUnreadExpanded(!unreadExpanded)
              }}
              action={async () => {
                const markedAsRead = await chat.markAllMessagesAsRead()
                updateUnreadMessagesCounts()

                //console.log(markedAsRead)
                showUserMessage(
                  'Success:',
                  'All messsages have been marked as read, and sent receipts are updated accordingly',
                  'https://www.pubnub.com/docs/chat/chat-sdk/build/features/messages/unread#mark-messages-as-read-all-channels',
                  ToastType.CHECK
                )
              }}
            />
          )}
          {unreadExpanded && (
            <div>
              {unreadMessages?.map(
                (unreadMessage, index) =>
                  unreadMessage.channel.id !== activeChannel?.id && (
                    <ChatMenuItem
                      key={index}
                      avatarUrl={
                        unreadMessage.channel.type === 'group'
                          ? chat?.currentUser.profileUrl
                            ? chat?.currentUser.profileUrl
                            : '/avatars/placeholder.png'
                          : unreadMessage.channel.type == 'public'
                          ? unreadMessage.channel.custom?.profileUrl
                            ? unreadMessage.channel.custom?.profileUrl
                            : '/avatars/placeholder.png'
                          : unreadMessage.channel.type == 'direct' &&
                            directChats
                          ? directChatsUsers[
                              directChats.findIndex(
                                dmChannel =>
                                  dmChannel.id == unreadMessage.channel.id
                              )
                            ]?.find(user => user.id !== chat.currentUser.id)
                              ?.profileUrl
                            ? directChatsUsers[
                                directChats.findIndex(
                                  dmChannel =>
                                    dmChannel.id == unreadMessage.channel.id
                                )
                              ]?.find(user => user.id !== chat.currentUser.id)
                                ?.profileUrl
                            : '/avatars/placeholder.png'
                          : '/avatars/placeholder.png'
                      }
                      avatarBubblePrecedent={
                        unreadMessage.channel.type === 'group' && privateGroups
                          ? privateGroupsUsers[
                              privateGroups.findIndex(
                                group => group.id == unreadMessage.channel.id
                              )
                            ]?.map(user => user.id !== chat.currentUser.id)
                            ? `+${
                                privateGroupsUsers[
                                  privateGroups.findIndex(
                                    group =>
                                      group.id == unreadMessage.channel.id
                                  )
                                ]?.map(user => user.id !== chat.currentUser.id)
                                  .length - 1
                              }`
                            : ''
                          : ''
                      }
                      text={
                        unreadMessage.channel.type === 'direct' && directChats
                          ? directChatsUsers[
                              directChats.findIndex(
                                dmChannel =>
                                  dmChannel.id == unreadMessage.channel.id
                              )
                            ]?.find(user => user.id !== chat.currentUser.id)
                              ?.name
                          : unreadMessage.channel.name
                      }
                      present={-1}
                      count={'' + unreadMessage.count}
                      markAsRead={true}
                      markAsReadAction={async e => {
                        e.stopPropagation()
                        if (
                          unreadMessage.channel.type === 'public' &&
                          publicChannelsMemberships &&
                          publicChannels
                        ) {
                          const index = publicChannelsMemberships.findIndex(
                            membership =>
                              membership.channel.id == unreadMessage.channel.id
                          )
                          if (index > -1) {
                            const lastMessage = await publicChannels[
                              index
                            ]?.getHistory({ count: 1 })
                            if (lastMessage && lastMessage.messages) {
                              console.log(lastMessage)
                              await publicChannelsMemberships[
                                index
                              ].setLastReadMessage(lastMessage.messages[0])
                              updateUnreadMessagesCounts()
                            }
                          }
                        } else if (
                          unreadMessage.channel.type === 'group' &&
                          privateGroupsMemberships &&
                          privateGroups
                        ) {
                          const index = privateGroupsMemberships.findIndex(
                            membership =>
                              membership.channel.id == unreadMessage.channel.id
                          )
                          if (index > -1) {
                            const lastMessage = await privateGroups[
                              index
                            ]?.getHistory({ count: 1 })
                            if (lastMessage && lastMessage.messages) {
                              await privateGroupsMemberships[
                                index
                              ].setLastReadMessage(lastMessage.messages[0])
                              updateUnreadMessagesCounts()
                            }
                          }
                        } else if (
                          unreadMessage.channel.type === 'direct' &&
                          directChatsMemberships &&
                          directChats
                        ) {
                          const index = directChatsMemberships.findIndex(
                            membership =>
                              membership.channel.id == unreadMessage.channel.id
                          )
                          if (index > -1) {
                            const lastMessage = await directChats[
                              index
                            ]?.getHistory({ count: 1 })
                            if (lastMessage && lastMessage.messages) {
                              await directChatsMemberships[
                                index
                              ].setLastReadMessage(lastMessage.messages[0])
                              updateUnreadMessagesCounts()
                            }
                          }
                        }
                      }}
                      setActiveChannel={() => {
                        if (
                          unreadMessage.channel.type === 'public' &&
                          publicChannels
                        ) {
                          const index = publicChannels.findIndex(
                            channel => channel.id == unreadMessage.channel.id
                          )
                          if (index > -1) {
                            setActiveChannel(publicChannels[index])
                          }
                        } else if (
                          unreadMessage.channel.type === 'group' &&
                          privateGroups
                        ) {
                          const index = privateGroups.findIndex(
                            group => group.id == unreadMessage.channel.id
                          )
                          if (index > -1) {
                            setActiveChannel(privateGroups[index])
                          }
                        } else if (
                          unreadMessage.channel.type === 'direct' &&
                          directChats
                        ) {
                          const index = directChats.findIndex(
                            dmChannel =>
                              dmChannel.id == unreadMessage.channel.id
                          )
                          if (index > -1) {
                            setActiveChannel(directChats[index])
                          }
                        }
                      }}
                    ></ChatMenuItem>
                  )
              )}
            </div>
          )}

          {unreadMessages && unreadMessages.length > 0 && (
            <div className='w-full border border-navy200 mt-4'></div>
          )}

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
                  }}
                />
              ))}
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
                    )?.profileUrl
                      ? directChatsUsers[index]?.find(
                          user => user.id !== chat.currentUser.id
                        )?.profileUrl
                      : '/avatars/placeholder.png'
                  }
                  text={
                    directChatsUsers[index]?.find(
                      user => user.id !== chat.currentUser.id
                    )?.name
                  }
                  present={1}
                  setActiveChannel={() => {
                    setActiveChannel(directChats[index])
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className='relative w-full'>
          <div
            id='chats-main'
            className='flex flex-col grow w-full max-h-screen py-0 mt-[64px]'
          >
            {creatingNewMessage ? (
              <NewMessageGroup
                chat={chat}
                setCreatingNewMessage={setCreatingNewMessage}
                showUserMessage={showUserMessage}
                sendChatEvent={(eventType, recipients, payload) => {
                  sendChatEvent(eventType, recipients, payload)
                }}
                invokeRefresh={(desiredChannelId, createdType) => {
                  refreshMembersFromServer(
                    createdType == 'direct',
                    createdType == 'group',
                    desiredChannelId
                  )
                }}
              />
            ) : (
              <MessageList
                activeChannel={activeChannel}
                currentUser={chat.currentUser}
                //users={channelStreamedUsers} //  channelStreamedUsers activeChannelUsers .  todo can I reuse what I'm doing for private groups and dms?
                groupUsers={
                  activeChannel?.type == 'group' && privateGroups
                    ? privateGroupsUsers[
                        privateGroups.findIndex(
                          group => group.id == activeChannel?.id
                        )
                      ]
                    : activeChannel?.type == 'direct' && directChats
                    ? directChatsUsers[
                        directChats.findIndex(
                          dmChannel => dmChannel.id == activeChannel?.id
                        )
                      ]
                    : publicChannels
                    ? publicChannelsUsers[
                        publicChannels.findIndex(
                          channel => channel.id == activeChannel?.id
                        )
                      ]
                    : []
                }
                messageActionHandler={(action, vars) =>
                  messageActionHandler(action, vars)
                }
                usersHaveChanged={() => {
                  refreshMembersFromServer()
                }}
                updateUnreadMessagesCounts={() => {
                  updateUnreadMessagesCounts()
                }}
                setChatSettingsScreenVisible={setChatSettingsScreenVisible}
                quotedMessage={quotedMessage}
                setShowPinnedMessages={setShowPinnedMessages}
                setShowThread={setShowThread}
              />
            )}
            {
              !quotedMessage && typingData && <TypingIndicator
                typers={typingData}
                users={
                  activeChannel?.type == 'group' && privateGroups
                    ? privateGroupsUsers[
                        privateGroups.findIndex(
                          group => group.id == activeChannel?.id
                        )
                      ]
                    : activeChannel?.type == 'direct' && directChats
                    ? directChatsUsers[
                        directChats.findIndex(
                          dmChannel => dmChannel.id == activeChannel?.id
                        )
                      ]
                    : []
                }
              />
            }
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
                creatingNewMessage={creatingNewMessage}
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
