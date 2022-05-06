describe('where', () => {
  it(`should find customers with the name 'John Doe'`, () => {
    return request(mavi.server)
      .get('/customers?where=name-eq-John Doe')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.name).toBe('John Doe');
        });
      });
  });
  it(`should find customers with the capitalized name 'John'`, () => {
    return request(mavi.server)
      .get('/customers?where=name-ins-John')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {          
          expect(row.name).toMatch(/John/);
        });
      });
  });
  it(`should find customers with the name is not 'John Doe'`, () => {
    return request(mavi.server)
      .get('/customers?where=name-neq-John Doe')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {          
          expect(row.name).not.toBe('John Doe');
        });
      });
  });
  it(`should find customers with the capitalized name is not 'John'`, () => {
    return request(mavi.server)
      .get('/customers?where=name-nins-John')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {          
          expect(row.name).not.toBe(expect.stringMatching(/John/));
        });
      });
  });
  it(`should find customers with the name starts with 'j'`, () => {
    return request(mavi.server)
      .get('/customers?where=name-j%') // or name-eq-j%
      .then(res => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(row => {
          expect(row.name[0].toLowerCase()).toMatch(/j/);
        });
      });
  });
  it(`should find customers with the name not includes 'sun'`, () => {
    return request(mavi.server)
      .get('/customers?where=name-nin-sun')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.name.toLowerCase()).not.toMatch(/sun/);
        });
      });
  });
  it(`should find where the customer status is larger than 1`, () => {
    return request(mavi.server)
      .get('/customers?where=status-lg-1')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.status.id).toBeGreaterThan(1);
        });
      });
  });
  it(`should find where the customer status is larger than or equal to 1`, () => {
    return request(mavi.server)
      .get('/customers?where=status-lge-1')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.status.id).toBeGreaterThanOrEqual(1);
        });
      });
  });
  it(`should find where the customer status is smaller than 2`, () => {
    return request(mavi.server)
      .get('/customers?where=status-sm-2')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.status.id).toBeLessThan(2);
        });
      });
  });
  it(`should find where the customer status is smaller than or equal to 2`, () => {
    return request(mavi.server)
      .get('/customers?where=status-sme-2')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.status.id).toBeLessThanOrEqual(2);
        });
      });
  });
  it(`should find customers with the name is contains 'john' and the status is larger than 1`, () => {
    return request(mavi.server)
      .get('/customers?where=name-john and status-lg-1')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.name.toLowerCase()).toBe('john');
          expect(row.status.id).toBeGreaterThan(1);
        });
      });
  });
  it(`should find customers with the name contains 'john' and the status is larger than or equal to 1`, () => {
    return request(mavi.server)
      .get('/customers?where=name-john and status-lge-1')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.name.toLowerCase()).toMatch(/john/);
          expect(row.status.id).toBeGreaterThanOrEqual(1);
        });
      });
  });
  it(`should find customers with the name contains 'john' or 'julia'`, () => {
    return request(mavi.server)
      .get('/customers?where=name-john and status-lge-1')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.name.toLowerCase()).toMatch(/john|julia/);
        });
      });
  });
  it(`should find customers with the name contains 'john' or 'julia' and the status is equal to 1`, () => {
    return request(mavi.server)
      .get('/customers?where=name-john or name-julia and status-eq-1')
      .then(res => {
        expect(res.status).toBe(200);
        res.body.forEach(row => {
          expect(row.name.toLowerCase()).toMatch(/john|julia/);
          expect(row.status.id).toBe(1);
        });
      });
  });

  // between haven't implemented yet
  // it(`should find customers with the name is equal to 'john' or 'julia' and the status is between 1 and 2`, () => {
  //   return false;
  // });
});
