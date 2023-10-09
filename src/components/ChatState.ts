import Reactive from '@/util/Reactive';
import ChatMessageState from './ChatMessageState';


export default class ChatState extends Reactive {
    history: ChatMessageState[] = [];

    constructor() {
        super();
    }

    addMessage(message: ChatMessageState) {
        if (message.chat !== null) throw new Error("Message already in chat");
        message.chat = this;
        this.history.push(message);
        message.addReactive(this);
        this.notifyListeners();
    }

    removeMessage(message: ChatMessageState) {
        message.chat = null;
        this.history = this.history.filter(m => m !== message);
        message.removeReactive(this);
        this.notifyListeners();
    }
};
