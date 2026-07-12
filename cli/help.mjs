const helpTexts = {
    help: `
Nexfep - A desktop application framework for Node.js

This is a command-line tool for building desktop applications with Node.js.

For application development, please refer to the README.md:
  https://github.com/nexfteam/Nexfep#readme

Usage: nexfep <command> [options]

Commands:
  help            Show this help message
  build           Build the application into a standalone executable

See 'nexfep help <command>'
to read about a specific subcommand.
`,
    build: `
nexfep build - Build the application into a standalone executable

Usage:
  nexfep build [options]

Options:
  -n, --name <name>             Application name (default: from package.json)
  -e, --entry <file>            Entry file path (default: from package.json main)
  -o, --output <dir>            Output directory (default: dist)
  -i, --ignore <pattern>        Files or directories to ignore (can be used multiple times)
  -c, --console                 Show console window on Windows (default: false)
  -r, --reinstall               Reinstall production dependencies only before building (default: false)
  -s, --skip-clean              Skip cleaning old build files before building (default: false)
  -u, --upx <level>             Use UPX to compress the executable, level in range 0-9, 0 means no UPX compression.
                                Ensure UPX is installed before using (default: 0)
  -m, --meta, --metadata <file> Metadata JSON file path.
                                For more details, see README.md and https://github.com/nexfteam/Nexfpack#Metadata.

Examples:
  nexfep build                          # Build using defaults from package.json
  nexfep build -n my-app                # Set custom application name
  nexfep build -e ./src/index.js        # Set custom entry file
  nexfep build -o ./build               # Set custom output directory
  nexfep build -i node_modules          # Ignore node_modules
  nexfep build -i test -i temp          # Ignore multiple patterns

This command uses nexfpack (github.com/nexfteam/Nexfpack) to package
your application into a standalone executable. For more details, see:
  https://github.com/nexfteam/Nexfpack
`,
}
export default function help(command = 'help') {
    if(command in helpTexts) {
        console.log(helpTexts[command]);
    } else {
        console.log("Invalid command.");
    }
}