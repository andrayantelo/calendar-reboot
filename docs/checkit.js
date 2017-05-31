/*jslint devel: true, es5: true, nomen: true, plusplus: true*/
/*global
    browser:true, Promise, firebase, $, jQuery, alert, moment, Spinner, LocalCalendarStorage, FirebaseCalendarStorage
*/

//CODE FOR MONTH AND CALENDAR OBJECTS
var Month = function (dateString) {
    "use strict";
    var self = this;
    //date will be of the format moment("YYYYMMDD")
    self.dateString = dateString;
    self.date = moment(dateString, "YYYYMMDD");

    self.firstActiveDayIndex = self.date.day();

    self.numberOfDays = self.date.daysInMonth();
    self.monthYear = self.date.year();
    self.monthIndex = self.date.month();

    self.monthName = self.date.format("MMMM");
    // Start day is the first active day
    self.startDay = self.date.date();
    
    // Moment object for the first of the month
    self.firstDayDate = moment(dateString, "YYYYMMDD").subtract((self.startDay - 1), 'days');
    // the first of the month date (always 1)
    self.firstDay = self.firstDayDate.date();
    // Index of the first of the month
    self.firstDayIndex = self.firstDayDate.day();
    self.dayIndex = {};
    self.monthId = self.monthYear.toString() + self.monthIndex.toString();
    
};


// Calendar Helper functions

var generateUniqueId = function () {
    "use strict";
    var uniqueId = (Math.floor((Math.random() + Date.now()) * 10e4)).toString();
    return uniqueId;
    
};

var emptyCalendarState = function (params) {
    "use strict";
    var startDate = moment(params.startDate, "YYYY-MM-DD"),
        endDate = moment(params.endDate, "YYYY-MM-DD");
    
    if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
        throw new Error("End date must be a date after start date.");
    }
    if (params.calendarTitle === "") {
        throw new Error("Must provide a calendar title.");
    }
    return {
        //"YYYYMMDD" string
        startDateString: startDate.format("YYYYMMDD"),
        endDateString: endDate.format("YYYYMMDD"),
        //list name under which it will be saved
        title: params.calendarTitle,
        //unique ID for calendar
        uniqueId: generateUniqueId(),
        //checkedDays day id: 1
        checkedDays: {}
    };
};

var Calendar = function (state) {
    "use strict";
    var self = this;
    self.state = state;
    //startDate is a moment object , the argument startDateString is 
    //"YYYYMMDD" string
    self.startDate = moment(state.startDateString, "YYYYMMDD");
    //endDate is a moment object
    // End date is the last active day
    self.endDate = moment(state.endDateString, "YYYYMMDD");

    self.monthObjects = self.generateMonthObjects(self.startDate, self.endDate);
};

Calendar.prototype.addMonth = function () {
    // Add a month to the calendar.
    "use strict";
    var self = this,
        newMonth;
    
    // Update self.endDate so that it occurs one month later.
    self.endDate = self.endDate.add(1, 'months');
    // Update the endDateString in the calendarState
    self.state.endDateString = self.endDate.format("YYYYMMDD");
    // Update the self.monthObjects so that it includes the new month
    self.monthObjects = self.generateMonthObjects(self.startDate, self.endDate);
    newMonth = self.monthObjects[self.monthObjects.length - 1];
    // return the new month
    return newMonth;
};

    
Calendar.prototype.generateMonthObjects = function (startDate, endDate) {
    // Parameters:
    //     startDate: moment object
    //     endDate: moment object
    
    //instantiate all the required Month objects for the calendar
    //using the startDate moment object and the endDate moment object
    //return an array of monthObjects
    "use strict";
    if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
        throw new Error("End date must be a date after start date");
    }
    
    var self = this,
        monthObjects = [],
        momentObject = moment(startDate),
        month;
    while (momentObject.isBefore(endDate) || momentObject.isSame(endDate)) {
        
        month = new Month(momentObject.format("YYYYMMDD"));
        monthObjects.push(month);
        momentObject.startOf('month');
        momentObject.add(1, 'month');
    }
    //change the number of days for the last month object to the endDate date.

    monthObjects[monthObjects.length - 1].lastActiveDay = endDate.date();

    return monthObjects;

};

// calendarAnalyzer takes a calendar object and can analyze facts about it.

var CalendarAnalyzer = function (calendarState) {
    "use strict";
    this.calState = calendarState;
};

CalendarAnalyzer.prototype.getNumberOfChecked = function () {
    // Returns the number of checked days in a calendar
    "use strict";
    return Object.keys(this.calState.checkedDays).length;
};

