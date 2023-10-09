import Reactive from "@/util/Reactive";
import ChatBot from "./ChatBot";
import ChatSession from "./ChatSession";


export default class App extends Reactive {
    chatbots: ChatBot[] = [];
    chats: ChatSession[] = [];

    addChatbot(chatbot: ChatBot) {
        this.chatbots.push(chatbot);
        this.notifyListeners();
    }

    removeChatbot(chatbot: ChatBot) {
        this.chatbots = this.chatbots.filter(c => c !== chatbot);
        this.notifyListeners();
    }

    addChat(chat: ChatSession) {
        this.chats.push(chat);
        this.notifyListeners();
    }

    removeChat(chat: ChatSession) {
        this.chats = this.chats.filter(c => c !== chat);
        this.notifyListeners();
    }
}