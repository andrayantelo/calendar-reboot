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

QUnit.test("toKey Test", function(assert) {
    assert.expect(1);
    var id = '1234';
    var prefix = 'test';
    var keyId = this.lstore._toKey(id);
    assert.equal(keyId, 'test_1234');
});

QUnit.test("onActivityChanged test", function(assert) {
    assert.expect(2);
    this.lstore.onActivityChanged('function');
    assert.deepEqual(this.lstore.activityChangeFunctions[0], 'function');
    assert.equal(this.lstore.activityChangeFunctions.length, 1);
});

QUnit.test("localCalendarStorage and checkit Tests", {
    beforeEach: function() {
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
    
        this.$fixture.append(
            `<script>
            $(document).ready( function() {
            checkit = new CheckIt('localStorage');
            });
            </script>`);
        this.checkit = checkit;
    },
    afterEach: function() {
    }
});

QUnit.test("Checkit's onActivityChanged test", {
});

