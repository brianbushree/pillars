# pillars
Desktop app allowing users to visualize class structure and call hierarchy of Java projects.

![sample](https://github.com/brianbushree/pillars/blob/master/sample.png)

## Quickstart
1. `git clone git@github.com:brianbushree/pillars.git`
2. `cd pillars`
3. `npm install`
4. `npm start`
5. Enter configs:
	- **project name:** arbitrary project name (ex. 'test')
	- **class dir(s):** directory holding '.class' files (ex. '/tmp/asm-profiler/test/target/classes')
	- **source dir(s):** directory holding '.java' files (ex. '/tmp/asm-profiler/test/src')
	- **classpath:** any additional paths to add to the java CLASSPATH
	- **executable jar:** (ex. '/tmp/asm-profiler/test/target/test-0.1-SNAPSHOT.jar')
	- **root dir:** directory to run the program from (ex. '/tmp/asm-profiler/test/')
	- **runtime args:** runtime arguments
	- **packages:** java packages to track (ex. 'test')
6. Run program (type & press enter to write to STDIN)
7. Interact with visualization

## Resources
* [Electron](https://electron.atom.io/) - Desktop application framework (built on [Chromium](https://www.chromium.org/Home))
* [D3](https://d3js.org/) - SVG visualization library

## Purpose/Goal
* Allow developers to easily visualize small or large scale Java projects by looking at interaction between classes using method call-hierarchy.

## End-User Scenario
* Student wants see how their Java Classes interact to better understand OOP.
* In a large Java project settings, allow developers to more easily track down bugs and understand how a project is structured.

## [Project Wiki](https://github.com/brianbushree/pillars/wiki/pillars)
