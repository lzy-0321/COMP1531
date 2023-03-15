```javascript
let data = {
    users: [
        {
            uId: 7,
            email: 'chris@gmail.com',
            password: 'hunter2',
            nameFirst: 'Chris',
            nameLast: 'Bi',
            handleStr: 'chrissyB'
        }
    ],
    channels: [
        {
            channelId: 9,
            isPublic: false,
            name: 'Chris\' room',
            messages: [{
                messageId: 1,
                uId: 7,
                message: 'Hi I\'m Chris',
                timeSent: 1663734029
            }],
            ownerMembers: [
                7
            ],
            allMembers: [
                2, 3, 5
            ]
        }
    ]
}
```

Short description:
 * A user has an ID, an email, a first and last name, and a handle.
 * A channel has an ID, a flag for if it's public, a name, an array of owner IDs, an array of member IDs, and an array of sent messages. Each message has an ID, the sender ID, the message contents, and the time sent (in UNIX time).