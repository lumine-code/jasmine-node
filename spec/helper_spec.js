describe("helper", function() {
  it("exposes the spec collection used to discover helpers", function() {
    var collection = require('../lib/jasmine-node/spec-collection');

    expect(typeof(collection.load)).toBe('function');
    expect(typeof(collection.getSpecs)).toBe('function');
  });
});
