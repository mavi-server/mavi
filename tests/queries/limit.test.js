require('../__global__/serverSetup');

describe('limit', () => {
  it('should limit the number of results to 2', () => {
    return request(mavi.server)
      .get('/statuses?limit=2')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
      });
  });
});
