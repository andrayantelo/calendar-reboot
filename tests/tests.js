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
    this.$fixture = $('#qunit-fixture');
}

});


QUnit.test("addMonth test", function( assert ) {
    assert.expect(2);
    assert.equal(this.calendar.monthObjects.length, 1);
    this.checkit.addMonth(this.calendar);
    assert.equal(this.calendar.monthObjects.length, 2);
    
});

QUnit.test("generateEmptyCalendar test", function( assert ) {
    assert.expect(14);
    var $calendarDiv = this.$fixture.find('#calendarDiv');
    this.checkit.generateEmptyCalendar(this.calendar, $calendarDiv);
    assert.equal($calendarDiv.find('#calendarTitleHeading').text(), "Test Calendar");
    assert.equal($calendarDiv.find('.monthframe').attr('id'), this.calendar.monthObjects[0].monthId);
    assert.equal($calendarDiv.find('#yearHeader').text(), this.calendar.monthObjects[0].monthYear);
    assert.equal(this.$fixture.find('.week').length, 6);
    assert.equal(this.$fixture.find('td').length, 49);
    assert.equal(this.$fixture.find('.nil').length, 42);
    
    var daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    $calendarDiv.find('#dayNames td').each(function(index, td) {
        assert.equal($(this).html(), daysOfWeek[index]);
    });
    
    this.checkit.addMonth(this.calendar);
    $calendarDiv.empty();
    this.checkit.generateEmptyCalendar(this.calendar, $calendarDiv);
    assert.notOk($calendarDiv.find('20172 > #yearHeader').text(),
    "Make sure second month does not have a yearHeader");
});

QUnit.test("fillCalendar test", function( assert ) {
    assert.expect(72);
    
    var $calendarDiv = this.$fixture.find('#calendarDiv');
    // Add month to calendar
    this.checkit.addMonth(this.calendar);
    var firstMonth = this.calendar.monthObjects[0];
    var secondMonth = this.calendar.monthObjects[1];
    this.checkit.generateEmptyCalendar(this.calendar, $calendarDiv);
    
    assert.equal($calendarDiv.find('#20171').children().length, 4,
        "Number of children of first month");
    assert.equal($calendarDiv.find('#20172').children().length, 3,
        "Number of children of second month");
    this.checkit.fillCalendar(this.calendar);
    
    assert.equal($calendarDiv.find(".activeDay").first().children('.cell')
       .attr('id'), 20170214, "Check start day of the month");
        
    //Check first inactiveDay is the first of the month
    assert.equal($calendarDiv.find(".inactiveDay").first().children('.cell')
        .attr('id'), 20170201, "Check first of the month");
  
    $('#' + firstMonth.monthId).find('.cell').each( function(index) {
        assert.equal($(this).attr('id'), '201702' + 
        (index + 1 < 10? '0' + (index + 1).toString(): (index + 1).toString()),
        "Checking id's of .cell divs for first month");
    });
    $('#' + secondMonth.monthId).find('.cell').each( function(index) {
        assert.equal($(this).attr('id'), '201703' +
        (index + 1 < 10? '0' + (index + 1).toString(): (index + 1).toString()),
        "Checking id's of .cell divs for first month");
    });
   
    assert.equal($('#' + firstMonth.monthId).find(".month-year").text(),
        "February 2017");
    
    assert.equal(Object.keys(firstMonth.dayIndex).length, 28,
    "Asserting number of keys in dayIndex object of first month.");
    
    assert.equal(Object.keys(secondMonth.dayIndex).length, 31,
    "Asserting number of keys in dayIndex object of second month.");
    
    assert.equal($('#' + firstMonth.monthId).find('.activeDay').length,
    15, "Checking the number of .activeDay td elements in first month.");
    
    assert.equal($('#' + secondMonth.monthId).find('.activeDay').length,
     20, "Checking the number of .activeDay td elements in second month.");
     
    assert.equal($('#' + firstMonth.monthId).find('.cell').length,
    28, "Correct number of .cell elements in first month");
    
    assert.equal($('#' + secondMonth.monthId).find('.cell').length,
    31, "Checking the number of .cell td elements in second month.");
    
    assert.equal($('#' + firstMonth.monthId).find('.nil').length,
    14, "Correct number of .nil div elements in first month");
    
    assert.equal($('#' + secondMonth.monthId).find('.nil').length,
    11, "Correct number of .nil div elements in second month");
    
    fillMonth("Checking first month html", firstMonth, $calendarDiv, 44);
    fillMonth("Checking second month html", secondMonth, $calendarDiv, 52);


});

