describe('sort', () => {
  it('should sort the customer ids as descending order', () => {
    return request(mavi.server)
      .get('/customers?sort=id-desc')
      .then(res => {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((row, i) => {
          if (res.body.length < i + 1) {
            expect(row.id).toBeGreaterThan(res.body[i + 1].id);
          }
        });
      });
  });
  it('should sort the customer ids as ascending and name as descending order', () => {
    return request(mavi.server)
      .get('/customers?sort=id-desc')
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
