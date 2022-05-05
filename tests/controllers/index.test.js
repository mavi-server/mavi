// This `controller` tests are using /examples/example2 workspace.
// Tests doesn't cover all the functionality yet.
// You can also use `mavi` npm package to run tests.

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

const data = {
  id: 3,
  name: 'Will Smith',
  email: 'will@doe.com',
  gender: 'male',
  status: 1,
};

require('../__global__/serverSetup');

describe('Controllers', () => {
  it('should `find` customers', () => {
    // default limit is 10
    return request(mavi.server)
      .get('/customers')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([customer]));
      });
  });
  it('should `count` customers', () => {
    return request(mavi.server)
      .get('/customers/count')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.count).toEqual(2);
      });
  });
  it('should `create` a customer', () => {
    return request(mavi.server)
      .post('/customers')
      .send(data)
      .then(res => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual(customer);
      });
  });
  it('should `findOne` customer', () => {
    // finds new added customer
    // status is populated, so its id will become an object like below:
    data.status = expect.objectContaining({
      id: expect.any(Number),
      lastSeen: expect.any(String),
      state: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    return request(mavi.server)
      .get(`/customers/${data.id}`)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.objectContaining(data));
      });
  });
  it('should `update` customer', () => {
    const name = (data.name = 'Chris Rock');
    const email = (data.email = 'chris@doe.com');

    return request(mavi.server)
      .put(`/customers/${data.id}`)
      .send({ name, email })
      .then(res => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual(customer);
        // expect(res.body).toEqual(expect.objectContaining(data));
      });
  });
  it('should `delete` customer', () => {
    return request(mavi.server)
      .delete(`/customers/${data.id}`)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(customer);
      });
  });
});
