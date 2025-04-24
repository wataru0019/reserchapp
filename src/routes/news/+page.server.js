import { posts } from './data';

export function load() {
    return {
        posts: posts.map((post) => ({
            title: post.title,
            description: post.description
        }))
    }
}