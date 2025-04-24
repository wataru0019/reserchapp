import { graphAi } from "$lib/service/with_langgraph";
import { chatAi } from "$lib/service/connectai";
import { json } from "@sveltejs/kit";

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
