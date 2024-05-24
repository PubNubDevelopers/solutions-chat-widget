import Image from 'next/image'
import Avatar from './avatar'
import { roboto } from '@/app/fonts'

export default function ChatSettingsScreen ({
  chatSettingsScreenVisible,
  setChatSettingsScreenVisible,
  changeChatNameScreenVisible,
  manageMembersModalVisible,
  isDirectChat,
  currentChannel,
  buttonAction,
  changeChatNameAction = () => {},
  manageMembershipsAction = () => {}
}) {
  return (
    <div
      className={`${
        !chatSettingsScreenVisible && 'hidden'
      } flex flex-col h-full flex-wrap h-16 p-3 rounded-l-lg bg-sky-950 select-none fixed right-0 w-96 z-20`}
    >
      <div
        className={`${roboto.className} ${(changeChatNameScreenVisible || manageMembersModalVisible) && "opacity-40"}  text-sm font-medium flex flex flex-row text-white py-3 items-center`}
      >
        <div
          className={`flex cursor-pointer`}
          onClick={e => setChatSettingsScreenVisible(false)}
        >
          <Image
            src='/icons/close-rooms.svg'
            alt='Close Rooms'
            className='p-3'
            width={36}
            height={36}
            priority
          />
        </div>
        Chat settings
      </div>

      <div className={`${(changeChatNameScreenVisible || manageMembersModalVisible) && "opacity-40"} `}>
      <div
        className={`${roboto.className} text-sm font-medium flex flex flex-row text-white p-4 justify-between items-center`}
      >
        Settings
      </div>

      <div className='flex flex-col'>
        {/* Avatar(s) */}
        <div className='flex justify-center pb-6'>
          {isDirectChat ? (
            <Avatar
              avatarUrl={'/avatars/avatar01.png'}
              width={88}
              height={88}
            />
          ) : (
            <div className='flex flex-row -space-x-2.5'>
              <Avatar
                avatarUrl={'/avatars/avatar01.png'}
                width={88}
                height={88}
              />

              <Avatar
                avatarUrl={'/avatars/avatar02.png'}
                width={88}
                height={88}
              />

              <Avatar
                avatarUrl={'/avatars/avatar03.png'}
                width={88}
                height={88}
              />
            </div>
          )}
        </div>

        {/* Chat members for 1:1 chats, or Chat name for Group chats */}
        {isDirectChat ? (
          <div className='flex flex-row justify-between items-center py-4 px-4'>
            <div className='flex flex-col'>
              <div className='text-lg text-white'>Chat members</div>
              <div className='text-lg text-white font-semibold'>
                Sarah Johannsen
              </div>
              <div className='text-lg text-white font-semibold'>Philip Soto</div>
            </div>
            {/*<div
              className={`${roboto.className} flex flex-row justify-between items-center font-medium text-sm px-6 mx-2.5 h-10 cursor-pointer rounded-lg bg-pubnubbabyblue`}
              onClick={(e) => changeChatNameAction()}
            >
              Change
        </div>*/}
          </div>
        ) : (
          <div className='flex flex-row justify-between items-center py-4 px-4'>
            <div className='flex flex-col'>
              <div className='text-lg text-white font-normal'>Chat name</div>
              <div className='text-lg text-white font-semibold'>
                Bike lovers
              </div>
            </div>
            <div
              className={`${roboto.className} flex flex-row justify-between items-center font-medium text-sm px-6 mx-2.5 h-10 cursor-pointer rounded-lg bg-pubnubbabyblue`}
              onClick={(e) => changeChatNameAction()}
            >
              Change
            </div>
          </div>
        )}

        <div className='border border-navy600'></div>

        {!isDirectChat && (
          <div>
            {' '}
            <div className='flex flex-row justify-between items-center py-6 px-4'>
              <div className='text-lg text-white'>Members</div>
              <div
                className={`${roboto.className} flex flex-row justify-between items-center font-medium text-sm px-6 mx-2.5 h-10 cursor-pointer rounded-lg bg-pubnubbabyblue`}
                onClick={e => manageMembershipsAction()}
              >
                Manage
              </div>
            </div>
            <div className='border border-navy600'></div>
          </div>
        )}

        <div className='flex flex-row py-6 px-4'>
          <div className='flex flex-col'>
            <div className='text-lg text-white pb-2'>Mute chat</div>
            <div className='text-base text-white'>
              Get notified about new messages and mentions from chats
            </div>
          </div>
          <div className='h-6 relative inline-block'>
            {/* ToDo: Checkbox is currently disabled with no handlers */}
            <input type='checkbox' checked={false} disabled />
          </div>
        </div>
        <div className='border border-navy600'></div>

        {isDirectChat ? (
          <div
            className={`${roboto.className} flex flex-row justify-center my-6 items-center text-white font-medium text-sm px-4 mx-2.5 h-10 cursor-pointer border border-[#938F99] rounded-lg bg-sky-950`}
            onClick={e => buttonAction()}
          >
            <Image
              src='/icons/delete.svg'
              alt='Delete conversation'
              className='p-2'
              width={36}
              height={36}
              priority
            />
            Delete conversation
          </div>
        ) : (
          <div
            className={`${roboto.className} flex flex-row justify-center my-6 items-center text-white font-medium text-sm px-4 mx-2.5 h-10 cursor-pointer border border-[#938F99] rounded-lg bg-sky-950`}
            onClick={e => buttonAction()}
          >
            <Image
              src='/icons/logout.svg'
              alt='Logout'
              className='p-3'
              width={36}
              height={36}
              priority
            />
            Leave conversation
          </div>
        )}
      </div>
      </div>
    </div>
  )
}