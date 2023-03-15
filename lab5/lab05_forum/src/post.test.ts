import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

export function requestPostClear() {
  request('DELETE', SERVER_URL + '/clear', { qs: {} });
}

export function requestPostCreate(sender: string, title: string, content: string) {
  const res = request(
    'POST',
    SERVER_URL + '/post/create',
    {
      json: {
        sender,
        title,
        content
      }
    });
  return JSON.parse(res.getBody() as string);
}

describe('post/create test', () => {
  test('success for create one', () => {
    requestPostClear();
    expect(requestPostCreate('test', 'test', 'test')).toStrictEqual({ postId: expect.any(Number) });
  });
  test('success for create more', () => {
    requestPostClear();
    expect(requestPostCreate('test', 'test', 'test')).toStrictEqual({ postId: expect.any(Number) });
    expect(requestPostCreate('test1', 'test1', 'test1')).toStrictEqual({ postId: expect.any(Number) });
  });
  test('failure, empty sender', () => {
    expect(requestPostCreate('', 'test', 'test')).toStrictEqual({ error: expect.any(String) });
  });
  test('failure, empty title', () => {
    expect(requestPostCreate('test', '', 'test')).toStrictEqual({ error: expect.any(String) });
  });
  test('failure, empty content', () => {
    expect(requestPostCreate('test', 'test', '')).toStrictEqual({ error: expect.any(String) });
  });
});

export function requestPostComment(postId: number, sender: string, comment: string) {
  const res = request(
    'POST',
    SERVER_URL + '/post/comment',
    {
      json: {
        postId,
        sender,
        comment
      }
    });
  return JSON.parse(res.getBody() as string);
}

describe('post/comment test', () => {
  test('success', () => {
    requestPostClear();
    const postId = requestPostCreate('test', 'test', 'test').postId;
    expect(requestPostComment(postId, 'test1', 'test2')).toStrictEqual({ commentId: expect.any(Number) });
  });
  test('failure, empty sender', () => {
    requestPostClear();
    const postId = requestPostCreate('test', 'test', 'test').postId;
    expect(requestPostComment(postId, '', 'test')).toStrictEqual({ error: expect.any(String) });
  });
  test('failure, empty comment', () => {
    requestPostClear();
    const postId = requestPostCreate('test', 'test', 'test').postId;
    expect(requestPostComment(postId, 'test', '')).toStrictEqual({ error: expect.any(String) });
  });
  test('failure, invalid postId', () => {
    requestPostClear();
    expect(requestPostComment(-1, 'test', 'test')).toStrictEqual({ error: expect.any(String) });
  });
});

export function requestPostView(postId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/post/view',
    {
      qs: {
        postId
      }
    });
  return JSON.parse(res.getBody() as string);
}

describe('post/view test', () => {
  test('success for create one comment', () => {
    requestPostClear();
    const postId = requestPostCreate('test', 'test', 'test').postId;
    requestPostComment(postId, 'test1', 'test2');
    expect(requestPostView(postId)).toStrictEqual({ post: expect.any(Object) });
  });
  test('seccess for create more coment', () => {
    requestPostClear();
    const postId = requestPostCreate('test', 'test', 'test').postId;
    const postId1 = requestPostCreate('test1', 'test1', 'test1').postId;
    requestPostComment(postId, 'test1', 'test1');
    requestPostComment(postId, 'test2', 'test2');
    requestPostComment(postId, 'test3', 'test3');
    requestPostComment(postId1, 'test1', 'test1');
    requestPostComment(postId1, 'test2', 'test2');
    const post = requestPostView(postId).post;
    const post1 = requestPostView(postId1).post;
    expect(post.postId).toStrictEqual(expect.any(Number));
    expect(post1.postId).toStrictEqual(expect.any(Number));
    expect(post.comments.length).toBe(3);
    expect(post1.comments.length).toBe(2);
    expect(post.comments[0].comment).toBe('test3');
    expect(post.comments[1].comment).toBe('test2');
    expect(post.comments[2].comment).toBe('test1');
    expect(post1.comments[0].comment).toBe('test2');
    expect(post1.comments[1].comment).toBe('test1');
  });
  test('failure, invalid postId', () => {
    requestPostClear();
    expect(requestPostView(-1)).toStrictEqual({ error: expect.any(String) });
  });
});
