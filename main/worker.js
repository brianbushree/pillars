/**
 *
 *  worker.js
 *
 *     In order to take load off main thread,
 *      use this seperate thread to perform tasks.
 */
const { Project } = require('./Project.js');
const visBuilder = require('./vis-builder/Vis-Builder.js');

process.on('message', exec);

function exec(data) {

	switch(data.type) {

		/* request to build project */
		case 'proj_data':
			Project.buildProject(data.proj, data.appPath, function(err) {
			    if (err) {
			      console.log(err);
			    }

			   	process.send({ type: 'proj_data', proj: data.proj });
			});
			break;

		default:
			console.log('ERR: child bad event!');
	}


}