import omit from 'lodash/omit';

export const sanitizeUser = (user: any) => omit(user, ['password_hash']);
