# Linear History Tool - Enhanced Features Documentation

## Overview

This document describes the enhanced features of the Linear History Tool that provide advanced integration with Linear's API beyond the basic MCP server functionality.

## Features

### 1. Custom Fields Mapping

The tool now supports mapping Git metadata to Linear custom fields:

- Author information can be mapped to custom text fields
- Commit dates can be mapped to date fields
- Commit types (feat, fix, chore, etc.) can be mapped to single-select fields
- Commit messages can be mapped to text fields

#### Configuration

To enable custom fields mapping, use the following configuration:

```json
{
  "enableCustomFields": true,
  "customFieldMappings": {
    "author": "linear_custom_field_id_for_author",
    "date": "linear_custom_field_id_for_date",
    "type": "linear_custom_field_id_for_type",
    "message": "linear_custom_field_id_for_message"
  }
}
```

### 2. Project Templates

The tool supports creating and applying Linear project templates:

- Create templates from existing projects
- Apply templates to new projects during migration
- Configure default settings for teams, labels, and statuses

#### Configuration

To enable project templates:

```json
{
  "enableProjectTemplates": true,
  "projectTemplateId": "your_project_template_id"
}
```

### 3. Advanced Issue Relationships

The tool can map Git commit relationships to Linear issue relationships:

- Merge commits create "related" relationships
- Sequential commits create "related" relationships
- Commits mentioning "blocks" create "blocks" relationships
- Commits referencing other commits create "related" relationships

### 4. Epics and Cycles

The tool supports mapping Git structures to Linear epics and cycles:

- Branch-based epics: Create epics based on Git branches
- Time-based cycles: Create cycles based on commit date ranges
- Release-based epics and cycles: Create from Git tags/releases

#### Configuration

To enable epics and cycles:

```json
{
  "enableEpics": true,
  "enableCycles": true,
  "defaultEpicStrategy": "branch-based",
  "defaultCycleStrategy": "time-based"
}
```

## Usage

### Command Line Interface

The enhanced features can be enabled through the CLI:

```bash
# Enable all enhanced features
linear-history analyze --enable-enhanced-features

# Enable specific features
linear-history analyze --enable-custom-fields --enable-project-templates
```

### Programmatic Usage

```typescript
import { LinearHistoryApp } from '@linear-history/core';
import { EnhancedLinearMappingService } from '@linear-history/enhanced';

const app = new LinearHistoryApp();
const enhancedService = new EnhancedLinearMappingService(/* dependencies */);

// Configure enhanced options
const enhancedOptions = {
  enableCustomFields: true,
  enableProjectTemplates: true,
  enableAdvancedRelationships: true,
  enableEpics: true,
  enableCycles: true,
  customFieldMappings: new Map([
    ['author', 'custom_field_id_for_author'],
    ['date', 'custom_field_id_for_date']
  ])
};

// Run with enhanced features
await app.run('./config.json', enhancedOptions);
```

## Configuration Options

The following configuration options are available for enhanced features:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableGraphQLFeatures` | boolean | false | Enable advanced GraphQL API features |
| `enableCustomFields` | boolean | false | Enable custom field mapping |
| `enableProjectTemplates` | boolean | false | Enable project template application |
| `enableAdvancedRelationships` | boolean | false | Enable advanced issue relationship mapping |
| `enableEpics` | boolean | false | Enable epic creation and mapping |
| `enableCycles` | boolean | false | Enable cycle creation and mapping |
| `customFieldMappings` | Map&lt;string, string&gt; | empty | Mappings from Git metadata to Linear custom fields |
| `projectTemplateId` | string | null | ID of the project template to apply |
| `defaultEpicStrategy` | string | 'branch-based' | Strategy for epic creation ('branch-based', 'release-based', 'feature-based') |
| `defaultCycleStrategy` | string | 'time-based' | Strategy for cycle creation ('time-based', 'release-based', 'sprint-based') |

## Best Practices

1. **Start Small**: Begin with basic MCP integration, then gradually enable enhanced features
2. **Test Mappings**: Verify custom field mappings before running on production data
3. **Template Consistency**: Use consistent project templates for predictable results
4. **Monitor Performance**: Advanced features may impact performance on large repositories
5. **Backup Data**: Always backup Linear data before running migration with enhanced features

## Troubleshooting

### Common Issues

- **Custom Field Permissions**: Ensure your API key has permissions to access and modify custom fields
- **Template Access**: Verify that project templates are accessible to your Linear organization
- **Rate Limits**: Advanced features may increase API usage; monitor for rate limit errors
- **Relationship Loops**: Be cautious of creating circular relationships between issues

### Error Messages

- `"Custom field not found"`: Verify the custom field ID exists and is accessible
- `"Template not found"`: Check that the project template ID is correct and accessible
- `"Rate limit exceeded"`: Reduce the scope of your migration or implement delays