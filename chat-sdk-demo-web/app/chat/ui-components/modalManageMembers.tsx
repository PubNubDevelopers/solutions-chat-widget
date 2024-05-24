import Image from 'next/image'
import { useState } from 'react'
import { roboto } from '@/app/fonts'
import Avatar from './avatar'
import ManagedMember from './managedMember'

export default function ModalManageMembers ({
  saveAction,
  manageMembersModalVisible,
  setManageMembersModalVisible
}) {

  return (
    <div
      className={`${
        !manageMembersModalVisible && 'hidden'
      } fixed mx-auto inset-0 flex justify-center items-center z-40 select-none`}
    >
      {/* Example Modal */}
      <div className='flex flex-col lg:w-1/2 md:w-2/3 sm:w-2/3 shadow-xl rounded-xl bg-white border border-neutral-300'>
        <div className='flex flex-row justify-end'>
          <div
            className=' cursor-pointer'
            onClick={() => {
              setManageMembersModalVisible(false)
            }}
          >
            <Image
              src='/icons/close.svg'
              alt='Close'
              className='m-3'
              width={24}
              height={24}
              priority
            />
          </div>
        </div>
        <div className='flex flex-col px-12 pb-12 gap-3'>
          <div className='flex font-semibold text-lg justify-center text-neutral-900 mb-2'>
            Manage Members
          </div>
          <div className='flex font-normal text-base justify-center text-neutral-600'>
            The Chat SDK supports access rights, so you can choose which users
            have permission to remove others from a group
          </div>

          <div className='flex flex-col my-2 max-h-[40vh] overflow-y-auto overscroll-none'>

          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Cameron Williamson" avatarUrl="/avatars/avatar10.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Brooklyn Simmons" avatarUrl="/avatars/avatar11.png" removeAction={() => {console.log("ToDo: Remove Member")}}/>
          <ManagedMember name="Leslie Alexander" avatarUrl="/avatars/avatar12.png" removeAction={() => {console.log("ToDo: Remove Member")}} lastElement={true}/>

          </div>
          <div className='flex flex-row justify-between'>
            <div
              className={`${roboto.className} flex flex-row justify-center items-center text-navy700 font-normal text-base w-1/3 h-12 cursor-pointer border border-neutral-300 rounded-lg bg-white`}
              onClick={e => setManageMembersModalVisible(false)}
            >
              Cancel
            </div>
            <div
              className={`${roboto.className} flex flex-row justify-center items-center text-neutral-50 font-normal text-base w-1/3 h-12 cursor-pointer shadow-sm rounded-lg bg-navy900`}
              onClick={e => saveAction()}
            >
              Save
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
