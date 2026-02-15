# Linear History Tool - Product Specification

## Vision
A skill that maps local repository history to Linear via Linear's official MCP server, enabling seamless migration of Git commit history and project management data to Linear issues and projects.

## Users
- Developers wanting to migrate project history to Linear
- Project managers looking to consolidate project tracking in Linear
- Teams transitioning from other project management tools to Linear

## Goals
- Enable seamless migration of Git commit history to Linear
- Provide flexible configuration for different repository structures
- Integrate with Linear's official MCP server by default
- Allow for alternative MCP server endpoints
- Support gradual, configurable mapping of repository history
- Maintain traceability between Git commits and Linear issues

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