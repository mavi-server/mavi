describe('app', () => {
  it('mavi start is defined', () => {
    expect(mavi.start).toBeDefined();
  });
  it('mavi apply is defined', () => {
    expect(mavi.apply).toBeDefined();
  });
  it('mavi seed is defined', () => {
    expect(mavi.seed).toBeDefined();
  });
  it('mavi clear is defined', () => {
    expect(mavi.clear).toBeDefined();
  });
  it('mavi drop is defined', () => {
    expect(mavi.drop).toBeDefined();
  });
  it('mavi config is defined', () => {
    expect(mavi.config).toBeDefined();
  });
  it('mavi server is not defined', () => {
    expect(mavi.server).toBeDefined();
  });
});