function fillMonth(testName, monthObj, $div, expected) {
    QUnit.test(testName, function(assert) {
        assert.expect(expected);
        assert.notOk(jQuery.isEmptyObject(monthObj.dayIndex),
            "dayIndex object for month is not empty");
        $div.find('#' + monthObj.monthId + ' .daynumber').each( function(index) {
            assert.equal($(this).html(), index + 1,
            "Correct daynumbers in first month");
        });
        $div.find('#' + monthObj.monthId + ' .checkmark').each(function (index) {
            assert.ok($(this).hasClass("hidden"),
            "Check that .checkmark divs have a hidden class in first month");
        });
    });
};

function selectorNameTest(testName, selectorName, expected) {
    QUnit.test(testName, function(assert) {
        assert.expect(1);
        assert.equal(selectorName.selector, expected);
    });
};


QUnit.test("Initialize CheckIt test", function( assert ) {
    assert.expect(2);
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
    selectorNameTest("loadingWheel selector test", this.checkit.$loadingWheel, '#loadingWheel');
    assert.equal(jQuery.type(this.checkit.spinner), 'object');
});


QUnit.module( "Checkit Calendar DOM Manipulation Tests", {
  beforeEach: function() {
    // prepare something before each test
    this.params = {startDate: "2017-02-14" , endDate: "2017-02-20" , calendarTitle: "Test Calendar"};
    this.state = emptyCalendarState(this.params);
    this.calendar = new Calendar(this.state);
    this.checkit = new CheckIt('localStorage');
    this.$fixture = $('#qunit-fixture');
    this.$calendarDiv = this.$fixture.find('#calendarDiv');
    this.checkit.generateEmptyCalendar(this.calendar, this.$calendarDiv);
    this.checkit.fillCalendar(this.calendar);

  },
  afterEach: function() {
    // clean up after each test
    this.$calendarDiv.empty();
  }
});


QUnit.test("attachCheckMarkClickHandler test", function( assert ) {
    assert.expect(6);
    this.checkit.attachCheckmarkClickHandler(this.calendar,
        this.calendar.monthObjects);
    
    assert.equal(this.$calendarDiv.find('#20171 .hidden').length, 7);
    // Check valentine's day
    this.$calendarDiv.find('#20170214').trigger('click');
    assert.equal(this.$calendarDiv.find('#20171 .hidden').length, 6);
    assert.equal(this.calendar.state.checkedDays['20170214'], 1);
    // Uncheck valentine's day
    this.$calendarDiv.find('#20170214').trigger('click');
    assert.equal(this.$calendarDiv.find('#20171 .hidden').length, 7);
    assert.deepEqual(this.calendar.state.checkedDays, {});
    // Check that this information was updated in localStorage
    var storedState = JSON.parse(localStorage.getItem(this.calendar.state.uniqueId));
    assert.deepEqual(storedState.checkedDays, this.calendar.state.checkedDays);
});

QUnit.test("generateCheckmarks test", function( assert ) {
    assert.expect(1);
    this.checkit.attachCheckmarkClickHandler(this.calendar,
        this.calendar.monthObjects);
    // Check valentine's day
    this.$calendarDiv.find('#20170214').trigger('click');
    // Clear calendar, and build again
    this.$calendarDiv.empty();
    this.checkit.generateEmptyCalendar(this.calendar, this.$calendarDiv);
    this.checkit.fillCalendar(this.calendar);
    this.checkit.attachCheckmarkClickHandler(this.calendar,
        this.calendar.monthObjects);
    this.checkit.generateCheckmarks(this.calendar, this.$calendarDiv);
    // Make sure valentine's day is checked on the DOM
    assert.equal(this.$calendarDiv.find('#20170214 .checkmark')
                 .attr('hidden'), undefined);
});

