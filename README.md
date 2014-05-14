# shady-template

Template for experiments executed by the Shady replication system.

## Directory Structure

The directory structure for the template is as follows:
```
/
|
+-- css
|
+-- lib
|
+-- src
|
+-- shaders
```
The root directory contains ```README```, ```LICENSE``` and ```index.html```.
The latter is a driver program for testing the experiment before submitting to Shady.
The ```css``` directory contains style sheets for this driver program.
The ```lib``` directory contains JavaScript libraries used by the termplate.
The ```src``` directory contains the JavaScript that is part of the template.
Additional source files should be put here.
The ```shaders``` directory contains a passthrough vertex shader and a passthrough fragment shader.
Additional shaders should be put here.

## Development

Developing experiments for Shady is supposed to be as easy as possible.
To this end, this template will work out of the box for developing experiments and won't require any modification for use with Shady.
The sections below specify how to perform some common tasks.

### Program entry.

Program entry is in the ```main()``` function in ```src/main.js```.
Extend this function to implement your experiment.

### Update loop.

The template sets up an update loop that will be called every 16 milliseconds (for a 60 Hz frame rate).
You can extend ```update()``` to add any animation in here.
The update function also calls the ```display()``` function.

### Display function.

Display code should go in here.

### Keyboard event.

The template sets up a keyboard callback, implemented in the ```keyboard()``` function.
This function receives an event object named ```ev```.

### Reshape event.

The template sets up a reshape callback in the ```reshape()``` function.
It contains code to resize the canvas and correct the viewport.
Additional corrections must be added by the user.

### Logging

The template sets up a global logger (called ```logger```).
The logger has several methods, such as ```trace()```, ```info()```, ```warn()``` and ```error()```.
All of these methods take a single string as argument.
Use them to log messages of the corresponding severity to the console.

### Including

Include other js files by calling ```include(path)``` where ```path``` is relative to the root of the repository.
This simply loads the file and evaluates it.
This potentially pollutes the global context.
If you care about this, use a namespace in your included files, or use something like require.js.

## Libraries

### gl-matrix.js

This is included by default to help with linear algebra operations that might be needed.

### log4js.js

This is included by the framework to serve as an out of the box logging framework.
