
exports.up =(knex, Promise)=> Promise.all ([
	knex.schema.dropTableIfExists('videos')

	])
	

exports.down = function(knex, Promise) {
  
};
