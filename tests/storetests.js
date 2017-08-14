/*jslint devel: true, es5: true, nomen: true*/
/*global
    browser:true, Promise, firebase, QUnit, moment, Month,
    generateUniqueId, emptyCalendarState, Calendar, $, CheckIt,
    jQuery, checkit, LocalCalendarStorage
*/

//store.js tests

QUnit.module("LocalStorage Store Tests", {
    beforeEach: function () {
        // Initiate a test localCalendarStorage object
        "use strict";
        this.lstore = new LocalCalendarStorage({storeId: 'test'});
    }
});

QUnit.test("initLocalStorage test", function (assert) {
    "use strict";
    assert.expect(2);
    assert.equal(this.lstore.activeCalls, 0);
    assert.deepEqual(this.lstore.activityChangeFunctions, []);
});

QUnit.test("toKey Test", function (assert) {
    "use strict";
    assert.expect(1);
    var id = '1234',
        prefix = 'test',
        keyId = this.lstore._toKey(id);
    assert.equal(keyId, 'test_1234');
});

QUnit.module("localCalendarStorage and checkit Tests", {
    beforeEach: function () {
        // Initiate checkit object, store test calendars in storage and
        // append a loadingWheel div to calendar html
        "use strict";
        localStorage.clear();
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        
        this.$fixture.append(
            '<script>\
            $(document).ready( function() {\
            checkit = new CheckIt("\
            localStorage", $("#calendarDiv"));\
            });\
            </script>'
        );
        this.checkit = checkit;
        this.store = this.checkit.store;
        // Set some calendars in localStorage
        // allCalendarIds
        var allCalendarIdsKey = 'allCalendarIdsKey',
            allCalendarIds = {'1234' : 'hello', '5678': 'world'},
            current_active_calendar,
            helloState,
            worldState;
        this.store.setInStorage_(allCalendarIdsKey, allCalendarIds);
        // currentActiveCalendar
        current_active_calendar = 'current_active_calendar';
        this.store.setInStorage_(current_active_calendar, '1234');
        //calendar states
        helloState = {uniqueId: '1234', title: 'hello'};
        worldState = {uniqueId: '5678', title: 'world'};
        this.store.setInStorage_(helloState.uniqueId, helloState);
        this.store.setInStorage_(worldState.uniqueId, worldState);
        //add loading wheel
        this.$calendarDiv.append('<div id="loadingWheel"></div>');
    },
    afterEach: function () {
        // clear localStorage and clear calendar html
        "use strict";
        this.$calendarDiv.empty();
        localStorage.clear();
    }
});
// With localStorage
QUnit.test("Checkit's store initialization", function (assert) {
    "use strict";
    assert.expect(1);
    assert.equal(this.checkit.mode, 'localStorage');
});

QUnit.test("onActivityChanged test", function (assert) {
    "use strict";
    assert.expect(2);
    assert.equal(typeof this.store.activityChangeFunctions[0], 'function');
    assert.equal(this.store.activityChangeFunctions.length, 1);
});

QUnit.test("startWork test", function (assert) {
    "use strict";
    assert.expect(1);
    var done = assert.async(),
        store;
    
    this.store.startWork();
    store = this.store;
    setTimeout(function () {assert.equal(store.activeCalls, 1); done();
        }, 1000);
});

QUnit.test("endWork test", function (assert) {
    "use strict";
    assert.expect(1);
    
    this.store.activeCalls = 1;
    var store = this.store;
    store.endWork();
    assert.equal(this.store.activeCalls, 0);
});

QUnit.test("getAllCalendarIds test", function (assert) {
    "use strict";
    assert.expect(3);
    var done = assert.async(2),
        calendarIdsP = this.store.getAllCalendarIds(),
        calendarIds,
        fakeCalendarP;
    assert.equal(typeof calendarIdsP, 'object');
    calendarIds = calendarIdsP.then(function (val) {
        assert.deepEqual(val, {'1234' : 'hello', '5678': 'world'});
        done();
    });
    localStorage.removeItem('allCalendarIdsKey');

    fakeCalendarP = this.store.getAllCalendarIds();
    
    fakeCalendarP.then(function (val) {
        assert.deepEqual(val, {});
        done();
    });
});

