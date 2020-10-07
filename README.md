## Why?

This project was built to test the performance of Chromium-based browsers, including Chrome, Brave, Turbo, Edge and Opera, across a number of different real-world sites.

The aim was to see whether there was any noticeable performance advantages of using any particular browser on desktop, in combination with a number of different content-blocking extensions, including Adblock Plus.

The extension has a variety of settings, so you can monitor the performance of target applications with variations of bandwidth and latency, as well as the presence or absence of caching and service workers.

Key metrics and statistical analysis are included for each page and job. Results can be downloaded as CSV files. All page and job data is saved in your browser's local storage.

## How to use?

Copy the build folder to your local machine and load it unpacked from the Extensions management page in your browser.

The build folder contains the minified version of all the code in the src directory, plus the public directory.

## How to work on the project?

Fork or clone the repo and run NPM install to install all the relevant packages listed in the __package.json__. 

As the extension is built with React, you will need to run a build each time you make changes to folders in the src or public directories. To automate this process, you can install a VS code extension called [Run On Save](https://marketplace.visualstudio.com/items?itemName=pucelle.run-on-save), for which the settings are in __.vscode/settings.json__. 

To view changes, reload it unpacked from the Extensions management page in your browser.
