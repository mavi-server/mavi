describe('app', () => {
  it('mavi server is defined', () => {
    expect(mavi.server).toBeDefined();
  });

  it('mavi config is defined', () => {
    expect(mavi.config).toBeDefined();
  });

  it('mavi cli is defined', () => {
    expect(mavi.cli).toBeDefined();
  });

  afterAll(() => mavi.server.close());
});
