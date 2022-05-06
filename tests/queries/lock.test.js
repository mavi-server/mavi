describe('query locks', () => {
  it('should not process any given query', () => {
    // will not use any given query
    return request(mavi.server)
      .get('/lock/all?limit=1&start=10&exclude=id&where=name-whatever')
      .then(res => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(1); // default limit is 10
        res.body.forEach(row=>{
          expect(row.id).toBeDefined();
          expect(row.name).not.toBe('whatever');
        });
      });
  });

  describe('limit', () => {
    it('should lock limit', () => {
      // will use limit: '$'
      return request(mavi.server)
        .get('/lock/limit?limit=1')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(1);
        });
    });
    it('should lock limit and use pre-defined value', () => {
      // will use limit: [5]
      return request(mavi.server)
        .get('/lock/limit-with-value?limit=10')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('start', () => {
    it('should lock start', () => {
      // will use start: '$'
      return request(mavi.server)
        .get('/lock/start?start=2')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].id).toBe(1);
        });
    });
    it('should lock start and use pre-defined value', () => {
      // will use start: [2]
      return request(mavi.server)
        .get('/lock/start-with-value?start=2')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].id).toBe(4);
        });
    });
  });

  describe('sort', () => {
    it('should lock sort', () => {
      // will use sort: '$'
      return request(mavi.server)
        .get('/lock/sort?sort=id-desc')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].id).toBe(1);
        });
    });
    it('should lock sort and use pre-defined value', () => {
      // will use sort: ['name-desc,id-asc']
      return request(mavi.server)
        .get('/lock/sort-with-value?sort=id-desc,status-desc')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((row, i) => {
            if (res.body.length < i + 1) {
              expect(row.id).toBeLessThan(res.body[i + 1].id);
              expect(row.name.toLowerCase()).toBeGreaterThan(res.body[i + 1].name.toLowerCase());
            }
          });
        });
    });
  });

  describe('where', () => {
    it('should lock where', () => {
      // will use where: '$'
      return request(mavi.server)
        .get('/lock/where?where=status-eq-3')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(row=>{
            expect(row.status).not.toBe(expect.any(Number));
          });
        });
    });
    it('should lock where and use pre-defined value', () => {
      // will use where: ['name-john']
      return request(mavi.server)
        .get('/lock/where-with-value?where=status-eq-3')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(row=>{
            expect(row.name.toLowerCase()).toMatch(/john/);
            expect(row.status).not.toBe(expect.any(Number));
          });
        });
    });
    it('should lock specific columns and use pre-defined value', () => {
      // will use where: '$name-john and status-1'
      // '$name' can't be overwritten but 'status' can
      return request(mavi.server)
        .get('/lock/where-with-some-columns?where=name-albert and status-2')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(row=>{
            expect(row.name.toLowerCase()).toMatch(/john/);
            expect(row.status).toBe(2);
          });
        });
    });
  });

  describe('exclude', () => {
    it('should lock exclude', () => {
      // will use exclude: '$'
      return request(mavi.server)
        .get('/lock/exclude?exclude=id')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(row=>{
            expect(row.id).toBeDefined();
          });
        });
    });
    it('should lock exclude and use pre-defined value', () => {
      // will use exclude: ['name']
      return request(mavi.server)
        .get('/lock/exclude-with-value?exclude=id')
        .then(res => {
          expect(res.status).toBe(200);
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(row=>{
            expect(row.id).toBeDefined();
            expect(row.name).not.toBeDefined();
          });
        });
    });
  });
});
