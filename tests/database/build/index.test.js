describe('Database builder', () => {
  // build the database with its structure state
  describe('Builder', () => {
    it('should create database state');
    it('should create model tables');
    it('should create default database triggers');
  });

  // used for detecting changes on the property
  describe('Hash', () => {
    it("should find models dir");
    it("should assign hash on every model");
    it("should assign hash on every model' columns");
  });

  // detect changes by comparing model files with the database state
  describe('Change detector', () => {
    describe('Model changes', () => {
      it('should detect model deletion');
      it('should detect model creation');
      it('should detect model rename');
    });

    describe('Model Column changes', () => {
      it('should detect column rename');
      it('should detect column deletion');
      it('should detect column creation');
      it('should detect column constraint creation');
      it('should detect column constraint deletion');
      it('should detect column foreign key creation');
      it('should detect column foreign key deletion');
      it('should detect column type change');

      describe('Column Type changes', () => {
        it('should change column type from string to integer');
        it('should change column type from integer to string');
        it('should change column type from string to float');
        it('should change column type from float to string');
        it('should change column type from string to boolean');
        it('should change column type from boolean to string');
        it('should change column type from string to date');
        /**
         * .
         * .
         * .
         * .
         */
      });
    });
  });

  describe('Change saver', () => {
    it('should save changes to the database state');
  });
});
