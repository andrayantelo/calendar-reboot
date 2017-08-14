/*jslint devel: true, es5: true, nomen: true*/
/*global
    browser:true, Promise, firebase, QUnit, moment, Month,
    generateUniqueId, emptyCalendarState, Calendar, $, CheckIt,
    jQuery, checkit
*/

// Tests for checkit.js

// Testing Month Object
QUnit.module("Month Tests", {
// Hardcoded a date for moment object because javascript's Date object
// does not have a way to get the number of days in the month.


    beforeEach: function () {
    // Initiate a test month object
        "use strict";
        localStorage.clear();
        this.valentine = moment("2017-02-14", "YYYY-MM-DD");
        this.dateString = this.valentine.format("YYYYMMDD");
        this.testmonth = new Month(this.dateString);
    },
    afterEach: function () {
        "use strict";
        localStorage.clear();
    }

});

QUnit.test("init month object test", function (assert) {
    
    "use strict";
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
QUnit.module("Calendar helper functions tests", {
    beforeEach: function () {
        "use strict";
        localStorage.clear();
    },
    afterEach: function () {
        "use strict";
        localStorage.clear();
    }
});

QUnit.test("generateUniqueId test", function (assert) {
    "use strict";
    assert.expect(1);
    var uniqueId = generateUniqueId(),
        uniqueId2 = generateUniqueId();
    
    assert.notEqual(uniqueId, uniqueId2);
});

QUnit.test("emptyCalendarState test", function (assert) {
    "use strict";
    assert.expect(9);
    var params = {startDate: "2017-02-14", endDate: "2017-02-20", calendarTitle: "Hello"},

        state = emptyCalendarState(params);
    
    assert.equal(state.title, "Hello", "Checking state title");
    assert.equal(state.startDateString, "20170214", "Checking startDateString");
    assert.equal(state.endDateString, "20170220", "Checking endDateString");
    assert.ok(state.uniqueId);
    assert.deepEqual(state.checkedDays, {});
    
    //assert that an exception is thrown with invalid dates.
    params.endDate = "2017-01-01";
    
    assert.raises(function () {
        emptyCalendarState(params);
    }, Error, "testing invalid dates");
    assert.raises(function () {
        emptyCalendarState(params);
    }, /End date must be a date after start date./, "Testing error message");
    
    params.startDate = "2017-02-14";
    params.endDate = "2017-02-20";
    params.calendarTitle = "";
    
    assert.raises(function () {
        emptyCalendarState(params);
    }, Error, "Testing empty calendar title string");
    
    assert.raises(function () {
        emptyCalendarState(params);
    }, /Must provide a calendar title\./, "Testing error message");
});

// Testing calendar object 
QUnit.module("Calendar Tests", {

    beforeEach: function () {
        "use strict";
        // Initiate a test calendar object for testing
        localStorage.clear();
        this.params = {startDate: "2017-02-14", endDate: "2017-02-20", calendarTitle: "Test Calendar"};

        this.state = emptyCalendarState(this.params);

        this.calendar = new Calendar(this.state);
    },
    afterEach: function () {
        "use strict";
        localStorage.clear();
    }

});

QUnit.test("Init calendar object test", function (assert) {
    "use strict";
    assert.expect(7);
  
    assert.deepEqual(this.calendar.state, this.state, "Check state is correct");
    assert.ok(moment.isMoment(this.calendar.startDate, "startDate is a moment obj"));
    assert.ok(moment.isMoment(this.calendar.endDate, "endDate is a moment obj"));
    assert.equal(this.calendar.startDate.format("YYYYMMDD"), "20170214", "Checking startDate object's date");
    assert.equal(this.calendar.endDate.format("YYYYMMDD"), "20170220", "Checking endDate object's date");
    assert.equal(this.calendar.monthObjects.length, 1);
    assert.equal(typeof (this.calendar.monthObjects[0]), "object", "Month object is object");
});



QUnit.test("addMonth calendar method test", function (assert) {
    "use strict";
    assert.expect(4);
    this.calendar.addMonth();
    
    assert.equal(this.calendar.endDate.format("YYYYMMDD"), "20170320", "Check one month was added to endDate object");
    assert.equal(this.calendar.state.endDateString, "20170320", "Check calendar endDateString added a month");
    assert.equal(this.calendar.monthObjects.length, 2, "Check month was added to monthObjects array");
    assert.equal(typeof (this.calendar.addMonth()), "object", "addMonth returns an object");
});

QUnit.test("generateMonthObjects calendar method test", function (assert) {
    "use strict";
    assert.expect(7);
    
    var monthObjects = this.calendar.generateMonthObjects(moment("20170101", "YYYYMMDD"), moment("20170214", "YYYYMMDD"));
    assert.ok(Array.isArray(monthObjects));
    assert.equal(monthObjects[0].dateString, "20170101");
    assert.equal(monthObjects[1].dateString, "20170201");
    assert.equal(monthObjects[1].lastActiveDay, 14);
    assert.equal(monthObjects.length, 2);
    
    assert.raises(function () {
        this.calendar.generateMonthObjects(moment("20170214", "YYYYMMDD"), moment("20170101", "YYYYMMDD"));
    }, Error, "Testing invalid dates");
    assert.raises(function () {
        this.calendar.generateMonthObjects(moment("20170214", "YYYYMMDD"), moment("20170101", "YYYYMMDD"));
    }, /End date must be a date after start date/, "testing error message");
});


// Testing checkit object 
QUnit.module("CheckIt Tests", {

    beforeEach: function () {
        "use strict";
        // Initialize a fresh checkit object and a dummy active calendar for every test
        localStorage.clear();
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');

        this.checkit = new CheckIt('localStorage', $('#qunit-fixture #calendarDiv'));
        this.params = {startDate: "2017-02-14", endDate: "2017-02-20", calendarTitle: "Test Calendar"};
        this.state = emptyCalendarState(this.params);
        this.calendar = new Calendar(this.state);
    },
    afterEach: function () {
        "use strict";
        localStorage.clear();
    }

});


QUnit.test("addMonth test", function (assert) {
    "use strict";
    assert.expect(2);
    assert.equal(this.calendar.monthObjects.length, 1);
    this.checkit.addMonth(this.calendar);
    assert.equal(this.calendar.monthObjects.length, 2);
    
});

QUnit.test("generateEmptyCalendar test", function (assert) {
    "use strict";
    assert.expect(14);
    var $calendarDiv = this.$calendarDiv,
        daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    this.checkit.generateEmptyCalendar(this.calendar, $calendarDiv);
    assert.equal($calendarDiv.find('.calendarTitleHeading').text(), "Test Calendar");
    assert.equal($calendarDiv.find('.monthframe').attr('id'), this.calendar.monthObjects[0].monthId);
    assert.equal($calendarDiv.find('.year-header').text(), this.calendar.monthObjects[0].monthYear);
    assert.equal(this.$fixture.find('.week').length, 6);
    assert.equal(this.$fixture.find('td').length, 49);
    assert.equal(this.$fixture.find('.nil').length, 42);
    
    $calendarDiv.find('#dayNames td').each(function (index, td) {
        assert.equal($(this).html(), daysOfWeek[index]);
    });
    
    this.checkit.addMonth(this.calendar);
    $calendarDiv.empty();
    this.checkit.generateEmptyCalendar(this.calendar, $calendarDiv);
    assert.notOk($calendarDiv.find('20172 > .year-header').text(),
        "Make sure second month does not have a year-header");
});

QUnit.test("fillCalendar test", function (assert) {
    "use strict";
    assert.expect(72);
    
    var $calendarDiv = this.$calendarDiv,
        firstMonth,
        secondMonth;
    
    // Add month to calendar
    this.checkit.addMonth(this.calendar);
    this.checkit.generateEmptyCalendar(this.calendar);
    
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
    
    firstMonth = this.calendar.monthObjects[0];
    $('#' + firstMonth.monthId).find('.cell').each(function (index) {
        assert.equal($(this).attr('id'), '201702' +
            (index + 1 < 10 ? '0' + (index + 1).toString() : (index + 1).toString()),
            "Checking id's of .cell divs for first month");
    });
    
    secondMonth = this.calendar.monthObjects[1];
    $('#' + secondMonth.monthId).find('.cell').each(function (index) {
        assert.equal($(this).attr('id'), '201703' +
            (index + 1 < 10 ? '0' + (index + 1).toString() : (index + 1).toString()),
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
    
    //fillMonth("Checking first month html", firstMonth, $calendarDiv, 44);
    //fillMonth("Checking second month html", secondMonth, $calendarDiv, 52);


});

function fillMonth(testName, monthObj, $div, expected) {
    "use strict";
    
    // this test fails when initLocalStorage method in checkit.js runs 
    // displayActiveCalendar (because it changes the html).
    QUnit.test(testName, function (assert) {
        assert.expect(expected);

        assert.notOk(jQuery.isEmptyObject(monthObj.dayIndex),
            "dayIndex object for month is not empty");
        
        $div.find('#' + monthObj.monthId + ' .daynumber').each(function (index) {
            assert.equal($(this).html(), index + 1,
                "Correct daynumbers in first month");
        });
        $div.find('#' + monthObj.monthId + ' .checkmark').each(function (index) {
            assert.ok($(this).hasClass("hidden"),
                "Check that .checkmark divs have a hidden class in first month");
        });
    });
}

function selectorNameTest(testName, selectorName, expected) {
    "use strict";
    QUnit.test(testName, function (assert) {
        assert.expect(1);
        assert.equal(selectorName.selector, expected);
    });
}


QUnit.test("Initialize CheckIt test", function (assert) {
    "use strict";
    assert.expect(2);
    assert.equal(this.checkit.mode, 'localStorage', "Checking checkit object's mode");
    
    selectorNameTest("userPic selector test", this.checkit.$userPic, '#user-pic');
    selectorNameTest("userName selector test", this.checkit.$userName, '#user-name');
    selectorNameTest("Sign-in button selector test", this.checkit.$signInButton, '#sign-in');
    selectorNameTest("Sign-out button selector test", this.checkit.$signOutButton, '#sign-out');
    selectorNameTest("getStarted selector test", this.checkit.$getStarted, '#getStarted');
    selectorNameTest("buildFormAccordion selector test", this.checkit.$buildFormAccordion, '#buildFormAccordion');
    selectorNameTest("titleForm selector test", this.checkit.$titleFormGroup, '#titleFormGroup');
    selectorNameTest("startDateForm selector test", this.checkit.$startDateFormGroup, '#startDateFormGroup');
    selectorNameTest("endDateForm selector test", this.checkit.$endDateFormGroup, '#endDateFormGroup');
    selectorNameTest("startDatePicker selector test", this.checkit.$startDatePicker, '#datetimepicker1');
    selectorNameTest("startDatePickerInput selector test", this.checkit.$startDatePickerInput, '#datetimepicker1 input');
    selectorNameTest("endDatePicker selector test", this.checkit.$endDatePicker, '#datetimepicker2');
    selectorNameTest("endDatePickerInput selector test", this.checkit.$endDatePickerInput, '#datetimepicker2 input');
    selectorNameTest("calendarDropdown selector test", this.checkit.$calendarDropdown, '#calendarDropdown');
    selectorNameTest("startDateErrorSpan selector test", this.checkit.$srStartDateError, '#srStartDateError');
    selectorNameTest("endDateErrorSpan selector test", this.checkit.$srEndDateError, '#srEndDateError');
    selectorNameTest("titleErrorSpan selector test", this.checkit.$srTitleError, '#srTitleError');
    selectorNameTest("titleGlyphiconTag selector test", this.checkit.$titleErrorGlyphicon, '#titleErrorGlyphicon');
    selectorNameTest("clearButton selector test", this.checkit.$clearButton, '#clearButton');
    selectorNameTest("fullForm selector test", this.checkit.$fullForm, '#fullForm');
    selectorNameTest("createButton selector test", this.checkit.$createButton, '#createButton');
    selectorNameTest("deleteButton selector test", this.checkit.$deleteButton, '#deleteButton');
    selectorNameTest("calendarTitle selector test", this.checkit.$calendarTitle, '#calendarTitle');
    selectorNameTest("startDate selector test", this.checkit.$startDate, '#startDate');
    selectorNameTest("endDate selector test", this.checkit.$endDate, '#endDate');
    selectorNameTest("buildCalendarForm selector test", this.checkit.$buildCalendarForm, '#collapseOne');
    selectorNameTest("calendarDiv selector test", this.checkit.$calendarDiv, '#qunit-fixture #calendarDiv');
    selectorNameTest("loadingWheel selector test", this.checkit.$loadingWheel, '#loadingWheel');
    assert.equal(jQuery.type(this.checkit.spinner), 'object');
});


QUnit.module("Checkit Calendar DOM Manipulation Tests", {
    beforeEach: function () {
        "use strict";
        // Initialize a test calendar object, checkit object, and generate
        // the test calendar html
        localStorage.clear();
        this.params = {startDate: "2017-02-14", endDate: "2017-02-20", calendarTitle: "Test Calendar"};
        this.state = emptyCalendarState(this.params);
        this.calendar = new Calendar(this.state);
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        this.checkit = new CheckIt('localStorage', this.$calendarDiv);
        this.checkit.generateEmptyCalendar(this.calendar, this.$calendarDiv);
        this.checkit.fillCalendar(this.calendar);

    },
    afterEach: function () {
        "use strict";
        // clean up calendar html
        localStorage.clear();
        this.$calendarDiv.empty();
    }
});


QUnit.test("attachCheckMarkClickHandler test", function (assert) {
    "use strict";
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

QUnit.test("generateCheckmarks test", function (assert) {
    "use strict";
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

QUnit.test("removeEmptyWeeks test", function (assert) {
    "use strict";
    assert.expect(2);
    
    // Check that there are 6 .weeks
    assert.equal(this.$calendarDiv.find('.week').length, 6);
    
    this.checkit.removeEmptyWeeks(this.calendar, this.$calendarDiv);
    assert.equal(this.$calendarDiv.find('.week').length, 5);
    
});

QUnit.test("findCurrentDay test", function (assert) {
    "use strict";
    assert.expect(2);
    
    assert.equal(this.$calendarDiv.find('#20170214').attr('class'), 'cell');
    this.checkit.findCurrentDay();
    // today's date does not exist in this calendar.
    assert.equal(this.$calendarDiv.find('.currentDay').length, 0);
});

QUnit.module("Checkit DOM manipulation tests", {
    beforeEach: function () {
        "use strict";
        // Initiate a test calendar object, checkit object, and generate all
        // the html for the test calendar.
        localStorage.clear();
        this.params = {startDate: "2017-02-14", endDate: "2017-02-20", calendarTitle: "Test Calendar"};
        this.state = emptyCalendarState(this.params);
        this.calendar = new Calendar(this.state);
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        this.checkit = new CheckIt('localStorage', this.$calendarDiv);
        this.checkit.generateEmptyCalendar(this.calendar, this.$calendarDiv);
        this.checkit.fillCalendar(this.calendar);
        this.checkit.attachCheckmarkClickHandler(this.calendar, this.calendar.monthObjects);
        this.checkit.generateCheckmarks(this.calendar, this.$calendarDiv);
        this.checkit.removeEmptyWeeks(this.calendar, this.$calendarDiv);
        this.checkit.findCurrentDay('20170214');

    },
    afterEach: function () {
        "use strict";
        // clean up calendar html
        localStorage.clear();
        this.$calendarDiv.empty();
    }
});

QUnit.test("displayLoadingWheel test", function (assert) {
    "use strict";
    assert.expect(2);
    this.$calendarDiv.append('<div id="loadingWheel"></div>');
    this.checkit.displayLoadingWheel(this.$calendarDiv.find('#loadingWheel'));
    assert.equal(this.$calendarDiv.find('#loadingWheel').children().length, 1);
    // div with class 'spinner' added to loadingWheel
    assert.equal(this.$calendarDiv.find('#loadingWheel > .spinner').length, 1);
});

QUnit.test("hideLoadingWheel test", function (assert) {
    "use strict";
    assert.expect(1);
    this.$calendarDiv.append('<div id="loadingWheel"></div>');
    this.checkit.displayLoadingWheel(this.$calendarDiv.find('#loadingWheel'));
    this.checkit.hideLoadingWheel();
    assert.equal(this.$calendarDiv.find('#loadingWheel').children().length, 0);
});

QUnit.test("clearCalendarDiv", function (assert) {
    "use strict";
    assert.expect(2);
    assert.ok(this.$calendarDiv.children().length > 0);
    this.checkit.clearCalendarDiv();
    console.log(this.$calendarDiv.html());
    assert.notOk(this.$calendarDiv.children().length > 0);
});

QUnit.module("CheckIt tests dropdown", {
    beforeEach: function () {
        "use strict";
        // prepare something before each test
        localStorage.clear();
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        this.checkit = new CheckIt('localStorage', this.$calendarDiv);

        this.$fixture.append('<div id="dropdownContainer"><ul id="dropdown"></ul></div>');
        this.$dropdown = this.$fixture.find('#dropdown');
    },
    afterEach: function () {
        "use strict";
        // clean up after each test
        localStorage.clear();
        this.$fixture.find('#dropdown').empty();
    }
});


QUnit.test("addCalendarToDropdown test", function (assert) {
    "use strict";
    assert.expect(5);
        // Check with items in dropdown already.
    this.$dropdown.append("<li>Hello World</li>");
    assert.equal(this.$dropdown.children().length, 1);
    this.checkit.addCalendarToDropdown("101", "Cal", this.$dropdown);
    assert.equal(this.$dropdown.children().length, 2);
    
    assert.equal(this.$dropdown.find('#1234').length, 0);
    this.checkit.addCalendarToDropdown("1234", "Hello", this.$dropdown);
    assert.equal(this.$dropdown.find('#1234').text(), "Hello");
    assert.equal(this.$dropdown.find('#1234').length, 1);
});

QUnit.test("removeFromCalendarDropdown test", function (assert) {
    "use strict";
    assert.expect(4);
    this.$dropdown.append('<li id="1234">Hello</li>');
    assert.equal(this.$dropdown.children().attr('id'), '1234');
    assert.equal(this.$dropdown.children().text(), "Hello");
    assert.equal(this.$dropdown.children().length, 1);
    this.checkit.removeFromCalendarDropdown("1234", this.$dropdown);
    assert.equal(this.$dropdown.children().length, 0);
});

QUnit.test("clearDropdown test", function (assert) {
    "use strict";
    assert.expect(2);
    this.$dropdown.append('<li id="1">Hello</li>');
    this.$dropdown.append('<li id="2">Hoi</li>');
    this.$dropdown.append('<li id="3">Hola</li>');
    
    assert.equal(this.$dropdown.children().length, 3);
    this.checkit.clearDropdown(this.$dropdown);
    assert.equal(this.$dropdown.children().length, 0);
});



QUnit.module("Form Tests", {
    beforeEach: function () {
        "use strict";
        // Initiate a checkit object, and html for a mock form that includes
        // hidden error elements
        localStorage.clear();
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        this.checkit = new CheckIt('localStorage', this.$calendarDiv);
        var formHTML =
            '<form id="fullForm"><div class="form-group"\
            id="emailFormGroup"><input type="email" class="form-control"\
            id="exemail"><span id="sr" class="sr-only hidden">(error)</span>\
            <span id="helpBlock" class="help-block hidden">This is some help text\
            .</span><span id ="fiveYears" class="help-block hidden">Five years.\
            </span></div></form>';
        this.$calendarDiv.append(formHTML);
        this.$form = this.$calendarDiv.find('#fullForm');
        this.$formGroup = this.$form.find('#emailFormGroup');
        this.$sr = this.$form.find('#sr');
        this.$form.find('.form-group').append(
            '<span id="heart" class="glyphicon glyphicon-heart hidden glyph" aria-hidden="true"></span>'
        );
        this.$heart = this.$form.find('#heart');
        this.$helpBlock = this.$formGroup.find('#helpBlock');
        this.$fiveYears = this.$formGroup.find('#fiveYears');
    },
    afterEach: function () {
        "use strict";
        // clean up html
        localStorage.clear();
        this.$calendarDiv.empty();
    }
});

QUnit.test("show and hide Form test", function (assert) {
    "use strict";
    assert.expect(1);
    
    this.$calendarDiv.append('<div id="testCollapse" class="collapse"></div>');
    
    var $testCollapse = this.$calendarDiv.find('#testCollapse');
    assert.equal($testCollapse.css('display'), 'none');
    this.checkit.showForm($testCollapse);
    setTimeout(function () {
        assert.equal($testCollapse.css('display'), 'block');
    }, 350);
    this.checkit.hideForm($testCollapse);
    setTimeout(function () {
        assert.equal($testCollapse.css('display'), 'none');
    }, 350);
});

QUnit.test("clearForm test", function (assert) {
    "use strict";
    assert.expect(2);

    var $formInput = this.$form.find('input');
    $formInput.val('what@what.com');

    assert.equal($formInput.val(), 'what@what.com');
    
    this.checkit.clearForm(this.$form);
    
    assert.equal($formInput.val(), "");
});

QUnit.test("addFieldError test", function (assert) {
    "use strict";
    assert.expect(4);
    
    assert.equal(this.$formGroup.find('has-error').length, 0);
    assert.ok(this.$sr.hasClass('hidden'));
    this.checkit.addFieldError(this.$formGroup, this.$sr);
    
    assert.ok(this.$formGroup.hasClass('has-error'));
    assert.notOk(this.$sr.hasClass('hidden'));
});

QUnit.test("removeFieldError test", function (assert) {
    "use strict";
    assert.expect(4);
    // Give the form errors
    this.$formGroup.addClass('has-error has-feedback');
    this.$sr.removeClass('hidden');
    
    assert.ok(this.$formGroup.hasClass('has-error has-feedback'));
    assert.notOk(this.$sr.hasClass('hidden'));
    // Remove the rrors
    this.checkit.removeFieldError(this.$formGroup, this.$sr);
    assert.notOk(this.$formGroup.hasClass('has-error has-feedback'));
    assert.ok(this.$sr.hasClass('hidden'));
    
});

QUnit.test("addGlyphicon test", function (assert) {
    "use strict";
    assert.expect(3);
    
    assert.ok(this.$heart.hasClass('hidden'));

    this.checkit.addGlyphicon(this.$heart);
    assert.notOk(this.$heart.hasClass('hidden'));
    
    this.$heart.addClass('hidden');
    this.$heart.removeClass('glyph');
    // addGlyphicon should remove the class 'hidden' from #heart
    this.checkit.addGlyphicon(this.$heart);
    assert.ok(this.$heart.hasClass('hidden'));
});

QUnit.test("removeGlyphicon test", function (assert) {
    "use strict";
    assert.expect(3);
    
    this.$heart.removeClass('hidden');
    assert.notOk(this.$heart.hasClass('hidden'));
    this.checkit.removeGlyphicon(this.$heart);
    assert.ok(this.$heart.hasClass('hidden'));
    
    this.$heart.removeClass('hidden');
    this.$heart.removeClass('glyph');
    // removeGlyphicon should add class 'hidden' to #heart
    this.checkit.removeGlyphicon(this.$heart);
    assert.notOk(this.$heart.hasClass('hidden'));
});

QUnit.test("addHelpBlock test", function (assert) {
    "use strict";
    assert.expect(2);

    assert.ok(this.$helpBlock.hasClass('hidden'), "helpBlock is hidden");
    this.checkit.addHelpBlock(this.$helpBlock);
    assert.notOk(this.$helpBlock.hasClass('hidden'), "helpBlock is not hidden");
});

QUnit.test("removeHelpBlock test", function (assert) {
    "use strict";
    assert.expect(2);
    
    assert.ok(this.$helpBlock.hasClass('hidden'), "helpBlock is hidden");
    this.checkit.removeHelpBlock(this.$helpBlock);
    assert.ok(this.$helpBlock.hasClass('hidden'), "helpBlock is hidden");
});

QUnit.test("removeFormErrors test", function (assert) {
    "use strict";
    assert.expect(6);
    // Add errors to input field and reveal glyphicon and assert
    this.$heart.removeClass('hidden');
    assert.notOk(this.$heart.hasClass('hidden'));
    this.$formGroup.addClass('has-error has-feedback');
    assert.ok(this.$formGroup.hasClass('has-error'));
    assert.ok(this.$formGroup.hasClass('has-feedback'));
    // Remove form errors and assert
    this.checkit.removeFormErrors(this.$form);
    assert.ok(this.$heart.hasClass('hidden'));
    assert.notOk(this.$formGroup.hasClass('has-error'));
    assert.notOk(this.$formGroup.hasClass('has-feedback'));
});

QUnit.test("validateDates test", function (assert) {
    "use strict";
    assert.expect(17);
    // Ensure true is returned when dates are correct (startDate before
    // endDate and no more than 5 years between them
    
    var startDate = "2017-01-01",
        endDate = "2017-02-01",
        validDates = this.checkit.validateDates(startDate, endDate,
            this.$formGroup),
        invalidDates,
        invalidYear,
        moreThanFive;
    
    assert.ok(validDates, "endDate > startDate < 5 years");
    assert.notOk(this.$formGroup.hasClass('has-error'));
    assert.notOk(this.$formGroup.hasClass('has-feedback'));
    
    // Ensure false when endDate is before startDate but they are still
    // less than 5 years apart.
    endDate = "2016-12-01";
    invalidDates = this.checkit.validateDates(startDate, endDate,
        this.$formGroup);
    assert.notOk(invalidDates, "endDate < startDate");
    assert.ok(this.$formGroup.hasClass('has-error'), 'Has has-error class');
    assert.ok(this.$formGroup.hasClass('has-feedback'), 'Has has-feedback class');
    assert.notOk(this.$helpBlock.hasClass('hidden'), "endDate < startDate helpBlock");
    // Remove errors
    this.$formGroup.removeClass('has-error');
    this.$formGroup.removeClass('has-feedback');
    this.$helpBlock.addClass('hidden');
    // Ensure false when endDate is before startDate AND they are more than 
    // 5 years apart, in this case, the form just shows error for the 
    // end date being before the start date
    endDate = "2011-01-01";
    invalidYear = this.checkit.validateDates(startDate, endDate,
        this.$formGroup);
    assert.notOk(invalidYear, "endDate < startDate and > 5 years");
    assert.ok(this.$formGroup.hasClass('has-error'), 'Has has-error class');
    assert.ok(this.$formGroup.hasClass('has-feedback'), 'Has has-feedback class');
    assert.notOk(this.$helpBlock.hasClass('hidden'), "endDate < startDate helpBlock");
    assert.ok(this.$fiveYears.hasClass('hidden'), "> 5 years apart");
    // Remove errors
    this.$formGroup.removeClass('has-error');
    this.$formGroup.removeClass('has-feedback');
    this.$helpBlock.addClass('hidden');
    this.$fiveYears.addClass('hidden');
    // Ensure false when endDate is after startDate BUT they are more than 5
    // years apart. Function should return false, add a helpBlock, and field errors
    endDate = "2023-01-01";
    moreThanFive = this.checkit.validateDates(startDate, endDate,
        this.$formGroup);
    assert.notOk(moreThanFive, "More than five years invalid");
    assert.ok(this.$formGroup.hasClass('has-error'), "does not have has-error");
    assert.ok(this.$formGroup.hasClass('has-feedback'), 'does not have has-feedback class');
    assert.ok(this.$helpBlock.hasClass('hidden'), "helpClass is hidden");
    assert.notOk(this.$fiveYears.hasClass('hidden'), "Over five years");

});

QUnit.test("validateInput test", function (assert) {
    "use strict";
    assert.expect(4);
    // Ensure validateInput returns false for an empty string
    var empty = this.checkit.validateInput(this.$form, this.$formGroup, 'exemail');
    assert.notOk(empty, "validateInput returns false for empty string");
    assert.ok(this.$formGroup.hasClass('has-error'), 'error for invalid input');
    assert.ok(this.$formGroup.hasClass('has-feedback'), 'feedback for invalid input');
    assert.notOk(this.$heart.hasClass('hidden'), 'glyphicon is visible');
});

QUnit.test("validateForm test", function (assert) {
    "use strict";
    assert.expect(0);
    // validateForm is made up of individual functions that I already tested
    // Do I need to write this?

});

QUnit.module("CheckIt tests for functions that involve store", {
    beforeEach: function () {
        "use strict";
        // clear localStorage, initiate checkit object, calendar object, and
        // store in storage other test calendars. Also generate html for one
        // of the test calendars

        localStorage.clear();
        var uniqueId,
            allCalendarIdsKey,
            allCalendarIds,
            current_active_calendar;

        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');

        this.checkit = new CheckIt('localStorage', $('#qunit-fixture #calendarDiv'));
        this.store = this.checkit.store;

        this.params = {startDate: "2017-02-14", endDate: "2017-02-20", calendarTitle: "Test Calendar"};
        this.state = emptyCalendarState(this.params);
        this.calendar = new Calendar(this.state);
        uniqueId = this.calendar.state.uniqueId;

        this.checkit.generateEmptyCalendar(this.calendar, this.$calendarDiv);
        this.checkit.fillCalendar(this.calendar);
        // Set some calendars in localStorage
        // allCalendarIds
        allCalendarIdsKey = 'allCalendarIdsKey';
        allCalendarIds = {'1234' : 'hello', '5678': 'world'};
        allCalendarIds[uniqueId] = 'Test Calendar';

        localStorage.setItem(allCalendarIdsKey, JSON.stringify(allCalendarIds));
        //current active calendar
        current_active_calendar = 'current_active_calendar';
        localStorage.setItem(current_active_calendar, '1234');

        //calendar states
        this.helloState = {uniqueId: '1234', title: 'hello', startDateString: "20170101", endDateString: "20171201"};
        this.worldState = {uniqueId: '5678', title: 'world', startDateString: "20160101", endDateString: "20161201"};
        localStorage.setItem(uniqueId, JSON.stringify(this.state));
        localStorage.setItem(this.helloState.uniqueId, JSON.stringify(this.helloState));
        localStorage.setItem(this.worldState.uniqueId, JSON.stringify(this.worldState));
        //add loading wheel
        this.$calendarDiv.append('<div id="loadingWheel"></div>');
        // make calendar objects out of hello calendar and world calendar
        this.helloCal = new Calendar(this.helloState);
        this.worldCal = new Calendar(this.worldState);
    
    },
    afterEach: function () {
        "use strict";
        // clean up calendar html, and reset checkit's calendar div
        localStorage.clear();
        this.$calendarDiv.empty();
    }
});


QUnit.test("displayActiveCalendar test", function (assert) {
    "use strict";
    assert.expect(8);
    var $calendarDiv = this.$calendarDiv,
        done,
        displayActiveP,
        displayNoP;
    
    // When there is a current Active Calendar
    assert.equal($calendarDiv.find('h1').text(), 'Test Calendar');
    // currentActiveCalendar
    done = assert.async(2);
    assert.equal($calendarDiv.find('.monthframe').length, 1);
    displayActiveP = this.checkit.displayActiveCalendar();
    displayActiveP.then(function () {
        assert.equal($calendarDiv.find('h1').text(), 'hello');
        assert.equal($calendarDiv.find('.monthframe').length, 12);
        done();
    });
    
    // When there isn't a current active calendar
    $calendarDiv.empty();
    assert.equal($calendarDiv.find('.monthframe').length, 0);
    localStorage.removeItem('current_active_calendar');
    assert.equal(JSON.parse(localStorage.getItem('current_active_calendar')), null);
    displayNoP = this.checkit.displayActiveCalendar();
    displayNoP.then(function (val) {
        assert.equal(val, "Active Calendar Id Not found");
        assert.equal($calendarDiv.find('.monthframe').length, 0);
        done();
    });

});

QUnit.test("onActivityChanged test", function (assert) {
    "use strict";
    assert.expect(4);
    // check that loading wheel is displayed when active calls > 0 and hidden
    // when active calls === 0, what about if active calls < 0? throw an error?
    
    //active calls > 0
    assert.equal($('#loadingWheel').children().length, 0);
    this.checkit.onActivityChanged(1, 'loadingWheel');
    assert.equal($('#loadingWheel').children().length, 1);
    
    // active calls === 0
    this.checkit.onActivityChanged(0, 'loadingWheel');
    assert.equal($('#loadingWheel').children().length, 0);
    
    // check that there is no loadingWheel if activeCalls < 0
    this.checkit.onActivityChanged(-1, 'loadingWheel');
    assert.equal($('#loadingWheel').children().length, 0);
    
});

QUnit.test("deleteCalendar test", function (assert) {
    "use strict";
    assert.expect(8);
    var done = assert.async(),
    
    
        activeCal =             JSON.parse(localStorage.getItem('current_active_calendar')),
        activeCalState = JSON.parse(localStorage.getItem('1234')),
        allCalendarIds = JSON.parse(localStorage.getItem('allCalendarIdsKey')),
        currentActive;
    
    assert.equal(allCalendarIds['1234'], 'hello');
    assert.deepEqual(activeCalState, this.helloState);
    assert.equal(activeCal, '1234');
    
    this.checkit.deleteCalendar().then(function () {
        var noActive = JSON.parse(localStorage.getItem('current_active_calendar')),
            state = JSON.parse(localStorage.getItem('1234')),
            ids = JSON.parse(localStorage.getItem('allCalendarIdsKey'));
        
        assert.equal(noActive, null);
        assert.deepEqual(state, null);
        assert.equal(ids['123'], null);
        done();
    });
    
    // remove current active calendar from storage
    localStorage.removeItem('current_active_calendar');
    // check that it has been removed
    currentActive = JSON.parse(localStorage.getItem('current_active_calendar'));
    assert.equal(currentActive, null);
    
    this.checkit.deleteCalendar()
        .catch(function (err) {
            assert.equal(err, "Active Calendar Id Not found");
        });

});

QUnit.test("buildCalendar test", function (assert) {
    "use strict";
    assert.expect(6);
    var $calendarDiv = this.$calendarDiv,
    // Ensure currently displayed calendar is 'Test Calendar'
        calTitle = $calendarDiv.find('.calendarTitleHeading').text(),
        secondCalTitle,
        months;
    
    assert.equal(calTitle, 'Test Calendar');
    assert.equal($calendarDiv.find('.monthContainer').length, 1);
    
    // append a div to $qunit-fixture where new calendar will be built
    $calendarDiv.append('<div id="test"></div>');
    // Set it as the active calendar Div
    this.checkit.setCalendarDiv($calendarDiv.find('#test'));
    // Build the calendar
    this.checkit.buildCalendar(this.helloCal);
    
    // check that $calendarDiv now has two calendar titles
    assert.equal($calendarDiv.find('.calendarTitleHeading').length, 2);
    
    //check the second calendar's title and number of months
    secondCalTitle = $calendarDiv.find('#test .calendarTitleHeading').text();
    months = $calendarDiv.find('#test .monthContainer').length;
    
    assert.equal(secondCalTitle, 'hello');
    assert.equal(months, 12);
  
    //ensure Test Calendar still only has one month
    assert.equal($calendarDiv.find('.monthContainer').length, 13);
});

QUnit.test("displayCalendar test", function (assert) {
    "use strict";
    assert.expect(7);
    // Uses functions that have all already been tested
    var $calendarDiv = this.$calendarDiv,
    //Ensure currently displayed calendar is 'Test Calendar'
        calTitle = $calendarDiv.find('.calendarTitleHeading').text(),
        activeCal,
        state;
    
    assert.equal(calTitle, 'Test Calendar');
    assert.equal($calendarDiv.find('.monthContainer').length, 1);
    
    //display 'hello' calendar
    this.checkit.displayCalendar(this.helloCal);
    
    //check that 'hello' is displayed and not 'Test Calendar'
    assert.equal($calendarDiv.find('.calendarTitleHeading').length, 1);
    assert.equal($calendarDiv.find('.calendarTitleHeading').text(), 'hello');
    assert.equal($calendarDiv.find('.monthContainer').length, 12);
    
    // check that 'hello' is active calendar in storage
    activeCal = JSON.parse(localStorage.getItem('current_active_calendar'));
    assert.equal(activeCal, '1234');
    state = JSON.parse(localStorage.getItem(activeCal));
    assert.deepEqual(this.helloState, state);
});


QUnit.module("CheckIt tests for functions that involve firebase", {
    beforeEach: function () {
        "use strict";
        // Initiate a checkit object, calendar object, and store other calendars
        // in storage for testing
        localStorage.clear();

        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');

        this.$fixture.append(
            '<script>\
            $(document).ready( function() {\
            checkit = new CheckIt("localStorage",\
            $("#qunit-fixture #calendarDiv"));\
            }); </script>'
        );

        this.checkit = checkit;
        this.store = this.checkit.store;

        this.params = {startDate: "2017-02-14", endDate: "2017-02-20", calendarTitle: "Test Calendar"};
        this.state = emptyCalendarState(this.params);
        this.calendar = new Calendar(this.state);
        var uniqueId = this.calendar.state.uniqueId,

        // Set some calendars in localStorage
        // allCalendarIds
            allCalendarIdsKey = 'allCalendarIdsKey',
            allCalendarIds = {'1234' : 'hello', '5678': 'world'},
            current_active_calendar;
        allCalendarIds[uniqueId] = 'Test Calendar';

        localStorage.setItem(allCalendarIdsKey, JSON.stringify(allCalendarIds));
        //current active calendar
        current_active_calendar = 'current_active_calendar';
        localStorage.setItem(current_active_calendar, '1234');

        //calendar states
        this.helloState = {uniqueId: '1234', title: 'hello', startDateString: "20170101", endDateString: "20171201"};
        this.worldState = {uniqueId: '5678', title: 'world', startDateString: "20160101", endDateString: "20161201"};
        localStorage.setItem(uniqueId, JSON.stringify(this.state));
        localStorage.setItem(this.helloState.uniqueId, JSON.stringify(this.helloState));
        localStorage.setItem(this.worldState.uniqueId, JSON.stringify(this.worldState));
    },
    afterEach: function () {
        "use strict";
        // clean up after each test
        localStorage.clear();
    }
});

QUnit.test("initFirebase test", function (assert) {
    "use strict";
    assert.expect(0);
    //console.log(this.checkit.mode);
    
    // Can only do these tests if I include the firebase key in my html.
    // should I do that?
});

QUnit.test("signIn test", function (assert) {
    "use strict";
    assert.expect(0);
});

QUnit.test("signOut test", function (assert) {
    "use strict";
    assert.expect(0);
});

QUnit.test("updateUserDescription test", function (assert) {
    "use strict";
    assert.expect(0);
});

QUnit.test("onAuthStateChanged test", function (assert) {
    "use strict";
    assert.expect(0);
});

// And pretty much all of the same functions as localStorage (createCalendar, etc)

QUnit.module("CheckIt tests for clickHandlers", {
    beforeEach: function () {
        "use strict";
        // prepare something before each test
        localStorage.clear();
    },
    afterEach: function () {
        "use strict";
        // clean up after each test
        localStorage.clear();
    }
});

QUnit.test("createCalendar test", function (assert) {
    "use strict";
    assert.expect(0);
    // createCalendar uses functions that have already been tested
    

});

QUnit.test("loadFromDropdown test", function (assert) {
    "use strict";
    assert.expect(0);
    // Uses functions that have already been tested
});

// Have to have the same html in test html as my app html so that I can
// test out the buttons and make sure the correct functions are triggered
// should I do that?


QUnit.module("Edit or Create Tests", {
// Hardcoded a date for moment object because javascript's Date object
// does not have a way to get the number of days in the month.


    beforeEach: function () {
    // Initiate a test month object
        "use strict";
        localStorage.clear();
        // using localStorage
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        this.$calendarDiv.append('<div><button id="createButton"\ type="button" class="btn btn-primary">Save</button></div>\
        <div><input type="text" id="calendarTitle" value="Hello World"/>\
        </div>\
        <div><input type="text" id="startDate" value="2017-01-01"/></div>\
        <div><input type="text" id="endDate" value="2017-12-01"/></div>'
        )
        
        
        this.checkit = new CheckIt('localStorage', $('#qunit-fixture #calendarDiv'));
        this.store = this.checkit.store;
        this.checkit.$createButton = $("#createButton");
        
        this.start = "2017-01-01";
        this.end = "2017-12-01";
        this.title = "Hello World";
        
        // make a calendar object to store
        //this.state = emptyCalendarState({startDate: this.startDateString,     //endDate: this.endDateString, title: this.title});
        
        //this.calendar = new Calendar(this.state);
        
        //this.store.save(this.calendar);
        

    },
    afterEach: function () {
        "use strict";
        localStorage.clear();
    }

});

QUnit.test("editOrCreate test", function (assert) {
    "use strict";
    assert.expect(7);
    
    var done = assert.async(2),
        allCalendars,
        title = this.title,
        start = this.start,
        end = this.end,
        createP,
        editP,
        calId,
        calId2,
        calState;
    
    // verify there is nothing in storage
    allCalendars = JSON.parse(localStorage.getItem('allCalendarIdsKey'));
    assert.equal(null, allCalendars);
    
    // Run editOrCreate
    createP = this.checkit.editOrCreate({title: title, start: start, end: end, buttonId: "createButton"}).then(function () {
        // check that editOrCreate returns a promise
        assert.equal(createP instanceof Promise, true);
        done();
    })
    
    // Test that we can edit this newly created calendar
    Promise.all([createP]).then(function () {
        // check the title and endDate before changing it
        calId = JSON.parse(localStorage.getItem('current_active_calendar'));
        calState = JSON.parse(localStorage.getItem(calId));
        assert.equal(calState.title, "Hello World");
        assert.equal(calState.endDateString, "20171201");
        // edit the calendar's title and end date
        editP = this.checkit.editOrCreate({title: "New Title", start: start, end: 
        "2017-02-02", buttonId: "editButton"})
        
        Promise.all([editP]).then(function () {
            // check that we are still dealing with the same calendar
            // check that calendar has updated information
            calId2 = JSON.parse(localStorage.getItem('current_active_calendar'));
            assert.equal(calId2, calId);
            calState = JSON.parse(localStorage.getItem(calId));
            assert.equal(calState.title, "New Title");
            assert.equal(calState.endDateString, "20170202");
            done()
        })
    }.bind(this));
    
})

QUnit.module("Prefill Form Tests", {
// Hardcoded a date for moment object because javascript's Date object
// does not have a way to get the number of days in the month.


    beforeEach: function () {
    // Initiate a test month object
        "use strict";
        localStorage.clear();
        // using localStorage
        this.$fixture = $('#qunit-fixture');
        this.$calendarDiv = this.$fixture.find('#calendarDiv');
        
        // TODO add buildCalendar form html
        this.$calendarDiv.append('<div><form><input type="text"\
            class="form-control" id="calendarTitle"\
            maxlength="140" placeholder="What are we\
            tracking Eg Good Deeds Done, Days Without\
            Smoking, etc./">\
            <input type="text" id="startDate"\
            class="form-control" placeholder="Pick a Start Date"/>\
            <input type="text" id="endDate" class="form-control"\ placeholder="Pick an End Date" />'
        )
        
        
        this.checkit = new CheckIt('localStorage', $('#qunit-fixture #calendarDiv'));
        this.store = this.checkit.store;
        this.checkit.$createButton = $("#createButton");
        
        this.start = "2017-01-01";
        this.end = "2017-12-01";
        this.title = "Hello World";
        // make an active calendar
        this.calState = emptyCalendarState({startDate: this.start, endDate: this.end, calendarTitle: this.title});
        this.checkit.createCalendar(this.calState);
    },
    afterEach: function () {
        "use strict";
        localStorage.clear();
    }

});

QUnit.test("prefillForm test", function (assert) {
    "use strict";
    assert.expect(7);
    var done = assert.async(1),
        activeId,
        activeCal,
        prefillP;
    
    assert.equal(this.checkit.$calendarTitle.val(), "");
    assert.equal(this.checkit.$startDate.val(), "");
    assert.equal(this.checkit.$endDate.val(), "");
    // verify we have a current active calendar
    activeId = JSON.parse(localStorage.getItem("current_active_calendar"));
    assert.notEqual(activeId, null);
    activeCal = JSON.parse(localStorage.getItem(activeId));
    
    // run prefill form then check that the form has been filled
    // with the current active calendar's information
    prefillP = this.checkit.prefillForm();
    Promise.all([prefillP]).then(function () {
        activeId = JSON.parse(localStorage.getItem("current_active_calendar"));
        activeCal = JSON.parse(localStorage.getItem(activeId));
        assert.equal(this.checkit.$calendarTitle.val(), this.title);
        assert.equal(this.checkit.$startDate.val(), this.start);
        assert.equal(this.checkit.$endDate.val(), this.end);
        done();
    }.bind(this))
});