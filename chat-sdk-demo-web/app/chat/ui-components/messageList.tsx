import { roboto } from '@/app/fonts'
import Avatar from './avatar'
import Message from './message'
import Image from 'next/image'
import { CustomQuotedMessage } from '../types'


export default function MessageList ({
  messageActionHandler = (action, vars) => {},
  setChatSettingsScreenVisible,
  quotedMessage,
  setShowPinnedMessages,
  setShowThread
}) {
  return (
    <div className='flex flex-col max-h-screen'>
      <div
        id='chats-header'
        className='flex flex-row items-center h-16 min-h-16 border border-navy-200 select-none'
      >
        <div
          className={`${roboto.className} text-base font-medium flex grow justify-center items-center gap-3`}
        >
          <Avatar present={1} avatarUrl={'/avatars/avatar01.png'} />
          Sarah Johannsen
        </div>

        <div className='flex flex-row'>
          {/* Icons on the top right of a chat screen */}
          <div className='flex flex-row'>
            {/* Pin with number of pinned messages */}
            <div className='flex justify-center items-center rounded min-w-6 px-2 my-2 border text-xs font-normal border-navy50 bg-neutral-100'>
              3
            </div>
            <div
              className='p-3 py-3 cursor-pointer hover:bg-neutral-100 hover:rounded-md'
              onClick={() => {
                setShowPinnedMessages(true)
                setShowThread(false)
              }}
            >
              <Image
                src='/icons/pin.svg'
                alt='Pin'
                className=''
                width={24}
                height={24}
                priority
              />
            </div>
          </div>
          <div
            className='p-3 py-3 cursor-pointer hover:bg-neutral-100 hover:rounded-md'
            onClick={() => setChatSettingsScreenVisible(true)}
          >
            <Image
              src='/icons/settings.svg'
              alt='Settings'
              className=''
              width={24}
              height={24}
              priority
            />
          </div>
        </div>
      </div>

      {/* This section hard-codes the bottom of the message list to accommodate the height of the message input Div, whose height will vary depending on whether there is a quoted message displayed or not */}
      <div
        id='chats-bubbles'
        className={`flex flex-col overflow-y-auto overscroll-none pb-6 ${
          quotedMessage ? 'mb-[234px]' : 'mb-[178px]'
        }`}
      >
        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          pinned={true}
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='1Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />


    

        <Message
          received={false}
          avatarUrl='/avatars/avatar02.png'
          isRead={true}
          sender='Default Text'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Augue sit et aenean non tortor senectus sed. Sagittis eget in ut magna semper urna felis velit cursus. Enim nunc leo quis volutpat dis.'
        />

        <Message
          received={false}
          avatarUrl='/avatars/avatar02.png'
          isRead={false}
          containsQuote={true}
          sender='Default Text'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          reactions={['😆','😗','😋']}
          messageText='Augue sit et aenean non tortor senectus sed. Sagittis eget in ut magna semper urna felis velit cursus. Enim nunc leo quis volutpat dis.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          reactions={['🐕', '🐶']}
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          reactions={['🐕', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶', '🐶']}
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          containsQuote={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />

        <Message
          received={true}
          avatarUrl='/avatars/avatar01.png'
          isRead={true}
          sender='Sarah Johannsen'
          dateTime='Tue 29 Aug 17:18'
          messageActionHandler={(action, vars) =>
            messageActionHandler(action, vars)
          }
          messageText='Aliquam a magna arcu tellus pellentesque mi pellentesque. Feugiat et a eget rutrum leo in. Pretium cras amet consequat est metus sodales. Id phasellus habitant dignissim viverra. Nulla non faucibus mus scelerisque diam. Nulla a quis venenatis convallis. Lectus placerat sit cursus parturient metus sagittis at mauris. Pharetra aliquam luctus ac fringilla ultricesluctus ac fringilla ultrices.'
        />
      </div>
    </div>
  )
}
