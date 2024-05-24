
import Avatar from './avatar'

export default function TypingIndicator({text, avatarUrl}) {

    return (
        <div className='absolute items-center bg-white h-12 max-h-12 bottom-[114px]'>

          <div className="flex flex-row items-center ml-7 mr-24 m-3  gap-3 text-base font-normal text-neutral-500">
          {avatarUrl && <div className="">
            {avatarUrl !== "" && <Avatar present={-1} avatarUrl={avatarUrl} />}
              </div>}
            {/* ToDo */}
            <div className="line-clamp-1">
          {text}
          </div>
          </div>
        </div>
        

  );

}