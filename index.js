import {Agent,run,tool} from "@openai/agents";
import {z} from "zod";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const latestAINews = tool({
    name: "Khabri",
  
    description:
      "Find recent AI news that is valuable and relevant to software developers.",
  
    parameters: z.object({}),
  
    async execute() {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=AI%20OR%20LLM%20OR%20OpenAI%20OR%20Anthropic%20OR%20MCP&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch news");
      }
  
      return data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt,
      }));
    },
  });

  const sendEmail = tool({
    name: "send_email",
  
    description:
      "Send an email containing AI news or other information to the user's email address.",
  
    parameters: z.object({
      subject: z.string(),
      body: z.string(),
    }),
  
    async execute({ subject, body }) {
      const { data, error } = await resend.emails.send({
        from: "AI Frontier <onboarding@resend.dev>",
        to: [process.env.MY_EMAIL],
        subject,
        html: body,
      });
  
      if (error) {
        throw new Error(error.message);
      }
  
      return `Email sent successfully. Email ID: ${data.id}`;
    },
  });

const agent = new Agent({
    name: "AI Frontier Agent",
  
    instructions: `
      You are an AI intelligence assistant for developers.
  
      When asked for the latest AI developments:
      1. Get relevant AI news using Khabri.
      2. Summarize the important developments.
      3. Explain why they matter to developers.
      4. If the user asks you to email the result, use send_email.
    `,
  
    tools: [latestAINews, sendEmail],
  });

// const result = await run(agent, "What is the capital of France?");
// console.log(result.finalOutput);

run(agent, "Find the latest important AI developments for developers and email me a useful summary.").then((result) => {
    console.log(result.finalOutput);
  });