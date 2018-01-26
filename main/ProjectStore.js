const fs = require('fs');
const path = require('path');

class ProjectStore {
	
	constructor(storage_dir) {
		this.store = storage_dir;
	}

	storeSync(project) {
		fs.writeFileSync(this.store + '/' + project.name + '.project', JSON.stringify(project));
	}

	deleteSync(name) {
		fs.unlinkSync(this.store + '/' + name + '.project');
	}

	getAllNames(callback) {
		let names = [];
		let full_path;

		fs.readdir(this.store, function(err, files) {

			if (err) return callback(err);

			files.forEach(function(file) {

				full_path = path.join(this.store, file);

				if (!fs.lstatSync(full_path).isDirectory() && path.extname(full_path).toLowerCase() === '.project') {

					names.push(path.basename(full_path, '.project'));

				}

			}.bind(this));

			callback(null, names);
		}.bind(this));
	}

	getProject(name, callback) {
		
		let project = null;
		let full_path;

		fs.readdir(this.store, function(err, files) {

			if (err) return callback(err, null);

			files.forEach(function(file) {

				full_path = path.join(this.store, file);

				if (!fs.lstatSync(full_path).isDirectory() && path.extname(full_path).toLowerCase() === '.project' && path.basename(full_path, '.project') == name) {

					project = JSON.parse(fs.readFileSync(full_path, 'utf8'));
					return;

				}

			}.bind(this));

			callback(null, project);

		}.bind(this));

	}


}

exports.ProjectStore = ProjectStore;