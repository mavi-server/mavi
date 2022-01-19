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
       * Order is important if there are foreign key references
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
  - Used for creating a database
  - Used for api router and populate configurations
*/
export declare namespace Model {
  type types =
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
    | 'timestamps'
    | 'binary'
    | 'enum'
    | 'json'
    | 'jsonb'
    | 'uuid'
    | 'geometry'
    | 'geography'
    | 'point'
  type constraints = 'primary' | 'nullable' | 'notNullable' | 'unique'
  interface Tables {
    [tableName: string]: {
      [columnName: string]: Properties
    }
  }
  interface Properties {
    type: types
    constraints?: constraints[]
    defaultTo?: string | number | boolean
    maxlength?: number
    /**
     * Which column is the reference id.
     */
    references?: string | 'id'
    /**
     * Which table to reference
     */
    inTable?: string
    /**
     * Dataset for `enum` type
     */
    dataset?: string[]
    /**
     * Make comment on this column
     */
    comment?: string
    /**
     * Private columns are not included in the response.
     */
    private?: boolean
    /**
     * created_at and updated_at columns
     */
    timestamp?: boolean[] | [true, true]
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