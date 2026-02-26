declare module 'postgres' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Row = Record<string, any>;

  interface Result<T = Row> extends Array<T> {
    count: number;
    command: string;
  }

  interface TransactionSql {
    (template: TemplateStringsArray, ...args: unknown[]): Promise<Result>;
  }

  interface Sql {
    (template: TemplateStringsArray, ...args: unknown[]): Promise<Result>;
    begin<T>(fn: (sql: TransactionSql) => Promise<T>): Promise<T>;
    end(): Promise<void>;
  }

  interface Options {
    max?: number;
    idle_timeout?: number;
    connect_timeout?: number;
  }

  function postgres(connectionString: string, options?: Options): Sql;
  export default postgres;
}
