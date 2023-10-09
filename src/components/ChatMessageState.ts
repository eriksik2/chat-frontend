import Reactive from '@/util/Reactive';
import OpenAI from 'openai';


export default class ChatMessageState extends Reactive {
    message: OpenAI.Chat.ChatCompletionMessage;
    selected: boolean = false;

    constructor(message: OpenAI.Chat.ChatCompletionMessage) {
        super();
        this.message = message;
    }

    setSelected(value: boolean) {
        this.selected = value;
        this.notifyListeners();
    }
};
