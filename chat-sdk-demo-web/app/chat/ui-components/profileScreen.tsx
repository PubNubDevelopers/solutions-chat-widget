import Image from 'next/image'
import Avatar from './avatar'
import { roboto } from '@/app/fonts'

export default function ProfileScreen ({
  profileScreenVisible,
  setProfileScreenVisible,
  name,
  logout,
  changeName,
  changeUserNameScreenVisible
}) {
  return (
    <div
      className={`${
        !profileScreenVisible && 'hidden'
      } flex flex-col h-full flex-wrap h-16 p-3 rounded-l-lg bg-sky-950 select-none fixed right-0 w-96 z-20`}
    >
      <div
        className={`${roboto.className} ${
          changeUserNameScreenVisible && 'opacity-40'
        } text-sm font-medium flex flex flex-row text-white py-3 items-center`}
      >
        <div
          className='flex cursor-pointer'
          onClick={e => setProfileScreenVisible(false)}
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
        Profile
      </div>

      <div
        className={`flex flex-col ${
          changeUserNameScreenVisible && 'opacity-40'
        }`}
      >
        <div
          className={`${roboto.className} text-sm font-medium flex flex flex-row text-white p-3 justify-between items-center`}
        >
          Settings
        </div>

        <div className='flex justify-center pb-6'>
          <Avatar
            avatarUrl={'/avatars/avatar01.png'}
            width={88}
            height={88}
            editIcon={true}
            editActionHandler={() => console.log('todo: Edit Profile icon')}
          />
        </div>
        <div className='flex flex-row justify-between items-center py-4 px-4'>
          <div className='flex flex-col'>
            <div className='text-lg text-white'>Name</div>
            <div className='text-lg text-white font-semibold'>{name}</div>
          </div>
          <div
            className={`${roboto.className} flex flex-row justify-between items-center font-medium text-sm px-6 mx-2.5 h-10 cursor-pointer rounded-lg bg-pubnubbabyblue`}
            onClick={e => changeName()}
          >
            Change
          </div>
        </div>

        <div className='border border-navy600'></div>

        <div className='flex flex-row py-6 px-4'>
          <div className='flex flex-col'>
            <div className='text-lg text-white pb-2'>Notifications</div>
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

        <div className='flex flex-row py-6 px-4'>
          <div className='flex flex-col'>
            <div className='text-lg text-white pb-2'>Read receipts</div>
            <div className='text-base text-white'>
              Receive receipts when messages are sent and read
            </div>
          </div>
          <div className='h-6 relative inline-block'>
            {/* ToDo: Checkbox is currently disabled with no handlers */}
            <input type='checkbox' checked={true} disabled />
          </div>
        </div>

        <div className='border border-navy600'></div>

        <div
          className={`${roboto.className} flex flex-row justify-center items-center my-6 text-white font-medium text-sm px-4 mx-2.5 h-10 cursor-pointer border border-[#938F99] rounded-lg bg-sky-950`}
          onClick={e => logout()}
        >
          <Image
            src='/icons/logout.svg'
            alt='Logout'
            className='p-3'
            width={36}
            height={36}
            priority
          />
          Log out
        </div>
      </div>
    </div>
  )
}
