#!/usr/bin/env node
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import TimeTyper from './timeTyper.mjs';

export default async function build(args) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const NexfpackConfig = {
        name: packageJson.name,
        entry: packageJson.main,
        output: 'dist',
        noConsole: true,
        log: false,
        upxLevel: 0,
        ignore: [],
    }
    let reinstall = false;
    let skipClean = false;

    for (const arg of args) {
        if (arg === ('--name') || arg === '-n') {
            NexfpackConfig.name = args[args.indexOf(arg) + 1];
        }
        if (arg === ('--entry') || arg === '-e') {
            NexfpackConfig.entry = args[args.indexOf(arg) + 1];
        }
        if (arg === ('--output') || arg === '-o') {
            NexfpackConfig.output = args[args.indexOf(arg) + 1];
        }
        if (arg === ('--ignore') || arg === '-i') {
            NexfpackConfig.ignore.push(args[args.indexOf(arg) + 1]);
        }
        if (arg === ('--console') || arg === '-c') {
            NexfpackConfig.noConsole = false;
        }
        if (arg === ('--reinstall') || arg === '-r') {
            reinstall = true;
        }
        if (arg === ('--skip-clean') || arg === '-s') {
            skipClean = true;
        }
        if (arg === ('--upx') || arg === '-u') {
            NexfpackConfig.upxLevel = Number(args[args.indexOf(arg) + 1]);
        }
    }
    if (NexfpackConfig.upxLevel > 0) {
        const upxCheckResult = child_process.spawnSync("upx --version", { shell: true });
        if (upxCheckResult.status !== 0) {
            console.log("⚠️ UPX is not installed or is not in the PATH.");
            console.log("   Will skip UPX compression. You can install UPX from https://github.com/upx/upx/releases/latest and add it to the PATH environment variable.");
        }
    }
    if (!skipClean) {
        console.log("Removing Old Build Files...");
        const typerForRemove = new TimeTyper("Removing Old Build Files...");
        await new Promise(resolve => {
            fs.rm(NexfpackConfig.output, { recursive: true, force: true }, resolve);
        });
        await typerForRemove.kill();
        console.log("\x1b[1A\x1b[2KRemoved Old Build Files");
    }
    if (reinstall) {
        console.log("Reinstalling Dependencies...");
        const typerForReinstall = new TimeTyper("Reinstalling Dependencies...");
        await new Promise(resolve => {
            fs.rm("node_modules", { recursive: true, force: true }, resolve);
        });
        await new Promise(resolve => {
            const child = child_process.spawn("npm install --omit=dev", { shell: true });
            child.on('close', (code) => {
                resolve({ status: code });
            });
        });
        await typerForReinstall.kill();
        console.log("\x1b[1A\x1b[2KReinstalled Dependencies");
    }
    console.log("Setting Up Build Environment...");
    const typerForSetup = new TimeTyper("Setting Up Build Environment...");
    if (!fs.existsSync(NexfpackConfig.output)) {
        await new Promise(resolve => {
            fs.mkdir(NexfpackConfig.output, { recursive: true }, resolve);
        });
    }
    await new Promise(resolve => {
        fs.writeFile(path.join(NexfpackConfig.output, 'nexfpack.config.json'), JSON.stringify(NexfpackConfig, null, 2), resolve);
    });
    await typerForSetup.kill();
    console.log("\x1b[1A\x1b[2KSet Up Build Environment");
    console.log("Building...");
    const typerForBuild = new TimeTyper("Building...");
    const result = await new Promise(resolve => {
        const child = child_process.spawn(`npx --yes nexfpack@0.4.1 ${path.join(NexfpackConfig.output, 'nexfpack.config.json')}`, { shell: true });
        child.on('close', (code) => {
            resolve({ status: code });
        });
    });
    await new Promise(resolve => {
        fs.unlink(path.join(NexfpackConfig.output, 'nexfpack.config.json'), resolve);
    });
    await typerForBuild.kill();
    if (result.status !== 0) {
        console.error("\x1b[1A\x1b[2KBuild Failed: Exit Code: " + result.status);
        process.exit(result.status);
    }
    console.log("\x1b[1A\x1b[2KBuild Success");
}