CalendarAnalyzer.prototype.getTotalCalendarDays = function () {
    // Returns the total number of active days in the calendar
    "use strict";
    var endDate = moment(this.calState.endDateString, "YYYYMMDD"),
        startDate = moment(this.calState.startDateString, "YYYYMMDD"),
        totalDays = endDate.diff(startDate, 'days');
    return totalDays;
};

CalendarAnalyzer.prototype.getNumberOfUnchecked = function () {
    // Returns number of unchecked days in a calendar
    "use strict";
    return this.getTotalCalendarDays() - this.getNumberOfChecked();
};

CalendarAnalyzer.prototype.getCheckedDaysStreak = function () {
    // Returns the longest streak of checked days
    "use strict";
    
    var currentStreak = 1,
        checkedDaysArray = (Object.keys(this.calState.checkedDays)).sort(),
        bestStreak = 0,
        i,
        currentDay,
        previousDay,
        dayDiff;
    
    previousDay = moment(checkedDaysArray[0], "YYYYMMDD");
    
    for (i = 1; i < checkedDaysArray.length; i++) {
        
        currentDay = moment(checkedDaysArray[i], "YYYYMMDD");
        
        // Calculate how many days are between previous day
        // and current day
        dayDiff = currentDay.diff(previousDay, 'days');
        
        // If they are not consecutive days 
        if (dayDiff !== 1) {
            // Find bestStreak
            bestStreak = Math.max(bestStreak, currentStreak);
            // reset currentStreak
            currentStreak = 1;
        } else {
            // Increment currentStreak
            currentStreak++;
            // Find bestStreak
            bestStreak = Math.max(bestStreak, currentStreak);
        }
        // Update previousDay
        previousDay = currentDay;
    }

    return bestStreak;
};

CalendarAnalyzer.prototype.getUncheckedDaysStreak = function () {
    // Returns the longest streak of unchecked days
    "use strict";

    // The largest gap between any two checked days (minus one)
    var checkedDaysArray = (Object.keys(this.calState.checkedDays)).sort(),
        currentGap = 0,
        longestGap = 0,
        i,
        currentDay,
        previousDay,
        dayDiff;
    
    previousDay = moment(checkedDaysArray[0], "YYYYMMDD");
    
    for (i = 1; i < checkedDaysArray.length; i++) {
        currentDay = moment(checkedDaysArray[i], "YYYYMMDD");
        
        dayDiff = currentDay.diff(previousDay, 'days');

        if (dayDiff === 1) {
            longestGap = Math.max(longestGap, currentGap);
            currentGap = 0;
        } else {
            currentGap = dayDiff;
            longestGap = Math.max(longestGap, currentGap);
        }
        previousDay = currentDay;
    }

    return longestGap;

};

CalendarAnalyzer.prototype.getTotalCalendarWeeks = function () {
    // Returns the total number of active weeks in the calendar
    "use strict";
    var endDate = moment(this.calState.endDateString, "YYYYMMDD"),
        startDate = moment(this.calState.startDateString, "YYYYMMDD"),
        totalWeeks = endDate.diff(startDate, 'weeks');
    return totalWeeks;
};

CalendarAnalyzer.prototype.getNumOfDaysLeft = function () {
    // Returns the total number of active days left in a calendar starting from current
    // day to end.
    "use strict";
    var endDate = moment(this.calState.endDateString, "YYYYMMDD"),
        today = moment(),
        daysLeft = endDate.diff(today, 'days');
    return daysLeft;
};

