# Linear History Tool - Tech Stack

## Languages
- **TypeScript**: Primary language for type safety and modern JavaScript features
- **JavaScript**: For compatibility with Node.js ecosystem and MCP server

## Frameworks & Libraries
- **Node.js**: Runtime environment for MCP server integration
- **Git CLI Integration**: Direct integration with Git for repository analysis
- **Axios/Fetch**: HTTP client for MCP server communication
- **Commander.js**: CLI framework for command-line interface
- **fs-extra**: Enhanced file system operations
- **yaml**: YAML parsing for configuration files
- **zod**: Schema validation for configuration and API responses

## Tools & Platforms
- **Linear MCP Server**: Official Linear MCP server integration (default endpoint)
- **Git**: Version control system for repository analysis
- **npm/yarn**: Package management

## Architecture Components
- **Repository Analyzer**: Component responsible for parsing Git history
- **Configuration Manager**: Handles repo-specific settings and mapping rules
- **MCP Client**: Communicates with MCP server endpoints
- **Mapper Engine**: Transforms Git history to Linear-compatible format
- **Traceability System**: Maintains links between Git commits and Linear issues

## Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **ts-node**: TypeScript execution in development
- **nodemon**: Development file watcher

## Configuration
- **Repository-specific config**: Individual settings for each repository
- **Global config**: Default settings and MCP server endpoints
- **Mapping rules**: Define how Git commits map to Linear entities

## Deployment
- **Node.js package**: Distributable as npm package
- **Executable binary**: Standalone executable for ease of use