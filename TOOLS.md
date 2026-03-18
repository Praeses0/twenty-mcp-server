# Twenty MCP Server - Tool Reference

This document provides detailed information about all **41 tools** available in this fork of Twenty MCP Server, patched for Twenty v1.19.0 self-hosted instances.

## Table of Contents

- [Contact Management Tools](#contact-management-tools)
- [Company Management Tools](#company-management-tools)
- [Opportunity Management Tools](#opportunity-management-tools)
- [Activity Management Tools](#activity-management-tools)
- [Task Management Tools](#task-management-tools)
- [Note Management Tools](#note-management-tools)
- [Relationship Management Tools](#relationship-management-tools)
- [Metadata Discovery Tools](#metadata-discovery-tools)
- [Schema Management Tools](#schema-management-tools)

---

## Contact Management Tools

### create_contact
Creates a new contact (person) in Twenty CRM.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `firstName` | string | yes | First name |
| `lastName` | string | yes | Last name |
| `email` | string | no | Email address |
| `phone` | string | no | Phone number |
| `companyId` | string | no | UUID of associated company |
| `jobTitle` | string | no | Job title |
| `linkedinUrl` | string | no | LinkedIn profile URL |
| `city` | string | no | City |

### get_contact
Retrieves a contact by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Contact UUID |

### update_contact
Updates an existing contact. All fields except `id` are optional — only send what you want to change.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Contact UUID |
| `firstName` | string | no | First name |
| `lastName` | string | no | Last name |
| `email` | string | no | Email address |
| `phone` | string | no | Phone number |
| `companyId` | string | no | UUID of associated company |
| `jobTitle` | string | no | Job title |
| `linkedinUrl` | string | no | LinkedIn profile URL |
| `city` | string | no | City |

> **v1.19 note:** This fork correctly maps flat fields to Twenty's nested GraphQL structure (`phone` -> `phones.primaryPhoneNumber`, `email` -> `emails.primaryEmail`, etc.).

### delete_contact
Deletes a contact.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Contact UUID |

### search_contacts
Searches contacts by name or email.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | yes | Search text (matches first name, last name, email) |
| `limit` | number | no | Max results (default: 20) |

---

## Company Management Tools

### create_company
Creates a new company.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | yes | Company name |
| `domainName` | string | no | Website domain |
| `address` | string | no | Street address |
| `employees` | number | no | Employee count |
| `linkedinUrl` | string | no | LinkedIn company URL |
| `xUrl` | string | no | X/Twitter URL |
| `annualRecurringRevenue` | number | no | ARR in dollars (converted to micros internally) |
| `idealCustomerProfile` | boolean | no | ICP flag |

### get_company
Retrieves a company by ID.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Company UUID |

### update_company
Updates an existing company. Same parameters as `create_company` plus required `id`.

### delete_company
Deletes a company.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Company UUID |

### search_companies
Searches companies by name or domain.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | yes | Search text |
| `limit` | number | no | Max results (default: 20) |

---

## Opportunity Management Tools

### create_opportunity
Creates a new deal/opportunity.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | yes | Opportunity name |
| `amount` | object | no | `{ value: number, currency: string }` (e.g. `{ value: 50000, currency: "USD" }`) |
| `stage` | string | no | Sales stage: `NEW`, `SCREENING`, `MEETING`, `PROPOSAL`, `CUSTOMER` |
| `closeDate` | string | no | Expected close date (ISO 8601) |
| `companyId` | string | no | Associated company UUID |
| `pointOfContactId` | string | no | Associated person UUID |

### get_opportunity
Retrieves an opportunity by ID.

### update_opportunity
Updates an existing opportunity. Same parameters as `create_opportunity` plus required `id`.

### delete_opportunity
Deletes an opportunity.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Opportunity UUID |

### search_opportunities
Search with filters.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | no | Name search |
| `stage` | string | no | Filter by stage |
| `minAmount` | number | no | Minimum deal value |
| `maxAmount` | number | no | Maximum deal value |
| `startDate` | string | no | Close date range start |
| `endDate` | string | no | Close date range end |
| `companyId` | string | no | Filter by company |
| `limit` | number | no | Max results (default: 20) |

### list_opportunities_by_stage
Returns all opportunities grouped by sales stage with totals. No parameters required.

---

## Activity Management Tools

### get_activities
Unified timeline of tasks and notes, sorted newest-first.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | array | no | Filter by `["task"]`, `["note"]`, or both |
| `dateFrom` | string | no | Start date (ISO 8601) |
| `dateTo` | string | no | End date (ISO 8601) |
| `authorId` | string | no | Filter by author/assignee |
| `limit` | number | no | Max results (default: 20) |

### filter_activities
Same as `get_activities` with additional `status` filter for tasks.

**Additional Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | array | no | Task status filter (e.g. `["TODO", "IN_PROGRESS"]`) |

### create_comment
Creates a comment on a CRM record.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `body` | string | yes | Comment content |
| `authorId` | string | no | Author UUID |
| `targetObjectId` | string | no | Target record UUID |
| `targetObjectType` | string | no | `person`, `company`, or `opportunity` |

> **v1.19 note:** Twenty v1.19 doesn't have a Comment entity. This tool creates a Note as a workaround.

### get_entity_activities
Gets activities related to a specific entity.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `entityId` | string | yes | Entity UUID |
| `entityType` | string | yes | `person`, `company`, or `opportunity` |
| `includeComments` | boolean | no | Include comments (default: true) |
| `limit` | number | no | Max results (default: 20) |

---

## Task Management Tools

### create_task
Creates a new task.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | yes | Task title |
| `body` | string | no | Task description (stored as BlockNote rich text internally) |
| `dueAt` | string | no | Due date (ISO 8601) |
| `status` | string | no | `TODO`, `IN_PROGRESS`, or `DONE` (default: `TODO`) |
| `assigneeId` | string | no | Assigned person UUID |

> **v1.19 note:** The `body` field is automatically converted to `bodyV2 { blocknote }` format.

### delete_task
Deletes a task.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Task UUID |

### get_tasks
Lists tasks.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `limit` | number | no | Max results (default: 20) |

---

## Note Management Tools

### create_note
Creates a note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `body` | string | yes | Note content (stored as BlockNote rich text internally) |
| `title` | string | no | Note title |
| `authorId` | string | no | Author UUID |

### delete_note
Deletes a note.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | yes | Note UUID |

---

## Relationship Management Tools

### get_company_contacts
Lists all people at a company.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `companyId` | string | yes | Company UUID |

### get_person_opportunities
Lists opportunities where a person is the point of contact.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `personId` | string | yes | Person UUID |

### link_opportunity_to_company
Links an opportunity to a company and/or contact.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `opportunityId` | string | yes | Opportunity UUID |
| `companyId` | string | no | Company UUID to link |
| `pointOfContactId` | string | no | Person UUID to set as point of contact |

### transfer_contact_to_company
Moves a contact from one company to another.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contactId` | string | yes | Contact UUID |
| `toCompanyId` | string | yes | Target company UUID |
| `fromCompanyId` | string | no | Current company UUID (for validation) |

### get_relationship_summary
Counts all relationships for a company or person.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `entityId` | string | yes | Entity UUID |
| `entityType` | string | yes | `company` or `person` |

### find_orphaned_records
Finds records missing important relationships: companies without contacts, contacts without companies. No parameters required.

---

## Metadata Discovery Tools

### list_all_objects
Lists all entity types in the workspace (standard + custom).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `includeCustom` | boolean | no | Include custom objects (default: true) |
| `includeSystem` | boolean | no | Include system objects (default: false) |
| `activeOnly` | boolean | no | Only active objects (default: true) |
| `groupBy` | string | no | `type` or `none` (default: `type`) |

### get_object_schema
Gets the full field list for an object type.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `objectName` | string | yes | Object name (singular or plural, e.g. `company` or `companies`) or UUID |
| `includeSystemFields` | boolean | no | Include system fields (default: false) |

### get_field_metadata
Gets detailed field info, optionally filtered.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `objectName` | string | no | Filter to a specific object |
| `fieldType` | string | no | Filter by type (e.g. `TEXT`, `NUMBER`, `RELATION`) |
| `includeCustom` | boolean | no | Include custom fields (default: true) |
| `includeSystem` | boolean | no | Include system fields (default: false) |
| `activeOnly` | boolean | no | Only active fields (default: true) |

---

## Schema Management Tools

*New in this fork. These tools modify the workspace schema.*

### create_custom_object
Creates a new entity type (e.g. Vehicle, Project, Listing).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `nameSingular` | string | yes | camelCase singular name (e.g. `vehicle`) |
| `namePlural` | string | yes | camelCase plural name (e.g. `vehicles`) |
| `labelSingular` | string | yes | Display label singular (e.g. `Vehicle`) |
| `labelPlural` | string | yes | Display label plural (e.g. `Vehicles`) |
| `description` | string | no | Object description |
| `icon` | string | no | Tabler icon name (e.g. `IconCar`) |

### update_custom_object
Updates an existing object's metadata.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `objectName` | string | yes | Object name or UUID |
| `labelSingular` | string | no | New singular label |
| `labelPlural` | string | no | New plural label |
| `description` | string | no | New description |
| `icon` | string | no | New icon |
| `isActive` | boolean | no | Activate/deactivate |

### delete_custom_object
Permanently removes a custom object and all its data.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `objectName` | string | yes | Object name or UUID |

> **Important:** Delete all relation fields on the object before deleting it, or the deletion will fail.

### create_custom_field
Adds a field to any object.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `objectName` | string | yes | Target object name or UUID |
| `name` | string | yes | camelCase field name (e.g. `vinNumber`) |
| `label` | string | yes | Display label (e.g. `VIN Number`) |
| `type` | string | yes | Field type (see below) |
| `description` | string | no | Field description |
| `icon` | string | no | Icon name |
| `isNullable` | boolean | no | Allow empty values (default: true) |
| `defaultValue` | any | no | Default value (JSON) |
| `options` | array | no | Options for SELECT/MULTI_SELECT (see below) |

**Supported field types:** `TEXT`, `NUMBER`, `BOOLEAN`, `DATE_TIME`, `DATE`, `PHONE`, `EMAIL`, `CURRENCY`, `LINK`, `LINKS`, `ADDRESS`, `RATING`, `SELECT`, `MULTI_SELECT`, `RICH_TEXT`, `POSITION`, `RAW_JSON`

**SELECT/MULTI_SELECT options format:**
```json
[
  {"label": "Hot", "value": "HOT", "color": "red"},
  {"label": "Warm", "value": "WARM", "color": "yellow"},
  {"label": "Cold", "value": "COLD", "color": "blue"}
]
```
Position is auto-added based on array order. Available colors: `green`, `blue`, `red`, `yellow`, `purple`, `orange`, `pink`, `gray`.

### update_custom_field
Updates a field's metadata.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fieldId` | string | yes | Field UUID |
| `label` | string | no | New label |
| `description` | string | no | New description |
| `icon` | string | no | New icon |
| `isActive` | boolean | no | Activate/deactivate |
| `defaultValue` | any | no | New default value |
| `options` | any | no | Updated SELECT/MULTI_SELECT options |

### delete_custom_field
Permanently removes a field from all records.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fieldId` | string | yes | Field UUID |

### create_relation_field
Links two objects together. Creates fields on both sides of the relation.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fromObjectName` | string | yes | Source object name or UUID |
| `fromFieldName` | string | yes | camelCase field name on source (e.g. `ownerCompany`) |
| `fromFieldLabel` | string | yes | Label on source (e.g. `Owner Company`) |
| `toObjectName` | string | yes | Target object name or UUID |
| `toFieldName` | string | yes | camelCase field name on target (e.g. `ownedVehicles`) |
| `toFieldLabel` | string | yes | Label on target (e.g. `Owned Vehicles`) |
| `relationType` | string | yes | `ONE_TO_MANY`, `MANY_TO_ONE`, or `MANY_TO_MANY` |
| `description` | string | no | Relation description |
| `icon` | string | no | Icon on source field |
| `toIcon` | string | no | Icon on target field |

**Example: Link Vehicles to Companies**
```
fromObjectName: "vehicle"
fromFieldName: "ownerCompany"
fromFieldLabel: "Owner Company"
toObjectName: "company"
toFieldName: "ownedVehicles"
toFieldLabel: "Owned Vehicles"
relationType: "MANY_TO_ONE"
```
This creates a `ownerCompany` relation on Vehicle (many vehicles -> one company) and an `ownedVehicles` relation on Company (one company -> many vehicles).
