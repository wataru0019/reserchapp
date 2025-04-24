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

const checkpointer = PostgresSaver.fromConnString(
  "postgresql://myuser:Wa3129Postgre@localhost:5432/practice_db",
  {
    schema: "public" // デフォルトは "public"
  }
);

await checkpointer.setup();

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
    .addEdge("model", END);
  
  // Add memory
  const config = { configurable: { thread_id: uuidv4() } };
  const memory = new MemorySaver();
  const app = workflow.compile({ checkpointer: checkpointer });

export async function load() {
    const input = [
      {
        role: "user",
        content: "Who am I?",
      },
    ];
    try {
      const config2 = { configurable: { thread_id: "5db61154-245b-46bb-a02d-79d5ed8f2d8a" } }
      const output = await app.invoke({ messages: input }, config2);
      // The output contains all messages in the state.
      // This will log the last message in the conversation.
      const state = await checkpointer.get(config2)
      console.log(config.configurable.thread_id)
      const msgs = state?.channel_values.messages.map(msg => {
        return msg.content
      })
      console.log(msgs);

      return { content: output.messages[output.messages.length - 1].content }
    } catch {
      console.error()
      return { content: "error" }
    }
}