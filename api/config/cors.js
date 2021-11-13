// https://www.npmjs.com/package/cors
export default {
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['*'],
  exposedHeaders: ['x-access-token']
}