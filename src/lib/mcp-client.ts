import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class MCPSupabaseClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  async connect() {
    if (this.client) {
      return this.client;
    }

    // MCPサーバープロセスを起動
    const serverProcess = spawn('npx', ['tsx', 'src/mcp/supabase-server.ts'], {
      env: {
        ...process.env,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
    });

    this.transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin,
    });

    this.client = new Client(
      {
        name: 'business-bingo-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);
    return this.client;
  }

  async getBusinessTerms() {
    const client = await this.connect();
    const result = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'get_business_terms',
          arguments: {},
        },
      },
      { method: 'tools/call' }
    );

    const content = result.content?.[0];
    if (content?.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Failed to get business terms');
  }

  async addBusinessTerm(term: string) {
    const client = await this.connect();
    const result = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'add_business_term',
          arguments: { term },
        },
      },
      { method: 'tools/call' }
    );

    const content = result.content?.[0];
    if (content?.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Failed to add business term');
  }

  async updateBusinessTerm(id: number, term: string) {
    const client = await this.connect();
    const result = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'update_business_term',
          arguments: { id, term },
        },
      },
      { method: 'tools/call' }
    );

    const content = result.content?.[0];
    if (content?.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Failed to update business term');
  }

  async deleteBusinessTerm(id: number) {
    const client = await this.connect();
    const result = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'delete_business_term',
          arguments: { id },
        },
      },
      { method: 'tools/call' }
    );

    const content = result.content?.[0];
    if (content?.type === 'text') {
      return JSON.parse(content.text);
    }
    throw new Error('Failed to delete business term');
  }

  async disconnect() {
    if (this.client && this.transport) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }
}

export const mcpSupabaseClient = new MCPSupabaseClient();