QUnit.test("removeEmptyWeeks test", function( assert ) {
    assert.expect(2);
    
    // Check that there are 6 .weeks
    assert.equal(this.$calendarDiv.find('.week').length, 6);
    
    this.checkit.removeEmptyWeeks(this.calendar, this.$calendarDiv);
    assert.equal(this.$calendarDiv.find('.week').length, 5);
    
});

QUnit.test("findCurrentDay test", function( assert ) {
    assert.expect(3);
    
    var currentDay = "20170214";
    assert.equal(this.$calendarDiv.find('#20170214').attr('class'), 'cell');
    this.checkit.findCurrentDay();
    // today's date does not exist in this calendar.
    assert.equal(this.$calendarDiv.find('.currentDay').length, 0);
    // Pass valentine's day in as the currentDay
    this.checkit.findCurrentDay(currentDay);
    assert.equal(this.$calendarDiv.find('.currentDay').length, 1);
    
});

QUnit.module( "Checkit DOM manipulation tests", {
  beforeEach: function() {
    // prepare something before each test
    this.params = {startDate: "2017-02-14" , endDate: "2017-02-20" , calendarTitle: "Test Calendar"};
    this.state = emptyCalendarState(this.params);
    this.calendar = new Calendar(this.state);
    this.checkit = new CheckIt('localStorage');
    this.$fixture = $('#qunit-fixture');
    this.$calendarDiv = this.$fixture.find('#calendarDiv');
    this.checkit.generateEmptyCalendar(this.calendar, this.$calendarDiv);
    this.checkit.fillCalendar(this.calendar);
    this.checkit.attachCheckmarkClickHandler(this.calendar, this.calendar.monthObjects);
    this.checkit.generateCheckmarks(this.calendar, this.$calendarDiv);
    this.checkit.removeEmptyWeeks(this.calendar, this.$calendarDiv);
    this.checkit.findCurrentDay('20170214');

  },
  afterEach: function() {
    // clean up after each test
    this.$calendarDiv.empty();
  }
});

QUnit.test("displayLoadingWheel test", function( assert ) {
    assert.expect(2);
    this.$calendarDiv.append(`<div id="loadingWheel"></div>`);
    this.checkit.displayLoadingWheel(this.$calendarDiv.find('#loadingWheel'));
    assert.equal(this.$calendarDiv.find('#loadingWheel').children().length, 1);
    // div with class 'spinner' added to loadingWheel
    assert.equal(this.$calendarDiv.find('#loadingWheel > .spinner').length, 1);
});

QUnit.test("hideLoadingWheel test", function( assert ) {
    assert.expect(1);
    this.$calendarDiv.append(`<div id="loadingWheel"></div>`);
    this.checkit.displayLoadingWheel(this.$calendarDiv.find('#loadingWheel'));
    this.checkit.hideLoadingWheel();
    assert.equal(this.$calendarDiv.find('#loadingWheel').children().length, 0);
});

QUnit.test("show and hide Form test", function( assert ) {
    assert.expect(1);
    
    this.$calendarDiv.append(`<div id="testCollapse" class="collapse"></div>`);
    
    var $testCollapse = this.$calendarDiv.find('#testCollapse');
    assert.equal($testCollapse.css('display'), 'none');
    this.checkit.showForm($testCollapse);
    setTimeout(function(){ 
        assert.equal($testCollapse.css('display'), 'block');
        }, 350);
    this.checkit.hideForm($testCollapse);
    setTimeout(function(){ 
        assert.equal($testCollapse.css('display'), 'none');
        }, 350);
    

});

