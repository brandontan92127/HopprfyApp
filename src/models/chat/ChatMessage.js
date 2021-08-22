//**Target ID is the RECEIVER - if you are sending, it's them, if you are receiving it's you */
export default class ChatMessage {
    //targetIdGuid is either you or recepient - that's how you know which side it's on
    constructor(content, targetIdGuid, sendStatus) {

        this.id = `${new Date().getTime()}`;
        this.type = "text";
        this.content = content;
        this.targetId = targetIdGuid;
        this.chatInfo = {
            avatar: "https://images-na.ssl-images-amazon.com/images/I/41y9PiKOeuL._SX425_.jpg",
            id: targetIdGuid
        };
        this.renderTime = true;
        this.sendStatus = sendStatus;
        this.time = Date.now();
    }
}

