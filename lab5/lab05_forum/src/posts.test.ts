import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

import { requestPostClear, requestPostCreate, requestPostComment } from './post.test';

function requestPostsList() {
  const res = request(
    'GET',
    SERVER_URL + '/posts/list',
    {
      qs: {}
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('posts/list test', () => {
  test('success', () => {
    requestPostClear();
    const postId = requestPostCreate('test', 'test', 'test').postId;
    const postId1 = requestPostCreate('test1', 'test1', 'test1').postId;
    const postId2 = requestPostCreate('test2', 'test2', 'test2').postId;
    requestPostComment(postId, 'test1', '1');
    requestPostComment(postId, 'test1', '2');
    requestPostComment(postId1, 'test1', '1');
    requestPostComment(postId1, 'test1', '2');
    requestPostComment(postId2, 'test2', '1');
    requestPostComment(postId2, 'test2', '2');
    const posts = requestPostsList();
    expect(posts.posts.length).toBe(3);
    expect(posts.posts[0].postId).toStrictEqual(2);
    expect(posts.posts[1].postId).toStrictEqual(1);
    expect(posts.posts[2].postId).toStrictEqual(0);
  });
});
