import { useState } from 'react'
import { roboto } from '@/app/fonts'
import Avatar from './avatar'
import Message from './message'
import Image from 'next/image'
import NewMessageUserRow from './newMessageUserRow'
import NewMessageUserPill from './newMessageUserPill'

export default function NewMessageGroup ({setCreatingNewMessage}) {
  let groupMembers = 3

  const [searchTerm, setSearchTerm] = useState("")

  function handleUserSearch (term: string) {
    console.log(term)
  }

  return (
    <div className='flex flex-col max-h-screen select-none'>
      <div className='flex flex-col border border-navy-200 min-w-full'>
        <div className='flex flex-row gap-4 py-2'>
          <div
            className={`${roboto.className} flex flex-row items-center px-3 font-medium text-base`}
          >
            <div className="cursor-pointer" onClick={(e) => setCreatingNewMessage(false)}>
            <Image
              src='/icons/west.svg'
              alt='Send'
              className='m-3'
              width={24}
              height={24}
              priority
            />
            </div>
            New Message / Group
          </div>
          <div
            className={`${roboto.className} flex flex-row items-center justify-center grow gap-4 min-h-10 font-medium text-base text-[#101729]`}
          >
            <div className='flex flex-row -space-x-2.5'>
              <Avatar
                present={-1}
                avatarUrl={'/avatars/avatar08.png'}
                border={true}
                width={36}
                height={36}
              />
              <Avatar
                present={-1}
                avatarUrl={'/avatars/avatar09.png'}
                border={true}
                width={36}
                height={36}
              />
              <Avatar
                present={-1}
                avatarUrl={'/avatars/avatar10.png'}
                border={true}
                width={36}
                height={36}
              />
            </div>
            <div className='flex flex-row gap-2'>
              {groupMembers > 2 && (
                <div
                  className='cursor-pointer'
                  onClick={() => {
                    console.log('ToDo: Change Chat Name')
                  }}
                >
                  <Image
                    src='/icons/edit.svg'
                    alt='Edit'
                    className='invert'
                    width={18}
                    height={18}
                    priority
                  />
                </div>
              )}
              Jack Wilson
            </div>
          </div>
        </div>

        <div className='px-6 py-2 w-2/3'>
          <input
            className='flex w-full rounded-md bg-white border h-12 px-6 border-neutral-300 shadow-sm text-sm focus:ring-1 focus:ring-inputring outline-none placeholder:text-neutral-600'
            placeholder='Search by name'
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
            }}
          />
        </div>

        {/* Search Results */}
        {(searchTerm.length) > 0 && <div className="px-6 w-full">
        <div className='relative px-6 w-full'>
          <div className='flex flex-col absolute w-2/5 bg-white rounded-lg border border-neutral-100 shadow-lg left-[0px] top-[0px] z-10'>
            {/* Search Results */}
            <NewMessageUserRow
              name='Jack Cooper'
              avatarUrl='/avatars/avatar06.png'
              present='1'
            />
            <NewMessageUserRow
              name='Jack Jones'
              avatarUrl='/avatars/avatar07.png'
              present='0'
            />
            <NewMessageUserRow
              name='Jack Wilson'
              avatarUrl='/avatars/avatar08.png'
              present='0'
            />
            <NewMessageUserRow
              name='Jacob Howard'
              avatarUrl='/avatars/avatar09.png'
              present='1'
            />
          </div>
        </div>
        </div>}

        <div className='flex flex-wrap px-6 mb-2 w-full bg-white '>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
          <NewMessageUserPill name='Darryn' removePillAction={(userId) => console.log('ToDo: Remove Pill for user ' + userId)}/>
        </div>

      </div>
    </div>
  )
}
