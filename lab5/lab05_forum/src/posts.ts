import { data } from './post';

export function postsList() {
  const posts = data.posts;
  return { posts: posts.reverse() };
}
