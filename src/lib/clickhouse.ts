let clickhouseInstance: any = null;

async function initClickHouse() {
  if (!clickhouseInstance) {
    try {
      const { createClient } = await import('@clickhouse/client');
      clickhouseInstance = createClient({
        url: process.env.CLICKHOUSE_HOST,
        username: process.env.CLICKHOUSE_USER,
        password: process.env.CLICKHOUSE_PASSWORD,
        database: process.env.CLICKHOUSE_DB,
      });
    } catch (error) {
      console.error('Failed to initialize ClickHouse client:', error);
      throw error;
    }
  }
  return clickhouseInstance;
}

export async function getClickHouse() {
  return await initClickHouse();
}

// For backward compatibility, create a proxy object with proper typing
interface ClickHouseClient {
  query(options: any): Promise<any>;
  [key: string]: any;
}

export const clickhouse: ClickHouseClient = new Proxy({} as ClickHouseClient, {
  get: (target, prop) => {
    return async (...args: any[]) => {
      const client = await initClickHouse();
      const method = (client as any)[prop];
      if (typeof method === 'function') {
        return method.apply(client, args);
      }
      return method;
    };
  },
}) as ClickHouseClient;
