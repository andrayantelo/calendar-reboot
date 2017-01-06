$(document).ready(function() {
    
    //will need to use a better key than this for masterKey (if this is
    //even a good way to do this)
    var masterKey = 'masterKey';
    var current_active_calendar = 'current_active_calendar';
    
    var calendarTitleId = 'titleFormGroup';
    var startDateId = 'dateFormGroup';
    
    var monthObjects;
    
    //have the calendar show when you click in the input section of the date
    //timepicker
    $('#datetimepicker1 input').click(function(event){
        $('#datetimepicker1 ').data("DateTimePicker").show();
    });
    
    //PROBABLY DON'T NEED THE BELOW COMMENTED CODE
    //$('input').on("keypress", function(e) {
    //    var n = $('input').length;
    //    console.log('input length is equal to ' + n);
    //    if (e.which === 13) {
    //        e.preventDefault();
    //        var nextIndex = $('input').index(this) + 1;
    //        console.log("the next index is " + nextIndex);
    //        if (nextIndex < n) {
    //            $('input')[nextIndex].focus();
    //        }
    //        else {
                //focus back on first input
    //            $('input').first().focus();
    //        }
    //    }
    //}); 
    
    //probably don't need titleCheck since titles don't need to be unique anymore
    var titleCheck = function(title) {
        //make sure that the title the user provides for their calendar is 
        //unique. Need to have unique titles for calendar so that you can 
        //use the calendarUniqueId object (dictionary) properly. Can't have
        //the same title pointing to different unique Ids. 
        
        if (calendarUniqueId[title]) {
            return false;
        }
        else {
            return true;
        }
    };
    
    var addToCalendarDropdown = function(uniqueId, title) {
        //add the calendar with unique Id, uniqueId, and title, title, to
        //the saved calendars dropdown on the navbar.
        
        console.log("adding calendar to dropdown");
        $('#calendarDropdown').append('<li id="' + uniqueId
                + '"><a href=#>' + title + '</a></li>');
    };
    
    var removeFromCalendarDropdown = function(uniqueId) {
        //remove the calendar with uniqueId from the saved calendars dropdown
        //in the navbar
        
        $('#calendarDropdown').children('#' + uniqueId).remove();
    };
    
    
    var addFormError = function(id, srId) {
        //adds the classes has-error and has-feedback
        //on the div with the class form-group and it removes the hidden
        //class on the span with class sr-only (for screen readers to notify
        //that there has been an error
        
        //id is the id of the eleent with the error glyphicon
        //srId is the id for the span tag with the instructions for 
        //screen readers, span has class sr-only
        
        id.addClass('has-error has-feedback');
        srId.removeClass('hidden');
        
    };
    
    var removeFormError = function(id, srId) {
        //removes the classes has-error and has-feedback from the div
        //with the class form-group, also adds the hidden class on the span
        //with class sr-only (for screen readers)
        
        id.removeClass('has-error has-feedback');
        srId.removeClass('hidden');
    };
    
    var addGlyphicon = function(id) {
        //removes the hidden class to the glyphicon tag with id = id
        id.removeClass('hidden');
    };
    
    var removeGlyphicon = function(id) {
        //adds the hidden class to the glyphicon tag with id=id
        id.addClass('hidden');
    };
    
    var validateForm = function(formGroupId) {
        
        //make a variable for the id string
        var id = formGroupId;
        //a variable for the id string with the # infront of it
        var $id = $('#' + formGroupId);
        //a variable for the input tag value
        var inputValue = $id.find('input[type=text]').val();
        
        //if the user hasn't written anything in the input tag
        // then we need to bring up the error, the glyphicon needs
        //to appear
        if (inputValue === "" || inputValue === null) {
            addFormError($id, $('#inputError-' + id) )
            
            //reveal the error glyphicon, ONLY THE TITLE HAS A GLYPHICON
            //check if we are dealing with the title
            if ($id.find("input").attr("id") === "calendarTitle") {
                addGlyphicon($('#span-' +  id));
            }
            return false;
        }
        else {
            removeFormError($id, $('#inputError-' + id) );
            //remove glyphicon, only for title input tag
            if ($id.find("input").attr('id') === "calendarTitle") {
                removeGlyphicon($('#span-' + id));
            }
        }
        return true;
    };
    
    var buildCalendar = function(calendarObject) {
        // builds the front end of a calendar object. creates the html
        //this function assumes the calendarObject already has it's
        //calendarState updated with the correct information. 
        
        monthObjects = calendarObject.generateMonthObjects();
        calendarObject.monthObjects = monthObjects;
        
        calendarObject.generateEmptyCalendar(calendarObject.monthObjects);
        calendarObject.fillCalendar(calendarObject.monthObjects);
        calendarObject.attachClickForCalendar(calendarObject.monthObjects);
        calendarObject.removeEmptyWeeksFromCalendar(calendarObject.monthObjects);
        calendarObject.placeCheckmarks(calendarObject.monthObjects);
        
    };
    
    $('#clearButton').click(function() {
        //clear all the entries in the build calendar form
        console.log("clearing form...");
        $('#fullForm')[0].reset();
    });
    
    $('#setButton').click(function(){
        console.log("set Button clicked");
        //take the empty calendar object made when the page is loaded
        // and fill it with the information given in the form
        //required info are startDate and title. default to tracking 1 
        //year
        
        
        //if there is no valid startDate, prompt user for a valid startDate
        var validateTitle = validateForm(calendarTitleId);
        var validateDate = validateForm(startDateId);
        
        if (validateTitle && validateDate) {
            //clear the previously displayed calendar <-- or should i reload the page???
            clearPage();
            
            //maybe don't need below two lines
            //collapse the build calendar form
            //$('#collapseOne').collapse('toggle'); 
            
            //update the calendar's startDate, title, and numberOfYears attributes
            //with information given in the form
            var calendarTitle = $("#calendarTitle").val();
            var startDate = $("#startDate").val();
            var numberOfYears = parseInt($("#numberOfYears").val()) || 1;
            
            calendar.updateCalendarAttributes(startDate, numberOfYears, calendarTitle);
            
            //initialize calendar object's state here instead of in build calendar because
            //you don't want to refill the calendarState every time you load a calendar
            //when a calendar is loaded, the calendar state will be equal to the 
            //loaded calendar state, so we do not need to run initCalendarState when we
            //build calendars after loading them. buildCalendar builds the html, not
            //the calendar object
            
            calendar.initCalendarState();
            
            //should I do the below lines this way?
            buildCalendar(calendar);
       }
    });
    
    //determines what happens when the save Button is clicked
    $('#saveButton').click(function() {
        //stores current calendar in localStorage, adds the name to
        //the saved calendars dropdown
        
        //what needs to happen when you save:
        //the monthStates attribute(property?) checkedDays needs to be 
        //updated with the day indices of days that have a checkmark
        //all monthStates need to have the most current information about
        //the calendar, this is done by updating the calendarState
        //maybe user changed numberOfYears to track or the calendarTitle, 
        //or even the start date? (should they be able to change the startdate?
        //probably not)
        //then the updated calendarState needs to be stored in localStorage
        
        //check if the calendar has a uniqueId (in other words, has a calendar been built?)
        //if not then we do not save anything.
        
        if (calendar.calendarState.uniqueId === null) {
            console.error("no calendar has been built");
        }
        
        else {
            console.log("Saving progress...");
        
            //the storage key is the calendar's unique Id
            var storageKey = calendar.calendarState.uniqueId;
            
            //get the calendar title to put in the dropdown
            var calendarTitle = calendar.calendarState.calendarTitle;
       
            //in order to use this this has to be stored in localstorage as well THIS IS WHAT I WAS WORKING ON LAST
            //MAY NEED TO USE THIS DICTIONARY TO MAKE THE DROPDOWN WHEN THE PAGE LOADS
            
            //the calendarUniqueId dictionary also needs to be stored in localstorage. use 
            //global variable masterKey as the storage key
            storeInLocalStorage(masterKey, calendarUniqueId);
            
            //update the calendarState (with checkmark information)
            calendar.updateCalendarAttributes(calendar.calendarState.startDate, calendar.calendarState.numberOfYears, calendar.calendarState.calendarTitle);
            calendar.updateCalendarState(calendar.monthObjects);
            
            //store the uniqueId and calendarTitle inside of an object (dictionary) 
            console.log("calendar stored in calendarUniqueId");
            calendarUniqueId[calendar.calendarState.uniqueId] = calendarTitle; 
            storeInLocalStorage(masterKey, calendarUniqueId);
            
            //check if it was already stored in localStorage 
            //if it isn't we add it to the dropdown, if it is, then it's already
            //in the dropdown. DO I NEED THIS??  
            if (loadFromLocalStorage(storageKey) === null) { //is null false in javascript
                //add to dropdown
                console.log('not in storage yet..');
                addToCalendarDropdown(calendar.calendarState.uniqueId, calendarTitle);
            }
            
            //store it in localStorage
            //localstorage will override things with the same key
            storeInLocalStorage(storageKey, calendar.calendarState);
            
            //hide build calendar form so that user can admire their calendar
            $('#collapseOne').collapse('hide'); 
            
            console.log("the last used calendar is " + calendar.calendarState.calendarTitle + " with unique Id " + calendar.calendarState.uniqueId);
            calendarUniqueId[current_active_calendar] = calendar.calendarState.uniqueId;
            storeInLocalStorage(masterKey, calendarUniqueId);
            
        }
        
        
    });
    
    $('#calendarDropdown').on('click', 'li', function() {
        //when a calendar is clicked on in the dropdown menu
        //the calendar that is currently on display (if there is one)
        //needs to be removed and replaced with the calendar that was clicked on
        //from the dropdown menu. Its' data will be loaded from localstorage
        //where it was stored. load the data, clear the page, build the saved
        //calendar
        
        //load the saved calendar with the title that was clicked
        console.log("this is uniqueId of " + calendar.calendarState.calendarTitle + " before loading from storage " + calendar.calendarState.uniqueId);
        //make sure calendar object is empty before loading new state into it <-- do i need this
        
        
        console.log("the storage key you are using " + $(this).attr('id'));
        var loadedCalendarState = loadFromLocalStorage($(this).attr('id'));
        
        if (loadedCalendarState === null) {
            console.error('calendar does not exist/has not been saved');
        }
        else {
            calendar.calendarState = loadedCalendarState;
            console.log("this is uniqueId of " + calendar.calendarState.calendarTitle + " after loading from storage " + calendar.calendarState.uniqueId);
            clearPage();
            buildCalendar(calendar);
            //hide the build calendar form
            $('#collapseOne').collapse('hide'); 
            
            //ADD LAST USED CALENDAR TO CALENDARUNIQUEID
            console.log("the last used calendar is " + calendar.calendarState.calendarTitle + " with unique Id " + calendar.calendarState.uniqueId);
            calendarUniqueId[current_active_calendar] = calendar.calendarState.uniqueId;
            storeInLocalStorage(masterKey, calendarUniqueId);
        }
        
        
    });

    
    $('#deleteButton').click(function() {
        //deletes the current calendar on display, removes
        //the name from the saved calendars dropdown
        
        //when you delete a calendar, it needs to be removed from local Storage
        //it's unique Id needs to be removed from the calendarUniqueId dictionary
        //it's name needs to be removed from the saved calendars dropdown
        //clear the calendar from the page and uncollapse build calendar
        
        //need to check if there is a calendar loaded that needs to be deleted.
        //in other words, are we currently looking at a calendar? (you can't
        //have a calendar be loaded without it being displayed on the screen)
        //to check maybe we can check if calendarState's uniqueId exists
        //in the calendarUniqueId dictionary, because if it isn't then this is
        //not a saved calendar
        
        //ask the user if they are sure they want to delete their calendar
        var confirmation = confirm("Are you sure you want to delete your calendar?");
        if (confirmation === true) {
        
            //if (calendarUniqueId[calendar.calendarState.uniqueId]) {
            console.log("deleting calendar " + calendar.calendarState.calendarTitle);
            
            removeFromCalendarDropdown(calendar.calendarState.uniqueId);
            delete calendarUniqueId[calendar.calendarState.uniqueId];
            //save the new calendarUniqueId
            storeInLocalStorage(masterKey, calendarUniqueId);
            removeFromLocalStorage(calendar.calendarState.uniqueId);
            
            console.log("clearing the page");
            //clear the page
            clearPage();
            //calendar object needs to be empty again
            calendar = new Calendar("", 0, "");
            //show build calendar form so that user can build a new one
            $('#collapseOne').collapse('show'); 
                
            //}
            //else {
            //    clearPage();
            //}
        
        }
        
    });
    
    
    //WHEN PAGE LOADS
    calendar = new Calendar("", 0, "");
    
    //first load the calendarUniqueId from storage.
    console.log("loading calendarUniqueId from localStorage");
    calendarUniqueId = loadFromLocalStorage(masterKey);
    //if it's not in localstorage make it an empty object
    if (calendarUniqueId === null) {
        calendarUniqueId = {};
    }
    
    //load the current_active_calendar
    var activeCalendarState = loadFromLocalStorage(calendarUniqueId[current_active_calendar]);
    
    if (activeCalendarState !== null) {
        console.log("loading last active calendar");
        calendar.calendarState = activeCalendarState;
        console.log("this is uniqueId of " + calendar.calendarState.calendarTitle + " after loading from storage " + calendar.calendarState.uniqueId);
        clearPage();
        buildCalendar(calendar);
        //hide the build calendar form
        $('#collapseOne').collapse('hide'); 
        
        //ADD LAST USED CALENDAR TO CALENDARUNIQUEID
        console.log("the last used calendar is " + calendar.calendarState.calendarTitle + " with unique Id " + calendar.calendarState.uniqueId);
        calendarUniqueId[current_active_calendar] = calendar.calendarState.uniqueId;
        storeInLocalStorage(masterKey, calendarUniqueId);
        }
   
    
    //GOING THROUGH THE KEYS OF THE DICTIONARY calendarUniqueId
    for (var key in calendarUniqueId) {
      if (calendarUniqueId.hasOwnProperty(key)) {
          if (key !== "current_active_calendar") {
            console.log("the uniqueId exists inside the calendarUniqueId dictionary");
            console.log(key + " -> " + calendarUniqueId[key]);
            addToCalendarDropdown(key, calendarUniqueId[key]);
          }
      }
    }
    
    
   
});

