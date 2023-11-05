import { itrpc } from "@/util/trcp";
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
        description:
          "A prompt describing the image to generate. A detailed, specific prompt will give the best result. The prompt should specify (if applicable): content, composition, actions and feeling.",
        required: true,
      },
      {
        name: "style",
        description:
          "The style of the image to generate. The style can be anything, for example: 'hyperrealistic raytraced render', 'modern corporate vector art', '1950's color cartoon', or 'iphone camera selfie'.",
        required: false,
      },
      {
        name: "big_image",
        description:
          "MUST be 'true' or 'false'. Only set this to true if you're generating a single detailed image with a complex prompt or style. For multiple images, set this to false.",
        required: true,
      },
    ],
    async run({ prompt, style, big_image }): Promise<string> {
      const img = await getGlobalOpenAI()!.images.generate({
        prompt: `${prompt}. ${style}`,
        n: 1,
        response_format: "url",
        size: big_image === "true" ? "512x512" : "256x256",
      });
      const urlraw = img.data[0].url!;
      return `{ "data" = "${urlraw}" }`;
    },
  }),
  AIFunction.create({
    name: "create_new_chatbot",
    display_name: "chat.eriksik API",
    description:
      "Creates a new chatbot which the user can chat with, using the chat.eriksik API.",
    params: [
      {
        name: "name",
        description: "A display name for the chatbot.",
        required: true,
      },
      {
        name: "description",
        description: "A description of the chatbot, for the user to read.",
        required: false,
      },
      {
        name: "model",
        description:
          "Which GPT model to use. This must be either 'gpt-4' or 'gpt-3.5-turbo'. gpt-4 is better for more complex behaviours.",
        required: true,
      },
      {
        name: "system_message",
        description:
          "Instructions for the model. This is how you tune the personality of the chatbot and make it act in a certain way or be primed to perform certain tasks. The system prompt should be long and detailed.",
        required: true,
      },
    ],
    async run({
      name,
      description,
      model,
      system_message,
    }: {
      name: string;
      description?: string;
      model: string;
      system_message: string;
    }): Promise<string> {
      const data = await itrpc.bots.create.mutate({
        name: name,
        description: description ?? "",
        model: model,
        systemMessage: system_message,
        temperature: 0.8,
        tags: [],
      });
      return `{ "url" = "https://${window.location.hostname}/bots/${data.id}" }`;
    },
  }),
];

export const predefinedFunctions: Map<string, AIFunction> = (() => {
  const map = new Map<string, AIFunction>();
  predefinedFunctionsList.forEach((func) => {
    map.set(func.name, func);
  });
  return map;
})();
