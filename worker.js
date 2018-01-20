const { Project } = require('./Project.js');
const visBuilder = require('./vis-builder/Vis-Builder.js');

process.on('message', function(data) {
	exec(data);
});

function exec(data) {

	switch(data.type) {
		case 'proj_data':    /* request to load project */
			Project.buildProject(data.data, data.appPath, function(err, data) {
			    if (err) {
			      console.log(err);
			    }
			   	process.send({ type: 'proj_data', data: data });
			});
			break;

		case 'vis_data':    /* request to load vis_data */
			process.send({ type: 'vis_data', data: visBuilder.buildVisData(data.project, data.root) });
			break;

		default:
			console.log('ERR: child bad event!');
	}


}