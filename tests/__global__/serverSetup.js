/**
 * @description Server setup for tests suite
 */

beforeAll(async () => {
  // Create database and with datasets
  await mavi.apply(mavi.config);
  await mavi.seed(mavi.config);
  
  // Start server
  global.mavi.server = await mavi.start(mavi.config);
});

afterAll(async () => {  
  // If server is active
  if(global.mavi.server && "close" in global.mavi.server) {
    // Drop test database
    // await mavi.drop(mavi.config); (not working on multiple tests)
    
    // Close server
    await global.mavi.server.close();
  }
});