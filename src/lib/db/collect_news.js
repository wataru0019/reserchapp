import pkg from 'pg';
const { Pool } = pkg;
import * as cheerio from 'cheerio';
import axios from 'axios';

const pool = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'practice_db',
    password: 'Wa3129Postgre',
    port: 5432,
});

// テーブル作成のSQL
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        provider VARCHAR(255),
        category VARCHAR(100)
    );
`;

const newsData = [{}]

async function getNews() {
    const url = "https://www.anthropic.com/news"
    const baseUrl = "https://www.anthropic.com"
    try {
        // ウェブページを取得
        const response = await axios.get(url);
        const html = response.data;
        
        // Cheerioで解析
        const $ = cheerio.load(html);
        const elements = $('.PostCard_post-card__z_Sqq').toArray();
        let processedCount = 0;
        // newsテーブルが存在しない場合はcreateTableQueryを使ってテーブルを作成
        try {
            await pool.query(createTableQuery);
        } catch (createTableError) {
            console.error('テーブル作成エラー:', createTableError);
            return; // テーブル作成に失敗したら処理を中断
        }

        for (const el of elements) {
            if (processedCount >= 15) break;
            const news = $(el);
            const title = news.find('.PostCard_post-heading__Ob1pu').text().trim();
            const date = news.find('.PostList_post-date__djrOA').text().trim();
            const contentUrl = baseUrl + $(el).attr('href');

            // まずcontentUrlが既にテーブルに存在するかチェック
            const checkQuery = `SELECT id FROM news WHERE url = $1 LIMIT 1;`;
            let exists = false;
            try {
                const checkResult = await pool.query(checkQuery, [contentUrl]);
                if (checkResult.rows.length > 0) {
                    exists = true;
                }
            } catch (checkError) {
                console.error('データベース存在チェックエラー:', checkError);
                continue; // チェックでエラーが出たらスキップ
            }

            if (!exists) {
                const content = await getContent(contentUrl);
                // データベースに挿入
                const insertQuery = `
                    INSERT INTO news (title, url, description)
                    VALUES ($1, $2, $3)
                    RETURNING id;
                `;
                try {
                    const result = await pool.query(insertQuery, [title, contentUrl, content]);
                    console.log(`Inserted news with ID: ${result.rows[0]?.id}`);
                } catch (dbError) {
                    console.error('データベース挿入エラー:', dbError);
                }
            } else {
                console.log(`URL already exists, skipping: ${contentUrl}`);
            }
            processedCount++;
        }
      } catch (error) {
        console.error('エラー:', error);
      }
}

async function getContent(contentUrl) {
    const url = contentUrl
    try {
        // ウェブページを取得
        const response = await axios.get(url);
        const html = response.data;
        
        // Cheerioで解析
        const $ = cheerio.load(html);
        const content = $(".Body_body__XEXq7").text().trim()
        return content
    } catch {

    }
}

async function readNews() {
    try {
        const query = `
        SELECT title, url, description FROM news;`
        const result = await pool.query(query);
        console.log(result.rows)
        return result
    } catch (error) {
        console.error('Error getting threads:', error);
        throw new Error('チャットセッションの取得に失敗しました');
    }
}

readNews()