//UTILITY FUNCTIONS FOR THE MONTH, YEAR, ETC OBJECTS

var generateUniqueId = function() {
};

var storeInLocalStorage = function(storageItemKey, storageItem) {
    //store information in database/ might start with localstorage though
    // Convert a javascript value (storageItem) to a JSON string and
    // accesses the current domain's local Storage object and adds a data item
    //  (storageString) to it.
    
    //  Parameters:
    //  storageItemKey: string
    //      The localstorage key to be used to store the data item.
    //  storageItem: string
    //      The item to be stored in localstorage
    
    localStorage.setItem(storageItemKey, JSON.stringify(storageItem));
};

var loadFromLocalStorage = function(storageItemKey) {
    //  Loads an item from localstorage with key storageItemKey and returns the item
    //  if the item is not in localStorage, then it returns null
        
    //  Parameters:
    //  storageItemKey: "string"
    //      The key used to store the item and to be used to retrieve it from
    //      localstorage.
    
    var storageItem = localStorage.getItem(storageItemKey);
        
        
    if (storageItem === null) 
    {
        console.log(storageItemKey + "not found in localstorage");
        return storageItem;   
    }
                                                                                                   
    else 
    {
        storageItem = JSON.parse(storageItem);  
        return storageItem;
    }     
};

