// Tests for checkit app

// the test method gets passed a string as the first argument (naming the
// test), and a function as the second (which will run the code for this test)
// div #qunit-fixture contains an extract of the markup from our app, enough to 
// write useful tests against. By putting it in this div, we don't have to worry
// about DOM changes from one test affecting other tests because qunit will 
// automatically reset the markup after each test.

QUnit.test( "a basic test example", function( assert ) {
var value = "hello";
assert.equal( value, "hello", "We expect value to be hello" );
});


// Tests for checkit.js



// Testing Month Object
QUnit.module( "Month Tests", {
// Hardcoded a date for moment object because javascript's Date object
// does not have a way to get the number of days in the month.


beforeEach: function() {
    // Prepare something once for all tests
    this.valentine = moment("2017-02-14", "YYYY-MM-DD");
    this.dateString = this.valentine.format("YYYYMMDD");
    this.calObj = new Calendar({}, "");
    this.testmonth = new Month(this.dateString, this.calObj);

}

});

QUnit.test("init month object test", function(assert) {
    
    assert.expect(11);
    assert.equal(this.testmonth.dateString, this.dateString, "dateString property");
    assert.ok(moment.isMoment(this.testmonth.date), "testmonth.date is a moment obj");
    assert.equal(this.testmonth.firstDayIndex, 2);
    assert.equal(this.testmonth.numberOfDays, 28);
    assert.equal(this.testmonth.monthYear, 2017);
    
    assert.equal(this.testmonth.monthIndex, 1);
    assert.equal(this.testmonth.monthName, "February");
    assert.equal(this.testmonth.startDay, 14);
    assert.deepEqual(this.testmonth.dayIndex, {});
    assert.equal(this.testmonth.monthId, "20171");
    assert.equal(typeof this.calObj, "object");
});

QUnit.test("generateEmptyMonthDiv test", function (assert) {
    assert.expect(0);
});
