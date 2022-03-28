// This is `controller` tests using /examples/example2 workspace.
// Tests doesn't cover all the functionality yet.

let app;
const request = require('supertest');
// const { createServer } = require('mavi');
const { createServer } = require('../dist/index');

/**
 * @type {import('../types').MaviConfig} config
 */
const config = require('../examples/example2/index');

// Database connection for testing
config.database.test = {
  client: 'pg',
  connection: {
    database: 'mavi-test',
    user: 'postgres',
    password: 'admin',
  },
};

const customer = expect.objectContaining({
  id: expect.any(Number),
  name: expect.any(String),
  email: expect.any(String),
  gender: expect.any(String),
  status: expect.objectContaining({
    id: expect.any(Number),
    lastSeen: expect.any(String),
    state: expect.any(String),
    created_at: expect.any(String),
    updated_at: expect.any(String),
  }),
  created_at: expect.any(String),
  updated_at: expect.any(String),
});

// Initialize mavi
beforeAll(async () => {
  /**
   * @type {import('../types').Mavi.createServer} app
   */
  app = await createServer(config);
});

const data = {
  id: 3,
  name: 'Will Smith',
  email: 'will@doe.com',
  gender: 'male',
  status: 1,
};

describe('Controllers', () => {
  it('should `create` a customer', async () => {
    return await request(app)
      .post('/customers')
      .send(data)
      .then(res => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual(customer);
      });
  });
  it('should `find` customers', async () => {
    // default limit is 10
    return await request(app)
      .get('/customers')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([customer]));
      });
  });
  it('should `count` customers', async () => {
    return await request(app)
      .get('/customers/count')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.count).toEqual(3);
      });
  });
  it('should `findOne` customer', async () => {
    // finds new added customer
    // status is populated, so its id will become an object like below:
    data.status = expect.objectContaining({
      id: expect.any(Number),
      lastSeen: expect.any(String),
      state: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    return await request(app)
      .get(`/customers/${data.id}`)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.objectContaining(data));
      });
  });
  it('should `update` customer', async () => {
    const name = (data.name = 'Chris Rock');
    const email = (data.email = 'chris@doe.com');

    return await request(app)
      .put(`/customers/${data.id}`)
      .send({ name, email })
      .then(res => {
        console.log(res.body);
        expect(res.status).toBe(201);
        expect(res.body).toEqual(customer);
        // expect(res.body).toEqual(expect.objectContaining(data));
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  });
  it('should `delete` customer', async () => {
    return await request(app)
      .delete(`/customers/${data.id}`)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(customer);
      });
  });
});

// it('should find new customers named Will', () => {
//   return await request(app)
//     .get('/customers')
//     .query({
//       where: 'name-like-%Will%', // where=name-John%Doe | where=name-eq-John%Doe
//     })
//     .expect(res => {
//       expect(res.status).toBe(200);
//       expect(res.body).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: expect.stringContaining('John'),
//           }),
//         ])
//       );
//     });
// });
// it('should find customers status larger than 1', () => {
//   return await request(app)
//     .get('/customers')
//     .query({
//       where: 'status-lg-1',
//     })
//     .expect(res => {
//       expect(res.status).toBe(200);
//       expect(res.body).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             status: expect.not.objectContaining({ id: 1 }),
//           }),
//         ])
//       );
//     });
// });