var removeFromLocalStorage = function(storageItemKey) {
    // removes item with key storageItemKey from localStorage
    
    localStorage.removeItem(storageItemKey);
};

var getMonthName = function(index) {
    //  Returns the name of the month of the given index. If no index is given,
    
    //  Parameters: 
    //  index: int
    //      0 index 0-11, 0 being January
    var months = {
        0:"January", 1:"February", 2:"March", 3:"April", 4:"May", 5:"June",
        6:"July", 7:"August", 8:"September", 9:"October", 10:"November",
        11:"December"};
    return months[index];
};

var setStartDate = function() {
    // return the startDate as a moment object
    
    var startDate = $('#datetimepicker1').data("DateTimePicker").date();
    //startDate = startDate.format("YYYY-MM-DD");
    
    return startDate;
};

var makeMonthObj = function(mState) {
    // Returns a month object with the given state as it's monthState.
    
    // Parameters:
    // mState: dictionary
    //     contains month information (numberOfDays, firstIndex, etc)
    var monthIndex = mState.monthIndex + 1;
    monthIndex = monthIndex.toString();
    var month = new Month(monthIndex + '-' + mState.startDay.toString() +
     '-' + mState.monthYear.toString(),  'MM-DD-YYYY');
    month.monthState = mState;
    return month;
};

