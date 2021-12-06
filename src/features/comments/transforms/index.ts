export const sanitizeDeletedComment = (comment: any) => {
  if (comment.deleted_at) {
    comment.content = '[DELETED]';
  }
  return comment;
};
