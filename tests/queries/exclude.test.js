describe('exclude', () => {
  it(`should exclude the customer status from the results`, () => {
    return request(mavi.server)
      .get('/customers?exclude=status')
      .then(res => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(row => {
          expect(row).not.toHaveProperty('status');
        });
      });
  });
  it(`should exclude the customer id and status from the results`, () => {
    return request(mavi.server)
      .get('/customers?exclude=id,status') // or exclude=id:status
      .then(res => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(row => {
          expect(row).not.toHaveProperty('id');
          expect(row).not.toHaveProperty('status');
        });
      });
  });
});
