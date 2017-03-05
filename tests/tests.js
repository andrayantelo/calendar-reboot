// Tests for checkit app

// Tests for checkit.js

// Testing Month Object
QUnit.module( "Month Tests", {
// Hardcoded a date for moment object because javascript's Date object
// does not have a way to get the number of days in the month.


beforeEach: function() {
    // Prepare something once for all tests
    this.valentine = moment("2017-02-14", "YYYY-MM-DD");
    this.dateString = this.valentine.format("YYYYMMDD");
    this.testmonth = new Month(this.dateString);
}

});

QUnit.test("init month object test", function(assert) {
    
    assert.expect(13);
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
});


// Testing Calendar Helper functions
QUnit.module( "Calendar helper functions tests", {
});

QUnit.test("generateUniqueId test", function(assert) {
    assert.expect(1);
    var uniqueId = generateUniqueId();
    var uniqueId2 = generateUniqueId();
    
    assert.notEqual(uniqueId, uniqueId2);
});

QUnit.test("emptyCalendarState test", function(assert) {
    assert.expect(9);
    var params = {startDate: "2017-02-14" , endDate: "2017-02-20" , calendarTitle: "Hello"};
    var state = emptyCalendarState(params);
    
    assert.equal(state.title, "Hello", "Checking state title");
    assert.equal(state.startDateString, "20170214", "Checking startDateString");
    assert.equal(state.endDateString, "20170220", "Checking endDateString");
    assert.ok(state.uniqueId);
    assert.deepEqual(state.checkedDays, {});
    
    //assert that an exception is thrown with invalid dates.
    var params = {startDate: "2017-02-14", endDate: "2017-01-01", calendarTitle: "hello"};
    
    assert.raises(function() {
        emptyCalendarState(params);
        }, Error, "testing invalid dates");
    assert.raises(function() {
        emptyCalendarState(params);
    }, /End date must be a date after start date./, "Testing error message");
    
    params.startDate = "2017-02-14";
    params.endDate = "2017-02-20";
    params.calendarTitle = "";
    
    assert.raises(function() {
        emptyCalendarState(params);
    }, Error, "Testing empty calendar title string");
    
    assert.raises(function() {
        emptyCalendarState(params);
    }, /Must provide a calendar title./, "Testing error message");
});

// Testing calendar object 
QUnit.module( "Calendar Tests", {

beforeEach: function() {
    // Prepare something once for all tests
    this.params = {startDate: "2017-02-14" , endDate: "2017-02-20" , calendarTitle: "Test Calendar"};
    
    this.state = emptyCalendarState(this.params);
    
    this.calendar = new Calendar(this.state);
    
}

});

QUnit.test("Init calendar object test", function(assert) {
    assert.expect(7);
  
    assert.deepEqual(this.calendar.state, this.state, "Check state is correct");
    assert.ok(moment.isMoment(this.calendar.startDate, "startDate is a moment obj")); 
    assert.ok(moment.isMoment(this.calendar.endDate, "endDate is a moment obj"));
    assert.equal(this.calendar.startDate.format("YYYYMMDD"), "20170214", "Checking startDate object's date");
    assert.equal(this.calendar.endDate.format("YYYYMMDD"), "20170220", "Checking endDate object's date");
    assert.equal(this.calendar.monthObjects.length, 1);
    assert.equal(typeof(this.calendar.monthObjects[0]), "object", "Month object is object");
});



QUnit.test("addMonth calendar method test", function(assert) {
    assert.expect(4);
    this.calendar.addMonth();
    
    assert.equal(this.calendar.endDate.format("YYYYMMDD"), "20170320", "Check one month was added to endDate object");
    assert.equal(this.calendar.state.endDateString, "20170320", "Check calendar endDateString added a month");
    assert.equal(this.calendar.monthObjects.length, 2, "Check month was added to monthObjects array");
    assert.equal(typeof(this.calendar.addMonth()), "object", "addMonth returns an object");
});

