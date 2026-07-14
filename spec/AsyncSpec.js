//=============================================================================
// Async spec, that will be time outed
//=============================================================================
describe('async', function() {
  var doneFunc;
  it('should be timed out', function() {
    return waitsFor((function() {
      return false;
    }), 'MIRACLE', 500);
  });
  doneFunc = function(done) {
    return setTimeout(done, 10000);
  };
  return it("should timeout after 100 ms", doneFunc, 100);
});
