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
1. Take in user input, in the form of a directory of .java files (default package), maven project, or gradle project.
2. For each .java file, run 'javap -p', parse the output, store the methods' attributes.
3. Display classes/methods structure for user interaction.
4. Once a method is selected, visualize Call Heirarchy of a selected method using [call-hierarchy-printer](https://github.com/pbadenski/call-hierarchy-printer) and D3.

## Steps of Execution
1. Open directory of .java/.class files.
2. Run 'javap -p' on each class file. Parse the output into array of 'Class' objects with array of methods.
3. For each class, for each method, run call-hierarchy-printer to see its callees. Store a list of callees in each method.
4. Use class/method data to run an interactive D3 hierarchy visualization.
