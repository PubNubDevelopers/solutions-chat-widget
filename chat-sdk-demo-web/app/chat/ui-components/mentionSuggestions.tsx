import Avatar from './avatar'
import Image from 'next/image'
import { roboto } from '@/app/fonts'

export default function MentionSuggestions ({ suggestedUsers, suggestedChannels, pickSuggestedUser, pickSuggestedChannel }) {
  return (
    <div className="flex w-full px-7 flex-row bg-white">
    {suggestedUsers.map((user, index) => {
      return (
        <div key={index} className={`${roboto.className} flex text-sm m-1 rounded-lg border px-2 py-1 line-clamp-1 text-nowrap cursor-pointer border-neutral-300 bg-neutral-50 text-neutral-900`} onClick={() => {pickSuggestedUser(user)}}>{user.name}</div>
      )})}
    {suggestedChannels.map((channel, index) => {
      return (
        <div key={index} className={`${roboto.className} flex text-sm m-1 rounded-lg border px-2 py-1 line-clamp-1 text-nowrap cursor-pointer border-neutral-300 bg-neutral-50 text-neutral-900`} onClick={() => {pickSuggestedChannel(channel)}}>{channel.name}</div>
      )})}
    </div>)
}
        
{/*    

{activeChannelUsers?.map((user, index) => {
              return (
                <ManagedMember
                  key={index}
                  user={user}
                  name={`${user.name}`}
                  removeAction={userId => {
                    let arr: User[] = [user]
                    sendChatEvent(ChatEventTypes.KICK, arr, {kickedBy: currentUserId, channelAffected: activeChannel.id})
                  }}
                  lastElement={index == activeChannelUsers?.length - 1}
                />
              )
            })}

<div
      className={`${roboto.className} flex flex-row text-base m-1 rounded-lg border px-2 py-1 border-neutral-300 bg-neutral-50 text-neutral-900`}
    >
      <Avatar
        key={index}
        present={
          users[users.findIndex(user => user.id == typer)]?.active
            ? PresenceIcon.ONLINE
            : PresenceIcon.OFFLINE
        }
        border={true}
        avatarUrl={users[users.findIndex(user => user.id == typer)]?.profileUrl}
      />

      <div className=''>{user.name}</div>
      {!isMe && (
        <div
          className='cursor-pointer'
          onClick={() => removePillAction(user.id)}
        >
          <Image
            src='/icons/close.svg'
            alt='Remove'
            className='ml-2'
            width={24}
            height={24}
            priority
          />
        </div>
      )}
    </div>
  )
}*/}
