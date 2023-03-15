export const data = {
  posts: []
};

export function createPostId(sender: string, title: string, content: string) {
  // if sender is empty, return error: empty string
  if (sender === '') {
    return { error: 'sender is empty string' };
  }
  // if title is empty, return error: empty string
  if (title === '') {
    return { error: 'title is empty string' };
  }
  // if content is empty, return error: empty string
  if (content === '') {
    return { error: 'content is empty string' };
  }
  // else return postId
  const postId = data.posts.length;
  // post containing keys {postId, sender, title, timeSent, content, comments}
  data.posts.push({ postId: postId, sender: sender, title: title, timeSent: new Date(), content: content, comments: [] });
  return { postId: postId };
}

export function addComment(postId: number, sender: string, comment: string) {
  // if postId is not valid, return error: invalid postId
  if (postId < 0 || postId >= data.posts.length) {
    return { error: 'invalid postId' };
  }
  // if sender is empty, return error: empty string
  if (sender === '') {
    return { error: 'sender is empty string' };
  }
  // if comment is empty, return error: empty string
  if (comment === '') {
    return { error: 'comment is empty string' };
  }
  // push commentId, sender, comment to data.posts[i].comments
  const commentId = data.posts.find(post => post.postId === postId).comments.length;
  data.posts.find(post => post.postId === postId).comments.push({ commentId: commentId, sender: sender, comment: comment });
  return { commentId: commentId };
}

export function viewPost(postId: number) {
  if (postId < 0 || postId >= data.posts.length) {
    return { error: 'invalid postId' };
  }
  const d = data.posts.find(post => post.postId === postId);
  return {
    post: {
      postId: d.postId,
      sender: d.sender,
      title: d.title,
      timeSent: d.timeSent,
      content: d.content,
      comments: d.comments.reverse()
    }
  };
}

export function clearPosts() {
  data.posts = [];
}
