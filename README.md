# pillars
App used to visualize call hierarchy structure of java projects, built on Electron.

## Plan of Execution
1. Take in user input, a directory with .java files.
2. For each .java file, run 'javap -l', parse the output, store the methods' attributes and line number range.
3. Display methods for interaction.
4. Once a method is selected, visualize Call Heirarchy of a selected method using [call-hierarchy-printer](https://github.com/pbadenski/call-hierarchy-printer).
