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
    assert.equal(this.testmonth.firstActiveDayIndex, 2, "Initialized first active day index");
    assert.equal(this.testmonth.numberOfDays, 28, "Initialized number of days");
    assert.equal(this.testmonth.monthYear, 2017, "Initialized the year");
    
    assert.equal(this.testmonth.monthIndex, 1, "Initialized the index of the month");
    assert.equal(this.testmonth.monthName, "February", "Initialized the month's name");
    assert.equal(this.testmonth.startDay, 14, "Initialized the start day");
    
    assert.ok(moment.isMoment(this.testmonth.firstDayDate), "testmonth.firstDayDate is a moment obj");
    assert.equal(this.testmonth.firstDay, 1, "Checking first of the month date");
    assert.equal(this.testmonth.firstDayIndex, 3, "Checking index of the first of the month");
    
    assert.deepEqual(this.testmonth.dayIndex, {}, "Initialized the day Index object");
    assert.equal(this.testmonth.monthId, "20171", "Initialized the month Id");
    assert.equal(typeof this.calObj, "object", "Verify calendar object is an object");
});

// Testing calendar object 
QUnit.module( "Calendar Tests", {

beforeEach: function() {
    // Prepare something once for all tests
    this.valentine = moment("2017-02-14", "YYYY-MM-DD");
    this.dateString = this.valentine.format("YYYYMMDD");
    this.calObj = new Calendar({}, "");
    this.testmonth = new Month(this.dateString, this.calObj);
}

});

/*

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
    assert.expect(56);
    var done = assert.async();
    
    // Define fixture out here because 'this' changes inside of the load 
    // function's 'complete' callback
    
    var fixture = this.fixture;
    var testmonth = this.testmonth;
    
    fixture.find('#calendarDiv').append(`<div class="monthframe" id="${testmonth.monthId}"></div>`);
    fixture.find(`#${testmonth.monthId}`).load('template.html', function() {
        
        // Test that template was added as a child
        assert.equal($(this).children().attr('id'), 'template');
        assert.equal($(this).children().length, 1, "Number of children of monthframe div");
        
        testmonth.fillMonthDiv();
        // May need to modify the below when I switch to using fully filled months. but possibly not depending on
        // if I still use the class actualDay
        assert.equal($(this).find(".actualDay").first().children('.cell').attr('id'), 20170214, "Check start day of the month");
        
        $(this).find('.cell').each( function(index) {
            assert.equal($(this).attr('id'), '201702' + (index + 14), "Checking id's of .cell divs");
        });
        
        assert.equal($(this).find(".month-year").text(), "February 2017");
        assert.notOk(jQuery.isEmptyObject(testmonth.dayIndex), "dayIndex object is not empty");
        assert.equal(Object.keys(testmonth.dayIndex).length, 15, "Asserting number of keys in dayIndex object");
        
        assert.equal($(this).find('.actualDay').length, 15, "Checking the number of .actualDay td elements");
        
        assert.equal($(this).find('.cell').length, 15, "Correct number of .cell div elements");
        
        assert.equal($(this).find('.nill').length, 27, "Correct number of .nill div elements");
        
        assert.equal($(this).find('.cell').children().length, 30, "Total number of children of each .cell div");
        assert.ok($(this).find('.daynumber').text(), ".daynumber divs have text in them");
        
        $(this).find('.daynumber').each( function(index) {
            assert.equal($(this).html(), index + 14, "Correct daynumbers");
            });
            
        $(this).find('.cell').each(function (index) {
            assert.ok($(this).find('.element').hasClass("hidden"), "Check that .element divs have a hidden class");
        });
        
        done();
    })
   
});

QUnit.test("removeEmptyWeeks test", function( assert ) {
    // This test will need to be modified if an entire month is included 
    // with grayed out days for inactive days
    assert.expect(2);
    
    var done = assert.async();
    var fixture = this.fixture;
    var testmonth = this.testmonth;
    
    fixture.find('#calendarDiv').append(`<div class="monthframe" id="${testmonth.monthId}"></div>`);
    fixture.find(`#${testmonth.monthId}`).load('template.html', function() {
        testmonth.fillMonthDiv();
        assert.equal($(this).find('.week').length, 6, "Check number of weeks generated");
        testmonth.removeEmptyWeeks('calendarDiv');
        assert.equal($(this).find('.week').length, 3);
        
        done();
    })
});

QUnit.test("attachClickHandler test", function( assert ) {
    assert.expect(0);
    var done = assert.async();
    var fixture = this.fixture;
    var testmonth = this.testmonth;
    var checkit = new CheckIt();
    var testcal = new Calendar({startDate: "20170214", endDate: "20170228", title: "hello"}, checkit);
    testmonth.calendar = testcal;
    
    fixture.find('#calendarDiv').append(`<div class="monthframe" id="${testmonth.monthId}"></div>`);
    fixture.find(`#${testmonth.monthId}`).load('template.html', function() {
        testmonth.fillMonthDiv();
        testmonth.removeEmptyWeeks('calendarDiv');
        testmonth.attachClickHandler();
        console.log(this);
        //assert.equal($(this).find('.hidden').length, 15);
        //$(this).find('#20170214').trigger('click');
        
        console.log(testmonth.calendar);
    })
    
});

*/
