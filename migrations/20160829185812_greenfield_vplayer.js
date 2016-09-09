
exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTableIfNotExists('channels', table => {
    table.increments('id');
    table.string('name');
    table.string('background');
  }),
  knex.schema.createTableIfNotExists('users', table => {
    table.increments('id');
    table.string('username');
    table.string('password');
  }),
  knex.schema.createTableIfNotExists('videos', table => {
    table.increments('id');
    table.string('url');
    table.integer('channel_id');
  }),
  knex.schema.createTableIfNotExists('likes', table => {
    table.increments('id');
    table.integer('start_time');
    table.integer('stop_time');
    table.integer('video_id');
    table.integer('channel_id');
  }),
  knex.schema.createTableIfNotExists('likes_by_user', table => {
    table.integer('user_id');
    table.integer('likes_id');
  }),
  knex.schema.createTableIfNotExists('ignores', table => {
    table.integer('user_id');
    table.integer('video_id');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('ignores'),
  knex.schema.dropTableIfExists('likes_by_user'),
  knex.schema.dropTableIfExists('likes'),
  knex.schema.dropTableIfExists('videos'),
  knex.schema.dropTableIfExists('users'),
  knex.schema.dropTableIfExists('channels'),
]);
