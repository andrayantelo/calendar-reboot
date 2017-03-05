
// Initializes CheckIt
function CheckIt(mode) {
    // Shortcuts to DOM elements.
    this.mode = mode;
    
    this.$userPic = $('#user-pic');
    this.$userName = $('#user-name');
    this.$signInButton = $('#sign-in');
    this.$signOutButton = $('#sign-out');
   
    this.$getStarted = $('#getStarted');
    this.$buildFormAccordion = $('#buildFormAccordion');
    this.$calendarTitleForm = $('#titleFormGroup');
    this.$startDateForm = $('#dateFormGroup');
    this.$endDateForm = $('#dateFormGroup2');
    this.$startDatePicker = $('#datetimepicker1');
    this.$startDatePickerInput = $('#datetimepicker1 input');
    this.$endDatePicker = $('#datetimepicker2');
    this.$endDatePickerInput = $('#datetimepicker2 input');
    this.$calendarDropdown = $('#calendarDropdown');
    this.$startDateErrorSpan = $('#inputError-dateFormGroup');
    this.$endDateErrorSpan = $('#inputError-dateFormGroup2');
    this.$titleErrorSpan = $('#inputError-titleFormGroup');
    this.$titleGlyphiconTag = $('#span-titleFormGroup');
    this.$clearButton = $('#clearButton');
    this.$fullForm = $('#fullForm');
    this.$createButton = $('#createButton');
    this.$deleteButton = $('#deleteButton');
    this.$calendarTitle = $('#calendarTitle');
    this.$startDate = $('#startDate');
    this.$endDate = $('#endDate');
    this.$buildCalendarForm = $('#collapseOne');
    this.$calendarDiv = $('#calendarDiv');
    
    var opts = {
      lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
    }
    
    this.spinner = new Spinner();
    
    // Click handlers for the DOM
    this.$clearButton.click(this.clearForm.bind(this));
    this.$createButton.click(this.createCalendar.bind(this));
    this.$calendarDropdown.on('click', 'li', this.loadFromDropdown.bind(this));
    this.$deleteButton.click(this.deleteCalendar.bind(this));
    
      //have the calendar show when you click in the input section of the date
    //timepicker
    
    this.$startDatePicker.datetimepicker({format: "YYYY-MM-DD"});
    this.$startDatePickerInput.click(function(event){
       this.$startDatePicker.data("DateTimePicker").show();
    }.bind(this));
    
    this.$endDatePicker.datetimepicker({format: "YYYY-MM-DD"});
    this.$endDatePickerInput.click(function(event){
        this.$endDatePicker.data("DateTimePicker").show();
    }.bind(this));

    
    // Attach click handler to sign in and sign out buttons.
    this.$signOutButton.click(this.signOut.bind(this));
    this.$signInButton.click(this.signIn.bind(this));
   
    
    // Initialize storage
    switch (this.mode) {
      case 'firebase': this.initFirebase(); break;
      case 'localStorage': this.initLocalStorage(); break;
      default: throw new Error("Unknown storage mode: '" + this.mode + "'");
    }

};

CheckIt.prototype.addMonth = function() {
    // Add a single month to the calendar
    
    // Get the active Calendar information because you need to know what the 
    // last month is as well as the endDate.
    this.store.getActive()
        .then(function (activeCalendarId) {
            this.store.loadById(activeCalendarId)
                .then(function (activeCalendarState) {
                   if (activeCalendarState !==  null) {
                       var state = activeCalendarState;
                       console.log(state);
                       // Create a calendar so that you can manipulate this calendar State
                       var calendar = new Calendar(state);

                       // Add a month to this calendar
                       this.attachCellClickHandler(calendar, [calendar.addMonth()]);

                   }
               }.bind(this))
               .catch(function(err) {
                   console.error("Could not load calendar " + err);
                   // Remove active status from the id we just tried to load
                   // because we were not able to load it.
                   this.store.removeActive();
                   this.uncollapseBuildMenu();
               }.bind(this));
           
       }.bind(this))
       
       .catch(function () {
           console.log("Could not load current active calendar");
           this.uncollapseBuildMenu();
       }.bind(this));
    
    
    
};