// Initializes CheckIt
function CheckIt(mode, calendarDiv) {
    // Shortcuts to DOM elements.
    "use strict";
    this.mode = mode;
    
    this.$userPic = $('#user-pic');
    this.$userName = $('#user-name');
    this.$signInButton = $('#sign-in');
    this.$signOutButton = $('#sign-out');
   
    this.$getStarted = $('#getStarted');
    this.$buildFormAccordion = $('#buildFormAccordion');
    this.$titleFormGroup = $('#titleFormGroup');
    this.$startDateFormGroup = $('#startDateFormGroup');
    this.$endDateFormGroup = $('#endDateFormGroup');
    this.$startDatePicker = $('#datetimepicker1');
    this.$startDatePickerInput = $('#datetimepicker1 input');
    this.$endDatePicker = $('#datetimepicker2');
    this.$endDatePickerInput = $('#datetimepicker2 input');
    this.$calendarDropdown = $('#calendarDropdown');
    this.$srStartDateError = $('#srStartDateError');
    this.$srEndDateError = $('#srEndDateError');
    this.$srTitleError = $('#srTitleError');
    this.$titleErrorGlyphicon = $('#titleErrorGlyphicon');
    this.$clearButton = $('#clearButton');
    this.$fullForm = $('#fullForm');
    this.$createButton = $('#createButton');
    this.$deleteButton = $('#deleteButton');
    this.$calendarTitle = $('#calendarTitle');
    this.$startDate = $('#startDate');
    this.$endDate = $('#endDate');
    this.$buildCalendarForm = $('#collapseOne');
    this.$loadingWheel = $('#loadingWheel');
    
    if (calendarDiv && calendarDiv.length === 0) {
        console.error("Selector given for calendar div does not select anything.");
    }
    this.$calendarDiv = calendarDiv;
    
    
    this.spinner = new Spinner();
    
    // Click handlers for the DOM
    this.$clearButton.click(function () {
        this.clearForm(this.$fullForm);
    }.bind(this));
    this.$createButton.click(this.createCalendar.bind(this));
    this.$calendarDropdown.on('click', 'li', this.loadFromDropdown.bind(this));
    this.$deleteButton.click(this.deleteCalendar.bind(this));
    
      //have the calendar show when you click in the input section of the date
    //timepicker
    
    this.$startDatePicker.datetimepicker({format: "YYYY-MM-DD"});
    this.$startDatePickerInput.click(function (event) {
        this.$startDatePicker.data("DateTimePicker").show();
    }.bind(this));
    
    this.$endDatePicker.datetimepicker({format: "YYYY-MM-DD"});
    this.$endDatePickerInput.click(function (event) {
        this.$endDatePicker.data("DateTimePicker").show();
    }.bind(this));

    
    // Attach click handler to sign in and sign out buttons.
    this.$signOutButton.click(this.signOut.bind(this));
    this.$signInButton.click(this.signIn.bind(this));
   
    
    // Initialize storage
    switch (this.mode) {
    case 'firebase':
        this.initFirebase();
        break;
    case 'localStorage':
        this.initLocalStorage();
        break;
    default:
        throw new Error("Unknown storage mode: '" + this.mode + "'");
    }

}

CheckIt.prototype.addMonth = function (calObj) {
    // Add a single month to the calendar
    "use strict";
    this.attachCheckmarkClickHandler(calObj, [calObj.addMonth()]);
};

CheckIt.prototype.attachCheckmarkClickHandler = function (calObj, monthObjArray) {
    // Takes an array of month objects (the array can be of length 1)
    "use strict";
    var checkitObj = this;
    
    monthObjArray.forEach(function (monthObj) {
        var $monthDiv = $('#' + monthObj.monthId);
        $monthDiv.find('.activeDay').click(function (event) {
            
            var boxId = $(this).find('.cell').attr('id');
          
            if (calObj.state.checkedDays === undefined) {
                calObj.state.checkedDays = {};
            }
            //Only store data for days with checkmarks.
            //unchecked days are undefined
            if (calObj.state.checkedDays[boxId] === undefined) {
                //add it to checkedDays
                calObj.state.checkedDays[boxId] = 1;
                //then add a checkmark
                $(this).find('.checkmark').removeClass("hidden");
            } else {
                //remove from checkedDays
                delete calObj.state.checkedDays[boxId];
                //remove the checkmark from the page
                $(this).find('.checkmark').addClass("hidden");
            }
            
            // save progress
            checkitObj.store.save(calObj);
            
        });
    });
   
};


CheckIt.prototype.displayLoadingWheel = function ($elementSelector) {
    // Displays the loading wheel.
    
    // Parameters: elementId 
           // A jquery selector pertaining to the element
           // where you want to place the loading wheel.
    "use strict";
    var target = $elementSelector.get()[0];
    this.spinner.spin(target);
    
};

CheckIt.prototype.hideLoadingWheel = function () {
    "use strict";
    this.spinner.stop();
};

CheckIt.prototype.fillDropdown = function ($dropdown) {
     // Load the calendar Ids from storage and fill the dropdown with calendar
    // titles.
    // Clear the dropdown before filling it 
    // $dropdown is the jquery selector of the element you are going to 
    // be adding these calendar titles to.
    "use strict";
    var dropdown = $dropdown || this.$calendarDropdown;
    dropdown.empty();
    
    this.store.getAllCalendarIds()
        .then(function (allCalendarIds) {
            // Add calendar titles to dropdown.
            var key;
            if (allCalendarIds) {
                for (key in allCalendarIds) {
                    if (allCalendarIds.hasOwnProperty(key)) {
                        this.addCalendarToDropdown(key, allCalendarIds[key],
                            this.$calendarDropdown);
                    }
                }
            }
        }.bind(this))
        .catch(function (value) {
            console.log("No calendars in storage (this is inside checkit's fillDropdown).");
        }.bind(this));
};

CheckIt.prototype.setCalendarDiv = function ($div) {
    // Changes the calendarDiv selector. $div is the selector of the new
    // div you want to use.
    "use strict";
    this.$calendarDiv = $div;
};

