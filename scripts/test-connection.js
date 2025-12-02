const { createClient } = require('@clickhouse/client');

const client = createClient({
  url: process.env.CLICKHOUSE_HOST,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DB,
});

async function main() {
  try {
    console.log('Testing connection...');
    const result = await client.query({
      query: 'SELECT 1',
      format: 'JSONEachRow',
    });
    console.log('Connection successful!');
    console.log(await result.json());
    
    console.log('Fetching tables...');
    const tablesResult = await client.query({
      query: 'SHOW TABLES',
      format: 'JSONEachRow',
    });
    const tables = await tablesResult.json();
    console.log('Tables:', tables);

    for (const table of tables) {
      console.log(`Schema for ${table.name}:`);
      const schema = await client.query({
        query: `DESCRIBE TABLE ${table.name}`,
        format: 'JSONEachRow',
      });
      console.log(JSON.stringify(await schema.json(), null, 2));
    }
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

main();
