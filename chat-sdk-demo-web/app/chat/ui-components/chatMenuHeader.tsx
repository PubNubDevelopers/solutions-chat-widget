import Image from "next/image";
import { roboto } from '@/app/fonts';
import { useState } from 'react'
import { ChatHeaderActionIcon } from '../types'


export default function ChatMenuHeader({text, actionIcon, expanded, expandCollapse, action = (b) => {}}) {

    return (
          <div className="mt-2">
            <div className="flex flex-row items-center justify-between h-12 text-sm tracking-wide">
            <div className="flex flex-row items-center  select-none">
            <div className="flex w-12 h-12 items-center justify-center cursor-pointer" onClick= {() => expandCollapse()}>
              <Image
                src="/icons/expand-more.svg"
                alt="Expand"
                className={expanded ? "" : "rotate-180"}
                width={12}
                height={7}
                priority
              />
            </div>
              {text}
            </div>
            <div className="flex w-12 h-12 items-center justify-center">
              {(actionIcon === ChatHeaderActionIcon.MARK_READ) &&
              <div className="cursor-pointer" onClick={(e) => action(e)}>
              <Image
                src="/icons/check2.svg"
                alt="More"
                className="m-3"
                width={16}
                height={16}
                priority
              /></div>} 
               {(actionIcon === ChatHeaderActionIcon.ADD) && 
              <div className="cursor-pointer" onClick={() => action(true)}>
              <Image
                src="/icons/add.svg"
                alt="Add"
                className="m-3"
                width={14}
                height={14}
                priority
              /></div>} 
            </div>
            </div>  
            
          </div>  
  );

}