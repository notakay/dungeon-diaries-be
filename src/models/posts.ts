import knex from '../../knex/knex';

export default class Posts {
  get(postId: string | number, userId: string | number) {
    return knex('posts')
      .join('users', 'users.id', 'posts.user_id')
      .select(
        'users.username as author',
        'users.profile_image as author_profile_image',
        'posts.user_id as author_id',
        'posts.*',
        commentsCountSubquery,
        voteSubquery(userId)
      )
      .where('posts.id', postId)
      .first();
  }
}

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
