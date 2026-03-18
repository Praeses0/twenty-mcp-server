import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TwentyClient } from '../client/twenty-client.js';

export function registerMetadataTools(server: McpServer, client: TwentyClient) {
  server.tool(
    'list_all_objects',
    'List all objects (entities) available in Twenty CRM with their metadata',
    {
      includeCustom: z.boolean().optional().default(true).describe('Include custom objects'),
      includeSystem: z.boolean().optional().default(false).describe('Include system objects'),
      activeOnly: z.boolean().optional().default(true).describe('Only include active objects'),
      groupBy: z.enum(['type', 'none']).optional().default('type').describe('How to group the results'),
    },
    async (args) => {
      try {
        const objectSummary = await client.listAllObjects({
          includeCustom: args.includeCustom,
          includeSystem: args.includeSystem,
          activeOnly: args.activeOnly,
        });

        if (args.groupBy === 'type') {
          const standardObjects = objectSummary.standard.map(obj => 
            `📊 ${obj.labelSingular} (${obj.nameSingular})`
          );
          
          const customObjects = objectSummary.custom.map(obj => 
            `🎨 ${obj.labelSingular} (${obj.nameSingular})`
          );
          
          const systemObjects = objectSummary.system.map(obj => 
            `⚙️ ${obj.labelSingular} (${obj.nameSingular})`
          );

          let content = `# Twenty CRM Objects Summary

## Overview
- **Total Objects**: ${objectSummary.totalCount}
- **Standard Objects**: ${objectSummary.standardCount}
- **Custom Objects**: ${objectSummary.customCount}`;

          if (args.includeSystem) {
            content += `\n- **System Objects**: ${objectSummary.systemCount}`;
          }

          if (standardObjects.length > 0) {
            content += `\n\n## Standard Objects (${standardObjects.length})\n${standardObjects.join('\n')}`;
          }

          if (customObjects.length > 0) {
            content += `\n\n## Custom Objects (${customObjects.length})\n${customObjects.join('\n')}`;
          }

          if (args.includeSystem && systemObjects.length > 0) {
            content += `\n\n## System Objects (${systemObjects.length})\n${systemObjects.join('\n')}`;
          }

          content += `\n\n💡 Use 'get_object_schema' with object name to see detailed field information.`;

          return {
            content: [{
              type: 'text' as const,
              text: content
            }]
          };
        } else {
          // Flat list
          const allObjects = [
            ...objectSummary.standard,
            ...objectSummary.custom,
            ...(args.includeSystem ? objectSummary.system : [])
          ];

          const objectList = allObjects.map((obj, index) => {
            const icon = obj.isCustom ? '🎨' : obj.isSystem ? '⚙️' : '📊';
            return `${index + 1}. ${icon} ${obj.labelSingular} (${obj.nameSingular}) - ${obj.description || 'No description'}`;
          }).join('\n');

          return {
            content: [{
              type: 'text' as const,
              text: `Twenty CRM Objects (${allObjects.length} total):\n\n${objectList}`
            }]
          };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error listing objects: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'get_object_schema',
    'Get detailed schema information for a specific object including all fields and their types',
    {
      objectName: z.string().describe('Object name (singular or plural) or ID to get schema for'),
      includeSystemFields: z.boolean().optional().default(false).describe('Include system fields in the output'),
    },
    async (args) => {
      try {
        const schema = await client.getObjectSchema(args.objectName);
        const object = schema.object;

        // Filter fields if needed
        let fields = schema.fields;
        if (!args.includeSystemFields) {
          fields = fields.filter(field => !field.isSystem);
        }

        const fieldList = fields.map(field => {
          const customIcon = field.isCustom ? '🎨' : '';
          const nullableText = field.isNullable ? '(optional)' : '(required)';
          const defaultText = field.defaultValue ? ` [default: ${field.defaultValue}]` : '';
          
          let fieldEntry = `  ${customIcon} **${field.label}** (${field.name})
    Type: ${field.type} ${nullableText}${defaultText}
    ${field.description ? `Description: ${field.description}` : 'No description'}`;
          if (field.options && Array.isArray(field.options) && field.options.length > 0) {
            fieldEntry += `\n    Options: ${field.options.map((o: any) => `${o.label} (${o.value})`).join(', ')}`;
          }
          return fieldEntry;
        }).join('\n\n');

        const content = `# ${object.labelSingular} Schema

## Object Information
- **Name**: ${object.nameSingular} / ${object.namePlural}
- **Label**: ${object.labelSingular} / ${object.labelPlural}
- **Type**: ${object.isCustom ? 'Custom' : 'Standard'} Object
- **Status**: ${object.isActive ? 'Active' : 'Inactive'}
- **Icon**: ${object.icon || 'No icon'}
${object.description ? `- **Description**: ${object.description}` : ''}

## Fields (${fields.length})

${fieldList}

---
💡 **Legend**: 🎨 = Custom field | (required) = Must have value | (optional) = Can be empty
📝 Use field names in API calls and tool arguments.`;

        return {
          content: [{
            type: 'text' as const,
            text: content
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error getting object schema: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'get_field_metadata',
    'Get detailed information about fields, either for a specific object or across all objects',
    {
      objectName: z.string().optional().describe('Object name to get fields for (if not specified, gets all fields)'),
      fieldType: z.enum([
        'UUID', 'TEXT', 'PHONE', 'EMAIL', 'DATE_TIME', 'DATE', 'BOOLEAN', 
        'NUMBER', 'CURRENCY', 'FULL_NAME', 'LINK', 'LINKS', 'ADDRESS', 
        'RATING', 'SELECT', 'MULTI_SELECT', 'RELATION', 'RICH_TEXT', 'POSITION', 'RAW_JSON'
      ]).optional().describe('Filter by specific field type'),
      includeCustom: z.boolean().optional().default(true).describe('Include custom fields'),
      includeSystem: z.boolean().optional().default(false).describe('Include system fields'),
      activeOnly: z.boolean().optional().default(true).describe('Only include active fields'),
    },
    async (args) => {
      try {
        const fields = await client.getFieldMetadata({
          objectName: args.objectName,
          fieldType: args.fieldType,
          includeCustom: args.includeCustom,
          includeSystem: args.includeSystem,
          activeOnly: args.activeOnly,
        });

        if (fields.length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'No fields found matching the specified criteria.'
            }]
          };
        }

        // Group fields by type
        const fieldsByType: Record<string, typeof fields> = {};
        fields.forEach(field => {
          if (!fieldsByType[field.type]) {
            fieldsByType[field.type] = [];
          }
          fieldsByType[field.type].push(field);
        });

        let content = `# Field Metadata Summary\n\n`;
        
        if (args.objectName) {
          content += `**Object**: ${args.objectName}\n`;
        }
        
        content += `**Total Fields**: ${fields.length}\n`;
        
        if (args.fieldType) {
          content += `**Field Type Filter**: ${args.fieldType}\n`;
        }
        
        content += `\n## Fields by Type\n\n`;

        Object.entries(fieldsByType).forEach(([type, typeFields]) => {
          content += `### ${type} (${typeFields.length})\n\n`;
          
          typeFields.forEach(field => {
            const customIcon = field.isCustom ? '🎨 ' : '';
            const requiredText = field.isNullable ? '' : ' ⚠️';
            
            content += `- ${customIcon}**${field.label}** (${field.name})${requiredText}\n`;
            if (field.description) {
              content += `  ${field.description}\n`;
            }
            if (field.defaultValue) {
              content += `  Default: ${field.defaultValue}\n`;
            }
            if (field.options && Array.isArray(field.options) && field.options.length > 0) {
              content += `  Options: ${field.options.map((o: any) => `${o.label} (${o.value})`).join(', ')}\n`;
            }
          });

          content += '\n';
        });

        content += `\n---\n💡 **Legend**: 🎨 = Custom field | ⚠️ = Required field\n📝 Total field types found: ${Object.keys(fieldsByType).length}`;

        return {
          content: [{
            type: 'text' as const,
            text: content
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error getting field metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  // Schema Management Tools

  server.tool(
    'create_custom_object',
    'Create a new custom object (entity type) in Twenty CRM. This defines a new table/entity like "Vehicle", "Project", etc.',
    {
      nameSingular: z.string().describe('Singular name in camelCase (e.g. "vehicle", "dealerContact")'),
      namePlural: z.string().describe('Plural name in camelCase (e.g. "vehicles", "dealerContacts")'),
      labelSingular: z.string().describe('Human-readable singular label (e.g. "Vehicle", "Dealer Contact")'),
      labelPlural: z.string().describe('Human-readable plural label (e.g. "Vehicles", "Dealer Contacts")'),
      description: z.string().optional().describe('Description of the object'),
      icon: z.string().optional().describe('Icon name from Tabler icons (e.g. "IconCar", "IconUser")'),
    },
    async (args) => {
      try {
        const result = await client.createCustomObject(args);
        return {
          content: [{
            type: 'text' as const,
            text: `Custom object created: ${result.labelSingular} (${result.nameSingular})\n` +
                  `ID: ${result.id}\n` +
                  `Plural: ${result.labelPlural} (${result.namePlural})\n` +
                  `Active: ${result.isActive}\n` +
                  (result.description ? `Description: ${result.description}` : '')
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error creating custom object: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'update_custom_object',
    'Update an existing custom object (change label, description, icon, or deactivate it)',
    {
      objectName: z.string().describe('Object name (singular or plural) or UUID to update'),
      labelSingular: z.string().optional().describe('New singular label'),
      labelPlural: z.string().optional().describe('New plural label'),
      description: z.string().optional().describe('New description'),
      icon: z.string().optional().describe('New icon name'),
      isActive: z.boolean().optional().describe('Set active/inactive'),
    },
    async (args) => {
      try {
        const { objectName, ...update } = args;

        // Resolve name to ID
        let objectId = objectName;
        if (!objectName.match(/^[0-9a-fA-F-]{36}$/)) {
          const schema = await client.getObjectSchema(objectName);
          objectId = schema.object.id;
        }

        const result = await client.updateCustomObject(objectId, update);
        return {
          content: [{
            type: 'text' as const,
            text: `Object updated: ${result.labelSingular} (${result.nameSingular})\n` +
                  `ID: ${result.id}\n` +
                  `Active: ${result.isActive}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error updating object: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'delete_custom_object',
    'Delete a custom object. WARNING: This permanently removes the object and all its data.',
    {
      objectName: z.string().describe('Object name (singular or plural) or UUID to delete'),
    },
    async (args) => {
      try {
        let objectId = args.objectName;
        if (!args.objectName.match(/^[0-9a-fA-F-]{36}$/)) {
          const schema = await client.getObjectSchema(args.objectName);
          objectId = schema.object.id;
        }

        const result = await client.deleteCustomObject(objectId);
        return {
          content: [{
            type: 'text' as const,
            text: `Object deleted: ${result.nameSingular} (ID: ${result.id})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error deleting object: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'create_custom_field',
    'Add a new field to an existing object. Supported types: TEXT, NUMBER, BOOLEAN, DATE_TIME, DATE, PHONE, EMAIL, CURRENCY, LINK, LINKS, ADDRESS, RATING, SELECT, MULTI_SELECT, RICH_TEXT, POSITION, RAW_JSON.',
    {
      objectName: z.string().describe('Object name (singular or plural) or UUID to add the field to'),
      name: z.string().describe('Field name in camelCase (e.g. "vinNumber", "estimatedValue")'),
      label: z.string().describe('Human-readable label (e.g. "VIN Number", "Estimated Value")'),
      type: z.enum([
        'TEXT', 'NUMBER', 'BOOLEAN', 'DATE_TIME', 'DATE', 'PHONE', 'EMAIL',
        'CURRENCY', 'LINK', 'LINKS', 'ADDRESS', 'RATING', 'SELECT',
        'MULTI_SELECT', 'RICH_TEXT', 'POSITION', 'RAW_JSON'
      ]).describe('Field data type'),
      description: z.string().optional().describe('Field description'),
      icon: z.string().optional().describe('Icon name'),
      isNullable: z.boolean().optional().default(true).describe('Whether the field can be empty'),
      defaultValue: z.any().optional().describe('Default value (JSON)'),
      options: z.any().optional().describe('Options for SELECT/MULTI_SELECT fields (JSON array of {label, value, color})'),
    },
    async (args) => {
      try {
        const { objectName, ...fieldInput } = args;

        // Resolve name to ID
        let objectId = objectName;
        if (!objectName.match(/^[0-9a-fA-F-]{36}$/)) {
          const schema = await client.getObjectSchema(objectName);
          objectId = schema.object.id;
        }

        const result = await client.createCustomField({
          ...fieldInput,
          objectMetadataId: objectId,
        });

        return {
          content: [{
            type: 'text' as const,
            text: `Field created: ${result.label} (${result.name})\n` +
                  `ID: ${result.id}\n` +
                  `Type: ${result.type}\n` +
                  `Object: ${objectName}\n` +
                  `Nullable: ${result.isNullable}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error creating field: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'update_custom_field',
    'Update an existing field (change label, description, icon, default value, or deactivate it)',
    {
      fieldId: z.string().describe('Field UUID to update'),
      label: z.string().optional().describe('New label'),
      description: z.string().optional().describe('New description'),
      icon: z.string().optional().describe('New icon'),
      isActive: z.boolean().optional().describe('Set active/inactive'),
      defaultValue: z.any().optional().describe('New default value (JSON)'),
      options: z.any().optional().describe('Updated options for SELECT/MULTI_SELECT fields'),
    },
    async (args) => {
      try {
        const { fieldId, ...update } = args;
        const result = await client.updateCustomField(fieldId, update);
        return {
          content: [{
            type: 'text' as const,
            text: `Field updated: ${result.label} (${result.name})\n` +
                  `ID: ${result.id}\n` +
                  `Type: ${result.type}\n` +
                  `Active: ${result.isActive}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error updating field: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'delete_custom_field',
    'Delete a custom field. WARNING: This permanently removes the field and its data from all records.',
    {
      fieldId: z.string().describe('Field UUID to delete'),
    },
    async (args) => {
      try {
        const result = await client.deleteCustomField(args.fieldId);
        return {
          content: [{
            type: 'text' as const,
            text: `Field deleted: ${result.name} (ID: ${result.id})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error deleting field: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  server.tool(
    'create_relation_field',
    'Create a relation between two objects (e.g. link Vehicles to Companies). Creates fields on both objects.',
    {
      fromObjectName: z.string().describe('Source object name (singular or plural) or UUID'),
      fromFieldName: z.string().describe('Field name on source object in camelCase (e.g. "company")'),
      fromFieldLabel: z.string().describe('Field label on source object (e.g. "Company")'),
      toObjectName: z.string().describe('Target object name (singular or plural) or UUID'),
      toFieldName: z.string().describe('Field name on target object in camelCase (e.g. "vehicles")'),
      toFieldLabel: z.string().describe('Field label on target object (e.g. "Vehicles")'),
      relationType: z.enum(['ONE_TO_MANY', 'MANY_TO_ONE', 'MANY_TO_MANY']).describe('Relation type'),
      description: z.string().optional().describe('Description of the relation'),
      icon: z.string().optional().describe('Icon for the source field'),
      toIcon: z.string().optional().describe('Icon for the target field'),
    },
    async (args) => {
      try {
        // Resolve object names to IDs
        let fromObjectId = args.fromObjectName;
        if (!args.fromObjectName.match(/^[0-9a-fA-F-]{36}$/)) {
          const schema = await client.getObjectSchema(args.fromObjectName);
          fromObjectId = schema.object.id;
        }

        let toObjectId = args.toObjectName;
        if (!args.toObjectName.match(/^[0-9a-fA-F-]{36}$/)) {
          const schema = await client.getObjectSchema(args.toObjectName);
          toObjectId = schema.object.id;
        }

        const result = await client.createRelationField({
          objectMetadataId: fromObjectId,
          name: args.fromFieldName,
          label: args.fromFieldLabel,
          description: args.description,
          icon: args.icon,
          relationType: args.relationType,
          targetObjectMetadataId: toObjectId,
          targetFieldLabel: args.toFieldLabel,
          targetFieldIcon: args.toIcon,
        });

        return {
          content: [{
            type: 'text' as const,
            text: `Relation created: ${args.fromFieldLabel} ↔ ${args.toFieldLabel}\n` +
                  `Type: ${args.relationType}\n` +
                  `From: ${args.fromObjectName}.${args.fromFieldName}\n` +
                  `To: ${args.toObjectName}.${args.toFieldName}\n` +
                  `Field ID: ${result.id}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error creating relation: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}