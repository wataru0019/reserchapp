import { graphAi } from "$lib/service/with_langgraph";
import { chatAi } from "$lib/service/connectai";
import { json } from "@sveltejs/kit";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import pkg from 'pg';
const { Pool } = pkg;

// データベース接続設定
const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'practice_db',
  password: 'Wa3129Postgre',
  port: 5432,
});

const checkpointer = PostgresSaver.fromConnString(
    "postgresql://myuser:Wa3129Postgre@localhost:5432/practice_db",
    {
      schema: "public" // デフォルトは "public"
    }
  );

export async function POST({ request }) {
    const data = await request.json();
    const humanChat = {
        role: "user",
        content: data.query
    }
    const threadId = data.thread_id
    console.log(humanChat)
    const result = await graphAi(humanChat, { thread_id: threadId })
    // const result = await chatAi(data)
    console.log(result)
    return json({
        success: true,
        message: `処理が完了しました`,
        data: {
            content: result.content,
            isAI: result.isAI
        }
    })
}

export async function GET({ request }) {
    const url = new URL(request.url);
    const thread_id = url.searchParams.get('thread_id');
    const data = { thread_id };
    const config = { configurable: { thread_id: data.thread_id }}
    try {
        const state = await checkpointer.get(config)
        const msgs = state?.channel_values.messages
            .filter(msg => msg.tool_call_id === undefined && !(Array.isArray(msg.content)))
            .map(msg => ({
                content: msg.content,
                isAI: !(Object.keys(msg.response_metadata).length === 0 && msg.tool_call_id === undefined)
            }));
        return json({messages: msgs})
        // const msgs = state?.channel_values.messages.map(msg => {
        //     // console.log(Object.keys(msg.response_metadata).length === 0 && msg.tool_call_id === undefined)
        //     // console.log(msg.tool_call_id !== undefined)
        //     console.log(Array.isArray(msg.content))
        //     // console.log(msg)
        //     if (Object.keys(msg.response_metadata).length === 0 && msg.tool_call_id === undefined) {
        //         return {
        //             content: msg.content,
        //             isAI: false
        //         }
        //     } else {
        //         return {
        //             content: msg.content,
        //             isAI: true
        //         }
        //     }
        // })
        // return json({messages: msgs})
    } catch (error) {
        console.error('Error getting threads:', error);
        throw new Error('チャットセッションの取得に失敗しました');
    }
}
