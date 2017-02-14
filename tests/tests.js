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
QUnit.module( "Month Tests" );
// Hardcoded a day because javascript's Date object does not have a way
// to get the number of days in the month.
var valentine = moment("2017-02-14", "YYYY-MM-DD");
var dateString = valentine.format("YYYYMMDD");
var calObj = new Calendar({}, "");

QUnit.test("init month object test", function( assert ) {
    var testmonth = new Month(dateString, calObj);
    assert.equal(testmonth.dateString, dateString);
    assert.ok(moment.isMoment(testmonth.date));
    assert.equal(testmonth.firstDayIndex, 2);
    assert.equal(testmonth.numberOfDays, 28);
});
