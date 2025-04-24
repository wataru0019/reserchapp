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

async function getThread() {
    try {
        const query = `
        SELECT DISTINCT ON (thread_id)* FROM public.checkpoints;`
        const result = await pool.query(query);
        const threads = result.rows.map(row => row.thread_id)
        return threads
    } catch (error) {
        console.error('Error getting threads:', error);
        throw new Error('チャットセッションの取得に失敗しました');
    }
}

export async function load() {
    const data = await getThread()
    return { threads: data }
}