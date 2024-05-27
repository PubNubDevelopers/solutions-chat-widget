import Message from './message'
import { roboto } from '@/app/fonts'
import Image from 'next/image'
import MessageInput from './messageInput'

export default function MessageListThread ({ showThread, setShowThread }) {
  return (
    <div className='relative'>
      <div
        className={`${
          !showThread && 'hidden'
        } flex flex-col min-w-80 max-w-80 max-h-screen py-0 mt-[64px]`}
      >
        <div
          id='threads-header'
          className='flex flex-row items-center w-full h-16 min-h-16 border border-navy-200'
        >
          <div
            className={`${roboto.className} text-base font-bold flex grow pl-6 pr-3 justify-between items-center`}
          >
            Reply in thread
            <div
              className='flex cursor-pointer p-3'
              onClick={e => setShowThread(false)}
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
        <div
          className={`flex flex-col border border-navy-200 h-screen overflow-y-auto pb-6 mb-[178px]`}
        >
          {/* THREAD BUBBLES */}
          <Message
            received={true}
            inThread={true}
            avatarUrl='/avatars/avatar01.png'
            isRead={true}
            sender='Sarah Johannsen'
            dateTime='Tue 29 Aug 17:18'
            reactions={['🐕', '🐶']}
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
          />

          <Message
            received={false}
            inThread={true}
            avatarUrl='/avatars/avatar02.png'
            isRead={false}
            sender='Philip Soto'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
          />

          <Message
            received={false}
            inThread={true}
            avatarUrl='/avatars/avatar03.png'
            isRead={true}
            sender='Philip Soto'
            dateTime='Tue 29 Aug 17:18'
            messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo '
          />
        </div>

        <div className='absolute bottom-0 left-0 right-0'>
          <MessageInput
            activeChannel={'CHANGE ME'}
            replyInThread={true}
            quotedMessage={null}
          />
        </div>
      </div>
    </div>
  )
}