CheckIt.prototype.displayActiveCalendar = function () {
    // Display the active calendar if there is one.
      // Get the current active calendar from storage and display it.
    // If there is none, show build calendar menu.
    "use strict";
    var checkit = this;

    // if the first promise doesn't work, then just go to catch, don't
    // try to resolve things inside of a catch and then run .then
    return checkit.store.getActive()
        .then(function (activeCalendarId) {
            // if loadById returns a rejected promise we want to handle it
            // before running .then, all it does is return a rejected promise
            // with the reason for rejection, but we can remove the active status
            // we don't really need .then to run after the catch because everything 
            // is handled inside of .catch. That's why we are returning a rejected
            // promise, the .then never gets run. 
            return checkit.store.loadById(activeCalendarId)
                .catch(function (err) {
                    console.log("There is no current active calendar " + err);
                    checkit.store.removeActive();
                    checkit.showForm(checkit.$buildCalendarForm);
                    return Promise.reject(err);
                });
        })
        .then(function (activeCalendarState) {
            if (activeCalendarState !== null) {
                var state = activeCalendarState,
                    calendar = new Calendar(state);
                return checkit.displayCalendar(calendar);
            }
        })
        // this gets run if getActive returns a rejected promise, but does it also 
        // run if loadById returns a rejected promise??
        .catch(function (err) {
            checkit.showForm(checkit.$buildCalendarForm);
            return err;
        });
        
};

CheckIt.prototype.clearDropdown = function ($dropdown) {
    // Removes all items from the Saved Items dropdown.
    "use strict";
    $dropdown.empty();
};


CheckIt.prototype.initLocalStorage = function () {
    "use strict";

    this.store = new LocalCalendarStorage({storeId: '', jitterTime: 10});
    // Fill the dropdown with user's saved calendar titles/
    this.fillDropdown(this.$calendarDropdown);
    
    // Display the user's active calendar.
    this.displayActiveCalendar();
    
    //Show the build Calendar form.
    this.$buildFormAccordion.removeAttr('hidden');
    
    this.store.activityChangeFunctions.push(this.onActivityChanged.bind(this));
};

CheckIt.prototype.initFirebase = function () {
    "use strict";
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    // Logs debugging information to the console.
    firebase.database.enableLogging(false);
    
    // Initiates firebase database
    this.store = new FirebaseCalendarStorage({'storeId': 'checkit'});
    
    this.store.onActivityChanged(this.onActivityChanged.bind(this));
    
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

};

// Signs-in Checkit
CheckIt.prototype.signIn = function () {
    // Sign in Firebase using popup auth and Google as the identity provider.
    "use strict";
    var provider = new firebase.auth.GoogleAuthProvider();
    
    this.auth.signInWithRedirect(provider);
};

// Signs out of Checkit.
CheckIt.prototype.signOut = function () {
    // Signs out of Firebase.
    "use strict";
    this.auth.signOut();
};

// Triggers when there is a change in the storage.
CheckIt.prototype.onActivityChanged = function (activeCalls, id) {
    // Will Manipulate the DOM to show the loading wheel or to hide it.
    "use strict";
    var $id = $('#' + id);
    if (activeCalls > 0) {
        this.displayLoadingWheel($id);
    } else if (activeCalls === 0) {
        this.hideLoadingWheel();
    }
    
};

CheckIt.prototype.updateUserDescription = function (user) {
    // Updates the user's picture and name
    "use strict";
    var profilePicUrl = user.photoURL,
        userName = user.displayName;
  
    this.$userName.empty();
    this.$userName.append(user.displayName);
    
    if (profilePicUrl !== null) {
        this.$userPic.css('background-image',  'url(' + profilePicUrl + ')');
    } else {
        this.$userPic.css('background-image', 'url("/public/profile_placeholder.png")');
    }
};


// Triggers when the auth state change for instance when the user signs-in or signs-out.
CheckIt.prototype.onAuthStateChanged = function (user) {
    "use strict";
    if (user) { // User is signed in!
        // Update the user in the store so that we have access to the correct information.
        this.store.user = user;
        
        // Update user email
        this.store.updateUserEmail();
        
        // Set the user's profile pic and name.
        this.updateUserDescription(user);

        // Show user's profile and sign-out button.
        this.$userName.removeAttr('hidden');
        this.$userPic.removeAttr('hidden');
        this.$signOutButton.removeAttr('hidden');
    
        // Hide sign-in button.
        this.$signInButton.attr('hidden', 'true');
        
        // Fill the dropdown with user's saved calendar titles/
        this.fillDropdown(this.$calendarDropdown);
        
        // Display the user's active calendar.
        this.displayActiveCalendar();
        
        //Show the build Calendar form.
        this.$buildFormAccordion.removeAttr('hidden');
        
        //Hide the get started blurb.
        this.$getStarted.attr('hidden', 'true');
    
    } else { // User is signed out!
        // Remove the user from the store so that we can't access their information.
        this.store.user = null;
        
        // Hide user's profile and sign-out button.
        this.$userName.attr('hidden', 'true');
        this.$userPic.attr('hidden', 'true');
        this.$signOutButton.attr('hidden', 'true');
    
        // Show sign-in button.
        this.$signInButton.removeAttr('hidden');
        
        //Clear the saved Calendars dropdown menu.
        this.clearDropdown(this.$calendarDropdown);
        
        //Clear the page.
        this.clearCalendarDiv();
        
        // Remove the build Calendar form.
        this.$buildFormAccordion.attr('hidden', 'true');
        
        // Show the get started blurb
        this.$getStarted.removeAttr('hidden');
        
    }
};