var extractMonthState = function(monthObj) {
    // Takes a month object, extracts it's monthState, and returns it.
    
    // Parameters:
    // monthObj: object
    //     An instance of the Month class
    
    return monthObj.monthState;
};

var leadingZero = function(n) {
    // if n < 10 put one leading zero infront of it. n is an integer
    // but we will be returning a string.
    
    if (n < 10) 
    {
        n = "0" + n.toString();
        return n;
        
    }
    else 
    {
        return n.toString();
    }
        
};


var oneIndexMonth = function(monthIndex) {
    //takes a monthindex from 0-11 and returns it's one-based index equivalent
    var oneIndexDictionary = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
        6: 7,
        7: 8,
        8: 9,
        9: 10,
        10: 11,
        11: 12
    };
    if (monthIndex >= 0 && monthIndex < 12) {
        return oneIndexDictionary[monthIndex];
    }
    else {
        throw "Invalid Month Index"
    }
};
        

var clearPage = function() {
    // Remove all divs from page except #template
    //Parameters:
    // yearArray: array
    var $div = $("#calendarDiv");
    
    $div.find('#calendarTitleHeading').remove();
    $div.children('.monthframe').remove();
};

//CODE FOR MONTH OBJECTS, CLASSES, ETC

var emptyMonthState = function() {
    //a dictionary of all the information you need for one month object
    return {
        //first day of the month index
        firstDayIndex: 0,
        //number many days in a month
        numberOfDays: 30,
        // month year
        monthYear: "",
        // index of month
        monthIndex: 0,
        // month name
        monthName: "",
        //the day someone wants to start in this month, doesn't necessarily 
        // have to be the first of the month
        startDay: 1,
        //use month index and year as the month Div Id
        monthId: 0,
        //string of the date
        dateString: "",
        // object (dictionary) containing which days are checked index:daynumber
        checkedDays: {},
        // day and their indices pairs daynumber:index
        dayIndex: {},
    };
};

 fillMonthState = function(date) {
    //fills in an empty monthState with information from the 
    //date provided
    dateString = date;
    date = moment(date, "MM-DD-YYYY");
    
    monthState = emptyMonthState();
    
    monthState.firstDayIndex = date.day();
    monthState.numberOfDays = date.daysInMonth();
    monthState.monthYear = date.year();
    monthState.monthIndex = date.month();
    monthState.monthName = getMonthName(monthState.monthIndex);
    monthState.startDay = date.date();
    monthState.monthId = monthState.monthIndex.toString() + monthState.monthYear.toString();
    monthState.dateString = dateString;
    
    return monthState;
};



