
import Image from "next/image";

export default function UserMessage({userMsgShown, message, href}) {

    return (
        <div className={`${userMsgShown ? "flex" : "hidden"} absolute flex-row left-5 bottom-5 p-4 rounded-2xl shadow-2xl gap-3 bg-cherry text-white text-sm font-normal z-40`}>
        {/* User messages */}
        <Image
              src='/icons/info.svg'
              alt='Info'
              className='w-[24px] h-[24px]'
              width={24}
              height={24}
            />
        <div className="flex flex-col">
        {message}
        {href!="" && <div className="text-sm"><a href={href} target="_new">Learn More...</a></div>}
        </div>
        </div>

        

  );

}