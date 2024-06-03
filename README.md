# Chat-SDK-Demo-Web
Demo of the PubNub Chat SDK running in a React app

# WORK IN PROGRESS

Live application is here: [https://chat-sdk-demo-web.netlify.app/](https://chat-sdk-demo-web.netlify.app/)


## Unsupported Features

Although the Chat SDK supports the following features, the demo does not:

### Theads:
This demo only supports sending text messages in Threads, i.e. no mentioned users or channels, no reactions and no pinned messages.  To reiterate, the Chat SDK DOES support these features: https://www.pubnub.com/docs/chat/chat-sdk/build/features/messages/threads 


### Presence:
This demo uses global presence, as described here: https://www.pubnub.com/docs/chat/chat-sdk/build/features/users/presence.  Channel presence, detailed on that same page, is not supported.