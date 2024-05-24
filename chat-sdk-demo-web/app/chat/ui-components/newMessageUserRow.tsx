import Avatar from './avatar'
import Image from 'next/image'
import { roboto } from '@/app/fonts'


export default function NewMessageUserRow({name, avatarUrl, present}) {

    return (
        <div className={`${roboto.className} flex flex-row text-base mx-4 my-2 gap-2 w-full items-center text-neutral-900 cursor-pointer`}>
         <Avatar present={present} avatarUrl={avatarUrl} />
        <div className="">
          {name}
        </div>
      </div>    
        

  );

}