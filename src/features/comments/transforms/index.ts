export const sanitizeDeletedComment = (comment: any) => {
  if (comment.deleted_at) {
    comment.content = '[DELETED]';
  }
  return comment;
};

// TODO types here
export const nestComments = (commentList: any) => {
  const commentMap: any = {};

  commentList.forEach((comment: any) => (commentMap[comment.id] = comment));

  commentList.forEach((comment: any) => {
    if (comment.parent_id !== null) {
      const parent = commentMap[comment.parent_id];
      (parent.child_comments = parent.child_comments || []).push(comment);
    }
  });

  return commentList.filter((comment: any) => comment.parent_id === null);
};
