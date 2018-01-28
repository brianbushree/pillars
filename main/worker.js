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
			Project.buildProject(data.data, data.appPath, function(err, data) {
			    if (err) {
			      console.log(err);
			    }
			   	process.send({ type: 'proj_data', data: data });
			});
			break;

		/* request to build vis_data */
		case 'vis_data':
			process.send({ type: 'vis_data', data: visBuilder.buildVisData(data.project, data.root) });
			break;

		default:
			console.log('ERR: child bad event!');
	}


}