CheckIt.prototype.generateEmptyCalendar = function (calObj) {
    // Generate the html for an empty calendar of the calendar you want to 
    // display.
    "use strict";
    var checkitApp = this;
    // Add the title of the calendar
    checkitApp.$calendarDiv.append(
        '<div class="calendarTitleHeading"><h1 class="page-header\
        text-center">' + calObj.state.title + '</h1></div>'
    );
                        
    calObj.monthObjects.forEach(function (monthObj, index) {
        
        //the div ID is the monthID
        checkitApp.$calendarDiv.append('<div class="monthframe" id=' + monthObj.monthId + '></div>');
        
        if (monthObj.monthIndex === 0 || index === 0) {
            var yearHeader = "<div class='page-header text-center year-header'>" +
                "<h2>" + monthObj.monthYear + "</h2>" +
                "</div>";
            checkitApp.$calendarDiv.find('#' + monthObj.monthId).append(yearHeader);
        }
        checkitApp.$calendarDiv.find('#' + monthObj.monthId).append(checkitApp.getTemplate());
            
    });
    
};

CheckIt.prototype.fillCalendar = function (calObj) {
    // Fill an empty calendar with appropriate calendar data.
    "use strict";
    var checkit = this;
    
    calObj.monthObjects.forEach(function (monthObj) {
    
        var $monthId = checkit.$calendarDiv.find('#' + monthObj.monthId);
        
        $monthId.find(".month-year").text(monthObj.monthName + " " + monthObj.monthYear);
        
        // Go through each td and fill in correct day number
        $monthId.find($('.week')).find('td').each(function (indexOfTableTd) {
            
            // The indexOfTableTd is where we are currently on the month table
            // which td are we in, from 0 to 41, because there are 6 rows
            // or 7 columns 
            
            // dayOfMonth is equal to 1 once the indexOfTableTd is equal to 
            // the index of the first day of the month.
            var dayOfMonth = indexOfTableTd - (monthObj.firstDayIndex - monthObj.firstDay),
                boxId,
                toAdd;
            
            if (dayOfMonth >= monthObj.firstDay && dayOfMonth <= monthObj.numberOfDays) {
                
                // Store the day of months with their indices in dayIndex object (dictionary)
                // in month state
                monthObj.dayIndex[dayOfMonth] = indexOfTableTd;
                 
                // Ensure the td is empty
                $(this).empty();
                 
                boxId = moment({"year": monthObj.monthYear, "month": monthObj.monthIndex, "day": dayOfMonth}).format("YYYYMMDD");
                // Add inactive class to inactive days, and do not include a 
                // checkmark div in the cell divs of inactive days. Also give
                // the td a unique Id.
                if (dayOfMonth < monthObj.startDay || dayOfMonth > monthObj.lastActiveDay) {
                    $(this).addClass('inactiveDay');
                     
                    toAdd = '<div class="cell"><div class="daynumber"' + ' daynumber="' +
                        dayOfMonth.toString() + '">';
                } else {
                    $(this).addClass('activeDay');
                     
                    toAdd = '<div class="cell"><div class="daynumber"' + ' daynumber="' +
                        dayOfMonth.toString() + '"></div><div class="checkmark hidden"></div></div>';
                }
                // Add html inside td element
                $(this).append(toAdd);
                 
                // Add the daynumber into the div with class .daynumber, which is 
                // inside of the td
                $(this).find('.cell').children('.daynumber').append(dayOfMonth);
                $(this).find('.cell').attr('id', boxId);
            }
        });
    });
};

CheckIt.prototype.generateCheckmarks = function (calObj) {
    // Display saved checkmarks on calendar
    // div is which div do you want to look through for checkmarks
    "use strict";
    if (calObj.state.checkedDays === undefined) {
        console.log("No days are checked");
        return;
    }
    
    this.$calendarDiv.find('.cell').each(function () {
        
        var boxId = $(this).attr('id');
        
        if (calObj.state.checkedDays[boxId]) {
            $(this).children('.checkmark').removeClass("hidden");
        }
        
    });
};

