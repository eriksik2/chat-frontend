import { ChatMessageContent } from "@/components/chat/ChatMessageComponent";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import AIFunction from "./AIFunction";
import { predefinedFunctions } from "./PredefinedFunctions";

export type FunctionCall = {
    name: string;
    arguments: {
        [key: string]: string;
    };
}

export type CompletionMessage = {
    role: "user" | "assistant";
    content: ChatMessageContent[];
};

export default class Completion {
    openai: OpenAI;
    model: string;
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    system_message: string | null;
    messages: CompletionMessage[];
    functions: AIFunction[];
    didRun: boolean = false;

    constructor(
        openai: OpenAI,
        model: string,
        temperature: number,
        frequency_penalty: number,
        presence_penalty: number,
        system_message: string | null,
        messages: CompletionMessage[],
        functions: string[] = [],
    ) {
        this.openai = openai;
        this.model = model;
        this.temperature = temperature;
        this.frequency_penalty = frequency_penalty;
        this.presence_penalty = presence_penalty;
        this.system_message = system_message;
        this.messages = messages;
        this.functions = functions.map(fn => predefinedFunctions.get(fn)).filter(fn => fn !== undefined) as AIFunction[];

        if (this.functions.length !== 0) {
            const extra_system_message = "When calling functions: If you are unsure about what parameter values to use, ask the user. However, dont be afraid to get creative, if the user wants you to.";
            this.system_message = this.system_message === null ? extra_system_message : `${this.system_message}\n\n${extra_system_message}`;
        }

        for (const fn of this.functions) {
            if (fn === undefined) {
                console.error("Invalid function name:", fn);
                continue;
            }
            if (fn.extraSystemMessage !== null) {
                this.system_message = this.system_message === null ? fn.extraSystemMessage : `${this.system_message}\n\nWhen calling '${fn.name}': ${fn.extraSystemMessage}`;
            }
        }
    }

    private convertMessage(message: CompletionMessage): ChatCompletionMessageParam[] | ChatCompletionMessageParam {
        if (message.role === "user") {
            return {
                role: message.role,
                content: message.content.map((cnt) => cnt.type === "md" ? cnt.content : "").join(""),
            }
        } else {
            return message.content.map((cnt) => {
                if (cnt.type === "md") {
                    return {
                        role: "assistant" as const,
                        content: cnt.content,
                    };
                } else {
                    return {
                        role: "function" as const,
                        content: cnt.result!,
                        name: cnt.name!,
                    };
                }
            });
        }
    }

    private getMessages(): ChatCompletionMessageParam[] {
        const msgs = new Array<ChatCompletionMessageParam>();
        if (this.system_message && this.system_message.trim() !== "") {
            msgs.push({
                role: "system",
                content: this.system_message,
            });
        }
        msgs.push(...this.messages.flatMap(this.convertMessage));
        return msgs;
    }

    async run(
        callback: (chunk: string | null, fn_name: string | null, fn_args: string | null, fn_res: string | null) => void,
        onFinish: () => void
    ): Promise<void> {
        if (this.didRun) {
            console.error("Completion.run() called twice");
            return;
        }

        this.didRun = true;
        var messages = [...this.getMessages()];
        var do_continue = true;
        var allow_fn = true;
        var iteration = 0;
        while (do_continue) {
            iteration++;
            if (iteration > 10) {
                console.error("Iteration limit exceeded");
                break;
            }
            do_continue = false;
            console.log("Prompting AI with messages: ", messages);
            const fn_specs = this.functions.map((fn) => fn.toOpenAISpec());
            const has_no_fn = fn_specs.length === 0;
            const stream = await this.openai.chat.completions.create({
                model: this.model,
                temperature: this.temperature,
                frequency_penalty: this.frequency_penalty,
                presence_penalty: this.presence_penalty,
                stream: true,
                n: 1,
                messages: messages,
                function_call: has_no_fn ? undefined : (allow_fn ? "auto" : "none"),
                functions: has_no_fn ? undefined : fn_specs,
            });
            var function_name = "";
            var function_args = "";
            for await (const chunk of stream) {
                const delta = chunk.choices[0].delta;
                const fin_reason = chunk.choices[0].finish_reason;
                if (fin_reason !== null && fin_reason !== undefined) {
                    if (fin_reason === "function_call") {
                        do_continue = true;
                    }
                }

                const fn_name = delta.function_call?.name;
                const fn_args = delta.function_call?.arguments;
                function_name += fn_name ?? "";
                function_args += fn_args ?? "";

                callback(delta.content ?? null, fn_name ?? null, fn_args ?? null, null);
            }
            const did_call_fn = function_name !== "";
            if (did_call_fn) {
                const fn = predefinedFunctions.get(function_name);
                if (fn === undefined) {
                    console.error("API returned invalid function name:", function_name);
                    break;
                }
                var arguments_obj = null;
                try {
                    arguments_obj = JSON.parse(function_args);
                } catch (e) {
                    console.error("API returned invalid JSON for function arguments:", function_args);
                    break;
                }
                const fn_result = await fn.call(arguments_obj);
                callback(null, null, null, fn_result);
                messages.push({
                    role: "function",
                    content: fn_result,
                    name: function_name,
                });
            }
        }
        onFinish();
    }
}