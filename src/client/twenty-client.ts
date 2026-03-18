import { GraphQLClient } from 'graphql-request';
import { TwentyConfig, Person, Company, Task, Note, SearchOptions } from '../types/twenty.js';
import { Opportunity, CreateOpportunityInput, UpdateOpportunityInput, SearchOpportunitiesInput } from '../types/opportunities.js';
import { Activity, Comment, CreateCommentInput, ActivityFilter, EntityActivitiesInput, ActivityTimeline } from '../types/activities.js';
import { ObjectMetadata, FieldMetadata, ObjectSchema, ObjectSummary, MetadataQueryOptions, FieldQueryOptions } from '../types/metadata.js';
import { 
  RelationshipSummary, 
  CompanyContactsResult, 
  PersonOpportunitiesResult, 
  OpportunityActivitiesResult,
  RelationshipHierarchy,
  OrphanedRecords,
  LinkOpportunityInput,
  TransferContactInput,
  BulkRelationshipUpdate
} from '../types/relationships.js';

export class TwentyClient {
  private client: GraphQLClient;
  private baseUrl: string;
  private apiKey: string;

  constructor(config: TwentyConfig) {
    this.baseUrl = config.baseUrl || 'https://api.twenty.com';
    this.apiKey = config.apiKey;
    this.client = new GraphQLClient(`${this.baseUrl}/graphql`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createPerson(person: Person): Promise<Person> {
    const mutation = `
      mutation CreatePerson($data: PersonCreateInput!) {
        createPerson(data: $data) {
          id
          name {
            firstName
            lastName
          }
          emails {
            primaryEmail
          }
          phones {
            primaryPhoneNumber
            primaryPhoneCountryCode
          }
          companyId
          jobTitle
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
          }
          city
          avatarUrl
        }
      }
    `;

    const result = await this.client.request(mutation, { data: person }) as { createPerson: Person };
    return result.createPerson;
  }

  async getPerson(id: string): Promise<Person> {
    const query = `
      query GetPerson($filter: PersonFilterInput!) {
        people(filter: $filter) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
              emails {
                primaryEmail
              }
              phones {
                primaryPhoneNumber
                primaryPhoneCountryCode
              }
              companyId
              jobTitle
              linkedinLink {
                primaryLinkUrl
                primaryLinkLabel
              }
              city
              avatarUrl
            }
          }
        }
      }
    `;

    const result = await this.client.request(query, { filter: { id: { eq: id } } }) as { people: { edges: { node: Person }[] } };
    return result.people.edges[0]?.node;
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    const mutation = `
      mutation UpdatePerson($id: UUID!, $data: PersonUpdateInput!) {
        updatePerson(id: $id, data: $data) {
          id
          name {
            firstName
            lastName
          }
          emails {
            primaryEmail
          }
          phones {
            primaryPhoneNumber
            primaryPhoneCountryCode
          }
          companyId
          jobTitle
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
          }
          city
          avatarUrl
        }
      }
    `;

    const result = await this.client.request(mutation, { id, data: updates }) as { updatePerson: Person };
    return result.updatePerson;
  }

  async deletePerson(id: string): Promise<{ id: string }> {
    const mutation = `
      mutation DeletePerson($id: UUID!) {
        deletePerson(id: $id) { id }
      }
    `;
    const result = await this.client.request(mutation, { id }) as { deletePerson: { id: string } };
    return result.deletePerson;
  }

  async searchPeople(query: string, options: SearchOptions = {}): Promise<Person[]> {
    const searchQuery = `
      query SearchPeople($filter: PersonFilterInput, $first: Int, $after: String) {
        people(filter: $filter, first: $first, after: $after) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
              emails {
                primaryEmail
              }
              phones {
                primaryPhoneNumber
                primaryPhoneCountryCode
              }
              companyId
              jobTitle
              linkedinLink {
                primaryLinkUrl
                primaryLinkLabel
              }
              city
              avatarUrl
            }
          }
        }
      }
    `;

    const filter = {
      or: [
        { name: { firstName: { ilike: `%${query}%` } } },
        { name: { lastName: { ilike: `%${query}%` } } },
        { emails: { primaryEmail: { ilike: `%${query}%` } } }
      ]
    };

    const result = await this.client.request(searchQuery, {
      filter,
      first: options.limit || 20,
    }) as { people: { edges: { node: Person }[] } };

    return result.people.edges.map(edge => edge.node);
  }

  async createCompany(company: Company): Promise<Company> {
    const mutation = `
      mutation CreateCompany($data: CompanyCreateInput!) {
        createCompany(data: $data) {
          id
          name
          domainName {
            primaryLinkUrl
            primaryLinkLabel
          }
          address {
            addressStreet1
            addressCity
            addressState
            addressCountry
            addressPostcode
          }
          employees
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
          }
          xLink {
            primaryLinkUrl
            primaryLinkLabel
          }
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          idealCustomerProfile
        }
      }
    `;

    const result = await this.client.request(mutation, { data: company }) as { createCompany: Company };
    return result.createCompany;
  }

  async getCompany(id: string): Promise<Company> {
    const query = `
      query GetCompany($filter: CompanyFilterInput!) {
        companies(filter: $filter) {
          edges {
            node {
              id
              name
              domainName {
                primaryLinkUrl
                primaryLinkLabel
              }
              address {
                addressStreet1
                addressCity
                addressState
                addressCountry
                addressPostcode
              }
              employees
              linkedinLink {
                primaryLinkUrl
                primaryLinkLabel
              }
              xLink {
                primaryLinkUrl
                primaryLinkLabel
              }
              annualRecurringRevenue {
                amountMicros
                currencyCode
              }
              idealCustomerProfile
            }
          }
        }
      }
    `;

    const result = await this.client.request(query, { filter: { id: { eq: id } } }) as { companies: { edges: { node: Company }[] } };
    return result.companies.edges[0]?.node;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    const mutation = `
      mutation UpdateCompany($id: UUID!, $data: CompanyUpdateInput!) {
        updateCompany(id: $id, data: $data) {
          id
          name
          domainName {
            primaryLinkUrl
            primaryLinkLabel
          }
          address {
            addressStreet1
            addressCity
            addressState
            addressCountry
            addressPostcode
          }
          employees
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
          }
          xLink {
            primaryLinkUrl
            primaryLinkLabel
          }
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          idealCustomerProfile
        }
      }
    `;

    const result = await this.client.request(mutation, { id, data: updates }) as { updateCompany: Company };
    return result.updateCompany;
  }

  async deleteCompany(id: string): Promise<{ id: string }> {
    const mutation = `
      mutation DeleteCompany($id: UUID!) {
        deleteCompany(id: $id) { id }
      }
    `;
    const result = await this.client.request(mutation, { id }) as { deleteCompany: { id: string } };
    return result.deleteCompany;
  }

  async searchCompanies(query: string, options: SearchOptions = {}): Promise<Company[]> {
    const searchQuery = `
      query SearchCompanies($filter: CompanyFilterInput, $first: Int, $after: String) {
        companies(filter: $filter, first: $first, after: $after) {
          edges {
            node {
              id
              name
              domainName {
                primaryLinkUrl
                primaryLinkLabel
              }
              address {
                addressStreet1
                addressCity
                addressState
                addressCountry
                addressPostcode
              }
              employees
              linkedinLink {
                primaryLinkUrl
                primaryLinkLabel
              }
              xLink {
                primaryLinkUrl
                primaryLinkLabel
              }
              annualRecurringRevenue {
                amountMicros
                currencyCode
              }
              idealCustomerProfile
            }
          }
        }
      }
    `;

    const filter = {
      or: [
        { name: { ilike: `%${query}%` } },
        { domainName: { primaryLinkUrl: { ilike: `%${query}%` } } }
      ]
    };

    const result = await this.client.request(searchQuery, {
      filter,
      first: options.limit || 20,
    }) as { companies: { edges: { node: Company }[] } };

    return result.companies.edges.map(edge => edge.node);
  }

  async createTask(task: Task): Promise<Task> {
    const mutation = `
      mutation CreateTask($data: TaskCreateInput!) {
        createTask(data: $data) {
          id
          title
          bodyV2 { blocknote }
          dueAt
          status
          assigneeId
        }
      }
    `;

    // Transform body to bodyV2 format
    const taskData = { ...task } as any;
    if (taskData.body) {
      taskData.bodyV2 = { blocknote: taskData.body };
      delete taskData.body;
    }

    const result = await this.client.request(mutation, { data: taskData }) as { createTask: any };
    const created = result.createTask;
    created.body = created.bodyV2?.blocknote || '';
    return created;
  }

  async getTasks(options: SearchOptions = {}): Promise<Task[]> {
    const query = `
      {
        tasks {
          edges {
            node {
              id
              title
              bodyV2 { blocknote }
              status
            }
          }
        }
      }
    `;

    const result = await this.client.request(query) as { tasks: { edges: { node: any }[] } };

    return result.tasks.edges.map(edge => {
      const node = edge.node;
      node.body = node.bodyV2?.blocknote || '';
      return node;
    });
  }

  async deleteTask(id: string): Promise<{ id: string }> {
    const mutation = `
      mutation DeleteTask($id: UUID!) {
        deleteTask(id: $id) { id }
      }
    `;
    const result = await this.client.request(mutation, { id }) as { deleteTask: { id: string } };
    return result.deleteTask;
  }

  async createNote(note: Note): Promise<Note> {
    const mutation = `
      mutation CreateNote($data: NoteCreateInput!) {
        createNote(data: $data) {
          id
          title
          bodyV2 { blocknote }
        }
      }
    `;

    // Transform body to bodyV2 format
    const noteData = { ...note } as any;
    if (noteData.body) {
      noteData.bodyV2 = { blocknote: noteData.body };
      delete noteData.body;
    }

    const result = await this.client.request(mutation, { data: noteData }) as { createNote: any };
    const created = result.createNote;
    created.body = created.bodyV2?.blocknote || '';
    return created;
  }

  async deleteNote(id: string): Promise<{ id: string }> {
    const mutation = `
      mutation DeleteNote($id: UUID!) {
        deleteNote(id: $id) { id }
      }
    `;
    const result = await this.client.request(mutation, { id }) as { deleteNote: { id: string } };
    return result.deleteNote;
  }

  async createOpportunity(opportunity: CreateOpportunityInput): Promise<Opportunity> {
    const mutation = `
      mutation CreateOpportunity($data: OpportunityCreateInput!) {
        createOpportunity(data: $data) {
          id
          name
          amount {
            amountMicros
            currencyCode
          }
          stage
          closeDate
          companyId
          pointOfContactId
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.client.request(mutation, { data: opportunity }) as { createOpportunity: Opportunity };
    return result.createOpportunity;
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    const query = `
      query GetOpportunity($filter: OpportunityFilterInput!) {
        opportunities(filter: $filter) {
          edges {
            node {
              id
              name
              amount {
                amountMicros
                currencyCode
              }
              stage
              closeDate
              companyId
              pointOfContactId
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const result = await this.client.request(query, { filter: { id: { eq: id } } }) as { opportunities: { edges: { node: Opportunity }[] } };
    return result.opportunities.edges[0]?.node;
  }

  async updateOpportunity(input: UpdateOpportunityInput): Promise<Opportunity> {
    const { id, ...data } = input;
    const mutation = `
      mutation UpdateOpportunity($id: UUID!, $data: OpportunityUpdateInput!) {
        updateOpportunity(id: $id, data: $data) {
          id
          name
          amount {
            amountMicros
            currencyCode
          }
          stage
          closeDate
          companyId
          pointOfContactId
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.client.request(mutation, { id, data }) as { updateOpportunity: Opportunity };
    return result.updateOpportunity;
  }

  async deleteOpportunity(id: string): Promise<{ id: string }> {
    const mutation = `
      mutation DeleteOpportunity($id: UUID!) {
        deleteOpportunity(id: $id) { id }
      }
    `;
    const result = await this.client.request(mutation, { id }) as { deleteOpportunity: { id: string } };
    return result.deleteOpportunity;
  }

  async searchOpportunities(input: SearchOpportunitiesInput): Promise<Opportunity[]> {
    const query = `
      query SearchOpportunities($filter: OpportunityFilterInput, $first: Int) {
        opportunities(filter: $filter, first: $first) {
          edges {
            node {
              id
              name
              amount {
                amountMicros
                currencyCode
              }
              stage
              closeDate
              companyId
              pointOfContactId
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const filters: any = {};
    
    if (input.query) {
      filters.name = { ilike: `%${input.query}%` };
    }
    
    if (input.stage) {
      filters.stage = { eq: input.stage };
    }
    
    if (input.companyId) {
      filters.companyId = { eq: input.companyId };
    }
    
    if (input.startDate || input.endDate) {
      filters.closeDate = {};
      if (input.startDate) filters.closeDate.gte = input.startDate;
      if (input.endDate) filters.closeDate.lte = input.endDate;
    }
    
    if (input.minAmount || input.maxAmount) {
      filters.amount = { amountMicros: {} };
      if (input.minAmount) filters.amount.amountMicros.gte = input.minAmount * 1000000;
      if (input.maxAmount) filters.amount.amountMicros.lte = input.maxAmount * 1000000;
    }

    const result = await this.client.request(query, {
      filter: Object.keys(filters).length > 0 ? filters : undefined,
      first: input.limit || 20,
    }) as { opportunities: { edges: { node: Opportunity }[] } };

    return result.opportunities.edges.map(edge => edge.node);
  }

  async listOpportunitiesByStage(): Promise<Record<string, Opportunity[]>> {
    const query = `
      query ListAllOpportunities {
        opportunities(first: 100) {
          edges {
            node {
              id
              name
              amount {
                amountMicros
                currencyCode
              }
              stage
              closeDate
              companyId
              pointOfContactId
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const result = await this.client.request(query) as { opportunities: { edges: { node: Opportunity }[] } };
    const opportunities = result.opportunities.edges.map(edge => edge.node);
    
    // Group by stage
    const groupedByStage: Record<string, Opportunity[]> = {};
    opportunities.forEach(opp => {
      const stage = opp.stage || 'No Stage';
      if (!groupedByStage[stage]) {
        groupedByStage[stage] = [];
      }
      groupedByStage[stage].push(opp);
    });
    
    return groupedByStage;
  }

  async getActivities(filter?: ActivityFilter): Promise<ActivityTimeline> {
    // Get both tasks and notes as activities
    const tasksQuery = `
      query GetTasks($first: Int) {
        tasks(first: $first, orderBy: { createdAt: DescNullsLast }) {
          edges {
            node {
              id
              title
              bodyV2 { blocknote }
              status
              dueAt
              assigneeId
              assignee {
                id
                name {
                  firstName
                  lastName
                }
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const notesQuery = `
      query GetNotes($first: Int) {
        notes(first: $first, orderBy: { createdAt: DescNullsLast }) {
          edges {
            node {
              id
              title
              bodyV2 { blocknote }
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const limit = filter?.limit || 20;

    const [tasksResult, notesResult] = await Promise.all([
      this.client.request(tasksQuery, { first: limit }),
      this.client.request(notesQuery, { first: limit })
    ]);
    
    const typedTasksResult = tasksResult as { tasks: { edges: { node: any }[] } };
    const typedNotesResult = notesResult as { notes: { edges: { node: any }[] } };

    // Transform and combine activities
    const activities: Activity[] = [];

    typedTasksResult.tasks.edges.forEach(edge => {
      const task = edge.node;
      activities.push({
        id: task.id,
        type: 'task',
        title: task.title,
        body: task.bodyV2?.blocknote || '',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        authorId: task.assigneeId,
        author: task.assignee
      });
    });

    typedNotesResult.notes.edges.forEach(edge => {
      const note = edge.node;
      activities.push({
        id: note.id,
        type: 'note',
        title: note.title,
        body: note.bodyV2?.blocknote || '',
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        authorId: undefined,
        author: undefined
      });
    });

    // Sort by creation date (newest first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply filters
    let filteredActivities = activities;
    
    if (filter?.type && filter.type.length > 0) {
      filteredActivities = filteredActivities.filter(activity => filter.type!.includes(activity.type));
    }
    
    if (filter?.dateFrom) {
      filteredActivities = filteredActivities.filter(activity => 
        new Date(activity.createdAt) >= new Date(filter.dateFrom!)
      );
    }
    
    if (filter?.dateTo) {
      filteredActivities = filteredActivities.filter(activity => 
        new Date(activity.createdAt) <= new Date(filter.dateTo!)
      );
    }
    
    if (filter?.authorId) {
      filteredActivities = filteredActivities.filter(activity => activity.authorId === filter.authorId);
    }

    return {
      activities: filteredActivities,
      totalCount: filteredActivities.length,
      hasMore: filteredActivities.length === limit
    };
  }

  async filterActivities(filter: ActivityFilter): Promise<Activity[]> {
    const timeline = await this.getActivities(filter);
    return timeline.activities;
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    // Twenty v1.19 doesn't support Comment via GraphQL.
    // Creating a Note as a workaround.
    const mutation = `
      mutation CreateNoteAsComment($data: NoteCreateInput!) {
        createNote(data: $data) {
          id
          title
          bodyV2 { blocknote }
          createdAt
          updatedAt
        }
      }
    `;

    const noteData = {
      title: 'Comment',
      bodyV2: { blocknote: input.body },
    };

    const result = await this.client.request(mutation, { data: noteData }) as { createNote: any };
    const note = result.createNote;
    return {
      id: note.id,
      body: note.bodyV2?.blocknote || '',
      authorId: input.authorId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    } as Comment;
  }

  async getEntityActivities(input: EntityActivitiesInput): Promise<ActivityTimeline> {
    // For now, we'll get general activities and filter client-side
    // In a real implementation, you'd want to use the entity relationships in the GraphQL query
    const activities = await this.getActivities({
      limit: input.limit,
      offset: input.offset
    });

    // Note: This is a simplified implementation. In practice, you'd want to query
    // activities that are specifically related to the entity through proper GraphQL relationships
    return activities;
  }

  private metadataClient: GraphQLClient | null = null;

  private getMetadataClient(): GraphQLClient {
    if (!this.metadataClient) {
      this.metadataClient = new GraphQLClient(`${this.baseUrl}/metadata`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    }
    return this.metadataClient;
  }

  private async fetchMetadataObjects(): Promise<any[]> {
    const query = `
      query {
        objects(paging: { first: 100 }) {
          edges {
            node {
              id
              nameSingular
              namePlural
              labelSingular
              labelPlural
              description
              icon
              isCustom
              isActive
              isSystem
              createdAt
              updatedAt
            }
          }
        }
      }
    `;
    const result = await this.getMetadataClient().request(query) as { objects: { edges: { node: any }[] } };
    return result.objects.edges.map(edge => edge.node);
  }

  async listAllObjects(options: MetadataQueryOptions = {}): Promise<ObjectSummary> {
    const allObjects = await this.fetchMetadataObjects();

    // Filter based on options
    let filteredObjects = allObjects;

    if (options.activeOnly !== false) {
      filteredObjects = filteredObjects.filter(obj => obj.isActive);
    }

    if (options.includeCustom === false) {
      filteredObjects = filteredObjects.filter(obj => !obj.isCustom);
    }

    if (options.includeSystem === false) {
      filteredObjects = filteredObjects.filter(obj => !obj.isSystem);
    }

    // Group objects by type
    const standard = filteredObjects.filter(obj => !obj.isCustom && !obj.isSystem);
    const custom = filteredObjects.filter(obj => obj.isCustom);
    const system = filteredObjects.filter(obj => obj.isSystem);

    return {
      standard,
      custom,
      system,
      totalCount: filteredObjects.length,
      standardCount: standard.length,
      customCount: custom.length,
      systemCount: system.length
    };
  }

  async getObjectSchema(objectNameOrId: string): Promise<ObjectSchema> {
    const allObjects = await this.fetchMetadataObjects();

    // Try to find object by name or ID
    const objectNode = allObjects.find((obj: any) => {
      if (objectNameOrId.match(/^[0-9a-fA-F-]{36}$/)) {
        return obj.id === objectNameOrId;
      }
      return obj.nameSingular === objectNameOrId || obj.namePlural === objectNameOrId;
    });

    if (!objectNode) {
      throw new Error(`Object not found: ${objectNameOrId}`);
    }

    // Fetch fields for this specific object via metadata GraphQL
    const fieldsQuery = `
      query GetFields($id: UUID!) {
        object(id: $id) {
          fields(paging: { first: 200 }) {
            edges {
              node {
                id
                name
                label
                description
                type
                isCustom
                isActive
                isNullable
                isSystem
                defaultValue
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    let fields: FieldMetadata[] = [];
    try {
      const fieldsResult = await this.getMetadataClient().request(fieldsQuery, { id: objectNode.id }) as any;
      fields = fieldsResult.object?.fields?.edges?.map((e: any) => e.node) || [];
    } catch {
      // Fields fetch failed, return empty
    }

    return {
      object: {
        id: objectNode.id,
        nameSingular: objectNode.nameSingular,
        namePlural: objectNode.namePlural,
        labelSingular: objectNode.labelSingular,
        labelPlural: objectNode.labelPlural,
        description: objectNode.description,
        icon: objectNode.icon,
        isCustom: objectNode.isCustom,
        isActive: objectNode.isActive,
        isSystem: objectNode.isSystem,
        createdAt: objectNode.createdAt,
        updatedAt: objectNode.updatedAt,
        fields
      },
      fields,
      relationships: [] // TODO: Implement relationship discovery
    };
  }

  async getFieldMetadata(options: FieldQueryOptions = {}): Promise<FieldMetadata[]> {
    let fields: FieldMetadata[] = [];

    if (options.objectId || options.objectName) {
      // Get fields for a specific object via REST metadata
      const allObjects = await this.fetchMetadataObjects();
      const targetObject = allObjects.find((obj: any) => {
        if (options.objectId) return obj.id === options.objectId;
        return obj.nameSingular === options.objectName || obj.namePlural === options.objectName;
      });

      if (!targetObject) {
        throw new Error(`Object not found: ${options.objectId || options.objectName}`);
      }

      const fieldsQuery = `
        query GetFields($id: UUID!) {
          object(id: $id) {
            fields(paging: { first: 200 }) {
              edges {
                node {
                  id
                  name
                  label
                  description
                  type
                  isCustom
                  isActive
                  isNullable
                  isSystem
                  defaultValue
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `;
      try {
        const result = await this.getMetadataClient().request(fieldsQuery, { id: targetObject.id }) as any;
        fields = result.object?.fields?.edges?.map((e: any) => e.node) || [];
      } catch {
        // Fields fetch failed
      }
    } else {
      // Get all fields across all objects
      const allObjects = await this.fetchMetadataObjects();
      for (const obj of allObjects) {
        if (obj.fields) {
          fields = fields.concat(obj.fields);
        }
      }
    }

    // Apply filters
    let filteredFields = fields;

    if (options.activeOnly !== false) {
      filteredFields = filteredFields.filter(field => field.isActive);
    }

    if (options.includeCustom === false) {
      filteredFields = filteredFields.filter(field => !field.isCustom);
    }

    if (options.includeSystem === false) {
      filteredFields = filteredFields.filter(field => !field.isSystem);
    }

    if (options.fieldType) {
      filteredFields = filteredFields.filter(field => field.type === options.fieldType);
    }

    return filteredFields;
  }

  // Schema Management Methods

  async createCustomObject(input: {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
    description?: string;
    icon?: string;
  }): Promise<any> {
    const mutation = `
      mutation CreateObject($input: CreateOneObjectInput!) {
        createOneObject(input: $input) {
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
          description
          icon
          isCustom
          isActive
        }
      }
    `;

    const result = await this.getMetadataClient().request(mutation, {
      input: { object: input },
    }) as any;
    return result.createOneObject;
  }

  async updateCustomObject(id: string, update: {
    labelSingular?: string;
    labelPlural?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  }): Promise<any> {
    const mutation = `
      mutation UpdateObject($input: UpdateOneObjectInput!) {
        updateOneObject(input: $input) {
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
          description
          icon
          isActive
        }
      }
    `;

    const result = await this.getMetadataClient().request(mutation, {
      input: { id, update },
    }) as any;
    return result.updateOneObject;
  }

  async deleteCustomObject(id: string): Promise<any> {
    const mutation = `
      mutation DeleteObject($input: DeleteOneObjectInput!) {
        deleteOneObject(input: $input) {
          id
          nameSingular
        }
      }
    `;

    const result = await this.getMetadataClient().request(mutation, {
      input: { id },
    }) as any;
    return result.deleteOneObject;
  }

  async createCustomField(input: {
    objectMetadataId: string;
    name: string;
    label: string;
    type: string;
    description?: string;
    icon?: string;
    isNullable?: boolean;
    defaultValue?: any;
    options?: any;
  }): Promise<any> {
    const mutation = `
      mutation CreateField($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) {
          id
          name
          label
          type
          description
          icon
          isCustom
          isActive
          isNullable
          defaultValue
        }
      }
    `;

    // Auto-add position to SELECT/MULTI_SELECT options if not present
    const fieldData = { ...input };
    // Parse options if passed as JSON string
    if (fieldData.options && typeof fieldData.options === 'string') {
      try { fieldData.options = JSON.parse(fieldData.options); } catch { /* leave as-is */ }
    }
    if (fieldData.options && Array.isArray(fieldData.options)) {
      fieldData.options = fieldData.options.map((opt: any, idx: number) => ({
        ...opt,
        position: opt.position ?? idx,
      }));
    }

    const result = await this.getMetadataClient().request(mutation, {
      input: { field: fieldData },
    }) as any;
    return result.createOneField;
  }

  async updateCustomField(id: string, update: {
    label?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
    defaultValue?: any;
    options?: any;
  }): Promise<any> {
    const mutation = `
      mutation UpdateField($input: UpdateOneFieldMetadataInput!) {
        updateOneField(input: $input) {
          id
          name
          label
          type
          description
          icon
          isActive
          defaultValue
        }
      }
    `;

    const result = await this.getMetadataClient().request(mutation, {
      input: { id, update },
    }) as any;
    return result.updateOneField;
  }

  async deleteCustomField(id: string): Promise<any> {
    const mutation = `
      mutation DeleteField($input: DeleteOneFieldInput!) {
        deleteOneField(input: $input) {
          id
          name
        }
      }
    `;

    const result = await this.getMetadataClient().request(mutation, {
      input: { id },
    }) as any;
    return result.deleteOneField;
  }

  async createRelationField(input: {
    objectMetadataId: string;
    name: string;
    label: string;
    description?: string;
    icon?: string;
    relationType: string; // ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY
    targetObjectMetadataId: string;
    targetFieldLabel: string;
    targetFieldIcon?: string;
  }): Promise<any> {
    const mutation = `
      mutation CreateRelationField($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) {
          id
          name
          label
          type
          description
          isCustom
          isActive
        }
      }
    `;

    const result = await this.getMetadataClient().request(mutation, {
      input: {
        field: {
          objectMetadataId: input.objectMetadataId,
          name: input.name,
          label: input.label,
          type: 'RELATION',
          description: input.description,
          icon: input.icon,
          relationCreationPayload: {
            type: input.relationType,
            targetObjectMetadataId: input.targetObjectMetadataId,
            targetFieldLabel: input.targetFieldLabel,
            targetFieldIcon: input.targetFieldIcon || '',
          },
        },
      },
    }) as any;
    return result.createOneField;
  }

  // Relationship Management Methods

  async getCompanyContacts(companyId: string): Promise<CompanyContactsResult> {
    const query = `
      query GetCompanyContacts($companyId: UUID!) {
        companies(filter: { id: { eq: $companyId } }) {
          edges {
            node {
              id
              name
            }
          }
        }
        people(filter: { companyId: { eq: $companyId } }, first: 100) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
              emails {
                primaryEmail
              }
              phones {
                primaryPhoneNumber
              }
              jobTitle
              createdAt
            }
          }
        }
      }
    `;

    const result = await this.client.request(query, { companyId }) as any;
    
    const contacts = result.people.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      email: edge.node.emails?.primaryEmail,
      phone: edge.node.phones?.primaryPhoneNumber,
      jobTitle: edge.node.jobTitle,
      createdAt: edge.node.createdAt
    }));

    return {
      companyId,
      companyName: result.companies?.edges?.[0]?.node?.name || 'Unknown Company',
      contacts,
      totalContacts: contacts.length
    };
  }

  async getPersonOpportunities(personId: string): Promise<PersonOpportunitiesResult> {
    const query = `
      query GetPersonOpportunities($personId: UUID!) {
        people(filter: { id: { eq: $personId } }) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
            }
          }
        }
        opportunities(filter: { pointOfContactId: { eq: $personId } }, first: 100) {
          edges {
            node {
              id
              name
              amount {
                amountMicros
                currencyCode
              }
              stage
              closeDate
              companyId
              company {
                id
                name
              }
              createdAt
            }
          }
        }
      }
    `;

    const result = await this.client.request(query, { personId }) as any;
    
    const opportunities = result.opportunities.edges.map((edge: any) => edge.node);
    const person = result.people?.edges?.[0]?.node;

    return {
      personId,
      personName: person ? `${person.name.firstName} ${person.name.lastName}` : 'Unknown Person',
      opportunities,
      totalOpportunities: opportunities.length
    };
  }

  async linkOpportunityToCompany(input: LinkOpportunityInput): Promise<any> {
    const mutation = `
      mutation LinkOpportunity($id: UUID!, $data: OpportunityUpdateInput!) {
        updateOpportunity(id: $id, data: $data) {
          id
          name
          companyId
          pointOfContactId
          company {
            id
            name
          }
          pointOfContact {
            id
            name {
              firstName
              lastName
            }
          }
        }
      }
    `;

    const updateData: any = {};
    if (input.companyId) updateData.companyId = input.companyId;
    if (input.pointOfContactId) updateData.pointOfContactId = input.pointOfContactId;

    const result = await this.client.request(mutation, {
      id: input.opportunityId,
      data: updateData
    }) as { updateOpportunity: any };

    return result.updateOpportunity;
  }

  async transferContactToCompany(input: TransferContactInput): Promise<any> {
    const mutation = `
      mutation TransferContact($id: UUID!, $data: PersonUpdateInput!) {
        updatePerson(id: $id, data: $data) {
          id
          name {
            firstName
            lastName
          }
          companyId
          company {
            id
            name
          }
        }
      }
    `;

    const result = await this.client.request(mutation, {
      id: input.contactId,
      data: { companyId: input.toCompanyId }
    }) as { updatePerson: any };

    return result.updatePerson;
  }

  async getRelationshipSummary(entityId: string, entityType: string): Promise<RelationshipSummary> {
    let counts = {
      companies: 0,
      contacts: 0,
      opportunities: 0,
      tasks: 0,
      activities: 0
    };

    try {
      switch (entityType.toLowerCase()) {
        case 'company':
          // Get contacts for this company
          const companyContacts = await this.getCompanyContacts(entityId);
          counts.contacts = companyContacts.totalContacts;
          
          // Get opportunities for this company
          const companyOpps = await this.searchOpportunities({ companyId: entityId, limit: 1000 });
          counts.opportunities = companyOpps.length;
          break;
          
        case 'person':
          // Get opportunities for this person
          const personOpps = await this.getPersonOpportunities(entityId);
          counts.opportunities = personOpps.totalOpportunities;
          
          // Get tasks assigned to this person (would need a specific query for filtering)
          // For now, we'll skip task counting as it requires a filtered query
          counts.tasks = 0;
          break;
      }
    } catch (error) {
      console.warn('Error calculating relationship summary:', error);
    }

    return {
      entityId,
      entityType,
      relationships: counts
    };
  }

  async findOrphanedRecords(): Promise<OrphanedRecords> {
    const orphaned: OrphanedRecords = {
      companies: [],
      contacts: [],
      opportunities: [],
      tasks: []
    };

    try {
      // Find companies with no contacts
      const companiesQuery = `
        query GetCompaniesWithContacts {
          companies(first: 1000) {
            edges {
              node {
                id
                name
                people {
                  totalCount
                }
                opportunities {
                  totalCount
                }
              }
            }
          }
        }
      `;

      const companiesResult = await this.client.request(companiesQuery) as any;
      orphaned.companies = companiesResult.companies.edges
        .map((edge: any) => edge.node)
        .filter((company: any) => company.people.totalCount === 0)
        .map((company: any) => ({
          id: company.id,
          name: company.name,
          contactCount: 0,
          opportunityCount: company.opportunities.totalCount
        }));

      // Find contacts without companies
      const contactsQuery = `
        query GetContactsWithoutCompanies {
          people(filter: { companyId: { is: "NULL" } }, first: 1000) {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
                companyId
                opportunities {
                  totalCount
                }
              }
            }
          }
        }
      `;

      const contactsResult = await this.client.request(contactsQuery) as any;
      orphaned.contacts = contactsResult.people.edges.map((edge: any) => ({
        id: edge.node.id,
        name: `${edge.node.name.firstName} ${edge.node.name.lastName}`,
        hasCompany: !!edge.node.companyId,
        opportunityCount: edge.node.opportunities.totalCount
      }));

    } catch (error) {
      console.warn('Error finding orphaned records:', error);
    }

    return orphaned;
  }
}