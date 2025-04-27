import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatAnthropic } from "@langchain/anthropic";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
  } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { DynamicTool } from "@langchain/core/tools";

const calculatorTool = new DynamicTool({
  name: "calculator",
  description: "Add two numbers together",
  func: async (input: string) => {
    const [num1, num2] = JSON.parse(input);
    return JSON.stringify({ num: num1 + num2 });
  },
});

const agentTool = [new TavilySearchResults({maxResults: 3}), calculatorTool]

const toolNode = new ToolNode(agentTool)
const model = new ChatAnthropic({
    model: "claude-3-5-haiku-20241022",
    temperature: 0.7,
}).bindTools(agentTool)

const checkpointer = PostgresSaver.fromConnString(
  "postgresql://myuser:Wa3129Postgre@localhost:5432/practice_db",
  {
    schema: "public" // デフォルトは "public"
  }
);

await checkpointer.setup();

function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}

// モデルを呼び出す関数を定義
// この関数は会話の状態(state)を受け取り、AIモデルに質問して返答を得る
const callModel = async (state: typeof MessagesAnnotation.State) => {
    // モデルにメッセージを送信して応答を待つ
    // state.messagesには会話履歴が含まれている
    const response = await model.invoke(state.messages);
    // 応答をメッセージ形式で返す
    return { messages: response };
  };
  
  // Define a new graph
  const workflow = new StateGraph(MessagesAnnotation)
    // Define the node and edge
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addNode("tools", toolNode)
    .addEdge("tools", "model")
    .addConditionalEdges("model", shouldContinue);
  
  // Add memory
  const app = workflow.compile({ checkpointer: checkpointer });

interface HumanChat {
    role: string,
    content: string
}

interface ThreadId {
    thread_id: string
}

export async function graphAi(humanChat: HumanChat, threadId: ThreadId | { thread_id: "" }) {
    const input = [
      {
        role: humanChat.role,
        content: humanChat.content,
      },
    ];
    console.log(`input: ${input}`)
    console.log(`threadId: ${threadId}`)
    try {
      const config = { configurable: { thread_id: threadId.thread_id === "" ? uuidv4() : threadId.thread_id } }
      const output = await app.invoke({ messages: input }, config);
      // The output contains all messages in the state.
      // This will log the last message in the conversation.
    //   const state = await checkpointer.get(config)
    //   console.log(config.configurable.thread_id)
    //   const msgs = state?.channel_values.messages.map(msg => {
    //     return msg.content
    //   })
    //   console.log(msgs);

      return { 
        content: output.messages[output.messages.length - 1].content,
        isAI: true
    }
    } catch {
      console.error()
      return { content: "error" }
    }
}