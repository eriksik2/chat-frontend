import AIFunction from "./AIFunction";
import { getGlobalOpenAI } from "./OpenAI";

const predefinedFunctionsList: AIFunction[] = [
    AIFunction.create({
        name: "generate_image",
        display_name: "DALL-E 2",
        description: "Generates an image using the DALL-E 2 Diffusion model.",
        params: [
            {
                name: "prompt",
                description: "A prompt describing the image to generate. A detailed, specific prompt will give the best result. The prompt should specify (if applicable): content, composition, actions and feeling.",
                required: true,
            },
            {
                name: "style",
                description: "The style of the image to generate. The style can be anything, for example: 'hyperrealistic raytraced render', 'modern corporate vector art', '1950's color cartoon', or 'iphone camera selfie'.",
                required: false,
            },
            {
                name: "big_image",
                description: "MUST be 'true' or 'false'. Only set this to true if you're generating a single detailed image with a complex prompt or style. For multiple images, set this to false.",
                required: true,
            },
        ],
        async run(prompt: string, style: string | null, big_image: string): Promise<string> {
            const img = await getGlobalOpenAI()!.images.generate({
                prompt: `${prompt}. ${style}`,
                n: 1,
                response_format: "url",
                size: big_image === "true" ? "512x512" : "256x256",
            });
            const urlraw = img.data[0].url!;
            return `{ "data" = "${urlraw}" }`;
        }
    })
];


export const predefinedFunctions: Map<string, AIFunction> = (() => {
    const map = new Map<string, AIFunction>();
    predefinedFunctionsList.forEach((func) => {
        map.set(func.name, func);
    });
    return map;
})();