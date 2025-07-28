import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { config } from "dotenv";
config();

const weatherTool = tool(
    async ({ query }) => {
        console.log("query", query);
        return "The weather in lucknow is sunny";
    },
    {
        name: "weather",
        description: "Get the weather in the given location",
        schema: z.object({
            query: z.string().describe("the query use in search"),
        }),
    }
);




const jsExecutor  = tool(async ({code})=>{
    const response =await fetch(process.env.EXECUTOR_URL || "http://localhost:3002",{
        method:"POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({code}),
    })
    return await response.json();
},{
    name:"run_javscript_code_tool",
    description:`
    Run general purpose javascript code. 
    This can be used to access Internet or do any computation that you need. 
    The output will be composed of the stdout and stderr. 
    The code should be written in a way that it can be executed with javascript eval in node environment.
    `,
    schema: z.object({
        code: z.string().describe("the code to be run"),
    })
})

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey:"AIzaSyAxj4SnZ28A1d0lQkj1c3wvoYAv-CQMUJA",
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
    llm: model,
    tools: [weatherTool,jsExecutor],
    checkpointSaver,
});

