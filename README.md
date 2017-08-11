# pillars
Desktop app allowing users to visualize class structure and call hierarchy of Java projects.

## Resources
* [Electron](https://electron.atom.io/) - Desktop application framework (built on [Chromium](https://www.chromium.org/Home))
* [call-hierarchy-printer](https://github.com/pbadenski/call-hierarchy-printer) - print a method's callees
* [React.js](https://facebook.github.io/react/) - DOM render library
* [D3](https://d3js.org/) - SVG visualization library

## Purpose/Goal
* Allow developers to easily visualize small or large scale Java projects by looking at interaction between classes using method call-hierarchy.

## End-User Scenario
* Student wants see how their Java Classes interact to better understand OOP.
* In a large Java project settings, allow developers to more easily track down bugs and understand how a project is structured.

## Functionality
1. Take in user input, in the form of a directory of .java files (default package), maven project, or gradle project.
2. Display classes/methods structure for user interaction.
4. Once a method is selected, visualize Call Heirarchy of a selected method using D3 interface.
5. Allow user to click on a method's callees to change the root of the heirarchy visualization and explore subsections of the project.

## Steps of Execution
| Step | Weeks | Task                                                                                                         |
|-----:|-------|--------------------------------------------------------------------------------------------------------------|
|    1 |  1-2  | Given a directory of Java '.class' files, execute and parse javap output into Class objects holding Methods. |
|    2 |  2-4  | For each Class object, for each method, run call-hierarchy-printer and parse/store each method's callees.    |
|    3 |  2-5  | Using the Class objects, convert to usable hierarchy dataset and create an interactive D3 visualization.     |
|    4 |  2-4  | Integrate everything above with a simple, error handling GUI.                                                |
|    5 |  1-2  | Add finishing touches on functionality and clean up GUI aesthetics.                                          |