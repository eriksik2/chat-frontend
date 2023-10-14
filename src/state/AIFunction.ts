import OpenAI from "openai";

type ArgumentSpec = {
    name: string;
    description: string;
    required: boolean;
};

export default class AIFunction {
    name: string;
    description: string;
    args: ArgumentSpec[];
    run: (...args: any[]) => Promise<string>;

    constructor(
        name: string,
        description: string,
        args: ArgumentSpec[],
        run: (...args: any[]) => Promise<string>,
    ) {
        this.name = name;
        this.description = description;
        this.args = args;
        this.run = run;
    }

    toOpenAISpec(): OpenAI.Chat.Completions.ChatCompletionCreateParams.Function {
        return {
            name: this.name,
            description: this.description,
            parameters: {
                type: "object",
                properties: this.args.reduce<Record<string, { type: string, description: string }>>((acc, arg) => {
                    acc[arg.name] = {
                        type: "string",
                        description: arg.description,
                    };
                    return acc;
                }, {}),
                required: this.args.filter((arg) => arg.required).map((arg) => arg.name),
            },
        }
    }

    async call(...args: any[]): Promise<string> {
        return await this.run(...args);
    }
}