QUnit.test("generateMonthObjects calendar method test", function(assert) {
    
    assert.expect(7);
    
    var monthObjects = this.calendar.generateMonthObjects(moment("20170101", "YYYYMMDD"), moment("20170214", "YYYYMMDD"));

    assert.ok(Array.isArray(monthObjects));
    assert.equal(monthObjects[0].dateString, "20170101");
    assert.equal(monthObjects[1].dateString, "20170201");
    assert.equal(monthObjects[1].lastActiveDay, 14);
    assert.equal(monthObjects.length, 2);
    
    assert.raises(function() {
        this.calendar.generateMonthObjects(moment("20170214", "YYYYMMDD"), moment("20170101", "YYYYMMDD"));
        }, Error, "Testing invalid dates");
    assert.raises(function() {
        this.calendar.generateMonthObjects(moment("20170214", "YYYYMMDD"), moment("20170101", "YYYYMMDD"));
    }, /End date must be a date after start date/, "testing error message");
});


// Testing checkit object 
QUnit.module( "CheckIt Tests", {

beforeEach: function() {
    // Prepare something once for all tests
    this.params = {startDate: "2017-02-14" , endDate: "2017-02-20" , calendarTitle: "Test Calendar"};
    this.state = emptyCalendarState(this.params);
    this.calendar = new Calendar(this.state);
    this.checkit = new CheckIt('localStorage');
}

});

function selectorNameTest(testName, selectorName, expected) {
    QUnit.test(testName, function(assert) {
        assert.expect(1);
        assert.equal(selectorName.selector, expected);
    });
};

QUnit.test("Initialize CheckIt test", function( assert ) {
    assert.expect(1);
    assert.equal(this.checkit.mode, 'localStorage', "Checking checkit object's mode");
    selectorNameTest("userPic selector test", this.checkit.$userPic, '#user-pic');
    selectorNameTest("userName selector test", this.checkit.$userName, '#user-name');
    selectorNameTest("Sign-in button selector test", this.checkit.$signInButton, '#sign-in');
    selectorNameTest("Sign-out button selector test", this.checkit.$signOutButton, '#sign-out');
    selectorNameTest("getStarted selector test", this.checkit.$getStarted, '#getStarted');
    selectorNameTest("buildFormAccordion selector test", this.checkit.$buildFormAccordion, '#buildFormAccordion');
    selectorNameTest("calendarTitleForm selector test", this.checkit.$calendarTitleForm, '#titleFormGroup');
    selectorNameTest("startDateForm selector test", this.checkit.$startDateForm, '#dateFormGroup');
    selectorNameTest("endDateForm selector test", this.checkit.$endDateForm, '#dateFormGroup2');
    selectorNameTest("startDatePicker selector test", this.checkit.$startDatePicker, '#datetimepicker1');
    selectorNameTest("startDatePickerInput selector test", this.checkit.$startDatePickerInput, '#datetimepicker1 input');
    selectorNameTest("endDatePicker selector test", this.checkit.$endDatePicker, '#datetimepicker2');
    selectorNameTest("endDatePickerInput selector test", this.checkit.$endDatePickerInput, '#datetimepicker2 input');
    selectorNameTest("calendarDropdown selector test", this.checkit.$calendarDropdown, '#calendarDropdown');
    selectorNameTest("startDateErrorSpan selector test", this.checkit.$startDateErrorSpan, '#inputError-dateFormGroup');
    selectorNameTest("endDateErrorSpan selector test", this.checkit.$endDateErrorSpan, '#inputError-dateFormGroup2');
    selectorNameTest("titleErrorSpan selector test", this.checkit.$titleErrorSpan,'#inputError-titleFormGroup');
    selectorNameTest("titleGlyphiconTag selector test", this.checkit.$titleGlyphiconTag, '#span-titleFormGroup');
    selectorNameTest("clearButton selector test", this.checkit.$clearButton, '#clearButton');
    selectorNameTest("fullForm selector test", this.checkit.$fullForm, '#fullForm');
    selectorNameTest("createButton selector test", this.checkit.$createButton, '#createButton');
    selectorNameTest("deleteButton selector test", this.checkit.$deleteButton, '#deleteButton');
    selectorNameTest("calendarTitle selector test", this.checkit.$calendarTitle, '#calendarTitle');
    selectorNameTest("startDate selector test", this.checkit.$startDate, '#startDate');
    selectorNameTest("endDate selector test", this.checkit.$endDate, '#endDate');
    selectorNameTest("buildCalendarForm selector test", this.checkit.$buildCalendarForm, '#collapseOne');
    selectorNameTest("calendarDiv selector test", this.checkit.$calendarDiv, '#calendarDiv');
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
