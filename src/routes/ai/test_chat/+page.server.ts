import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { ChatAnthropic } from "@langchain/anthropic";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
  } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

const model = new ChatAnthropic({
    model: "claude-3-5-haiku-20241022",
    temperature: 0.7,
})

const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages)
    return { message: response }
}

const workflow = new StateGraph(MessagesAnnotation)
    .addNode('model', callModel)
    .addEdge(START, 'model')
    .addEdge('model', END)

    const config = { configurable: { thread_id: "test1" } };
    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });

export async function load() {
    const input = {
        role: "user",
        content: "今日は雨が降りました。私は折り畳み傘を持っていました。"
    }

    const output = await app.invoke({ messages: input }, config)
    const test_state = await memory.get(config)
    return { content: output.messages[output.messages.length - 1].content }
}