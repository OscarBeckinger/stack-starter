# stack-starter

`stack-starter` is a CLI tool designed to simplify the setup of full-stack projects. With `stack-starter`, you can quickly create a new full stack project with a specified template, which includes a basic project structure. Set up your frontend, server, and database all with one command! I am working on adding set up templates for MERN, MEAN, React w/ Firebase, and more!


## Installation

You can install `stack-starter` globally on your system with the following command (`stack-starter` is not on the npm registry yet, but will be soon!):

```bash
npm install -g stack-starter
```
or
```bash
yarn global add stack-starter
```

## Usage

### Create a New Project

To create a new project, use the `create` command with the `-n` (or `--name`) and `-t` (or `--template`) options:

```bash
stack-starter create -n <project-name> -t <template-name>
```

## Local Testing

Since we aren't on the npm registry yet you might want to test `stack-starter` locally. To do so follow this process: 

1. **Clone the repo onto your local**
```bash
git clone https://github.com/OscarBeckinger/stack-starter.git
```

2. **Navigate to the project directory**
```bash
cd stack-starter
```

3. **Install Dependencies**
```bash
npm install
```
or
```bash
yarn install
```

4. **Link the package locally**
```bash
npm link
```
or
```bash
yarn link
```
_(Note: these command might need to be prefixed with `sudo`)_

5. **Test the tool**
Now you are ready to go! Check out the usage section for more details.




