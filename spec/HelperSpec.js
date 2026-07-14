testClass('HelperLoader', function() {
  return feature('Loading order', function() {
    return should('load the helpers before the specs.', function() {
      return expect(true).toBeTruthy();
    });
  });
});

// will fail to parse the spec if the helper was not loaded first
