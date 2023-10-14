import OpenAI from "openai";

type ArgumentSpec = {
    name: string;
    description: string;
    required: boolean;
};

export default class AIFunction {
    name: string;
    display_name: string;
    description: string;
    args: ArgumentSpec[];
    run: (...args: any[]) => Promise<string>;

    constructor(
        name: string,
        display_name: string,
        description: string,
        params: ArgumentSpec[],
        run: (...args: any[]) => Promise<string>,
    ) {
        this.name = name;
        this.display_name = display_name;
        this.description = description;
        this.args = params;
        this.run = run;
    }

    static create({
        name,
        display_name,
        description,
        params,
        run,
    }: {
        name: string;
        display_name: string;
        description: string;
        params: ArgumentSpec[];
        run: (...params: any[]) => Promise<string>;
    }): AIFunction {
        return new AIFunction(name, display_name, description, params, run);
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