CheckIt.prototype.attachCheckmarkClickHandler = function(calObj, monthObjArray) {
    // Takes an array of month objects (the array can be of length 1)
    var checkitObj = this;
    
    monthObjArray.forEach( function(monthObj) {
        var $monthDiv = $('#' + monthObj.monthId);
        $monthDiv.find('.activeDay').click(function(event) {
            
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
            }
            else {
                //remove from checkedDays
                delete calObj.state.checkedDays[boxId]
                //remove the checkmark from the page
                $(this).find('.checkmark').addClass("hidden");
            }
            
            // save progress
            checkitObj.store.save(calObj);
            
        })
    })
   
};


CheckIt.prototype.displayLoadingWheel = function(elementId) {
    // Displays the loading wheel.
    
    // Parameters: elementId 
           // A string pertaining to the id of the element
           // where you want to place the loading wheel.
    var target = $('#loadingWheel').get()[0];
    
    this.spinner.spin(target);
    
};

CheckIt.prototype.hideLoadingWheel = function() {
    this.spinner.stop();
};

CheckIt.prototype.fillDropdown = function() {
     // Load the calendar Ids from storage and fill the dropdown with calendar
    // titles.
    // Clear the dropdown before filling it 
    this.$calendarDropdown.empty();
    
    this.store.getAllCalendarIds()
        .then(function (allCalendarIds) {
            // Add calendar titles to dropdown.
            
            for (var key in allCalendarIds) {
                if (allCalendarIds.hasOwnProperty(key)) {
                    this.addCalendarToDropdown(key, allCalendarIds[key]);
                }
            }
        }.bind(this))
        .catch(function (value) {
            console.log("No calendars in storage (this is inside checkit's fillDropdown).");
        }.bind(this));
};

CheckIt.prototype.displayActiveCalendar = function() {
    // Display the active calendar if there is one.
      // Get the current active calendar from storage and display it.
    // If there is none, show build calendar menu.
   this.store.getActive()
       .then(function (activeCalendarId) {
           
           this.store.loadById(activeCalendarId)
               .then(function (activeCalendarState) {
                   if (activeCalendarState !==  null) {
                       var state = activeCalendarState;
                       var calendar = new Calendar(state);
                       this.displayCalendar(calendar);
                   }
               }.bind(this))
               .catch(function(err) {
                   console.error("Could not load calendar " + err);
                   this.store.removeActive();
                   this.uncollapseBuildMenu();
               }.bind(this));
           
       }.bind(this))
       
       .catch(function () {
           console.log("There is no current active calendar");
           this.uncollapseBuildMenu();
       }.bind(this));
}

CheckIt.prototype.clearDropdown = function() {
    // Removes all items from the Saved Items dropdown.
    this.$calendarDropdown.empty();
};


CheckIt.prototype.initLocalStorage = function() {
    this.store = new LocalCalendarStorage('');
    // Fill the dropdown with user's saved calendar titles/
    this.fillDropdown();
    
    // Display the user's active calendar.
    this.displayActiveCalendar();
    
    //Show the build Calendar form.
    this.$buildFormAccordion.removeAttr('hidden');
};

CheckIt.prototype.initFirebase = function() {
    
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    // Logs debugging information to the console.
    firebase.database.enableLogging(false);
    
    // Initiates database
    this.store = new LocalCalendarStorage({'storeId': 'checkit'});
    
    this.store.onActivityChanged(this.onActivityChanged.bind(this));
    
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

};

// Signs-in Checkit
CheckIt.prototype.signIn = function() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    
    this.auth.signInWithRedirect(provider);
};

// Signs out of Checkit.
CheckIt.prototype.signOut = function() {
    // Signs out of Firebase.
    this.auth.signOut();
};

// Triggers when there is a change in the storage.
CheckIt.prototype.onActivityChanged = function(activeCalls) {
    // Will Manipulate the DOM to show the loading wheel or to hide it.
    // Passing storageObj as argument to have access to activity calls, which
    // will tell us whether or not the loadingWheel should be on display or not.

    if (activeCalls > 0) {
        this.displayLoadingWheel("loadingWheel");
    }
    else if (activeCalls === 0) {
        this.hideLoadingWheel();
    }
    
};

