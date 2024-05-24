import Image from 'next/image'

export default function QuotedMessage({quotedMessage, setQuotedMessage, displayedWithMesageInput}) {

    return (
        <div className={`flex flex-row justify-between w-full ${displayedWithMesageInput ? "ml-6" : "mb-2"} mt-2 rounded-r-md mr-24 bg-neutral-50`}>
        <div className='flex flex-col w-full p-2.5 justify-center border-l-2 border-sky-950 '>
          <div className='font-normal text-sm text-neutral-900 mb-1'>
            {quotedMessage.sender}
          </div>
          <div className='font-normal text-sm text-neutral-900 line-clamp-2'>
            {quotedMessage.message}
          </div>
        </div>
        {displayedWithMesageInput && setQuotedMessage && <div
          className=' cursor-pointer'
          onClick={() => setQuotedMessage(null)}
        >
          <Image
            src='/icons/close.svg'
            alt='Close'
            className='m-3'
            width={20}
            height={20}
            priority
          />
        </div>}
      </div>
        

  );

}