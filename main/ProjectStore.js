/**
 * 
 * ProjectStore.js
 *
 *  Directory used to persistenly store Projects
 *   as '.project' files.
 *
 *  This will persistently store only the user input,
 *   not class/exec/vis data.
 */
const fs = require('fs');
const path = require('path');

exports.ProjectStore = class ProjectStore {
	
	/**
	 * Create a store out of an existing directory.
	 *
	 * @param {string} storage_dir  existing directory to use
	 */
	constructor(storage_dir) {
		this.store = storage_dir;
	}

	/**
	 * Save a project to the store.
	 *
	 * @param {Object} project  project to store
	 */
	storeSync(project) {
		let path = this.store + '/' + project.name + '.project';
		this._ensureDirectoryExists(path)
		fs.writeFileSync(path, JSON.stringify(project));
	}

	/**
	 * Given its name, delete a saved project.
	 *
	 * @param {string} name  project name to delete
	 */
	deleteSync(name) {
		fs.unlinkSync(this.store + '/' + name + '.project');
	}

	/**
	 * Return the names of the projects in the store.
	 *
	 * @param {Function} callback(err, names)
	 */
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

	/**
	 * Given the name of an existing project,
	 *  return the project.
	 *
	 * @param {Function} callback(err, project)
	 */
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

	_ensureDirectoryExists(filePath) {
		var dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			this._ensureDirectoryExists(dir);
			fs.mkdirSync(dir);
		}
	}

}