
// Initializes CheckIt
function CheckIt() {
    // Shortcuts to DOM elements.

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
   
    
    // We have to connect to Firebase before we can access it.
    // WHEN PAGE LOADS
    this.initFirebase();

};

CheckIt.prototype.attachCellClickHandler = function(calObj) {
    
    var checkitObj = this;
    this.$calendarDiv.find('.cell').click(function(event) {
        
        //HARDCODED FOR NOW
        
        var $monthDiv = $(`#${self.monthId}`);
        var boxId = $(this).attr('id');
        //if the boxId is not checked (as in, the value is not inside of checkedDays
        //in other words, it's undefined
        
        if (calObj.state.checkedDays === undefined) {
            calObj.state.checkedDays = {};
        }
        
        if (calObj.state.checkedDays[boxId] === undefined) {
            //add it to checkedDays
            calObj.state.checkedDays[boxId] = 1;
            //then add a checkmark
            $(this).find('.element').removeClass("hidden");
        }
        else {
            //remove from checkedDays
            delete calObj.state.checkedDays[boxId]
            //remove the checkmark from the page
            $(this).find('.element').addClass("hidden");
        }
        
        // save progress
        checkitObj.store.save(calObj);
        
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
                       var calendar = new Calendar(state, this);
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

CheckIt.prototype.initFirebase = function() {
    
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    // Logs debugging information to the console.
    firebase.database.enableLogging(false);
    
    // Initiates firebase database
    this.store = new firebaseCalendarStorage({'storeId': 'checkit'});
    
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

// Returns true if user is signed-in. Otherwise false and displays a message.
CheckIt.prototype.checkSignedInWithMessage = function() {
    // Return true if the user is signed in Firebase
    if (this.auth.currentUser) {
        return true;
    }
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

        var calendar = new Calendar(state, this);
        
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
            var calendar = new Calendar(state, this);
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
    
    calendarObject.generateEmptyCalendar(calendarObject.monthObjects);
    calendarObject.fillCalendar(calendarObject.monthObjects);
    this.attachCellClickHandler(calendarObject);
    calendarObject.generateCheckmarks();
    
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



$(document).ready(function() {
    
    checkit = new CheckIt();
    // Event listener for backgroundActivityChange
   
    
});

//CODE FOR MONTH AND CALENDAR OBJECTS
var Month = function(dateString) {
    
    var self = this;
    //date will be of the format moment("YYYYMMDD")
    self.dateString = dateString;
    self.date = moment(dateString, "YYYYMMDD");
    self.firstDayIndex = self.date.day();
    self.numberOfDays = self.date.daysInMonth();
    self.monthYear = self.date.year();
    self.monthIndex = self.date.month();
    self.monthName = self.date.format("MMMM");
    self.startDay = self.date.date();
    self.dayIndex = {};
    self.monthId = self.monthYear.toString() + self.monthIndex.toString()
    
    self.generateEmptyMonthDiv = function(isFirst) {
        //add a div to html code containing the table template for a month 
        
        //Parameters: 
        //    div: string
        
        //    the id of the div where you want to place your month div, this
        //    will probably end up being hardcoded in
        
        //HARDCODED FOR NOW
        var $div = $('#calendarDiv');
        var yearHeader = "<div class='page-header text-center'>" +
            "<h2 id='yearHeader'>" + self.monthYear + "</h2>" +
            "</div>";
        
        //the div ID is the monthID
        
        $div.append('<div class="monthframe" id=' + self.monthId + '></div>');
        $div.append('<div class="monthframe"></div>');
        if (self.monthIndex === 0 || isFirst) {
            $('#' + self.monthId).append(yearHeader);
        }
        $('#' + self.monthId).append($('#template').html());
        
        
    };
    
    
    self.fillMonthDiv = function() {
        //fill the template table with month information (name, number of
        //days, year, checked days if any, etc.
        
        var $monthId = $('#'+ self.monthId);
        
        //self.clearMonthDiv();  <-- Do I need this?
        
        $monthId.find(".month-year").empty();
        $monthId.find(".month-year").append(self.monthName + " " + self.monthYear);
        
        //go through each td and fill in correct day number
        $monthId.find($('.week')).find('td').each( function(indexOfTableTd) {
            //the indexOfTableSquare is where we are currently on the month table
            //which td are we in, from 0 to 42, because there are 6 rows
            // or 7 columns 
            
            //gives the day of the month
            
            
            var dayOfMonth = indexOfTableTd - (self.firstDayIndex - self.startDay);
            
            
            //if the day of the month is >= to the startDay, so for example
            //if you have startDay as 20th of Nov, then the following code
            //won't run until the dayOfMonth is 20 or up AND it is less
            //than the number of days in the month
            if (dayOfMonth >= self.startDay && dayOfMonth <= self.numberOfDays) 
            { 
                //store the day of months with their indices in dayIndex object (dictionary)
                //in month state
                 self.dayIndex[dayOfMonth] = indexOfTableTd;
                 
                 //this refers to the td
                 $(this).empty();  //ensure it's empty
                 
                 //inside each td there will be the following html 
                 var toAdd = '<div class="cell"><div class="daynumber"' + ' daynumber="' + 
                 dayOfMonth.toString() + '"></div><div class="element hidden"></div></div>';
                 
                 //add html inside td element
                 $(this).append(toAdd);
                 
                 //this ensures that the css changes for an actual day in the month
                 $(this).addClass('actualDay');
                 
                 //add the daynumber into the div with class .daynumber, which is 
                 //inside of the td
                 $(this).find('.cell').children('.daynumber').append(dayOfMonth);
                 var boxId = moment({"year":self.monthYear, "month":self.monthIndex, "day": dayOfMonth}).format("YYYYMMDD");
                 $(this).find('.cell').attr('id', boxId);
                 
            }
            
            else {
                $(this).addClass('emptyDay');
            }
        });
    };

    
    self.removeEmptyWeeks = function() {
        //remove empty weeks from the month view
        
        var $div = $('#calendarDiv');
        
        $div.find('.month').find('.week').each( function(index) {
            var counter = 0;
            $(this).find('td').each(function(td) {
                if ($(this).hasClass("emptyDay")) 
                counter +=1;
            })
            if (counter === 7) 
            {
                $(this).remove();
            }
        });
    };
    
};


// Calendar Helper functions

var generateUniqueId = function() {
    var uniqueId = (Math.floor((Math.random() + Date.now())*10e4)).toString();
    return uniqueId;
    
};

var emptyCalendarState = function(params) {
    return{
        //"YYYYMMDD" string
        startDateString: moment(params.startDate, "YYYY-MM-DD").format("YYYYMMDD"),
        endDateString: moment(params.endDate, "YYYY-MM-DD").format("YYYYMMDD"),
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
    self.endDate = moment(state.endDateString, "YYYYMMDD");
    //number of months we will need to be able to cover all the years the
    //user wants to track
    self.numberOfMonths = self.endDate.diff(self.startDate, 'months', true);
    self.monthObjects = self.generateMonthObjects();

}

    
Calendar.prototype.generateMonthObjects = function() {
    //instantiate all the required Month objects for the calendar
    //using the startDate moment object and the endDate moment object
    //return an array of monthObjects
    var self = this;
    var monthObjects = [];
    
    var momentObject = moment(self.startDate);
    while (momentObject.isBefore(self.endDate) || momentObject.isSame(self.endDate)) {
        
        var month = new Month(momentObject.format("YYYYMMDD"), self);
        monthObjects.push(month)
        momentObject.startOf('month');
        momentObject.add(1, 'month');
    }
    //change the number of days for the last month object to the endDate date.
    monthObjects[monthObjects.length-1].numberOfDays = self.endDate.date();
    return monthObjects;
};
    
Calendar.prototype.generateEmptyCalendar = function(monthObjectsArray) {
    // generates the empty month divs for the calendar
    
    var self = this;
    var $div = $('#calendarDiv');

    $div.append('<div id="calendarTitleHeading"> <h1 class="page-header text-center">' +
              self.state.title + '</h1></div>');
    
    monthObjectsArray.forEach (function(monthObj, index) {
        var isFirst = index === 0;
        monthObj.generateEmptyMonthDiv(isFirst);
            
    });
    
};

Calendar.prototype.fillCalendar = function(monthObjectsArray) {
    //fills an empty calendar with month names, dates, etc
    var self = this;
    monthObjectsArray.forEach (function(monthObj) {
        monthObj.fillMonthDiv();
        monthObj.removeEmptyWeeks();
        //monthObj.attachClickHandler();
        //monthObj.generateCheckmarks();
    });
};


Calendar.prototype.generateCheckmarks = function() {
    // Toggles the hidden class between the children of the div class="cell" 
    // of the cells whose indices are in the monthState.checkedDays
    // object.
    
    //checkedDays is an object that contains a date that points to 1 or 0
    var self = this;
    if (self.state.checkedDays === undefined) {
        console.log("No days are checked");
        return;
    }
    
    $('#calendarDiv').find('.cell').each( function() 
    {
        var boxId = $(this).attr('id');
        
        if (self.state.checkedDays[$(this).attr('id')]) 
        {
            $(this).children('.element').removeClass("hidden");
        }
        
     })

};