CheckIt.prototype.updateUserDescription = function(user) {
    // Updates the user's picture and name
    var profilePicUrl = user.photoURL; 
    var userName = user.displayName;
  
    this.$userName.empty();
    this.$userName.append(user.displayName);
    
    if (profilePicUrl !== null) {
        this.$userPic.css('background-image',  'url(' + profilePicUrl + ')');
    }
    else {
        this.$userPic.css('background-image', 'url("/public/profile_placeholder.png")');
    }
};


// Triggers when the auth state change for instance when the user signs-in or signs-out.
CheckIt.prototype.onAuthStateChanged = function(user) {
    
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
        this.fillDropdown();
        
        // Display the user's active calendar.
        this.displayActiveCalendar();
        
        //Show the build Calendar form.
        this.$buildFormAccordion.removeAttr('hidden');
        
        //Hide the get started blurb.
        this.$getStarted.attr('hidden', 'true');
    
      }
    else { // User is signed out!
        // Remove the user from the store so that we can't access their information.
        this.store.user = null;
        
        // Hide user's profile and sign-out button.
        this.$userName.attr('hidden', 'true');
        this.$userPic.attr('hidden', 'true');
        this.$signOutButton.attr('hidden', 'true');
    
        // Show sign-in button.
        this.$signInButton.removeAttr('hidden');
        
        //Clear the saved Calendars dropdown menu.
        this.clearDropdown();
        
        //Clear the page.
        this.clearPage();
        
        // Remove the build Calendar form.
        this.$buildFormAccordion.attr('hidden', 'true');
        
        // Show the get started blurb
        this.$getStarted.removeAttr('hidden');
        
    }
};


CheckIt.prototype.generateEmptyCalendar = function(calObj, $calendarDiv) {
    // Generate the html for an empty calendar of the calendar you want to 
    // display.
    var app = this;
    // Add the title of the calendar
    $calendarDiv.append('<div id="calendarTitleHeading"> <h1 class="page-header text-center">' +
                        calObj.state.title + '</h1></div>');
                        

    calObj.monthObjects.forEach (function(monthObj, index) {
        
        //the div ID is the monthID
        $calendarDiv.append('<div class="monthframe" id=' + monthObj.monthId + '></div>');
        
        if (self.monthIndex === 0) {
            var yearHeader = "<div class='page-header text-center'>" +
                "<h2>" + monthObj.monthYear + "</h2>" +
                "</div>";
            $('#' + monthObj.monthId).append(yearHeader);
        }
        $('#' + monthObj.monthId).append(app.getTemplate());
            
    });
    
};

CheckIt.prototype.fillCalendar = function(calObj) {
    // Fill an empty calendar with appropriate calendar data.
    
    calObj.monthObjects.forEach (function(monthObj) {
        
        var $monthId = $('#'+ monthObj.monthId);
        
        $monthId.find(".month-year").text(monthObj.monthName + " " + monthObj.monthYear);
        
        // Go through each td and fill in correct day number
        $monthId.find($('.week')).find('td').each( function(indexOfTableTd) {
            
            // The indexOfTableTd is where we are currently on the month table
            // which td are we in, from 0 to 41, because there are 6 rows
            // or 7 columns 
            
            // dayOfMonth is equal to 1 once the indexOfTableTd is equal to 
            // the index of the first day of the month.
            var dayOfMonth = indexOfTableTd - (monthObj.firstDayIndex - monthObj.firstDay);
            
            if (dayOfMonth >= monthObj.firstDay && dayOfMonth <= monthObj.numberOfDays) { 
                
                // Store the day of months with their indices in dayIndex object (dictionary)
                // in month state
                 monthObj.dayIndex[dayOfMonth] = indexOfTableTd;
                 
                 // Ensure the td is empty
                 $(this).empty(); 
                 
                 var boxId = moment({"year":monthObj.monthYear, "month":monthObj.monthIndex, "day": dayOfMonth}).format("YYYYMMDD");
                 // Add inactive class to inactive days, and do not include a 
                 // checkmark div in the cell divs of inactive days. Also give
                 // the td a unique Id.
                 if (dayOfMonth < monthObj.startDay || dayOfMonth > monthObj.lastActiveDay) {
                     $(this).addClass('inactiveDay');
                     
                      var toAdd = '<div class="cell"><div class="daynumber"' + ' daynumber="' + 
                         dayOfMonth.toString() + '">';
                 }
                 else {
                     $(this).addClass('activeDay');
                     
                     var toAdd = '<div class="cell"><div class="daynumber"' + ' daynumber="' + 
                         dayOfMonth.toString() + '"></div><div class="checkmark hidden"></div></div>';
                 }
                 // Add html inside td element
                 $(this).append(toAdd);
                 
                 // Add the daynumber into the div with class .daynumber, which is 
                 // inside of the td
                 $(this).find('.cell').children('.daynumber').append(dayOfMonth);
                $(this).find('.cell').attr('id', boxId);
            }
        })
    })
};

