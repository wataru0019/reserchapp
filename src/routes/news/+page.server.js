import { posts } from './data';

export function load() {
    return {
        posts: posts.map((post) => ({
            title: post.title,
            link: post.link,
            description: post.description
        }))
    }
}