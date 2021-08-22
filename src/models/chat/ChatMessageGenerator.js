export default class ChatMessageGenerator {

    static generateMySideChatMessage = (content, sendStatus) => {
        return {
            id: `${new Date().getTime()}`,
            type: 'text',
            content: content,
            targetId: '12345678',
            chatInfo: {
                avatar: "https://d2gg9evh47fn9z.cloudfront.net/800px_COLOURBOX30822157.jpg",
                id: '12345678',
                nickName: 'Test'
            },
            renderTime: true,
            sendStatus: sendStatus,
            time: Date.now()
        }
    }

    static generateTheirSideChatMessage = (content, sendStatus) => {
        return {
            id:`${new Date().getTime()}`,
            type: 'text',
            content: content,
            targetId: '88886666',
            chatInfo: {
                avatar: "https://m.media-amazon.com/images/M/MV5BOTg5NGYxOTItOTExYS00YzRmLThmZjEtYjE3MmFmODlmYmEyXkEyXkFqcGdeQXVyMzM4MjM0Nzg@._V1_.jpg",
                id: '12345678'
            },
            renderTime: true,
            sendStatus: sendStatus,
            time: Date.now()
        }
    }
}