CheckIt.prototype.removeEmptyWeeks = function (calObj) {
    // Remove empty weeks from the calendar
    "use strict";
    this.$calendarDiv.find('.month .week').each(function (index) {
        if ($(this).find('td > .nil').length === 7) {
            $(this).remove();
        }
    });
};

CheckIt.prototype.hideForm = function ($form) {
    // Collapse a collapsible div (in checkit's case forms).
    // Parameter $form is the selector for a collapsible form (or div).
    "use strict";
    $form.collapse('hide');
};

CheckIt.prototype.showForm = function ($form) {
    // Show a collapsible form.
    // Parameter $form is the selector for a collapsible form (or div).
    "use strict";
    $form.collapse('show');
};

CheckIt.prototype.clearForm = function ($fullForm) {
    // Clears the buildCalendar form.
    // $fullForm is the selector for the form div
    // Only removeFormErrors if there are any errors on display
    "use strict";
    if ($fullForm.find('.has-error')) {
        this.removeFormErrors($fullForm);
    }
    $fullForm.trigger("reset");
};

CheckIt.prototype.addFieldError = function ($id, $srId) {

    // Set the appropriate CSS on the form field to indicate an error state
    // $id is the selector for the div with class .form-group that
    // surrounds the input field with the error
    // $srId is the selector for the screen reader element
    "use strict";
    $id.addClass('has-error has-feedback');
    $srId.removeClass('hidden');
    
};

CheckIt.prototype.removeFieldError = function ($id, $srId) {
    // Removes error state CSS on form field 
    // $id is the selector for the div with class .form-group that
    // surrounds the input field with the error
    // $srId is the selector for the screen reader element
    "use strict";
    $id.removeClass('has-error has-feedback');
    $srId.addClass('hidden');
};

CheckIt.prototype.addHelpBlock = function ($helpBlock) {
    // Removes the hidden class from the $helpBlock
    "use strict";
    $helpBlock.removeClass('hidden');
};

CheckIt.prototype.removeHelpBlock = function ($helpBlock) {
    "use strict";
    $helpBlock.addClass('hidden');
};

CheckIt.prototype.addGlyphicon = function ($id) {
    // $id is the selector for the span element that contains the glyphicon
    "use strict";
    if (!$id.hasClass('glyph')) {
        console.error("No glyphicon");
        return;
    }
    $id.removeClass('hidden');
    $id.attr('aria-hidden', 'false');
};

CheckIt.prototype.removeGlyphicon = function ($id) {
    // $id is the selector for the span element that contains the glyphicon
    "use strict";
    if (!$id.hasClass('glyph')) {
        console.error("No glyphicon");
        return;
    }
    $id.addClass('hidden');
    $id.attr('aria-hidden', 'true');
};

CheckIt.prototype.removeFormErrors = function ($fullForm) {
    // Remove the error classes and glyphicons from the form input fields
    "use strict";
    var checkit = this;
    
    $fullForm.find('.form-group').each(function (index, value) {
        checkit.removeFieldError($(this), $(this).find('.sr-only'));
        checkit.removeGlyphicon($(this).find('.glyph'));
    });
    
};

CheckIt.prototype.validateDates = function (startDateString, endDateString, $formGroup) {
    // Ensure that the end Date comes after the start Date and that there is no
    // more than 5 years between them.
    // Parameters: 
    //    startDateString: "YYYY-MM-DD"
    //    endDateString: "YYYY-MM-DD"
    //    $formGroup: jQuery selector for the form where you will be adding errors
    "use strict";
    var startDate = moment(startDateString, "YYYY-MM-DD"),
        endDate = moment(endDateString, "YYYY-MM-DD"),
        $sr = $formGroup.find('.sr-only'),
        $helpBlock = $formGroup.find('#helpBlock'),
        $fiveYears = $formGroup.find('#fiveYears'),
        difference = endDate.diff(startDate.format("YYYY-MM-DD"), 'years', true);
    
    if (startDate.isBefore(endDate)) {
        // startDate is before endDate so errors can be removed.
        this.removeFieldError($formGroup, $sr);
        this.removeHelpBlock($helpBlock);
        // If there are more than 5 years between the dates return false for invalid
        if (difference < 5) {
            this.removeHelpBlock($fiveYears);
            return true;
        } else {
            this.addFieldError($formGroup, $sr);
            this.addHelpBlock($fiveYears);
        }
    } else {
        // Mark the endDate input field red because endDate is after startDate
        this.addFieldError($formGroup, $sr);
        this.addHelpBlock($helpBlock);
        return false;
    }
    
};