QUnit.test("save test", function (assert) {
    // TODO What's the error case here?
    "use strict";
    assert.expect(2);
    var done = assert.async(),
        store = this.store,
        state = {uniqueId: '123', title: 'Hello World', startDateString: "20170101", endDateString: "20170202"},
        calendarIds = {'1234' : 'hello', '5678': 'world', '123': 'Hello World'},
        calObj = new Calendar(state),
        saveP = this.store.save(calObj);
    saveP.then(function () {
        assert.deepEqual(store.getFromStorage_('123'), state);
        assert.deepEqual(store.getFromStorage_('allCalendarIdsKey'), calendarIds);
        done();
    });
    
});

QUnit.test("RemoveById test", function (assert) {
    // TODO is there an error case here that I could test?
    "use strict";
    assert.expect(1);
    var done = assert.async(),
        store = this.store,
        state = {uniqueId: '123', title: 'Hello World', startDateString: "20170101", endDateString: "20170202"},
        calendarIds = {'1234' : 'hello', '5678': 'world', '123': 'Hello World'},
        calObj = new Calendar(state),
        saveP = this.store.save(calObj),
        removeP = this.store.removeById('123');
    removeP.then(function () {
        assert.deepEqual(store.getFromStorage_('123'), null);
        done();
    });
});

QUnit.test("loadById test", function (assert) {
    "use strict";
    assert.expect(2);
    var done = assert.async(2),
        loadP = this.store.loadById('1234'),
        fakeP;
    loadP.then(function (val) {
        assert.deepEqual(val, {uniqueId: '1234', title: 'hello'});
        done();
    });
    fakeP = this.store.loadById('123');
    fakeP.then(function (val) {
        assert.equal(val, {uniqueId: '123', title: 'Hello World',
            startDateString: "20170101",
            endDateString: "20170202"});
        done();

    }, function (val) {
        assert.equal(val, "Calendar not found");
        done();
    });
});

QUnit.test("getActive test", function (assert) {
    "use strict";
    assert.expect(2);
    var done = assert.async(2),
    // when current_active_calendar exists
        activeP = this.store.getActive(),
        failActiveP;
    activeP.then(function (value) {
        assert.equal(value, '1234');
        done();
    }, function (reason) {
        // manually fail assertion, because it should have passed in this case
        assert.ok(false, "getActive test failed");
        done();
    });
    
    // When current_active_calendar does not exist
    localStorage.removeItem('current_active_calendar');
    failActiveP = this.store.getActive();
    failActiveP.then(function (value) {
        // Manually fail, because it should have failed in this case.
        assert.ok(false, "getActive test when no active failed");
        done();
    }, function (reason) {
        assert.equal(reason, "Active Calendar Id Not found");
        done();
    });
});

QUnit.test("removeActive test", function (assert) {
    "use strict";
    assert.expect(2);
    
    assert.equal(this.store.getFromStorage_('current_active_calendar'), '1234');
    var removeActiveP = this.store.removeActive();
   
    assert.equal(this.store.getFromStorage_('current_active_calendar'), undefined);
});

QUnit.test("setActiveById test", function (assert) {
    "use strict";
    assert.expect(2);
    
    assert.equal(this.store.getFromStorage_('current_active_calendar'), '1234');
    
    var setActiveP = this.store.setActiveById('5678');
    assert.equal(this.store.getFromStorage_('current_active_calendar'), '5678');
});

QUnit.test("initializeCalendar test", function (assert) {
    "use strict";
    assert.expect(3);
    var done = assert.async(),
        state = {uniqueId: '123', title: 'Hello World', startDateString: "20170101", endDateString: "20170202"},
        calObj = new Calendar(state),
        initializeP = this.store.initializeCalendar(calObj);
    
    initializeP.then(function () {
        var savedState = JSON.parse(localStorage.getItem('123')),
            allCalendarIds = JSON.parse(localStorage.getItem('allCalendarIdsKey')),
            currentCal = JSON.parse(localStorage.getItem('current_active_calendar'));
        assert.equal(currentCal, '123');
        assert.deepEqual(savedState, {uniqueId: "123", title: "Hello World",
            startDateString: "20170101", endDateString: "20170202"});
        assert.deepEqual(allCalendarIds, {123: "Hello World", 1234: "hello", 5678: "world"});
        
        done();
    });
});
