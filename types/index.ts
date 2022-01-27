import { CorsOptions } from 'cors'
import { ServeStaticOptions } from 'serve-static'
import { Request, Response, NextFunction } from 'express'
export default BlueServer

type middleware = (req: Request, res: Response, next: NextFunction) => any
type utils = 'detect-language'
type middlewares = 'authorization' | 'is-owner'
type controllers = 'find' | 'findOne' | 'count' | 'delete' | 'update' | 'create' | 'upload'
type methods = 'get' | 'post' | 'put' | 'delete'

declare namespace BlueServer {
  /**
   * Creates a blue-server instance.
   */
  type createServer = (config: BlueServerConfig) => any
  type config = BlueServerConfig
}

/**
 * Blue Server configuration
 */
export declare interface BlueServerConfig {
  /**
   * Port to listen on
   */
  port: number | string
  /**
   * Host to listen on
   */
  host: string
  /**
   * Cors options
   *
   * See details: https://www.npmjs.com/package/cors
   */
  cors: CorsOptions
  /**
   * API configurations
   *
   */
  api: {
    base: string
    /**
     * You can serve multiple static folders from the api.
     *
     * See details: https://expressjs.com/en/4x/api.html#express.static
     */
    static: Static[]
    /**
      - Used by req.config
      - Generates the api with the given config
      - Can be extendable by middlewares
     */
    routes: {
      [name: string]: Route[]
    }
    /**
     * Definitions for the api routes
     *
     */
    define: {
      /**
       * Database models
       * 
       * Used for creating/deleting tables
       * 
       * Used for api router and populate configurations
       * 
       * Order is important if there are existing foreign key references
       */
      models: Model.Tables
      /**
        - Every fragment(column) is like a sub route used by the parent routes
        - Each parent column can be used for populating relational data or datasets from these sub routes
        - This parent column is usually an id or a virtual column
        - Example: the posts entity doesn't have column as `isLiked`, but you can populate it via `likes` table.
          A user token will be required for this, and likes table should have a relation with the post ids.
      */
      populate: Populate.Columns
      utils?: object
      /**
       * Middlewares for the api routes
       *
       * See details: https://expressjs.com/en/guide/using-middleware.html
       */
      middlewares?: {
        [functionName: string]: middleware
      }
    }
    plugins?: object
  }
  /**
   * Knex database connection
   * 
   * See details: https://knexjs.org/#Installation-client
   */
  database: any // I will define this later.
  poweredBy?: string
}
/**
 * Will transformed into the API routes
 */
export declare interface Route {
  /**
   * Route path
   *
   * https://expressjs.com/en/guide/routing.html
   */
  path: string
  /**
   * Route method
   *
   */
  method: methods
  /**
   * Controller option.
   *
   * `upload` controller may have issues.
   */
  controller: controllers
  /** 
   * Intercepts the request and carries response to the next segment.
   
   * You can define your functions inside of `api.define.middlewares` and call their name in this array.
   * 
   * Order is important.
   * 
   * You can also put your functions in this array instead of strings.
  */
  middlewares?: string | string[] | middleware | middlewares[]
  /**
   * Columns inherited from your model files.
   *
   * This property represents selected columns for the response
   */
  columns?: string[]
  /**
   * It excludes specified columns from the columns array.
   */
  exclude?: string[]
  include?: string[]
  /**
   * Populates response data with the given columns.
   *
   * Be sure that columns are defined.
   */
  populate?: string[]
  /**
   * Right now there is only one utility function.
   *
   * Detect language, detects the language of the `content` column.
   *
   * Column selection should be optional. Needs improvement.
   * */
  utils?: utils[]
  /**
   * Extends the query builder.
   *
   * You can write your advanced sql queries and call via view.
   *
   * If not defined, the controller name will be used.
   */
  view?: string
}
/**
 * Database models
 * 
 * Used for creating/deleting tables
 * 
 * Used for api router and populate configurations
 * 
 * Order is important if there are existing foreign key references
 */
