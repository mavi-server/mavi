describe('query locks', () => {
  it('should not evaluate any given query', () => {
    return false;
  });

  describe('limit', () => {
    it('should lock limit', () => {
      // limit: '$'
      return false;
    });
    it('should lock limit and use pre-defined value', () => {
      // limit: [5]
      return false;
    });
  });

  describe('start', () => {
    it('should lock start', () => {
      // start: '$'
      return false;
    });
    it('should lock start and use pre-defined value', () => {
      // start: [5]
      return false;
    });
  });

  describe('sort', () => {
    it('should lock sort', () => {
      // sort: '$'
      return false;
    });
    it('should lock sort and use pre-defined value', () => {
      // sort: ['name-desc:id:asc']
      return false;
    });
  });

  describe('where', () => {
    it('should lock where', () => {
      // where: '$'
      return false;
    });
    it('should lock where and use pre-defined value', () =>{
      // where: ['name-neq-john']
      return false;
    });
    it('should lock specific columns and use pre-defined value', () => {
      // in here name column can't be overwritten by the request query:
      // where: '$name-neq-john and status-eq-1'
      return false;
    });
  });

  describe('exclude', () => {
    it('should lock exclude', () => {
      // exclude: '$'
      return false;
    });
    it('should lock exclude and use pre-defined value', () => {
      // exclude: ['name']
      return false;
    });
  });
});
