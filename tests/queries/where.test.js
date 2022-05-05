require('../__global__/serverSetup');

describe('where', () => {
  it(`should find where the name is equal to 'john'`, () => {
    return request(mavi.server).get('/customers?where=name-eq-john')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ name: 'john' }),
        ]));
      });
  });
  
  it(`should find where the name is not equal to 'john'`, () => {
    return request(mavi.server).get('/customers?where=name-neq-john')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).not.toEqual(expect.arrayContaining([
          expect.objectContaining({ name: 'john' }),
        ]));
      });
  });
  it(`should find where the name includes 'john'`, () => {
    return false;
  });
  it(`should find where the name not includes 'john'`, () => {
    return false;
  });
  it(`should find where the name starts with 'john'`, () => {
    return false;
  });
  it(`should find where the name ends with 'doe'`, () => {
    return false;
  });
  it(`should find where the customer status is larger than 1`, () => {
    return request(mavi.server).get('/customers?where=status-lg-1')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.not.objectContaining({ status: 1 }),
        ]));
      });
  });
  it(`should find where the customer status is larger than or equal to 1`, () => {
    return request(mavi.server).get('/customers?where=status-lge-1')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ status: 1 }),
          expect.objectContaining({ status: 2 }),
        ]));
      });
  });
  it(`should find where the customer status is smaller than 2`, () => {
    return request(mavi.server).get('/customers?where=status-sm-2')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ status: 1 }),
        ]));
      });
  });
  it(`should find where the customer status is smaller than or equal to 2`, () => {
    return request(mavi.server).get('/customers?where=status-sme-2')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ status: 1 }),
          expect.objectContaining({ status: 2 }),
        ]));
      });
  });
  it(`should find where the name is equal to 'john' and the status is larger than 1`, () => {
    return request(mavi.server).get('/customers?where=name-john and status-lg-1')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ name: 'john', status: 2 }),
        ]));
      });
  });
  it(`should find where the name is equal to 'john' and the status is larger than or equal to 1`, () => {
    return request(mavi.server).get('/customers?where=name-john and status-lge-1')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ name: 'john', status: 1 }),
        ]));
      });
  });
  it(`should find where the name is equal to 'john' or 'julia'`, () => {
    return request(mavi.server).get('/customers?where=name-john or name-julia')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ name: 'john' }),
          expect.objectContaining({ name: 'julia' }),
        ]));
      });
  });
  it(`should find where the name is equal to 'john' or 'julia' and the status is equal to 1`, () => {
    return request(mavi.server).get('/customers?where=name-john or name-julia and status-eq-1')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ name: 'john', status: 1 }),
          expect.objectContaining({ name: 'julia', status: 1 }),
        ]));
      });
  });
  it(`should find where the name is equal to 'john' or 'julia' and the status is between 1 and 2`, () => {
    return false;
  });
});