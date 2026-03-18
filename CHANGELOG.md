# Changelog

All notable changes to this fork of Twenty MCP Server will be documented in this file.

## [2.0.0] - 2026-03-18 (v1.19 Fork)

Forked from [jezweb/twenty-mcp v1.3.0](https://github.com/jezweb/twenty-mcp) and patched for **Twenty CRM v1.19.0 self-hosted** compatibility.

### Breaking Changes (from upstream)
- Removed `npx twenty-mcp-server` CLI setup wizard (use git clone + manual config instead)
- Changed package name scope for fork publication

### Fixed (Twenty v1.19 Compatibility)
- **UUID type mismatch**: All mutations now use `UUID!` instead of `ID!`/`String!` for ID parameters
- **bodyV2 migration**: Tasks and notes use `bodyV2 { blocknote }` instead of removed `body` field
- **Metadata API**: Schema discovery uses `/metadata` GraphQL endpoint with `paging` parameter instead of nonexistent REST endpoints
- **Pagination**: Removed `skip` parameter from opportunity search (v1.19 is cursor-based only)
- **Comments**: `create_comment` creates a Note as workaround (v1.19 has no `CommentCreateInput`)
- **Singular queries**: Changed `company()`/`person()` to `companies()`/`people()` with edges/node pattern
- **Contact updates**: `update_contact` now correctly transforms flat fields (`phone`, `email`, `firstName`, etc.) to Twenty's nested GraphQL structure
- **SELECT options**: Auto-adds `position` field to options (required by v1.19, not documented)
- **Relation payloads**: Uses correct field names (`targetObjectMetadataId`, `targetFieldLabel`, `targetFieldIcon`)

### Added
- **7 schema management tools** (new in this fork):
  - `create_custom_object` — define new entity types
  - `update_custom_object` — modify object metadata
  - `delete_custom_object` — remove custom objects
  - `create_custom_field` — add fields (TEXT, NUMBER, SELECT, BOOLEAN, etc.)
  - `update_custom_field` — modify field metadata
  - `delete_custom_field` — remove fields
  - `create_relation_field` — link objects (ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY)
- Metadata GraphQL client (`/metadata` endpoint) separate from data GraphQL client (`/graphql`)
- String-to-JSON parsing for `options` parameter (handles MCP SDK string serialization)

### Tool Count
- Upstream: 29 tools (10 passing on v1.19)
- This fork: **36 tools, all passing on v1.19.0**

---

## Upstream Changelog

### [1.3.0] - 2026-01-12 (upstream)
- Docker MCP support
- Security updates (npm audit fixes)

### [1.2.0] - 2025-06-24 (upstream)
- npx instant trial support
- Execution context detection

### [1.1.0] (upstream)
- Initial OAuth 2.1 implementation
- IP address protection
- Enhanced setup wizard
