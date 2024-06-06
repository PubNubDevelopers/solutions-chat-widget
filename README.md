# Chat-SDK-Demo-Web
Demo of the PubNub Chat SDK running in a React app

# WORK IN PROGRESS

Live application is here: [https://chat-sdk-demo-web.netlify.app/](https://chat-sdk-demo-web.netlify.app/)


## Limitations of this Demo

Although the Chat SDK supports the following features, the demo does not:

### Theads:
This demo only supports sending text messages in Threads, i.e. no mentioned users or channels, no reactions and no pinned messages.  To reiterate, the Chat SDK DOES support these features: https://www.pubnub.com/docs/chat/chat-sdk/build/features/messages/threads 
Threads don't support mentioning users or channels

### Presence:
This demo uses global presence, as described here: https://www.pubnub.com/docs/chat/chat-sdk/build/features/users/presence.  Channel presence, detailed on that same page, is not supported.

### Notifications:


### Other:
The typing indicator will not show if a message is being quoted
Unread messages on public channels will not be shown in the 'unread' list if you refresh the page (other groups will)
Only the last 20 messages from a channel's history are read in
Persistence is only set to a day
User and Channel mentions aren't stored but a popup is shown
Channel Monitor - muting and banning.
Public groups - I am deliberately limiting it to 40 people