CheckIt.prototype.generateCheckmarks = function(calObj, $calendarDiv) {
    // Display saved checkmarks on calendar
    // div is which div do you want to look through for checkmarks
    
    if (calObj.state.checkedDays === undefined) {
        console.log("No days are checked");
        return;
    }
    
    $calendarDiv.find('.cell').each( function() {
        
        var boxId = $(this).attr('id');
        
        if (calObj.state.checkedDays[boxId]) {
            $(this).children('.checkmark').removeClass("hidden");
        }
        
     })
};

CheckIt.prototype.removeEmptyWeeks = function(calObj, $calendarDiv) {
    // Remove empty weeks from the calendar
    
    $calendarDiv.find('.month .week').each( function(index) {
        if ($(this).find('td > .nil').length === 7) {
            $(this).remove();
        }
    })
};

CheckIt.prototype.collapseBuildMenu = function() {
    // Collapse the build calendar form.
    this.$buildCalendarForm.collapse('hide');
};

CheckIt.prototype.uncollapseBuildMenu = function() {
    // Show the build calendar form.
    this.$buildCalendarForm.collapse('show');
};

CheckIt.prototype.clearForm = function() {
    // Clears the buildCalendar form.
    
    // TODO only removeFormErrors if there are any errors on display
    this.removeFormErrors();
    this.$fullForm[0].reset();
};

CheckIt.prototype.createCalendar = function() {
    // Create a new calendar and display it.

    var title = this.$calendarTitle.val();
    var start = this.$startDate.val();
    var end = this.$endDate.val();
    
    if (this.validateForm(start, end)) {
        
        //clear the previously displayed calendar
        this.clearPage();

        //make a calendar State
        var state = emptyCalendarState({startDate: start, endDate: end, calendarTitle: title});
        
        //make calendar object

        var calendar = new Calendar(state);
        
        // Initialize calendar in the storage
        this.store.initializeCalendar(calendar);

        //add calendar to dropdown
        this.addCalendarToDropdown(calendar.state.uniqueId, calendar.state.title);
    
        //build the calendar
        this.buildCalendar(calendar);
        this.collapseBuildMenu(); 
   }
};

CheckIt.prototype.loadFromDropdown = function( event ) {
    // Load the data, clear the page, build the saved calendar.
    
    //load the saved calendar with the title that was clicked
    var dropdownItemId = event.currentTarget.id;
    
    return this.store.loadById(dropdownItemId)
        .then(function(state) {
            var calendar = new Calendar(state);
            this.displayCalendar(calendar);
            this.collapseBuildMenu(); 
        }.bind(this))
        .catch(function() {
            console.log("Calendar not in storage");
        }.bind(this));
    
};

CheckIt.prototype.deleteCalendar = function() {
    // Removes the name from the saved calendars dropdown of the current
    // active calendar then deletes the current calendar from storage and
    // clears the page.
    
    // Guard against accidental clicks of the delete button
    
    var confirmation = confirm("Are you sure you want to delete your calendar?");
    if (confirmation) {

        var currentCalendarId = this.store.getActive()
            .then(function(currentCalendarId) {
                this.removeFromCalendarDropdown(currentCalendarId);
                //delete the calendar and remove its active calendar status
                this.store.removeById(currentCalendarId);
                // To delete a calendar you have to be looking at it and if you
                // are looking at it that means it is the currentActiveCalendar
                this.store.removeActive();
                //console.log("clearing the page");
                //clear the page
                this.clearPage();
                this.uncollapseBuildMenu(); 
            }.bind(this))
            .catch(function() {
                console.log("Calendar could not be deleted.");
            }.bind(this));
    
    }
};

