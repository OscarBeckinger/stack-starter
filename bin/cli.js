#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

//cli version/desc
program
  .version('1.0.0')
  .description('A tool to speed up the setup of full-stack projects');

// create command
program
  .command('create')
  .description('Create a new project')
  .option('-n, --name <project-name>', 'Specify the project name', 'new-project')      //program.option(flags, description, defaultValue);
  .option('-t, --template <template-name>', 'Specify the template to use', 'default')  
  .action((options) => {
    // get options passed by user
    const projectName = options.name;
    const template = options.template;

    // path for project dir
    const projectPath = path.resolve(process.cwd(), projectName);

    // create project dir
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      console.log(`Created project directory: ${projectName}, located at: ${projectPath}`);
    } else {
      console.error(`Directory ${projectName} already exists.`);
      process.exit(1);
    }

    // create server dir
    const serverPath = path.join(projectPath, 'server');
    if (!fs.existsSync(serverPath)) {
      fs.mkdirSync(serverPath);
      console.log(`Created server directory at: ${serverPath}`);
    }

    console.log(`Project setup complete with template: ${template}`);
  });

// handling unrecognized commands
program
  .on('command:*', () => {
    console.error('Invalid command. Use --help to see available commands.');
    process.exit(1);
  });

// parse the command-line arguments
program.parse(process.argv);

// show help info if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
