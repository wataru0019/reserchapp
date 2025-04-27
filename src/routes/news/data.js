import { deserialize } from '$app/forms';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'practice_db',
    password: 'Wa3129Postgre',
    port: 5432,
  });

  async function getNews() {
    try {
        const query = `
        SELECT * FROM news;`
        const result = await pool.query(query);
        const posts = result.rows.map(post => {
            return {
                title: post.title,
                link: post.url,
                description: post.description
            }
        })
        return posts
    } catch (error) {
        console.error('Error getting threads:', error);
        throw new Error('チャットセッションの取得に失敗しました');
    }
}

export const posts = await getNews()