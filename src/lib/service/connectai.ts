import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { ChatAnthropic } from "@langchain/anthropic";
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

const model = new ChatAnthropic({
    model: "claude-3-5-haiku-20241022",
    temperature: 0.7,
})

interface Message{
    content: string,
    isAI: boolean
}

async function postChat() {
    try {
        const query = `
        INSERT INTO ai_chat_sessions (
            user_id, 
            title, 
            chat_history
        ) 
        VALUES ($1, $2, $3) 
        RETURNING *`

        const values = [
            1,
            "test",
            JSON.stringify([]) // 空の会話履歴で初期化
          ];
    
        const result = await pool.query(query, values);
        // JSONBフィールドをパース
        const session = result.rows[0];
        session.chat_history = JSON.parse(session.chat_history);
      
        return session;
    } catch (error) {
        console.error('Error creating chat session:', error);
        throw new Error('チャットセッションの作成に失敗しました');
    }
}

export async function chatAi(query: any) {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "ユーザーからの入力に応じて適切な値を返答してください"],
        ["user", "{query}"]
    ])
    const chain = prompt.pipe(model).pipe(new StringOutputParser())
    const result = await chain.invoke({query: query})
    return {
        content: result,
        isAI: true
    }
}