export declare namespace Model {
  type dataTypes =
    | 'increments'
    | 'integer'
    | 'bigInteger'
    | 'text'
    | 'string'
    | 'float'
    | 'double'
    | 'decimal'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'time'
    | 'timestamp'
    | 'binary'
    | 'enum'
    | 'json'
    | 'jsonb'
    | 'uuid'
    | 'geometry'
    | 'geography'
    | 'point'
  type constraints = 'primary' | 'nullable' | 'notNullable' | 'unique' | 'index'
  type SQL_Foreign_Commands = 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION'
  type SQL_Commands = string

  type Properties = {
    /**
     * Data type
     */
    type: dataTypes
    /**
     * Not null, primary, unique etc...
     */
    constraints?: constraints[]
    /**
     * Maximum length
     */
    maxlength?: number
    /**
     * Dataset for `enum` type
     */
    dataset?: string[]
    /**
     * Used with `datetime`, `time`, `timestamp` types
     * 
     * In PostgreSQL and MySQL a precision option may be passed.
     * 
     * https://knexjs.org/#Schema-timestamps
     */
    precision?: number
    /**
     * 
     * Used with `datetime`, `timestamp` types
     * 
     * By default PostgreSQL creates column with timezone (timestamptz type) and MSSQL does not (datetime2). This behaviour can be overriden by passing the useTz option (which is by default false for MSSQL and true for PostgreSQL). MySQL does not have useTz option.
     * 
     * In PostgreSQL and MSSQL a timezone option may be passed
     */
    useTz?: number
    /**
     * Sets the charset for the database table, only available within a createTable call, and only applicable to MySQL.
     */
    charset?: string
    /**
     * Default column value.
     * 
     * This can be a SQL too.
     * 
     * 
     * *Example:*
     * 
     * defaultTo: "knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')"
     * 
     */
    defaultTo?: string | number | boolean
    /**
     * Sets the comment for a table column.
     */
    comment?: string
    onDelete?: SQL_Foreign_Commands | SQL_Commands
    onUpdate?: SQL_Foreign_Commands | SQL_Commands
    /**
     * References to "table" where the foreign key column is located
     */
    references?: string,
    /**
     * Specifies an integer as unsigned. No-op if this is chained off of a non-integer field.
     */
    unsigned?: boolean,
    /**
     * Private columns are not included in the response.
     */
    private?: boolean
  }
  type Tables = {
    /**
     * Table name
     */
    [tableName: string]: {
      /**
       * Column name
       */
      [columnName: string]: Properties | {}
    } & {
      /**
       * Model hash. Used for detecting the changes then updating your database accordingly.
       */
      hash: string
    }
  } & {
    /**
     * Column hash. Used for detecting the changes then updating your database accordingly.
     */
    hash: string
  }
}

export declare namespace Populate {
  interface Columns {
    [columnName: string]: Properties
  }
  interface Properties {
    /**
     * Alias or real column name
     */
    select: string
    /**
     * Table name
     */
    from: string
    /**
     * Populate method
     */
    type: 'count' | 'object' | 'array' | 'token-reference' | 'array-reference'
    /**
     * Context column
     */
    on?: string
    /**
     * Context column for `type` column. This should be costumized column name, needs improvement.
     */
    on2?: string
    /**
     * As default, inherits all the columns from table's model. You can overwrite it.
     *
     * This property represents columns that will be selected in the query.
     *
     * Be sure the columns are defined in your database.
     */
    columns?: string[]
    /**
     * Exclude columns from array before the query.
     */
    exclude?: string[]
    /**
     * Only for token-reference.
     *
     * Any existing column can be returned.
     *
     * Also '*' can be used for returning all.
     *
     * Multiple column selection is not supported yet.
     */
    returning?: string | '*' | 'id'
  }
}

export declare interface Static {
  /**
   * Virtual path of your static folder
   */
  base?: string
  /**
   * Folder name, relative to root config file.
   *
   * You can also define `fullpath` instead.
   */
  folder?: string
  /**
   * Physical path of your static folder.
   */
  fullpath?: string
  options: ServeStaticOptions
}