CheckIt.prototype.addCalendarToDropdown = function(uniqueId, title) {
    //add the calendar with unique Id, uniqueId, and title, title, to
    //the saved calendars dropdown on the navbar.
    
    this.$calendarDropdown.append('<li id="' + uniqueId
            + '"><a href=#>' + title + '</a></li>');
};

CheckIt.prototype.removeFromCalendarDropdown = function(uniqueId) {
    //remove the calendar with uniqueId from the saved calendars dropdown
    //in the navbar
    
    this.$calendarDropdown.children('#' + uniqueId).remove();
};

CheckIt.prototype.addFormError = function(id, srId) {

    // Set the appropriate CSS on the form fields to indicate an error state
    
    id.addClass('has-error has-feedback');
    srId.removeClass('hidden');
    
};

CheckIt.prototype.removeFormError = function(id, srId) {

    // Removes error state CSS on form fields
    
    id.removeClass('has-error has-feedback');
    srId.removeClass('hidden');
};

CheckIt.prototype.addGlyphicon = function(id) {

    id.removeClass('hidden');
};

CheckIt.prototype.removeGlyphicon = function(id) {
    
    id.addClass('hidden');
};

CheckIt.prototype.removeFormErrors = function() {
    //remove the error classes and glyphicons from the form inputs
    removeFormError(this.$startDateForm, this.$startDateErrorSpan);
    removeFormError(this.$endDateForm, this.$endDateErrorSpan);
    removeFormError(this.$calendarTitleForm, this.$titleErrorSpan);
    removeGlyphicon(this.$titleGlyphiconTag);
};

CheckIt.prototype.validateDates = function(startDateString, endDateString) {
    // Ensure that the end Date comes after the start Date and that there is no
    // more than 5 years between them.
        
    var startDate = moment(startDateString, "YYYY-MM-DD");
    var endDate = moment(endDateString, "YYYY-MM-DD");
    
    var difference = endDate.diff(startDate.format("YYYY-MM-DD"), 'years', true);
    
    if (startDate.isBefore(endDate)) {
        this.removeFormError(this.$endDateForm, this.$endDateErrorSpan);
        // If there are more than 5 years between the dates return false for invalid
        return (difference < 5);
    }
    else {
        this.addFormError(this.$endDateForm, this.$endDateErrorSpan);
        return false;
    }
    
};

CheckIt.prototype.validateInput = function($formGroup) {
    //a variable for the input tag value
    var id = $formGroup.attr('id');
    var $input = $('#inputError-' + id);
    var inputId = $formGroup.find("input").attr("id");
    var $calendarSpan = $('#span-' +  id);
    var inputValue = $formGroup.find('input[type=text]').val();
    
    // If the user hasn't written anything we fail immediately
    if (inputValue === "" || inputValue === null) {
        this.addFormError($formGroup, $input )
        
        //reveal the error glyphicon, ONLY THE TITLE HAS A GLYPHICON
        //check if we are dealing with the title
        if (inputId === "calendarTitle") {
            this.addGlyphicon($calendarSpan);
        }
        return false;
    }
    else {
        this.removeFormError($formGroup, $input );
        //remove glyphicon, only for title input tag
        if (inputId === "calendarTitle") {
            this.removeGlyphicon($calendarSpan);
        }
    }
    return true;
};

CheckIt.prototype.validateForm = function(startDateString, endDateString) {
        
        
    var validateTitle = this.validateInput(this.$calendarTitleForm);
    var validateStartDate = this.validateInput(this.$startDateForm);
    var validateEndDate = this.validateInput(this.$endDateForm);
    
    var isValid = validateTitle && validateStartDate && validateEndDate;
    
    // Make sure input is OK before parsing and validating dates
    return (isValid && this.validateDates(startDateString, endDateString));
   
};

