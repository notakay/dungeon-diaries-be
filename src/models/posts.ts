import knex from '../../knex/knex';

export default class Posts {
  get(postId: string | number, userId: string | number) {
    return selectPosts(userId).where('posts.id', postId).first();
  }

  // cursor based pagination
  // https://stackoverflow.com/questions/18314687/how-to-implement-cursors-for-pagination-in-an-api
  list(offset: number, pageSize: number, userId: string | number) {
    return selectPosts(userId)
      .orderBy('posts.created_at', 'desc')
      .offset(offset * pageSize)
      .limit(pageSize);
  }
}

// selects posts and author's information
// TODO: voteSubquery feels awkward here
const selectPosts = (userId: string | number) =>
  knex('posts')
    .join('users', 'users.id', 'posts.user_id')
    .select(
      'posts.*',
      'posts.user_id as author_id',
      'users.username as author',
      'users.profile_image as author_profile_image',
      commentsCountSubquery,
      voteSubquery(userId)
    );

const commentsCountSubquery = knex('comments')
  .count()
  .where('comments.post_id', knex.raw('??', 'posts.id'))
  .as('comment_count');

// Note on COALESCE(MAX(...), 0) https://stackoverflow.com/a/33849902
const voteSubquery = (userId: string | number) =>
  knex('post_votes')
    .select(knex.raw(`COALESCE(MAX(vote), 0)`))
    .where({
      'post_votes.post_id': knex.raw('??', 'posts.id'),
      'post_votes.user_id': knex.raw('??', userId)
    })
    .as('user_vote');
