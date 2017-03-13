//store.js tests

QUnit.module("LocalStorage Store Tests", {
  beforeEach: function() {
    // prepare something before each test
    this.lstore = new LocalCalendarStorage({storeId: 'test'});
  },
  afterEach: function() {
    // clean up after each test
  }
});

QUnit.test("initLocalStorage test", function(assert) {
    assert.expect(2);
    assert.equal(this.lstore.activeCalls, 0);
    assert.deepEqual(this.lstore.activityChangeFunctions, []);
});

// localStorage helper functions
QUnit.module("LocalStorage Helper Functions Tests", {
});

QUnit.test("toKey Test", function(assert) {
    assert.equal(0);
    var id = '1234';
    var prefix = 'test';
    var keyId = toKey(id);
    
    assert.equal(keyId, 'test_1234');
});

QUnit.test("setInStorage Test", function(assert) {
});

QUnit.test("getFromStorage Test", function(assert) {
});

QUnit.test("removeFromStorage Test", function(assert) {
});

QUnit.test("Jitter Test", function(assert) {
});
