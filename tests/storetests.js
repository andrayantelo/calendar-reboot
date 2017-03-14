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

QUnit.module("localCalendarStorage and checkit Tests", {
    beforeEach: function() {
        // Clear localStorage before putting anything in it
        localStorage.clear();
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        
        this.$fixture.append(
            `<script>
            $(document).ready( function() {
            checkit = new CheckIt('localStorage');
            });
            </script>`);
        this.checkit = checkit;
        this.store = this.checkit.store;
        // Set some calendars in localStorage
        // allCalendarIds
        var allCalendarIdsKey = 'allCalendarIdsKey';
        var allCalendarIds = {'1234' : 'hello', '5678': 'world'};
        this.store.setInStorage_(allCalendarIdsKey, allCalendarIds);
        // currentActiveCalendar
        var current_active_calendar = 'current_active_calendar';
        this.store.setInStorage_(current_active_calendar, '1234');
        //calendar states
        var helloState = {uniqueId: '1234', title: 'hello'};
        var worldState = {uniqueId: '5678', title: 'world'};
        this.store.setInStorage_(helloState.uniqueId, helloState);
        this.store.setInStorage_(worldState.uniqueId, worldState);
        //add loading wheel
        this.$calendarDiv.append(`<div id="loadingWheel"></div>`);
        },
    afterEach: function() {
        this.$calendarDiv.empty();
        localStorage.clear();
    }
});
// With localStorage
QUnit.test("Checkit's store initialization", function(assert) {
    assert.expect(1);
    assert.equal(checkit.mode, 'localStorage');
});

QUnit.test("onActivityChanged test", function(assert) {
    assert.expect(2);
    assert.equal(typeof this.store.activityChangeFunctions[0], 'function');
    assert.equal(this.store.activityChangeFunctions.length, 1);
});

QUnit.test("startWork test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    
    this.store.startWork();
    var store = this.store
    setTimeout(function() {assert.equal(store.activeCalls, 1); done();
        }, 1000);
});

QUnit.test("endWork test", function(assert) {
    assert.expect(1);
    
    this.store.activeCalls = 1;
    var store = this.store;
    store.endWork();
    assert.equal(this.store.activeCalls, 0);
});

QUnit.test("getAllCalendarIds test", function(assert) {
    
    assert.expect(3);
    var done = assert.async(2);
    var calendarIdsP = this.store.getAllCalendarIds();
    assert.equal(typeof calendarIdsP, 'object');
    var calendarIds = calendarIdsP.then(function(val) {
        assert.deepEqual(val, {'1234' : 'hello', '5678': 'world'});
        done();
    });
    localStorage.removeItem('allCalendarIdsKey');

    var fakeCalendarP = this.store.getAllCalendarIds();
    
    fakeCalendarP.then(function(val) {
        assert.equal(val, "Not found");
        done();
        });
});

QUnit.test("save test", function(assert) {
    // TODO What's the error case here?
    assert.expect(2);
    var done = assert.async();
    var store = this.store;
    var state = {uniqueId: '123', title: 'Hello World', startDateString: "20170101",
        endDateString: "20170202"}
    var calendarIds = {'1234' : 'hello', '5678': 'world', '123': 'Hello World'};
    var calObj = new Calendar(state);
    var saveP = this.store.save(calObj);
    saveP.then(function() {
        assert.deepEqual(store.getFromStorage_('123'), state);
        assert.deepEqual(store.getFromStorage_('allCalendarIdsKey'), calendarIds);
        done();
    });
    
});

QUnit.test("RemoveById test", function(assert) {
    // TODO is there an error case here that I could test?
    assert.expect(1);
    var done = assert.async();
    var store = this.store;
    var state = {uniqueId: '123', title: 'Hello World', startDateString: "20170101",
        endDateString: "20170202"}
    var calendarIds = {'1234' : 'hello', '5678': 'world', '123': 'Hello World'};
    var calObj = new Calendar(state);
    var saveP = this.store.save(calObj);
    
    var removeP = this.store.removeById('123');
    removeP.then(function() {
        assert.deepEqual(store.getFromStorage_('123'), null);
        done();
    });
});

QUnit.test("loadById test", function(assert) {
    assert.expect(2);
    var done = assert.async(2);
    var loadP = this.store.loadById('1234');
    loadP.then(function(val) {
        assert.deepEqual(val, {uniqueId: '1234', title: 'hello'});
        done()
    });
    var fakeP = this.store.loadById('123');
    fakeP.then(function(val) {
        assert.equal(val, {uniqueId: '123', title: 'Hello World',
            startDateString: "20170101",
            endDateString: "20170202"});
        done();

    }, function(val) {
        assert.equal(val, "Calendar not found");
        done()
        });
});


