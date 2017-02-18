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
    this.fixture = $("#qunit-fixture");
},

afterEach: function() {
    // Clean up after each test
    this.fixture.empty();
}

});

QUnit.test("init month object test", function(assert) {
    
    assert.expect(11);
    assert.equal(this.testmonth.dateString, this.dateString, "dateString property");
    assert.ok(moment.isMoment(this.testmonth.date), "testmonth.date is a moment obj");
    assert.equal(this.testmonth.firstDayIndex, 2, "Initialized first day index");
    assert.equal(this.testmonth.numberOfDays, 28, "Initialized number of days");
    assert.equal(this.testmonth.monthYear, 2017, "Initialized the year");
    
    assert.equal(this.testmonth.monthIndex, 1, "Initialized the index of the month");
    assert.equal(this.testmonth.monthName, "February", "Initialized the month's name");
    assert.equal(this.testmonth.startDay, 14, "Initialized the start day");
    assert.deepEqual(this.testmonth.dayIndex, {}, "Initialized the day Index object");
    assert.equal(this.testmonth.monthId, "20171", "Initialized the month Id");
    assert.equal(typeof this.calObj, "object", "Verify calendar object is an object");
});

function yearHeaderTest(name, isFirst, numOfChildren, div) {
    QUnit.test(name, function( assert ) {
        assert.expect(1);
        this.testmonth.generateEmptyMonthDiv(isFirst, div);
        var childrenLen = this.fixture.find("*").length;
        
        assert.equal(childrenLen, numOfChildren);
    });
}
yearHeaderTest("generateEmptyMonthDiv with Header", true, 4, 'calendarDiv');
yearHeaderTest("generateEmptyMonthDiv without Header", false, 2, 'calendarDiv');

QUnit.test("generateEmptyMonthDiv monthframe test", function( assert ) {
    // Test that the monthframe div has the correct number of children
    // And that it has the correct id
    assert.expect(2);
    // Add a div with id template to fixture
    this.fixture.append('<div id="template"><div id="onlyChild"></div></div>');
    
    this.testmonth.generateEmptyMonthDiv(false, 'calendarDiv', 'template');
    var monthframeChild = this.fixture.find(".monthframe").children()[0].id;
    assert.equal(monthframeChild, "onlyChild");
    var monthframeId = this.fixture.find(".monthframe").attr('id');
    assert.equal(monthframeId, this.testmonth.monthId);
});

QUnit.test("fillMonthDiv test", function ( assert ) {
    assert.expect(0);
    var done = assert.async();
    this.fixture.find('#calendarDiv').load('template.html', function() {
        var fixture = $("#qunit-fixture");
        console.log("Load was performed.");
        console.log(this);
        console.log(fixture.find(this.id).children());
      done();
    })
    // TODO when you print out this on line 90, you see that template html
    // was successfully added, however, the next line still prints out 0
    // when it should be at least 1 since template is a child of calendarDiv
    // This is happening asynchronously and I have not figured out how to manage this yet.
    console.log(this.fixture.find('#calendarDiv').children().length);
    console.log(this.fixture.html());
  
});
