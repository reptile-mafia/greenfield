
exports.up = (knex, Promise)=> Promise.all([
	knex.schema.createTableIfNotExists('videos', table => {
    table.increments('id');
    table.string('url');
    table.integer('channel_id');
    table.string('video_title');
  }),
  
])

exports.down = (knex, Promise)=> Promise.all([
		knex.schema.dropTableIfExists('videos')
	])

  