CheckIt.prototype.validateInput = function ($form, $inputFormGroup, inputId) {
    // Validate a single input field of a form
    // Parameters: $form is the selector for the form element in question
    // $inputFormGroup is the selector for the div with the class .form-group
    // that surrounds the input field in question
    // inputId is the id of the input field we are validating.
    
    // Screen reader element for this input field
    "use strict";
    var $srElement = $inputFormGroup.find('.sr-only'),
        inputVal = $form.find('#' + inputId).val(),
        $glyphicon = $inputFormGroup.find('.glyph');
    
    // If user hasn't written anything we fail immediately
    if (!inputVal) {
        this.addFieldError($inputFormGroup, $srElement);
        // if the input field has a span element with a glyphicon
        // reveal the error glyphicon
        if ($glyphicon.length) {
            this.addGlyphicon($glyphicon);
        }
        return false;
    } else {
        this.removeFieldError($inputFormGroup, $srElement);
        // Remove glyphicon if it exists
        if ($glyphicon.length) {
            this.removeGlyphicon($glyphicon);
        }
    }
    return true;
    
};

CheckIt.prototype.validateForm = function (startDateString, endDateString) {
    "use strict";
    var validateTitle = this.validateInput(this.$fullForm, this.$titleFormGroup, 'calendarTitle'),
        
        validateStartDate = this.validateInput(this.$fullForm, this.$startDateFormGroup, 'startDate'),
        
        validateEndDate = this.validateInput(this.$fullForm, this.$endDateFormGroup, 'endDate'),
    
        isValid = validateTitle && validateStartDate && validateEndDate;
    
    // Make sure input is OK before parsing and validating dates
    return (isValid && this.validateDates(startDateString, endDateString, this.$endDateFormGroup));
   
};

CheckIt.prototype.createCalendar = function () {
    // Create a new calendar and display it.
    "use strict";
    var title = this.$calendarTitle.val(),
        start = this.$startDate.val(),
        end = this.$endDate.val(),
        state,
        calendar,
        initP,
        buildP;
        
    
    if (this.validateForm(start, end)) {
        
        //clear the previously displayed calendar
        this.clearCalendarDiv();

        //make a calendar State
        state = emptyCalendarState({startDate: start, endDate: end, calendarTitle: title});
        
        //make calendar object

        calendar = new Calendar(state);
        
        // Initialize calendar in the storage
        initP = this.store.initializeCalendar(calendar);

        //add calendar to dropdown
        this.addCalendarToDropdown(calendar.state.uniqueId, calendar.state.title,
            this.$calendarDropdown);
    
        //build the calendar
        buildP = this.buildCalendar(calendar);
        this.hideForm(this.$buildCalendarForm);
        
        return Promise.all([initP, buildP]);
    }
};

CheckIt.prototype.loadFromDropdown = function (event) {
    // Load the data, clear the page, build the saved calendar.
    
    //load the saved calendar with the title that was clicked
    "use strict";
    var dropdownItemId = event.currentTarget.id;
    
    return this.store.loadById(dropdownItemId)
        .then(function (state) {
            var calendar = new Calendar(state);
            this.displayCalendar(calendar);
            this.hideForm(this.$buildCalendarForm);
        }.bind(this))
        .catch(function () {
            console.log("Calendar not in storage");
        }.bind(this));
    
};

CheckIt.prototype.deleteCalendar = function () {
    // Removes the name from the saved calendars dropdown of the current
    // active calendar then deletes the current calendar from storage and
    // clears the page.
    
    // Guard against accidental clicks of the delete button
    "use strict";
    var confirmation = confirm("Are you sure you want to delete your calendar?"),
        checkit;
    if (!confirmation) {
        return Promise.reject("User cancelled the delete operation.");
    }

    checkit = this;

    return checkit.store.getActive()
        // if rejected promise returned catch gets run
        .catch(function (err) {
            console.error("Couldn't get active calendar id: " + err);
            // Notify user that there is no calendar on display for them
            // to delete? Should I bother notifying them of that?
            $.notify("No Calendar On Display", "error");
            // exit function
            return Promise.reject(err);
        })
        .then(function (currentCalendarId) {
            // remove calendar from dropdown
            checkit.removeFromCalendarDropdown(currentCalendarId,
                                               checkit.$calendarDropdown);

            // remove calendar state from storage
            return checkit.store.removeById(currentCalendarId)
                // if removeById is a rejected promise then catch is run, 
                // if it is a resolved promise catch is ignored.
                .catch(function (err) {
                    console.error("Unable to remove calendar from storage.");
                    // Notify user that calendar could not be removed
                    $.notify("Unable to Remove Calendar", "error");
                    // Exit promise chain
                    return Promise.reject(err);
                })
                .then(function () {
                    checkit.clearCalendarDiv();
                    checkit.showForm(checkit.$buildCalendarForm);
                    return checkit.store.removeActive()
                        .catch(function (err) {
                            console.error("Unable to remove active status from calendar");
                            // Should I notify the user of something here?
                            return Promise.reject(err);
                        });
                });
        });
    
};

