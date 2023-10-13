import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";


export default class Completion {
    openai: OpenAI;
    model: string;
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    messages: Array<ChatCompletionMessageParam>;
    didRun: boolean = false;

    constructor(
        openai: OpenAI,
        model: string,
        temperature: number,
        frequency_penalty: number,
        presence_penalty: number,
        messages: Array<ChatCompletionMessageParam>
    ) {
        this.openai = openai;
        this.model = model;
        this.temperature = temperature;
        this.frequency_penalty = frequency_penalty;
        this.presence_penalty = presence_penalty;
        this.messages = messages;
    }

    async run(callback: (chunk: string, reason: 'stop' | 'length' | 'function_call' | 'content_filter' | null) => void, onFinish: (full_message: string) => void): Promise<void> {
        if (this.didRun) {
            console.error("Completion.run() called twice");
            return;
        }

        this.didRun = true;
        const stream = await this.openai.chat.completions.create({
            model: this.model,
            temperature: this.temperature,
            frequency_penalty: this.frequency_penalty,
            presence_penalty: this.presence_penalty,
            stream: true,
            n: 1,
            messages: this.messages,
        });
        var full_message = "";
        for await (const chunk of stream) {
            const text = chunk.choices[0].delta.content;
            const finish_reason = chunk.choices[0].finish_reason;
            callback(text ?? "", finish_reason);
            full_message += text ?? "";
        }
        onFinish(full_message);
    }
}