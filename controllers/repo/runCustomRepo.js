const fs = require("fs");
const checkUserValidity = require("../../utils/checkUserValidity");
const path = require("path");
const zipdir = require("zip-dir");
const child_process = require("child_process").execFileSync;
const exec = require('child_process').exec;
const cp = require('child_process');
const { cwd, stdin, stderr, stdout } = require('process');
const shell = require('shelljs');

function createDirectory(pathname, name){
    fs.mkdirSync(path.join(process.cwd() + '/repos/' + pathname), { recursive: true }, (err) => {
        if(err) console.log(err, 'error')
        // console.log(`Directory ${name} added in ${pathname} successfully`);
    });
};

function createFile(pathname, filename, content){
    const filePath = process.cwd() + '/repos/' + pathname;
    const fileContent = content ? content: "";
    fs.writeFile(filePath,fileContent , (err) => {
        if(err) console.log("error", err);
        // console.log(`File ${filename} added in ${pathname} successfully`)
    });
};

const runCustomRepo = async (req, res) => {
    // const { tree } = req.body;
    // const userId = req.headers.authorization.split(" ")[1];
    // const { isUserValid } = await checkUserValidity(userId);
    // // if(!isUserValid){
    // //     res.send("User not found, please login to continue");
    // //     return
    // // }else {
    // if(!tree){
    //     res.send("JSON tree required");
    //     return
    // }
    // let directories = [];
    // let files = [];
    // if(fs.existsSync(process.cwd() + "/repos/root")){
    //     fs.rmdirSync(process.cwd() + "/repos/root", { recursive: true });
    // };
    // function walkTree(tree){
    //     tree.map(item => {
    //         if(Array.isArray(item.children)){
    //             directories.push(item);
    //             walkTree(item.children);
    //             return
    //         }else {
    //             files.push(item)
    //             return
    //         }
    //     });
    // };
    // walkTree(tree.children);
    // directories.map(item => {
    //     createDirectory(item.path, item.name)
    // });
    // files.map(item => {
    //     createFile(item.path, item.name, item.content)
    // });
    // const ls = cp.spawn('npm', ['install'], { cwd : cwd() + '/repos/root', shell: true });

    // ls.stdout.on('data', data => console.log(data.toString(), 'data'));
    // ls.stderr.on('data', data => console.log('std err:' + data));
    // ls.on('close', code => {
    //     console.log(code, 'code')
    // });
    // cd ${cwd() + '/repos/root'} && /usr/local/bin/npm install
    
    // cp.exec(`npm -v`,  { env: { ...process.env, npm:  '/usr/local/bin/npm' }}, (err, stdout, stderr) => {
    //     if (err) {
    //         console.log(`error: ${err}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    // });
    shell.exec(`cd ${cwd() + '/repos/root'} && yarn`, {} ,(code,stdout, stderr) => {
        if(code) console.log(code, 'code')
        if(stdout) console.log(stdout, 'std out')
        if(stderr) console.log(stderr, 'std errr')
    });
};
module.exports = runCustomRepo;

