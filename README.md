## Why?

This project was built to test the performance of Chromium-based browsers, including Chrome, Brave, Turbo, Edge and Opera, across a number of different real-world sites.

The aim was to see whether there was any noticeable performance advantages of using any particular browser on desktop, in combination with a number of different content-blocking extensions, including Adblock Plus.

At some point the goal is to the produce relative performance stats for all the Chromium-based browsers and content-blocking extensions.

## How to use?

Copy the build folder to your local machine and load it unpacked from the Extensions management page in your browser.

The build folder contains the minified version of all the code in the src directory, plus the public directory.

## How to work on the project?

Fork or clone the repo and run NPM install to install all the relevant packages listed in the package.json. As the extension is built with React, you will need to run a build each time you make changes to folders in the src or public directories. To automate this process, you can install a VS code extension called [Run On Save](https://marketplace.visualstudio.com/items?itemName=pucelle.run-on-save), for which the settings are in __.vscode/settings.json__. Load it unpacked from the Extensions management page in your browser.