QUnit.test("clearForm test", function( assert ) {
    assert.expect(1);
    var formHTML = `<form><div class="form-group"><label for="exemail">
        Email address</label><input type="email" class="form-control" 
        id="exemail" placeholder="Email"></div></form>`;
    this.$calendarDiv.append(formHTML);
    var $form = this.$calendarDiv.find('#exemail');
    $form.val('what@what.com');
    assert.equal($form.val(), 'what@what.com');
    this.checkit.clearForm($form);
    console.log($form.val());
});

QUnit.test("addCalendarToDropdown test", function( assert ) {
    assert.expect(0);
});

QUnit.test("removeFromCalendarDropdown test", function( assert ) {
    assert.expect(0);
});

QUnit.test("clearDropdown test", function(assert) {
    assert.expect(0);
});

QUnit.test("clearPage", function(assert) {
    assert.expect(0);
});

QUnit.module( "Build Calendar Form Tests", {
  before: function() {
    // prepare something once for all tests
  },
  beforeEach: function() {
    // prepare something before each test
  },
  afterEach: function() {
    // clean up after each test
  },
  after: function() {
    // clean up once after all tests are done
  }
});
// TODO Likely have to refactor the below functions
QUnit.test("addFormError test", function( assert ) {
    assert.expect(0);
});

QUnit.test("removeFormError test", function( assert ) {
    assert.expect(0);
});

QUnit.test("addGlyphicon test", function( assert) {
    assert.expect(0);
});

QUnit.test("removeGlyphicon test", function(assert) {
    assert.expect(0);
});

QUnit.test("removeFormErrors test", function(assert) {
    assert.expect(0);
});

QUnit.test("validateDates test", function(assert) {
    assert.expect(0);
});

QUnit.test("validateInput test", function(assert) {
    assert.expect(0);
});

QUnit.test("validateForm test", function(assert) {
    assert.expect(0);
});

QUnit.module( "CheckIt tests for functions that involve store", {
  before: function() {
    // prepare something once for all tests
  },
  beforeEach: function() {
    // prepare something before each test
  },
  afterEach: function() {
    // clean up after each test
  },
  after: function() {
    // clean up once after all tests are done
  }
});

// TODO test that tests if the correct init function runs depending on
// which storage is passed to CheckIt
QUnit.test("initLocalStorage test", function(assert) {
    assert.expect(0);
});

QUnit.test("displayActiveCalendar test", function(assert) {
    assert.expect(0);
});

QUnit.test("fillDropdown test", function(assert) {
    assert.expect(0);
});

QUnit.test("onActivityChanged test", function(assert) {
    assert.expect(0);
});

QUnit.test("createCalendar test", function(assert) {
    assert.expect(0);
});

QUnit.test("loadFromDropdown test", function(assert) {
    assert.expect(0);
});

QUnit.test("deleteCalendar test", function(assert) {
    assert.expect(0);
});

QUnit.test("buildCalendar test", function(assert) {
    // Probably not needed because each function inside of buildCalendar
    // has already been tested.
    assert.expect(0);
});

QUnit.test("displayCalendar test", function(assert) {
    assert.expect(0);
});


QUnit.module( "CheckIt tests for functions that involve firebase", {
  before: function() {
    // prepare something once for all tests
  },
  beforeEach: function() {
    // prepare something before each test
  },
  afterEach: function() {
    // clean up after each test
  },
  after: function() {
    // clean up once after all tests are done
  }
});

QUnit.test("initFirebase test", function(assert) {
    assert.expect(0);
});

QUnit.test("signIn test", function(assert) {
    assert.expect(0);
});

QUnit.test("signOut test", function(assert) {
    assert.expect(0);
});

QUnit.test("updateUserDescription test", function(assert) {
    assert.expect(0);
});

QUnit.test("onAuthStateChanged test", function(assert) {
    assert.expect(0);
});

// And pretty much all of the same functions as localStorage (createCalendar, etc)

QUnit.module( "CheckIt tests for clickHandlers", {
  before: function() {
    // prepare something once for all tests
  },
  beforeEach: function() {
    // prepare something before each test
  },
  afterEach: function() {
    // clean up after each test
  },
  after: function() {
    // clean up once after all tests are done
  }
});
