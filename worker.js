const projectMaker = require('./ProjectMaker.js');
const visBuilder = require('./vis-builder/Vis-Builder.js');

process.on('message', function(data) {
	exec(data);
});

function exec(data) {

	switch(data.type) {
		case 'proj_data':    /* request to load project */
			projectMaker.loadProject(data.data, data.appPath, function(err, project) {
			    if (err) {
			      console.log(err);
			    }
			   	process.send({ type: 'proj_data', data: project });
			});
			break;

		case 'vis_data':    /* request to load vis_data */
			process.send({ type: 'vis_data', data: visBuilder.buildVisData(data.project, data.root) });
			break;

		default:
			console.log('ERR: child bad event!');
	}


}