var masterKey = 'masterKey';
var current_active_calendar = 'current_active_calendar';

$(document).ready(function() {
    
    //will need to use a better key than this for masterKey (if this is
    //even a good way to do this)
    
    var monthObjects;
    
    var calendarTitleId = 'titleFormGroup'; //actual div id
    var startDateId = 'dateFormGroup';  //also div id
    var endDateId = 'dateFormGroup2'
    
    //have the calendar show when you click in the input section of the date
    //timepicker
    
    $('#datetimepicker1').datetimepicker({format: "YYYY-MM-DD"});
    $('#datetimepicker1 input').click(function(event){
        $('#datetimepicker1 ').data("DateTimePicker").show();
    });
    
    $('#datetimepicker2').datetimepicker({format: "YYYY-MM-DD"});
    $('#datetimepicker2 input').click(function(event){
        $('#datetimepicker2 ').data("DateTimePicker").show();
    });
    
    //update the current active calendar

    
    var addCalendarToDropdown = function(uniqueId, title) {
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
        
        $(id).addClass('has-error has-feedback');
        $(srId).removeClass('hidden');
        
    };
    
    var removeFormError = function(id, srId) {
        //removes the classes has-error and has-feedback from the div
        //with the class form-group, also adds the hidden class on the span
        //with class sr-only (for screen readers)
        
        $(id).removeClass('has-error has-feedback');
        $(srId).removeClass('hidden');
    };
    
    var addGlyphicon = function(id) {
        //removes the hidden class to the glyphicon tag with id = id
        $(id).removeClass('hidden');
    };
    
    var removeGlyphicon = function(id) {
        //adds the hidden class to the glyphicon tag with id=id
        $(id).addClass('hidden');
    };
    
    var removeFormErrors = function() {
        //remove the error classes and glyphicons from the form inputs
        removeFormError('#dateFormGroup', '#inputError-dateFormGroup');
        removeFormError('#dateFormGroup2', '#inputError-dateFormGroup2');
        removeFormError('#titleFormGroup', '#inputError-titleFormGroup');
        removeGlyphicon('#span-titleFormGroup');
    };
    
    var validateDates = function(startDateString, endDateString) {
        
        var startDate = moment(startDateString, "YYYY-MM-DD");
        var endDate = moment(endDateString, "YYYY-MM-DD");
        
        if (startDate.isBefore(endDate)) {
            removeFormError('#dateFormGroup2', '#inputError-dateFormGroup2');
            return true;
        }
        else {
            addFormError('#dateFormGroup2', '#inputError-dateFormGroup2');
            return false;
        }
        
    };
    
    var validateInput = function(formGroupId) {
        
        //make a variable for the id string
        var id = formGroupId;
        //a variable for the id string with the # infront of it
        var $id = $('#' + formGroupId);
   //     //a variable for the input tag value
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
    
    var validateForm = function(startDateString, endDateString) {
        
        
        var validateTitle = validateInput(calendarTitleId);
        var validateStartDate = validateInput(startDateId);
        var validateEndDate = validateInput(endDateId);
        
        var isValid = validateTitle && validateStartDate && validateEndDate;
        
        return (isValid && validateDates(startDateString, endDateString);
       
    };
    
    
    
    var buildCalendar = function(calendarObject) {
        // builds the front end of a calendar object. creates the html
        //this function assumes the calendarObject already has it's
        //calendarState updated with the correct information. 
        
        calendarObject.generateEmptyCalendar(calendarObject.monthObjects);
        calendarObject.fillCalendar(calendarObject.monthObjects);
        
    };
    
    var displayCalendar = function(uniqueId) {
        //load a calendarState and build the calendar on the page
        
        var state = loadFromLocalStorage(uniqueId);
        var calendar = new Calendar(state);
        
        clearPage();
        buildCalendar(calendar);
        calendar.setActiveCalendar();
        calendar.saveCalendar();
    };
    
    $('#clearButton').click(function() {
        //clear all the entries in the build calendar form
        
        removeFormErrors();
        $('#fullForm')[0].reset();
    });
    
    $('#setButton').click(function(){
        
        //take the empty calendar object made when the page is loaded
        // and fill it with the information given in the form
        
        
        var calendarTitle = $("#calendarTitle").val();
        var startDate = $("#startDate").val();
        var endDate = $("#endDate").val();
        
        if (validateForm(startDate, endDate)) {
            
            //clear the previously displayed calendar <-- or should i reload the page???
            clearPage();

            //make a calendar State
            var calendarState = emptyCalendarState(startDate, endDate, calendarTitle);
            
            //make calendar object
            var calendar = new Calendar(calendarState);
          
            calendar.setActiveCalendar();
            calendar.saveCalendar();
            
            //add calendar to dropdown
            addCalendarToDropdown(calendar.calendarState.uniqueId, calendar.calendarState.calendarTitle);
        
            //build the calendar
           buildCalendar(calendar);
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
    
        console.log("the storage key you are using " + $(this).attr('id'));
        var loadedCalendarState = loadFromLocalStorage($(this).attr('id'));
        
        if (loadedCalendarState === null) {
            console.error('calendar does not exist/has not been saved');
        }
        else {
            displayCalendar($(this).attr('id'));
            $('#collapseOne').collapse('hide'); 

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
            
            var currentCalendarId = loadFromLocalStorage(current_active_calendar);
            console.log(currentCalendarId);
            delete calendarUniqueId[currentCalendarId];
            storeInLocalStorage(masterKey, calendarUniqueId);
            
            removeFromCalendarDropdown(currentCalendarId);
            //remove the calendarstate from localStorage
            removeFromLocalStorage(currentCalendarId);
            
            removeFromLocalStorage(current_active_calendar);
            
            console.log("clearing the page");
            //clear the page
            clearPage();
            $('#collapseOne').collapse('show'); 
        
        }
        
    });
    
    
    //WHEN PAGE LOADS
    //first load the calendarUniqueId from storage.
    calendarUniqueId = loadFromLocalStorage(masterKey);
    //if it's not in localstorage make it an empty object
    if (calendarUniqueId === null) {
        calendarUniqueId = {};
    }
    
    //GOING THROUGH THE KEYS OF THE DICTIONARY calendarUniqueId
    for (var key in calendarUniqueId) {
      if (calendarUniqueId.hasOwnProperty(key)) {
          if (key !== current_active_calendar) {
            addCalendarToDropdown(key, calendarUniqueId[key]);
          }
      }
    }
    
    
    var activeCalendar = loadFromLocalStorage(current_active_calendar);
    
    if (activeCalendar !== null) {
        displayCalendar(activeCalendar);
        
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
        

var clearPage = function() {
    // Remove all divs from page except #template
    //Parameters:
    // yearArray: array
    var $div = $("#calendarDiv");
    
    $div.find('#calendarTitleHeading').remove();
    $div.children('.monthframe').remove();
};

//CODE FOR MONTH OBJECTS, CLASSES, ETC


var Month = function(dateString, calendarObj) {
    
    var self = this;
    //date will be of the format moment("YYYYMMDD")
    self.dateString = dateString;
    self.date = moment(dateString, "YYYYMMDD");
    self.firstDayIndex = self.date.day();
    self.numberOfDays = self.date.daysInMonth();
    self.monthYear = self.date.year();
    self.monthIndex = self.date.month();
    self.monthName = getMonthName(self.monthIndex);
    self.startDay = self.date.date();
    self.dayIndex = {};
    self.monthId = self.monthYear.toString() + self.monthIndex.toString()
    self.calendar = calendarObj;
    
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
    
     self.attachClickHandler = function() {
        //add functionality to the day tds, allowing it to be checked
        //with a checkmark when clicked
        
        // Attaches a function to the divs with class "cell" to be triggered
        // when "cell" is clicked. The function toggles the hidden class
        // between the children (daynumber and fa fa-check) of "cell"
        
        //HARDCODED FOR NOW
        var $div = $('#' + self.monthId);
        
        $div.find('.cell').click(function (event) {
            
            var boxId = $( this).attr('id');
            //if the boxId is not checked (as in, the value is not inside of checkedDays
            //in other words, it's undefined
            if (self.calendar.calendarState.checkedDays[boxId] === undefined) {
                //add it to checkedDays
                self.calendar.calendarState.checkedDays[boxId] = 1;
                //then add a checkmark
                $( this ).children('.element').removeClass("hidden");
            }
            else {
                //remove from checkedDays
                delete self.calendar.calendarState.checkedDays[boxId]
                //remove the checkmark from the page
                $( this ).children('.element').addClass("hidden");
            }
            
            //save your progress
            
            self.calendar.saveCalendar();
         })
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
    
    self.generateCheckmarks = function() {
        // Toggles the hidden class between the children of the div class="cell" 
        // of the cells whose indices are in the monthState.checkedDays
        // object.
        
        //checkedDays is an object that contains a date that points to 1 or 0
        
        var monthId = '#'+ self.monthId;
        
        $(monthId).find('.cell').each( function() 
        {
            var boxId = $(this).attr('id');
            
            if (self.calendar.calendarState.checkedDays[$(this).attr('id')]) 
            {
                $(this).children('.element').removeClass("hidden");
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

var generateUniqueId = function() {
    var uniqueId = Math.floor((Math.random() + Date.now())*10e4);
    return uniqueId
    
};

var emptyCalendarState = function(startDate, endDate, title) {
    return{
        //"YYYYMMDD" string
        startDateString: moment(startDate, "YYYY-MM-DD").format("YYYYMMDD"),
        endDateString: moment(endDate, "YYYY-MM-DD").format("YYYYMMDD"),
        //list name under which it will be saved
        calendarTitle: title,
        //unique ID for calendar
        uniqueId: generateUniqueId(),
        //checkedDays day id: 1
        checkedDays: {}
    };
};

var Calendar = function(state) {
    
    var self = this;
    self.calendarState = state;
    //startDate is a moment object , the argument startDateString is 
    //"YYYYMMDD" string
    self.startDate = moment(state.startDateString, "YYYYMMDD");
    //endDate is a moment object
    self.endDate = moment(state.endDateString, "YYYYMMDD");
    //number of months we will need to be able to cover all the years the
    //user wants to track
    self.numberOfMonths = self.endDate.diff(self.startDate, 'months', true);
    self.title = state.calendarTitle;
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
              self.calendarState.calendarTitle + '</h1></div>');
    
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
        monthObj.attachClickHandler();
        monthObj.generateCheckmarks();
    });
};


Calendar.prototype.setActiveCalendar = function() {
    
    //set the current active calendar 
    var self = this;
    storeInLocalStorage(current_active_calendar, self.calendarState.uniqueId);
};
    
Calendar.prototype.saveCalendar = function() {
    //saves the calendar in localStorage, saves the calendarUniqueId object
    //adds the calendar to the saved calendars dropdown
    var self = this;
    //store the state in localStorage
    storeInLocalStorage(self.calendarState.uniqueId, self.calendarState);
    
    //put calendar in calendarUniqueIds and store it
    calendarUniqueId[self.calendarState.uniqueId] = self.calendarState.calendarTitle;
    storeInLocalStorage(masterKey, calendarUniqueId);
        
    };

//dictionary of savedCalendars, calendar title: unique ID

var calendarUniqueId = {
};




