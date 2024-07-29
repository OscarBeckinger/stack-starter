#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

//currently supported templates
const supportedTemplates = ['react-firebase', ''];

//--------Helper Functions Start-----------\\

//helper function for setting up client side w/ vite (or others)
//async because spawn/npm commands ran are async and we want to make sure the client dir is create before moving on
async function setupClientVite(npmArgs, clientPath, projectName) {
  console.log(`Setting up client with args: ${npmArgs.join(' ')}`);
  
  // create a promise for the npm process
  await new Promise((resolve, reject) => {
    const npmProcess = spawn('npm', npmArgs, { stdio: 'inherit' });

    npmProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`NPM process exited with code ${code}`);
        reject(new Error(`NPM process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });

  console.log('cd into client...');
  process.chdir(clientPath);
  console.log('installing packages...');

  // create a promise for the npm install process
  await new Promise((resolve, reject) => {
    const install = spawn('npm', ['install'], { stdio: 'inherit' });
    install.on('close', (installCode) => {
      if (installCode !== 0) {
        console.error(`NPM install process exited with code ${installCode}`);
        reject(new Error(`NPM install process exited with code ${installCode}`));
      } else {
        console.log('Packages installed successfully.');
        resolve();
      }
    });
  });
}

async function installFirebase(clientPath) {

  // change dir to the clientPath
  process.chdir(clientPath);

  // create a promise for the Firebase install process
  await new Promise((resolve, reject) => {
    const firebaseInstallProcess = spawn('npm', ['install', 'firebase'], { stdio: 'inherit' });
    firebaseInstallProcess.on('close', (installCode) => {
      if (installCode !== 0) {
        console.error(`Firebase NPM install process exited with code ${installCode}`);
        reject(new Error(`Firebase NPM install process exited with code ${installCode}`));
      } else {
        console.log('Firebase installed successfully.');
        resolve();
      }
    });
  });
}

//function to update vite config file so browser launches when running npm run dev
async function updateViteConfig(clientPath) {
  const viteConfigPath = path.join(clientPath, 'vite.config.js');

  // check if the vite.config.js file exists
  if (!fs.existsSync(viteConfigPath)) {
    console.error(`vite.config.js not found at ${viteConfigPath}`);
    return;
  }

  // read the existing file contents
  const fileContent = fs.readFileSync(viteConfigPath, 'utf8');

  // stuff to be added (so browsers launches when running npm run dev)
  const updatedConfig = `
  server: {
    open: true,
  },
  `;

  // check if the file already contains the desired configuration
  if (fileContent.includes('server: {')) {
    console.log('vite.config.js is already updated.');
    return;
  }

  // modify the file content
  const updatedFileContent = fileContent.replace(
    /(\s*export\s+default\s+defineConfig\(\{)/,
    `$1\n${updatedConfig}`
  );

  // write the updated content back to the file
  fs.writeFileSync(viteConfigPath, updatedFileContent, 'utf8');
  console.log('vite.config.js updated successfully.');
}

//function to add config folder to gitignore so no api keys get pushed to github by accident
async function updateGitIgnore(clientPath) {
  const gitIgnorePath = path.join(clientPath, '.gitignore');

  // check if the vite.config.js file exists
  if (!fs.existsSync(gitIgnorePath)) {
    console.error(`.gitignore not found at ${gitIgnorePath}`);
    return;
  }

  // read the existing file contents
  const fileContent = fs.readFileSync(gitIgnorePath, 'utf8');

  // check if the file already contains the desired configuration
  if (fileContent.includes('/config')) {
    console.log('.gitignore is already updated.');
    return;
  }

  // modify the file content (adding lines to gitignore config stuff)
  const updatedFileContent = fileContent + '\n\n#Configuration\n/config\n';

  // write the updated content back to the file
  fs.writeFileSync(gitIgnorePath, updatedFileContent, 'utf8');
  console.log('.gitignore updated successfully.');
}

//--------Helper Functions End-----------\\


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
  .action(async (options) => {
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
        //later, add option for other package managers like yarn, pnpm, bun (only npm 7+ needs double dash)
        npmArgs = ['create', 'vite@latest', 'client', '--', '--template', 'react'];
        //get path for config dir
        const configPath = path.join(clientPath, 'config')

        //set up client with vite
        console.log(`Setting up ${template} client using Vite`);
        await setupClientVite(npmArgs, clientPath, projectName);

        //update vite config file so browser launches when running npm run dev
        await updateViteConfig(clientPath);

        //update gitignore file to ignore config stuff
        updateGitIgnore(clientPath);

        //create config dir and install firebase
        //install firebase in the client directory
        await installFirebase(clientPath);

        //create config dir
        if (!fs.existsSync(configPath)) {
          fs.mkdirSync(configPath);
          console.log(`Created config directory in client at: ${configPath}`);
          //TODO: create a config file and fill with relevent code

        }

        break;
      default:
        console.error(`No handler for template: ${template}`);
        process.exit(1);
    }

    

    console.log(`Project setup complete with template: ${template}`);
    console.log('--------------------------------------------------');
    console.log('To start the local development enviroment run:');
    console.log(`cd ${projectName}/client/`);  //possibly do this for the user...
    console.log('npm run dev');


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
