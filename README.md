# Linear History Tool

A tool that maps repository history to Linear via Linear's official MCP server.

## Overview

The Linear History Tool analyzes Git repository history and maps it to Linear issues via the Linear MCP server. This allows teams to migrate their project history from Git to Linear while maintaining traceability between commits and issues.

## Features

- Local repository analysis and Git history parsing
- Configurable mapping depth (whole repo or specific ranges)
- Setup wizard for repository-specific configuration
- MCP server communication layer (defaulting to official Linear MCP server)
- Modular architecture to support different MCP endpoints
- Flexible granularity options for mapping commits to Linear issues
- Support for both simple and complex mapping scenarios
- Traceability linking Git commits to Linear issues for audit purposes
- Automated review process at the end of each development track
- Automatic archiving of completed tracks
- Seamless progression to the next track after review completion

## Installation

```bash
npm install -g @linear-history/core
```

## Usage

### CLI Usage

```bash
# Analyze the current repository
linear-history analyze

# Analyze a specific repository
linear-history analyze -r /path/to/repo

# Use a specific configuration file
linear-history analyze -c /path/to/config.json

# Initialize a configuration file
linear-history init
linear-history init -c ./my-config.json
```

### Programmatic Usage

```typescript
import { LinearHistoryApp } from '@linear-history/core';

const app = new LinearHistoryApp();
await app.run('./config.json');
```

## Configuration

The tool can be configured via a JSON configuration file with the following options:

```json
{
  "repoPath": "./",
  "maxCommits": 100000,
  "includeBranches": [],
  "excludeBranches": [],
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": "2023-12-31T23:59:59.999Z",
  "mcpEndpoint": "https://mcp.linear.app/sse",
  "linearApiKey": "your-api-key-here"
}
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd linear-history

# Install dependencies
npm install

# Build the project
npm run build
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode
- `npm test` - Run tests
- `npm test:watch` - Run tests in watch mode
- `npm run lint` - Lint the code
- `npm run format` - Format the code

## Architecture

The tool follows a modular architecture:

- `ConfigManager`: Handles configuration loading and validation
- `GitAnalyzer`: Analyzes Git repositories and extracts commit history
- `DataTransformer`: Converts Git data to Linear-compatible format
- `LinearHistoryApp`: Main application class that orchestrates the process
- `CLI`: Command-line interface for user interaction

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT