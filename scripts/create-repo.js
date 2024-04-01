import prompt from "prompt";
import chalk from "chalk";
import { exec } from "child_process";
prompt.start();

process.stdout.write("Welcome to boilerplate automation \n\n");
prompt.get(["projectname"], (err, result) => {
	process.stdout.write(`Entered project name is ${result?.projectname} \n\n`);
	process.stdout.write(
		chalk.bold.green("Project Directory Created Successfully \n\n ")
	);
	exec(`mkdir ${result?.projectname}`, (err, stderr, stdout) => {
		if (err) {
			console.log(err);
			return;
		}
		process.stdout(`${stdout} \n\n`);
	});
	process.stdout.write(
		chalk.bold.blue(`Moving inside the ${result?.projectname} directory \n\n `)
	);
	process.stdout.write(chalk.bold.blue("Intialising the project \n\n"));
	const createFoldersCommand = `cd ${result?.projectname} && mkdir pages components modules public`;
	exec(createFoldersCommand, (err, stderr, stdout) => {
		if (err) {
			console.log(err);
			return;
		}
		process.stdout(chalk.green(`Project folders are created \n\n`));
	});
	const initialzeCommand = `cd ${result?.projectname} && npm init`;
	exec(initialzeCommand, (err, stderr, stdout) => {
		if (err) {
			console.log(err);
			return;
		}
		process.stdout(`${stdout} \n\n`);
		process.stdout(chalk.green(`Package.json file created successfully \n\n`));
	});
});
