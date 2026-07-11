#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import build from './build.mjs';
import help from './help.mjs';
const args = process.argv.slice(2);
if(args.length === 0) {
    help();
    process.exit(1);
}
if(args[0] === 'help') {
    if(args.length > 1) {
        help(args[1]);
    } else {
        help();
    }
}
if(args[0] === 'build') {
    build(args.slice(1));
}