import Image from 'next/image'
import { roboto } from '@/app/fonts'
import Avatar from './avatar'
import {
  PresenceIcon
} from '@/app/types'


export default function ManagedMember({user, name, /*removeAction,*/ lastElement = false}) {

    return (
        <div className={`flex justify-between items-center px-4 py-3 ${!lastElement && "border-solid border-b border-navy200"}`}>
        <div className='flex flex-row items-center'>
          <Avatar present={user.active ? PresenceIcon.ONLINE : PresenceIcon.OFFLINE} avatarUrl={user.profileUrl} />
          <div className='flex pl-3 text-sm font-normal text-neutral-900'>
            {name}
          </div>
        </div>
        {/*<div
          className='flex flex-row items-center pr-4 cursor-pointer'
          onClick={() => {
            removeAction(userId)
          }}
        >
          <Image
            src='/icons/remove.svg'
            alt='Remove'
            className='m-3'
            width={24}
            height={24}
            priority
          />
          <div
            className={`${roboto.className} text-sm font-medium text-sky-800`}
          >
            Remove
        </div>
        </div>*/}
      </div>

        

  );

}