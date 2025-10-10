import axios from "axios";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function* streamChatCompletion(
  messages: ChatMessage[],
  model: string = "openai/gpt-5",
  temperature: number = 0.7
): AsyncGenerator<string> {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model,
        messages,
        temperature,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
          "X-Title": "AgentiLab ChatBuilder",
        },
        responseType: "stream",
      }
    );

    for await (const chunk of response.data) {
      const lines = chunk.toString().split("\n").filter((line: string) => line.trim() !== "");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          if (data === "[DONE]") {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    throw new Error("Failed to stream chat completion");
  }
}

export async function getChatCompletion(
  messages: ChatMessage[],
  model: string = "openai/gpt-5",
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model,
        messages,
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
          "X-Title": "AgentiLab ChatBuilder",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error getting chat completion:", error);
    throw new Error("Failed to get chat completion");
  }
}
