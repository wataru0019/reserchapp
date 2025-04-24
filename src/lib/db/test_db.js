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

async function queryDatabase() {
  try {
    // クエリの実行
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
    console.log(result.rows[0]); // 最初の結果行
  } catch (err) {
    console.error('データベースエラー:', err);
  } finally {
    // 必要に応じてプールを終了
    await pool.end();
  }
}

queryDatabase();