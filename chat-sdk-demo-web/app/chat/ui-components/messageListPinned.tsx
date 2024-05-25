import Message from './message'
import { roboto } from '@/app/fonts'
import Image from 'next/image'
import MessageInput from './messageInput'

export default function MessageListPinned ({
  showPinnedMessages,
  setShowPinnedMessages
}) {
  return (
    <div className='relative'>
      <div
        className={`${
          !showPinnedMessages && 'hidden'
        } flex flex-col min-w-80 max-w-80 h-full py-0 mt-[64px] `}
      >
        <div
          id='threads-header'
          className='flex flex-row items-center w-full h-16 min-h-16 border border-navy-200'
        >
          <div
            className={`${roboto.className} text-base font-bold flex grow pl-6 pr-3 justify-between items-center`}
          >
            Pinned messages
            <div
              className='flex cursor-pointer p-3'
              onClick={e => setShowPinnedMessages(false)}
            >
              <Image
                src='/icons/close.svg'
                alt='Close Thread'
                className=''
                width={24}
                height={24}
                priority
              />
            </div>
          </div>
        </div>
        {/* Bottom padding to accommodate for having to move this component down below the header & allow scrollable content (I'm not a fan, but it works) */}
        <div
          className={`flex flex-col grow border border-navy-200 overflow-y-auto overscroll-none overflow-hidden pb-[84px]`}
        >
          {/* PINNED MESSAGE BUBBLES */}
          <Message
            received={true}
            inPinned={true}
            avatarUrl='/avatars/avatar01.png'
            isRead={true}
            sender='Sarah Johannsen is a very long name'
            dateTime='Tue 29 Aug 17:18'
            reactions={['🐕', '🐶']}
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis '
          />

          <Message
            received={false}
            inPinned={true}
            avatarUrl='/avatars/avatar02.png'
            isRead={true}
            sender='Mikey'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque.'
          />

          <Message
            received={false}
            inPinned={true}
            avatarUrl='/avatars/avatar02.png'
            isRead={true}
            sender='Mikey'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque.'
          />

          <Message
            received={false}
            inPinned={true}
            avatarUrl='/avatars/avatar02.png'
            isRead={true}
            sender='Mikey'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque.'
          />

          <Message
            received={false}
            inPinned={true}
            avatarUrl='/avatars/avatar02.png'
            isRead={true}
            sender='Mikey'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque.'
          />

          <Message
            received={false}
            inPinned={true}
            avatarUrl='/avatars/avatar02.png'
            isRead={true}
            sender='Mikey'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque.'
          />

          <Message
            received={false}
            inPinned={true}
            avatarUrl='/avatars/avatar02.png'
            isRead={true}
            sender='Mikey 222'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque.'
          />
        </div>
      </div>
    </div>
  )
}
