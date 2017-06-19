# pillars
App used to visualize class structure of Java projects, built on Electron.

## Purpose/Goal
* Allow developers to easily visualize small or large scale Java projects by looking at interaction between classes using method call-hierarchy. 

## End-User Scenario
1. Take in user input, a directory with .java files.
2. For each .java file, run 'javap -p', parse the output, store the methods' attributes.
3. Display classes/methods structure for user interaction.
4. Once a method is selected, visualize Call Heirarchy of a selected method using [call-hierarchy-printer](https://github.com/pbadenski/call-hierarchy-printer) and D3.

## Plan of Execution
1. Open directory of .java/.class files.
2. Run 'javap -p' on each class file. Parse the output into array of class objects with array of methods.
3. For each class, for each method, run call-hierarchy-printer to see its callees. Store a list of callees in each method.
4. Use class/method data to run an interactive D3 hierarchy visualization.