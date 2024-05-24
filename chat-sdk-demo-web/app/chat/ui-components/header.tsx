import Image from 'next/image'
import { roboto } from '@/app/fonts'

export default function Header ({
  setRoomSelectorVisible,
  setProfileScreenVisible,
  creatingNewMessage,
  setCreatingNewMessage,
  showNotificationBadge = false,
  showMentionsBadge = false,
  showUserMessage
}) {

  return (
    <div
      id='header'
      className='flex flex-row flex-wrap justify-between h-16 bg-sky-950 select-none fixed w-full z-10'
    >
      <div
        id='room-selector'
        className='flex items-center justify-center gap-2.5 ml-2.5 hover:bg-sky-900 cursor-pointer rounded-md m-1 px-2'
        onClick={e => setRoomSelectorVisible(true)}
      >
        <div
          id='room-avatar'
          className='flex justify-center w-12 h-12 rounded-full bg-navy50'
        >
          <Image
            src='/pn-logo-red-tint.svg'
            alt='PubNub Logo'
            className='flex self-center'
            width={23.81}
            height={17.07}
            priority
          />
        </div>
        <div id='room-name' className='text-neutral50 text-base'>
          PubNub
        </div>
      </div>
      <div id='header-actions' className='flex items-center mr-2.5'>
        <div
          id='btn-message-new'
          className={`${
            roboto.className
          } flex flex-row min-w-52 items-center font-medium text-sm px-4 mx-2.5 h-10 rounded-lg ${
            'bg-pubnubbabyblue'
          } cursor-pointer`}
          onClick={() => setCreatingNewMessage(true)}
        >
                      <Image
              src='/icons/new_message.svg'
              alt='New Message icon'
              className='flex self-center mr-3'
              width={15}
              height={15}
              priority
            />
          New Message / Group
        </div>
        <div
          className='cursor-pointer hover:bg-sky-900 hover:rounded-md'
          onClick={e =>
            showUserMessage(null, 
              'Although not supported by this demo, you use the Chat SDK to alert your users with built-in or custom events',
              'https://www.pubnub.com/docs/chat/chat-sdk/build/features/custom-events'
            )
          }
        >
          <div className='relative'>
            <Image
              src='/icons/notifications_none.svg'
              alt='Notifications'
              className='flex self-center m-3'
              width={24}
              height={24}
              priority
            />
            {showNotificationBadge && (
              <div className='w-[12px] h-[12px] rounded-full border-2 border-sky-950 bg-cherry absolute left-[23px] top-[0px]'></div>
            )}
          </div>
        </div>
        <div
          className='cursor-pointer hover:bg-sky-900 hover:rounded-md'
          onClick={e =>
            showUserMessage(null, 
              "The Chat SDK supports mentioning users with the '@' syntax, although not yet supported by this demo",
              'https://www.pubnub.com/docs/chat/chat-sdk/build/features/users/mentions'
            )
          }
        >
          <div className='relative'>
            <Image
              src='/icons/alternate_email.svg'
              alt='Mentions'
              className='flex self-center m-3'
              width={24}
              height={24}
              priority
            />
            {showMentionsBadge && (
              <div className='w-[12px] h-[12px] rounded-full border-2 border-sky-950 bg-cherry absolute left-[23px] top-[0px]'></div>
            )}
          </div>
        </div>
        <div
          className='cursor-pointer hover:bg-sky-900 hover:rounded-md'
          onClick={e => setProfileScreenVisible(true)}
        >
          <Image
            src='/icons/person_outline.svg'
            alt='My Profile'
            className='flex self-center m-3'
            width={24}
            height={24}
            priority
          />
        </div>
      </div>
    </div>
  )
}
