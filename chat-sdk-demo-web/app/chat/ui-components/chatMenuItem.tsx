import Avatar from './avatar'
import UnreadIndicator from './unreadIndicator'



export default function ChatMenuItem({avatarUrl, text, present = -1, avatarBubblePrecedent = "", count = ""}) {

    return (

    <div className="flex flex-col">
    <div className="flex flex-row justify-between items-center w-full px-4">
    <div className="flex flex-row py-2 gap-3 h-12 text-sm items-center text-neutral900">
    <Avatar present={present} bubblePrecedent={avatarBubblePrecedent} avatarUrl={avatarUrl} />
        {text}
    </div>
    <UnreadIndicator count={count}/>
    </div>

    </div>

);

}