import Image from 'next/image'
import ToolTip from './toolTip'
import { useState } from 'react'
//import data from '@emoji-mart/data'
//import Picker from '@emoji-mart/react'

export default function MessageActions ({
  received,
  actionsShown,
  timetoken,
  isPinned,
  messageActionsEnter,
  messageActionsLeave,
  replyInThreadClick,
  quoteMessageClick,
  pinMessageClick,
  //reactMessageClick,
  copyMessageClick,
  showEmojiPickerClick
}) {
  const [emoteToolTip, setEmoteToolTip] = useState(false)
  const [quoteToolTip, setQuoteToolTip] = useState(false)
  const [pinToolTip, setPinToolTip] = useState(false)
  const [replyToolTip, setReplyToolTip] = useState(false)
  const [copyToolTip, setCopyToolTip] = useState(false)
  //const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  function copyClick (e) {
    copyMessageClick()
  }
  function copyEnter () {
    setCopyToolTip(true)
  }
  function copyLeave () {
    setCopyToolTip(false)
  }

  function replyClick (e) {
    replyInThreadClick()
  }

  function replyEnter () {
    setReplyToolTip(true)
  }

  function replyLeave () {
    setReplyToolTip(false)
  }

  function pinClick (e) {
    pinMessageClick()
  }

  function pinEnter () {
    setPinToolTip(true)
  }

  function pinLeave () {
    setPinToolTip(false)
  }

  function quoteClick (e) {
    quoteMessageClick()
  }

  function quoteEnter () {
    setQuoteToolTip(true)
  }

  function quoteLeave () {
    setQuoteToolTip(false)
  }

  function emoteClick (e) {
    //setShowEmojiPicker(true)
    showEmojiPickerClick({isShown: true, mouseX: e.clientX, mouseY: e.clientY, messageTimetoken: timetoken})
    //reactMessageClick()
  }

  function emojiSelected(data) {
    console.log(data)
    //setShowEmojiPicker(false)
    //reactMessageClick(data)
  }

  function emoteEnter () {
    setEmoteToolTip(true)
  }

  function emoteLeave () {
    setEmoteToolTip(false)
  }

  const handleMessageActionsMouseEnter = e => {
    messageActionsEnter()
  }
  const handleMessageActionsMouseLeave = e => {
    messageActionsLeave()
    //setShowEmojiPicker(false)
  }

  return (
    <div className={`${!received && 'relative self-start'}`}>
      <div
        className={`absolute flex flex-row-reverse p-2 gap-1 w-[252px] z-10 rounded-sm shadow-lg bg-white mr-24 ${
          received ? 'right-[10px]' : 'left-[10px]'
        } ${received ? '-bottom-[50px]' : '-bottom-[35px]'} cursor-pointer ${
          !actionsShown && 'hidden'
        } `}
        onMouseEnter={handleMessageActionsMouseEnter}
        onMouseLeave={handleMessageActionsMouseLeave}
      >
        <div
          className='hover:bg-navy100 hover:rounded-md relative'
          onClick={e => copyClick(e)}
          onMouseEnter={e => copyEnter()}
          onMouseLeave={e => copyLeave()}
        >
          <Image
            src='/icons/copy.svg'
            alt='Copy'
            className='m-3'
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={`${copyToolTip ? 'block' : 'hidden'}`}
            tip='Copy to clipboard'
          />
        </div>
        <div
          className='hover:bg-navy100 hover:rounded-md relative'
          onClick={e => replyClick(e)}
          onMouseEnter={e => replyEnter()}
          onMouseLeave={e => replyLeave()}
        >
          <Image
            src='/icons/reply.svg'
            alt='Reply'
            className='m-3'
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={`${replyToolTip ? 'block' : 'hidden'}`}
            tip='Reply in thread'
          />
        </div>
        <div
          className='hover:bg-navy100 hover:rounded-md relative'
          onClick={e => pinClick(e)}
          onMouseEnter={() => pinEnter()}
          onMouseLeave={() => pinLeave()}
        >
          <Image
            src='/icons/pin.svg'
            alt='Pin'
            className='m-3'
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={`${pinToolTip ? 'block' : 'hidden'}`}
            tip={`${isPinned ? "Unpin message" : "Pin message"}`}
          />
        </div>
        <div
          className='hover:bg-navy100 hover:rounded-md relative'
          onClick={e => quoteClick(e)}
          onMouseEnter={() => quoteEnter()}
          onMouseLeave={() => quoteLeave()}
        >
          <Image
            src='/icons/quote.svg'
            alt='Quote'
            className='m-3'
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={`${quoteToolTip ? 'block' : 'hidden'}`}
            tip='Quote message'
          />
        </div>
        <div
          className='hover:bg-navy100 hover:rounded-md relative'
          onClick={e => emoteClick(e)}
          onMouseEnter={() => emoteEnter()}
          onMouseLeave={() => emoteLeave()}
        >
          <Image
            src='/icons/smile.svg'
            alt='Smile'
            className='m-3'
            width={20}
            height={20}
            priority
          />
          <ToolTip
            className={`${emoteToolTip ? 'block' : 'hidden'} bottom-[50px]`}
            tip='React to message'
          />
        </div>
        {/*showEmojiPicker && <div
          className={`absolute ${
            received ? 'right-[250px]' : 'left-[60px]'
          } -top-[250px]`}
        >
          <Picker data={data} sheetRows={3} previewPosition={'none'} navPosition={'none'} searchPosition={'none'} maxFrequentRows={0} onEmojiSelect={(data) => {emojiSelected(data)}} onClickOutside={() => {setShowEmojiPicker(false)}} />
        </div>*/}
      </div>
    </div>
  )
}
