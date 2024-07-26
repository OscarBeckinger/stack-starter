#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const supportedTemplates = ['react-firebase', ''];

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

    // check if the we have the template the user inputted
    if (!supportedTemplates.includes(template)) {
      if (template.length === 0) {
        console.error(`Please provide a template. Supported templates are: ${supportedTemplates.join(', ')}`);
        process.exit(1);
      }
      console.error(`Invalid template: ${template}. Supported templates are: ${supportedTemplates.join(', ')}`);
      process.exit(1);
    }

    // path for project dir
    const projectPath = path.resolve(process.cwd(), projectName);
    //client path
    const clientPath = path.join(projectPath, 'client');

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

    // create client dir using Vite
    process.chdir(projectPath); //make sure in correct dir


    let npmArgs;
    switch (template) {
      case 'react-firebase':
        //npm 7+ needs double dash, add check for this later
        //yarn, pnpm, bun, npm <7: ['create', 'vite@latest', 'client', '--template', 'react'];
        npmArgs = ['create', 'vite@latest', 'client', '--', '--template', 'react'];
        break;
      default:
        console.error(`No handler for template: ${template}`);
        process.exit(1);
    }

    console.log(`Setting up ${template} client using Vite`);

    //later, add option for other package managers like yarn, pnpm, bun (only npm 7+ needs double dash)
    const npmProcess = spawn('npm', npmArgs, { stdio: 'inherit' }); 

    npmProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`NPM process exited with code ${code}`);
        process.exit(code);
      } else {
        console.log('cd into client...');
        process.chdir(clientPath)
        console.log('installing packages...')
        const install = spawn('npm', ['install'], { stdio: 'inherit' });
        install.on('close', (installCode) => {
          if (installCode !== 0) {
            console.error(`NPM install process exited with code ${installCode}`);
            process.exit(installCode);
          } else {
            console.log('Packages installed successfully.');
            console.log('Finished! Run:')
            console.log(`cd ${projectName}/client/`)
            console.log('npm run dev')
          }
        });
        
      }
    });
    
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
