#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create MCP server
const server = new Server(
  {
    name: 'supabase-business-terms',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'describe_schema',
        description: 'Get database schema information for all tables',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'describe_table',
        description: 'Get detailed schema information for a specific table',
        inputSchema: {
          type: 'object',
          properties: {
            table_name: {
              type: 'string',
              description: 'The name of the table to describe',
            },
          },
          required: ['table_name'],
        },
      },
      {
        name: 'run_sql_query',
        description: 'Execute a SQL query (read-only SELECT queries only for safety)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The SQL query to execute (SELECT statements only)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'create_table',
        description: 'Create a new table with specified schema',
        inputSchema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'The CREATE TABLE SQL statement',
            },
          },
          required: ['sql'],
        },
      },
      {
        name: 'seed_initial_data',
        description: 'Insert initial data into business_terms table',
        inputSchema: {
          type: 'object',
          properties: {
            terms: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of business terms to insert',
            },
          },
          required: ['terms'],
        },
      },
    ],
  };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'describe_schema': {
        // Get all tables by trying to query business_terms
        const { data, error } = await supabase
          .from('business_terms')
          .select('*')
          .limit(0);

        if (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ 
                  message: 'No business_terms table found. Need to create it first.',
                  error: error.message
                }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                message: 'business_terms table exists',
                table_found: true
              }),
            },
          ],
        };
      }

      case 'describe_table': {
        const { table_name } = args as { table_name: string };

        // Get column information
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', table_name)
          .eq('table_schema', 'public');

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                table: table_name,
                columns: data 
              }),
            },
          ],
        };
      }

      case 'run_sql_query': {
        const { query } = args as { query: string };

        // Security check: only allow SELECT queries
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
          throw new Error('Only SELECT queries are allowed for safety');
        }

        const { data, error } = await supabase.rpc('execute_sql', { 
          query: query 
        });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                query,
                result: data 
              }),
            },
          ],
        };
      }

      case 'create_table': {
        const { sql } = args as { sql: string };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                message: 'Table creation should be done via Supabase Dashboard SQL Editor',
                sql,
                note: 'Use the provided SQL in Supabase Dashboard instead of this tool'
              }),
            },
          ],
        };
      }

      case 'seed_initial_data': {
        const { terms } = args as { terms: string[] };

        // Insert initial business terms
        const termObjects = terms.map(term => ({ term }));
        
        const { data, error } = await supabase
          .from('business_terms')
          .upsert(termObjects, { onConflict: 'term' })
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                message: `Successfully seeded ${data.length} terms`,
                data 
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: (error as Error).message }),
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);