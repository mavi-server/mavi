describe('start', () => {
  it('should start the results from the 3th result', () => {
    return request(mavi.server)
      .get('/statuses?start=2')
      .then(res=>{
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([
          expect.objectContaining({ id: 3 }),
        ]));
      });
  });
});