CheckIt.prototype.addCalendarToDropdown = function (uniqueId, title, $dropdown) {
    //add the calendar with unique Id, uniqueId, and title, title, to
    //the saved calendars dropdown on the navbar.
    "use strict";
    $dropdown.append('<li id="' + uniqueId
            + '"><a href=#>' + title + '</a></li>');
};

CheckIt.prototype.removeFromCalendarDropdown = function (uniqueId, $dropdown) {
    //remove the calendar with uniqueId from the saved calendars dropdown
    //in the navbar
    "use strict";
    $dropdown.children('#' + uniqueId).remove();
};

CheckIt.prototype.buildCalendar = function (calendarObject) {
    // builds the front end of a calendar object. creates the html
    //this function assumes the calendarObject already has it's
    //state updated with the correct information. 
    // Calendars must be built in an empty div
    "use strict";
    this.generateEmptyCalendar(calendarObject);
    this.fillCalendar(calendarObject);
    this.attachCheckmarkClickHandler(calendarObject, calendarObject.monthObjects);
    this.generateCheckmarks(calendarObject);
    this.removeEmptyWeeks(calendarObject);
    this.findCurrentDay();
};

CheckIt.prototype.displayCalendar = function (calendarObj) {
    //load a state and build the calendar on the page
    // $div is the div where you want to build the calendar
    "use strict";
    this.clearCalendarDiv();
    this.buildCalendar(calendarObj);
    var activeP = this.store.setActiveById(calendarObj.state.uniqueId),
        saveP = this.store.save(calendarObj);
    return Promise.all([activeP, saveP]);
};

CheckIt.prototype.clearCalendarDiv = function () {
    // Remove all checkit related divs from page
    
    "use strict";
    this.$calendarDiv.find('.calendarTitleHeading').remove();
    this.$calendarDiv.children('.monthframe').remove();
};

CheckIt.prototype.findCurrentDay = function () {
    // Finds current day to apply CSS to it and so that the browser scrolls to it.
    // Pass the day you are looking for as a parameter "YYYYMMDD"
    // Clear the page of any days in the calendar that may have the class
    // 'currentDay' on them
    "use strict";
    if (this.$calendarDiv === undefined) {
        return;
    }

    if (this.$calendarDiv.find('.currentDay').length) {
        this.removeClass("currentDay");
    }
    
    var today = moment(),
        todayId = moment({"year": today.year(), "month": today.month(), "day": today.date()}).format("YYYYMMDD");
    // If current day is not actually an ACTIVE day in the calendar, don't add it
    this.$calendarDiv.find('.activeDay')
        .children('.cell')
        .filter('#' + todayId)
        .addClass('currentDay');
    return todayId;
};
    
CheckIt.prototype.getTemplate = function () {
    "use strict";
    return $.parseHTML(
        '<div class="header">\
          <span class="month-year"> </span>\
        </div> <!-- /.header -->\
        \
        <div id="dayNames">\
          <table id="days">\
            <td>S</td>\
            <td>M</td>\
            <td>T</td>\
            <td>W</td>\
            <td>T</td>\
            <td>F</td>\
            <td>S</td>\
          </table>\
        </div> <!-- /#dayNames -->\
        \
        \
        <div class="monthContainer">    \
          <table class="month">\
            <tbody>\
              <tr class="week">\
                <td>\
                  <div class="nil"></div>\
                </td>\
                <td>\
                  <div class="nil"></div>\
                </td>\
                <td>\
                  <div class="nil"></div>\
                </td>\
                <td>\
                  <div class="nil"></div>\
                </td>\
                <td>\
                  <div class="nil"></div>\
                </td>\
                <td>\
                  <div class="nil"></div>\
                </td>\
                <td>\
                  <div class="nil"></div>\
                </td>\
            </tr>\
            <tr class="week">\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
            </tr>\
            <tr class="week">\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
            </tr>\
            <tr class="week">\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
            </tr>\
            <tr class="week">\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
            </tr>\
            <tr class="week">\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
              <td>\
                <div class="nil"></div>\
              </td>\
            </tr>\
          </tbody>\
        </table>\
        </div><!-- end of class="monthcontainer" div -->\
        '
    );
    
};

// Options for Spinner, currently not being used.
CheckIt.prototype.opts = {
    lines: 13, // The number of lines to draw
    length: 28, // The length of each line
    width: 14, // The line thickness
    radius: 42, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000', // #rgb or #rrggbb or array of colors
    opacity: 0.25, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    position: 'absolute' // Element positioning
};