var Month = function(date) {
    
    var self = this;
    //date will be of the format moment("MM-DD-YYYY")
    self.dateString = date;
    self.date = moment(date, "MM-DD-YYYY");
    self.monthState = emptyMonthState();
    
    self.storeMonth = function() {
        //save month data, whether on a database, localstorage, whatever 
        //ends up being used
    };
    
    self.loadMonth = function() {
        //load month data from database/localstorage, whatever is used
        //to store
    };
    
    //MIGHT NOT NEED THIS ANYMORE, INITIALIZE MONTHSTATE
    self.initializeMonthState = function() {
        //fill the monthState with all the information given by the chosen 
        //date when the month object was initialized.
        
        self.monthState.firstDayIndex = self.date.day();
        self.monthState.numberOfDays = self.date.daysInMonth();
        self.monthState.monthYear = self.date.year();
        self.monthState.monthIndex = self.date.month();
        self.monthState.monthName = getMonthName(self.monthState.monthIndex);
        self.monthState.startDay = self.date.date();
        self.monthState.monthId = self.monthState.monthIndex.toString() + self.monthState.monthYear.toString();
        self.monthState.dateString = self.dateString;
        
        
    };
    
    self.generateEmptyMonthDiv = function(div) {
        //add a div to html code containing the table template for a month 
        
        //Parameters: 
        //    div: string
        
        //    the id of the div where you want to place your month div, this
        //    will probably end up being hardcoded in
        
        //HARDCODED FOR NOW
        
        var $div = $('#calendarDiv');
        var yearHeader = "<div class='page-header text-center'>" +
            "<h2 id='yearHeader'>" + self.monthState.monthYear + "</h2>" +
            "</div>";
        
        //the div ID is the monthID
        $div.append('<div class="monthframe" id=' + self.monthState.monthId + '></div>');
        if (self.monthState.monthId == "0" + self.monthState.monthYear.toString()) {
            $('#' + self.monthState.monthId).append(yearHeader);
        }
        $('#' + self.monthState.monthId).append($('#template').html());
        
        
    };
    
    self.collectCheckedDays = function() {
        //go through table and store which days the user checked
        // Stores index: daynumber pairs in monthState.checkedDays. These
        // pertain to the days which have the daynumber div hidden.
        
        var $monthId = $('#'+ self.monthState.monthId);
        //retrieves the daynumber attribute of the checked days and stores it in monthState.checkedDays
        
        //empty the checkedDays object first, so that if someone is unchecking days
        // then they don't show up when you generate the calendar again
        self.monthState.checkedDays = {};
        
        $monthId.find('.month').find('td').find('.cell').find('.checkedDay').each(function () {
            var daynumber = $(this).attr('daynumber');
            //the key is the index of the day for now, which is stored in the
            //dayIndex dictionary, which was made when you filled the month div
            self.monthState.checkedDays[self.monthState.dayIndex[daynumber]] = daynumber;
        });
        //}
    };
    
     self.attachClickHandler = function() {
        //add functionality to the day tds, allowing it to be checked
        //with a checkmark when clicked
        
        // Attaches a function to the divs with class "cell" to be triggered
        // when "cell" is clicked. The function toggles the hidden class
        // between the children (daynumber and fa fa-check) of "cell"
        
        //HARDCODED FOR NOW
        var $div = $('#calendarDiv');
        var $monthId = $('#' + self.monthState.monthId);
        $div.find($monthId).find('.cell').click(function (event) {
            $( this ).children('.element').toggleClass("hidden");
            if ( $( this ).children('.element').hasClass("hidden") ) {
                $( this ).children('.daynumber').removeClass('checkedDay');
            }
            else {
                $( this ).children('.daynumber').addClass("checkedDay");
            }
            
            //save your progress
            $('#saveButton').trigger('click');
            
        });
    };
    
    self.fillMonthDiv = function() {
        //fill the template table with month information (name, number of
        //days, year, checked days if any, etc.
        
        var $monthId = $('#'+ self.monthState.monthId);
        
        //self.clearMonthDiv();  <-- Do I need this?
        
        $monthId.find(".month-year").empty();
        $monthId.find(".month-year").append(self.monthState.monthName + " " + self.monthState.monthYear);
        
        //go through each td and fill in correct day number
        $monthId.find($('.week')).find('td').each( function(indexOfTableTd) {
            //the indexOfTableSquare is where we are currently on the month table
            //which td are we in, from 0 to 42, because there are 6 rows
            // or 7 columns 
            
            //gives the day of the month
            
            
            var dayOfMonth = indexOfTableTd - (self.monthState.firstDayIndex - self.monthState.startDay);
            
            
            //if the day of the month is >= to the startDay, so for example
            //if you have startDay as 20th of Nov, then the following code
            //won't run until the dayOfMonth is 20 or up AND it is less
            //than the number of days in the month
            if (dayOfMonth >= self.monthState.startDay && dayOfMonth <= self.monthState.numberOfDays) 
            { 
                //store the day of months with their indices in dayIndex object (dictionary)
                //in month state
                 self.monthState.dayIndex[dayOfMonth] = indexOfTableTd;
                 
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
                 
            }
            
            else {
                $(this).addClass('emptyDay');
            }
        });
    };
    
    self.generateCheckMarks = function() {
        // Toggles the hidden class between the children of the div class="cell" 
        // of the cells whose indices are in the monthState.checkedDays
        // object.
        
        var $div = $('#calendarDiv');
        var monthId = '#'+ self.monthState.monthId;
        
      
        $div.find(monthId).find('.month').find('td').each( function(index) 
        {
            
            if (self.monthState.checkedDays[index]) 
            {
                $(this).find('.cell').children('.element').toggleClass("hidden");
                $(this).find('.cell').children('.daynumber').addClass('checkedDay');
            }
            
         });
    };
    
    self.removeEmptyWeeks = function() {
        //remove empty weeks from the month view
        
        var $div = $('#calendarDiv');
        var monthId = '#' + self.monthState.monthId;
        
        $div.find(monthId).find('.month').find('.week').each( function(index) {
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


//generate a year/multiple years

var makeCalendarObj = function(state) {
    // Returns a calendar object with the given state as it's calendarState.
    
    // Parameters:
    // state: dictionary
    //     contains calendar information (numberOfYears, startDate, etc)
    var startDate = state.startDate;
    var numberOfYears = state.numberOfYears;
    var calendar = new Calendar(startDate, numberOfYears);
    calendar.calendarState = state;
    return calendar;
};

var extractCalendarState = function(calendarObj) {
    // Takes a calendar object, extracts it's calendarState, and returns it.
    
    // Parameters:
    // calendarObj: object
    //     An instance of the Calendar class
    
    return calendarObj.calendarState;
};

var emptyCalendarState = function() {
    return{
        //"MM-DD-YYYY" string
        startDate: undefined,
        //list of years
        years: [],
        //dictionary of monthId: monthState
        monthStates: [],
        //list name under which it will be saved
        calendarTitle: '',
        //self.numberOfYears
        numberOfYears: 1,
        //self.numberOfMonths
        numberOfMonths: 12,
        //the last day of tracking
        endDate: undefined,
        //unique ID for calendar
        uniqueId: null
    };
};

var Calendar = function(startDateString, numberOfYears, title) {
    
    var self = this;
    //startDate is a moment object , the argument startDateString is 
    //"MM-DD-YYYY" string
    self.startDate = moment(startDateString, "MM-DD-YYYY");
    self.calendarState = emptyCalendarState();
    //numberOfYears is a number given by user, how many years do they want
    //to track, we will default to 1 right now
    self.numberOfYears = numberOfYears;
    //number of months we will need to be able to cover all the years the
    //user wants to track
    self.numberOfMonths = self.numberOfYears * 12;
    self.title = title;
    self.monthObjects = [];
    //endDate is a moment object
    self.endDate = undefined;
    
    self.updateCalendarAttributes = function(startDateString, numberOfYears, title) {
        //update the startDate, numberOfYears, and title.
        //startDate is a string, numberOfyears is an int, and title is
        //a string
        
        self.startDate = moment(startDateString, "MM-DD-YYYY");
        self.numberOfYears = numberOfYears;
        self.title = title;
        self.numberOfMonths = self.numberOfYears * 12;
        self.endDate = self.getEndDate();
    };
    
    self.resetCalendarState = function() {
        //reset calendarState to factory settings... as in empty calendarState
        self.calendarState = emptyCalendarState();
    };
    
    self.initCalendarState = function() {
        //store all the information needed for a calendarState
        //you store the strings "MM-DD-YYYY" for startDate and endDate
        
        self.calendarState.startDate = self.startDate.format();
        self.calendarState.years = self.getYears();
        self.calendarState.monthStates = self.getMonthStates();
        self.calendarState.calendarTitle = self.title;
        self.calendarState.numberOfYears = self.numberOfYears;
        self.calendarState.numberOfMonths = self.numberOfMonths;
        self.calendarState.endDate = self.endDate.format();
        self.calendarState.uniqueId = Date.now().toString();
        
        console.log("after initialization, the calendar's unique Id is equal to " + self.calendarState.uniqueId);
    };
    
    
    self.getEndDate = function() {
        //endDate depends on the startDate and numberOfYears
        // Someone picks dec 15 2016 as startDate and then wants to 
        //track 3 years, the last day should be dec 15, 2019
        
        var endYear = (self.startDate.year() + self.numberOfYears).toString();
        var endMonth = oneIndexMonth(self.startDate.month()).toString();
        var endDate = self.startDate.date().toString();
        
        var endDate = moment(endMonth + "-" + endDate + "-" + endYear,
                             "MM-DD-YYYY");
        
        return endDate;
        
    };
    
    self.getYears = function() {
        //get all the years user wants to track and store in calendarState
        var years = [];
        var startYear = self.startDate.year();
        var endYear = self.endDate.year();
        
        for (i = 0; i <= self.numberOfYears; i++)
        {
            years.push(startYear += i);
        }
        return years;
    };
    
    
    
    
    self.getMonthStatesDraft = function() {
        var monthStates = [];
        //number of years that will be covered
        var yearsLength = self.calendarState.years.length;
        var monthState = null;
        
        //iterating over the number of Years.
        for (i = 0; i < yearsLength; i++) {
            console.log("we are on iteration " + i);
        }
        return 0;
        
    };
    
    
    
    
    self.getMonthStates = function() {
        
        //get the required monthStates for the calendar, filled in month
        //states not blank
        var monthStates = [];
        //how many years is the calendar going to cover
        var yearsLength = self.calendarState.years.length;
        console.log("this is the yearsLength " + yearsLength);
        var monthState = null;
        
        //iterating over the years
        for (i = 0; i < yearsLength; i++) 
        {
            console.log("this is the i we are on in the i for loop " + i);
            //in year i, get monthStates for months in it
            
            if (self.calendarState.years[i] === self.startDate.year()) 
            {
                
                for (j = self.startDate.month(); j < 12; j ++) 
                {
                    
                    //iterating over months inside startDate Year
                    if (j === self.startDate.month()) 
                    {
                        
                        //var month = "month" + leadingZero(j) + self.calendarState.years[i].toString();
                        //console.log("Potential month Ids " + month);
                        monthState = fillMonthState(self.startDate.format("MM-DD-YYYY"));
                        monthStates.push(monthState);
                        
                    }
                    else 
                    {
                        monthState = fillMonthState(leadingZero(oneIndexMonth(j)) + "01" + 
                                         self.calendarState.years[i]);
                        monthStates.push(monthState);
                    }
                } // end of for loop
            
            } //end of first if statement
            
            //if the year is not the same as the startDate year, so the
            //remaining years in the calendar
            else
            {
                //for loop for the 12 months of each remaining year
                for (k = 0; k  < 12; k ++)
                {
                    
                    monthState = fillMonthState(leadingZero(oneIndexMonth(k)) + "-" + "01" + "-" +
                                     self.calendarState.years[i]);
                    
                    if (i === yearsLength - 1 && k === self.endDate.month()) {
                        monthState.numberOfDays = self.endDate.date();
                        monthStates.push(monthState);
                        return monthStates
                    }
                    monthStates.push(monthState);
                         
                } // end of k for loop
            } //end of else conditional
            
        } //end of i for loop
        return monthStates;
    };
        
    
    self.generateMonthObjects = function() {
        //instantiate all the required Month objects for the calendar
        //using the monthStates that we have already generated in 
        //getMonthStates or loaded monthStates from local storage or 
        //wherever they are being stored
        
        var monthObjects = [];
        //iterate over the monthStates in calendarState
        var iterationLength = self.calendarState.monthStates.length;
        for (i = 0; i< iterationLength; i++) 
        {
            var month = makeMonthObj(self.calendarState.monthStates[i]);
            monthObjects.push(month);
        }
        
        return monthObjects;
    };
    
    self.generateEmptyCalendar = function(monthObjectsArray) {
        // generates the empty month divs for the calendar
        
        
        
        var $div = $('#calendarDiv');
    
        $div.append('<div id="calendarTitleHeading"> <h1 class="page-header text-center">' +
                  self.calendarState.calendarTitle + '</h1></div>');
        
        monthObjectsArray.forEach (function(monthObj) {
            if (self.startDate.month() === monthObj.date.month() && self.startDate.year() === monthObj.date.year()) 
            {
                $div.append('<div class="monthframe" id=' + monthObj.monthState.monthId + '></div>');
                var yearHeader = "<div class='page-header text-center'>" +
                "<h2 id='yearHeader'>" + self.startDate.year() + "</h2>" +
                "</div>";
            
                $('#' + monthObj.monthState.monthId).append(yearHeader);
                $('#' + monthObj.monthState.monthId).append($('#template').html());
            }
            else 
            {
                monthObj.generateEmptyMonthDiv();
            }
        });
        
    };
    
    self.fillCalendar = function(monthObjectsArray) {
        //fills an empty calendar with month names, dates, etc
        
        monthObjectsArray.forEach (function(monthObj) {
            monthObj.fillMonthDiv();
        });
    };
    
    self.attachClickForCalendar = function(monthObjectsArray) {
        //attach the click handler to the entire calendar.
        
        monthObjectsArray.forEach (function(monthObj) {
            monthObj.attachClickHandler();
        });
    };
    
    self.removeEmptyWeeksFromCalendar = function(monthObjectsArray) {
        //remove empty weeks from each month
        
        monthObjectsArray.forEach (function(monthObj) {
            monthObj.removeEmptyWeeks();
        });
    };
    

    self.collectCalendarCheckmarks = function(monthObjectsArray) {
        //gather all the checkmarks to store inside of the monthStates
        
        monthObjectsArray.forEach(function(monthObj) {
            monthObj.collectCheckedDays();
        });
    };
    
    self.placeCheckmarks = function(monthObjectsArray) {
        //place checkmarks in the calendar according to what is stored in 
        //the month's monthState under checkedDays
        
        monthObjectsArray.forEach(function(monthObj) {
            monthObj.generateCheckMarks();
        });
    };
    
    self.updateMonthStates = function(monthObjectsArray) {
        //get most current version of monthState
        updatedMonthStates = [];
        monthObjectsArray.forEach(function(monthObj) 
        {
            updatedMonthStates.push(extractMonthState(monthObj));
        });
        return updatedMonthStates;
    };
    
    self.updateCalendarState = function(monthObjectsArray) {
        //updates calendarState to most current version
        
        //update the individual monthState checkedDays object
        self.collectCalendarCheckmarks(monthObjectsArray);
        //update calendarStates monthStates object
        self.calendarState.monthStates = self.updateMonthStates(monthObjectsArray);
        
        self.calendarState.startDate = self.startDate.format();
        self.calendarState.years = self.getYears();
        self.calendarState.calendarTitle = self.title;
        self.calendarState.numberOfYears = self.numberOfYears;
        self.calendarState.numberOfMonths = self.numberOfMonths;
        self.calendarState.endDate = self.getEndDate();
        //uniqueId is set when calendar is initialized, and never changes
    };
    
    self.storeCalendarState = function() {  // SHOULD THE TITLE BE A PARAMETER IN THE FUNCTION?
        //Store the calendarState in localStorage with storageKey = listTitle
        //and the storageItem = calendarState
        
        storeInLocalStorage(self.calendarState.calendarTitle, self.calendarState);
    };
    
    self.loadCalendarState = function(listTitle) {
        //Load the calendarState with storageKey = listTitle from localStorage
        
        loadFromLocalStorage(listTitle);
    };
    
};

//dictionary of savedCalendars, calendar title: unique ID

var calendarUniqueId = {
    'current_active_calendar' : null
};
