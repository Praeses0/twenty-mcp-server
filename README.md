# Twenty MCP Server (v1.19 Fork)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Twenty CRM](https://img.shields.io/badge/Twenty-v1.19-blue)](https://twenty.com/)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-Compatible-green)](https://modelcontextprotocol.io/)

A [Model Context Protocol](https://modelcontextprotocol.io/) server for [Twenty CRM](https://twenty.com/), forked from [jezweb/twenty-mcp](https://github.com/jezweb/twenty-mcp) and patched for compatibility with **Twenty v1.19.0 self-hosted** instances.

## What's Different in This Fork

The upstream MCP server targets Twenty Cloud and newer versions. Self-hosted Twenty v1.19.0 has several GraphQL API differences that cause widespread failures. This fork fixes all of them:

| Issue | Upstream | This Fork |
|-------|----------|-----------|
| Mutation ID types | `ID!` / `String!` | `UUID!` (what v1.19 expects) |
| Task/Note body field | `body` (removed in v1.19) | `bodyV2 { blocknote }` with auto-conversion |
| Metadata API | GraphQL `objects` query (doesn't exist) | `/metadata` GraphQL endpoint with `paging` |
| Pagination | `skip` parameter | Removed (v1.19 is cursor-based only) |
| Comments | `CommentCreateInput` (doesn't exist) | Creates a Note as workaround |
| Singular queries | `company()`, `person()` | `companies()`, `people()` with edges/node |
| Contact updates | Passes flat fields directly | Transforms to nested structure (`phones.primaryPhoneNumber`, etc.) |
| SELECT field options | No position field | Auto-adds `position` index |
| Relation payloads | `toObjectMetadataId` / `toLabel` | `targetObjectMetadataId` / `targetFieldLabel` |
| Schema management | Not supported | 7 new tools for custom objects, fields, and relations |

**Result: 36 tools, all passing on Twenty v1.19.0.**

## Tools (36)

### Contacts (4)
| Tool | Description |
|------|-------------|
| `create_contact` | Create a person with name, email, phone, company, job title |
| `get_contact` | Retrieve a contact by ID |
| `update_contact` | Update any contact field (name, email, phone, company, etc.) |
| `search_contacts` | Search by name or email |

### Companies (4)
| Tool | Description |
|------|-------------|
| `create_company` | Create with name, domain, address, employees, revenue |
| `get_company` | Retrieve a company by ID |
| `update_company` | Update any company field |
| `search_companies` | Search by name or domain |

### Opportunities (5)
| Tool | Description |
|------|-------------|
| `create_opportunity` | Create a deal with amount, stage, company, contact |
| `get_opportunity` | Retrieve an opportunity by ID |
| `update_opportunity` | Update stage, amount, dates, linked entities |
| `search_opportunities` | Filter by name, stage, amount range, date range, company |
| `list_opportunities_by_stage` | Pipeline view grouped by sales stage with totals |

### Tasks & Notes (3)
| Tool | Description |
|------|-------------|
| `create_task` | Create with title, body, status (TODO/IN_PROGRESS/DONE), assignee |
| `get_tasks` | List all tasks |
| `create_note` | Create a note with title and body |

### Activities (4)
| Tool | Description |
|------|-------------|
| `get_activities` | Unified timeline of tasks + notes, sorted by date |
| `filter_activities` | Filter by type, date range, author, status |
| `get_entity_activities` | Get activities for a specific person/company/opportunity |
| `create_comment` | Add a comment (creates a note as workaround for v1.19) |

### Relationships (6)
| Tool | Description |
|------|-------------|
| `get_company_contacts` | List all people at a company |
| `get_person_opportunities` | List opportunities where person is point of contact |
| `link_opportunity_to_company` | Link a deal to a company and/or contact |
| `transfer_contact_to_company` | Move a person from one company to another |
| `get_relationship_summary` | Count all connections for a company or person |
| `find_orphaned_records` | Find companies without contacts, contacts without companies |

### Schema Discovery (3)
| Tool | Description |
|------|-------------|
| `list_all_objects` | List all entity types (standard + custom) with counts |
| `get_object_schema` | Full field list for any object with types and descriptions |
| `get_field_metadata` | Detailed field info filtered by object, type, custom/system |

### Schema Management (7) -- New in this fork
| Tool | Description |
|------|-------------|
| `create_custom_object` | Define a new entity type (e.g. Vehicle, Project) |
| `update_custom_object` | Change label, description, icon, active status |
| `delete_custom_object` | Remove a custom object (delete relations first) |
| `create_custom_field` | Add a field to any object (TEXT, NUMBER, SELECT, etc.) |
| `update_custom_field` | Modify field label, description, icon, defaults |
| `delete_custom_field` | Remove a custom field |
| `create_relation_field` | Link two objects (ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY) |

## Setup

### Prerequisites

- Node.js 18+
- A self-hosted Twenty CRM instance (v1.19.x)
- A Twenty API key (Settings > API & Webhooks > Generate API Key)

### Install

```bash
git clone https://github.com/Praeses0/twenty-mcp-server.git ~/Projects/twenty-mcp-server
cd ~/Projects/twenty-mcp-server
npm install
npm run build
```

### Configure for Claude Code

Add to `~/.claude.json` under `mcpServers`:

```json
{
  "twenty-crm": {
    "type": "stdio",
    "command": "node",
    "args": ["/path/to/twenty-mcp-server/dist/index.js"],
    "env": {
      "TWENTY_API_KEY": "your-api-key-here",
      "TWENTY_BASE_URL": "https://your-twenty-instance.example.com",
      "NODE_TLS_REJECT_UNAUTHORIZED": "0"
    }
  }
}
```

> Set `NODE_TLS_REJECT_UNAUTHORIZED=0` only if your instance uses a self-signed certificate. Remove it for properly signed certs.

### Configure for Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "node",
      "args": ["/path/to/twenty-mcp-server/dist/index.js"],
      "env": {
        "TWENTY_API_KEY": "your-api-key-here",
        "TWENTY_BASE_URL": "https://your-twenty-instance.example.com"
      }
    }
  }
}
```

### Verify

Restart your MCP client (Claude Code, Claude Desktop, etc.) and test:

```
"Search for companies named Acme in my CRM"
"Create a new contact: John Doe, john@example.com, at Acme Corp"
"Show me the pipeline — list opportunities by stage"
"What custom objects do I have?"
```

## Field Type Reference

When creating custom fields with `create_custom_field`, these types are available:

| Type | Description | Notes |
|------|-------------|-------|
| `TEXT` | Single-line text | |
| `NUMBER` | Numeric value | |
| `BOOLEAN` | True/false | |
| `DATE` | Date only | |
| `DATE_TIME` | Date and time | |
| `EMAIL` | Email address | |
| `PHONE` | Phone number | |
| `CURRENCY` | Money amount | Stores as micros (1M = $1) |
| `LINK` | Single URL | |
| `LINKS` | Multiple URLs | |
| `ADDRESS` | Full address | Composite: street, city, state, country, zip |
| `RATING` | Star rating | |
| `SELECT` | Single choice | Requires `options` array with `label`, `value`, `color` |
| `MULTI_SELECT` | Multiple choices | Same options format as SELECT |
| `RICH_TEXT` | Formatted text | Stored as BlockNote JSON |
| `POSITION` | Sort order | |
| `RAW_JSON` | Arbitrary JSON | |
| `RELATION` | Link to another object | Use `create_relation_field` instead |

### SELECT/MULTI_SELECT Options Format

```json
{
  "options": [
    {"label": "Hot", "value": "HOT", "color": "red"},
    {"label": "Warm", "value": "WARM", "color": "yellow"},
    {"label": "Cold", "value": "COLD", "color": "blue"}
  ]
}
```

Position is auto-added based on array order. Colors: `green`, `blue`, `red`, `yellow`, `purple`, `orange`, `pink`, `gray`.

## Architecture

```
src/
  client/
    twenty-client.ts     # GraphQL client — all API calls (data + metadata)
  tools/
    index.ts             # Contact, company, task, note, relationship tools
    opportunities.ts     # Opportunity CRUD + pipeline tools
    activities.ts        # Timeline, filtering, comments, entity activities
    metadata.ts          # Schema discovery + schema management tools
  types/
    twenty.ts            # Core type definitions
    opportunities.ts     # Opportunity types
    activities.ts        # Activity/comment types
    metadata.ts          # Object/field metadata types
    relationships.ts     # Relationship types
  index.ts               # MCP server entry point
```

The client uses two GraphQL endpoints:
- **`/graphql`** for data operations (CRUD on records)
- **`/metadata`** for schema operations (objects, fields, relations)

## Known Limitations

- **Comments**: Twenty v1.19 doesn't have a Comment entity via GraphQL. `create_comment` creates a Note as a workaround.
- **Batch operations**: Not implemented. Use individual CRUD tools.
- **Deleting objects with relations**: You must delete relation fields before deleting the object.
- **Activities**: `get_entity_activities` returns all activities, not just those linked to the specific entity (Twenty v1.19 limitation in the GraphQL schema).
- **Search pagination**: Uses `first`/`after` cursor-based pagination. The `offset` parameter on search tools is accepted but not used (Twenty v1.19 doesn't support `skip`).

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Watch mode
npm test             # Run tests
npm run lint         # Lint
npm run typecheck    # Type check without emitting
```

## Credits

- Forked from [jezweb/twenty-mcp](https://github.com/jezweb/twenty-mcp)
- [Twenty CRM](https://twenty.com/) — open-source CRM
- [Model Context Protocol](https://modelcontextprotocol.io/) — by Anthropic

## License

MIT