CheckIt.prototype.buildCalendar = function(calendarObject) {
    // builds the front end of a calendar object. creates the html
    //this function assumes the calendarObject already has it's
    //state updated with the correct information. 

    this.generateEmptyCalendar(calendarObject, this.$calendarDiv);
    this.fillCalendar(calendarObject)
    this.attachCheckmarkClickHandler(calendarObject, calendarObject.monthObjects);
    this.generateCheckmarks(calendarObject, this.$calendarDiv);
    this.removeEmptyWeeks(calendarObject, this.$calendarDiv);
    this.findCurrentDay();


};

CheckIt.prototype.displayCalendar = function(calendarObj) {
    //load a state and build the calendar on the page
    
    this.clearPage();
    this.buildCalendar(calendarObj);
    this.store.setActiveById(calendarObj.state.uniqueId);
    this.store.save(calendarObj);
};

CheckIt.prototype.clearPage = function() {
    // Remove all divs from page except #template
    
    this.$calendarDiv.find('#calendarTitleHeading').remove();
    this.$calendarDiv.children('.monthframe').remove();
};

CheckIt.prototype.findCurrentDay = function() {
    // Finds current day to apply CSS to it.
    
    // Clear the page of any days in the calendar that may have the class
    // 'today' on them
    if (this.$calendarDiv === undefined) {
        return;
    }
    
    this.$calendarDiv.find('.today').removeClass("today");
    
    var today = moment();
    var todayId = moment({"year":today.year(), "month":today.month(), "day": today.date()}).format("YYYYMMDD");
    
    this.$calendarDiv.find('#' + todayId).addClass("today");

};


//CODE FOR MONTH AND CALENDAR OBJECTS
var Month = function(dateString) {
    
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
    self.monthId = self.monthYear.toString() + self.monthIndex.toString()
    
};


// Calendar Helper functions

var generateUniqueId = function() {
    var uniqueId = (Math.floor((Math.random() + Date.now())*10e4)).toString();
    return uniqueId;
    
};

var emptyCalendarState = function(params) {
    var startDate = moment(params.startDate, "YYYY-MM-DD");
    var endDate = moment(params.endDate, "YYYY-MM-DD");
    
    if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
        throw new Error("End date must be a date after start date.");
    }
    if (params.calendarTitle === "") {
        throw new Error("Must provide a calendar title.");
    }
    return{
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

var Calendar = function(state) {
    
    var self = this;
    self.state = state;
    //startDate is a moment object , the argument startDateString is 
    //"YYYYMMDD" string
    self.startDate = moment(state.startDateString, "YYYYMMDD");
    //endDate is a moment object
    // End date is the last active day
    self.endDate = moment(state.endDateString, "YYYYMMDD");

    self.monthObjects = self.generateMonthObjects(self.startDate, self.endDate);
}

Calendar.prototype.addMonth = function() {
    // Add a month to the calendar.
    var self = this;
    
    // Update self.endDate so that it occurs one month later.
    self.endDate = self.endDate.add(1, 'months');
    // Update the endDateString in the calendarState
    self.state.endDateString = self.endDate.format("YYYYMMDD");
    // Update the self.monthObjects so that it includes the new month
    self.monthObjects = self.generateMonthObjects(self.startDate, self.endDate);
    var newMonth = self.monthObjects[self.monthObjects.length-1];
    // return the new month
    return newMonth;
};

    
Calendar.prototype.generateMonthObjects = function(startDate, endDate) {
    // Parameters:
    //     startDate: moment object
    //     endDate: moment object
    
    //instantiate all the required Month objects for the calendar
    //using the startDate moment object and the endDate moment object
    //return an array of monthObjects
    if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
        throw new Error("End date must be a date after start date");
    }
    
    var self = this;
    var monthObjects = [];

    var momentObject = moment(startDate);
    while (momentObject.isBefore(endDate) || momentObject.isSame(endDate)) {
        
        var month = new Month(momentObject.format("YYYYMMDD"));
        monthObjects.push(month)
        momentObject.startOf('month');
        momentObject.add(1, 'month');
    }
    //change the number of days for the last month object to the endDate date.

    monthObjects[monthObjects.length-1].lastActiveDay = endDate.date();

    return monthObjects;

};
    
CheckIt.prototype.getTemplate = function() {
    
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
