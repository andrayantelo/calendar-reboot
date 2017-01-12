var allCalendarIdsKey = 'allCalendarIdsKey';
//the current_active_calendar is the key for localStorage that stores
//the active calendar's Id
var current_active_calendar = 'current_active_calendar';

$(document).ready(function() {
    
    //will need to use a better key than this for allCalendarIdsKey (if this is
    //even a good way to do this)
    
    
    var calendarTitleId = 'titleFormGroup'; //actual div id
    var startDateId = 'dateFormGroup';  //also div id
    var endDateId = 'dateFormGroup2'
    
    var monthObjects;
    
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
    
    validateForm = function(startDate, endDate) {
        //check that endDate comes after startDate
        //checks 
          //if there is no valid startDate, prompt user for a valid startDate
        
        var startDateMoment = moment(startDate, "YYYYMMDD");
        var endDateMoment = moment(endDate, "YYYYMMDD");
        
        if (startDateMoment.isBefore(endDateMoment)) {
            return true;
        }
        else {
            console.log("endDate is before startDate");
            return false;
        }
    };
    
    var validateInput = function(formGroupId) {
        
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
        //state updated with the correct information. 
        
        calendarObject.generateEmptyCalendar(calendarObject.monthObjects);
        calendarObject.fillCalendar(calendarObject.monthObjects);
        
    };
    
    var displayCalendar = function(calendarObj) {
        //load a state and build the calendar on the page
        
        clearPage();
        buildCalendar(calendarObj);
        store.setActive(calendarObj);
        store.save(calendarObj);
    };
    
    $('#clearButton').click(function() {
        //clear all the entries in the build calendar form
        console.log("clearing form...");
        $('#fullForm')[0].reset();
    });
    
    $('#setButton').click(function(){
        
        //take the empty calendar object made when the page is loaded
        // and fill it with the information given in the form
        //required info are startDate and title. default to tracking 1 
        //year
        var title = $("#calendarTitle").val();
        var start = $("#startDate").val();
        var end = $("#endDate").val();
            
        
        var validateTitle = validateInput(calendarTitleId);
        var validateStartDate = validateInput(startDateId);
        var validateEndDate = validateInput(endDateId);
        var validateDates = validateForm(start, end);
        
        if (validateTitle && validateStartDate && validateEndDate && validateDates) {
            //clear the previously displayed calendar <-- or should i reload the page???
            clearPage();
        
            
            //make a calendar State
            var state = emptyCalendarState({startDate: start, endDate: end, calendarTitle: title});
            
            
            //make calendar object
            var calendar = new Calendar(state);
            
            store.setActive(calendar);
            store.save(calendar);
            
            //add calendar to dropdown
            addCalendarToDropdown(calendar.state.uniqueId, calendar.state.title);
        
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
        
        var dropdownItemId = $(this).attr('id');
        
        var state = store.loadById(dropdownItemId);
        
        var calendar = new Calendar(state);
        
        displayCalendar(calendar);
        $('#collapseOne').collapse('hide'); 
        
    });

    
    $('#deleteButton').click(function() {
        //deletes the current calendar on display, removes
        //the name from the saved calendars dropdown
        
        //when you delete a calendar, it needs to be removed from local Storage
        //it's unique Id needs to be removed from the allCalendarIds dictionary
        //it's name needs to be removed from the saved calendars dropdown
        //clear the calendar from the page and uncollapse build calendar
        
        //need to check if there is a calendar loaded that needs to be deleted.
        //in other words, are we currently looking at a calendar? (you can't
        //have a calendar be loaded without it being displayed on the screen)
        //to check maybe we can check if calendarState's uniqueId exists
        //in the allCalendarIds dictionary, because if it isn't then this is
        //not a saved calendar
        
        //ask the user if they are sure they want to delete their calendar
        var confirmation = confirm("Are you sure you want to delete your calendar?");
        if (confirmation) {
            
            var currentCalendarId = loadFromLocalStorage(current_active_calendar);
            removeFromCalendarDropdown(currentCalendarId);
            
            //load calendarState from local storage and make a calendar object
            var calendarState = loadFromLocalStorage(currentCalendarId);
            var calendar = new Calendar(calendarState);
            
            //delete the calendar and remove it's active calendar status
            store.remove(calendar);
            store.removeActiveStatus(calendar);
            
            console.log("clearing the page");
            //clear the page
            clearPage();
            $('#collapseOne').collapse('show'); 
        
        }
        
    });
    
    
    //WHEN PAGE LOADS
    //first load the allCalendarIds from storage.
    allCalendarIds = store.getAllCalendarIds();
    //if it's not in localstorage make it an empty object
    if (allCalendarIds === null) {
        allCalendarIds = {};
    }
    
    //GOING THROUGH THE KEYS OF THE DICTIONARY allCalendarIds
    for (var key in allCalendarIds) {
      if (allCalendarIds.hasOwnProperty(key)) {
          if (key !== current_active_calendar) {
            addCalendarToDropdown(key, allCalendarIds[key]);
          }
      }
    }
    
    //get the current_active calendar id from storage if any
    var activeCalendarId = store.getActive();
    
    if (activeCalendarId !== null) {
        console.log("the activeCalendarKey was not null");
        var activeCalendarState = store.loadById(activeCalendarId);
        
        if (activeCalendarState !== null) {
            var state = activeCalendarState;
            var calendar = new Calendar(state);
            displayCalendar(calendar);
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
        console.log(storageItemKey + " not found in localstorage");
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
            if (self.calendar.state.checkedDays[boxId] === undefined) {
                //add it to checkedDays
                self.calendar.state.checkedDays[boxId] = 1;
                //then add a checkmark
                $( this ).children('.element').removeClass("hidden");
            }
            else {
                //remove from checkedDays
                delete self.calendar.state.checkedDays[boxId]
                //remove the checkmark from the page
                $( this ).children('.element').addClass("hidden");
            }
            
            //save your progress
            
            store.save(self.calendar);
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
            
            if (self.calendar.state.checkedDays[$(this).attr('id')]) 
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
    calendar.state = state;
    return calendar;
};

var extractCalendarState = function(calendarObj) {
    // Takes a calendar object, extracts it's calendarState, and returns it.
    
    // Parameters:
    // calendarObj: object
    //     An instance of the Calendar class
    
    return calendarObj.state;
};

var generateUniqueId = function() {
    var uniqueId = Math.floor((Math.random() + Date.now())*10e4);
    return uniqueId
    
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
    self.title = state.title;
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
        monthObj.attachClickHandler();
        monthObj.generateCheckmarks();
    });
};


Calendar.prototype.setActiveCalendar = function() {
    var self = this;
    //set the current active calendar 
    storeInLocalStorage(current_active_calendar, self.state.uniqueId);
};

Calendar.prototype.removeActiveCalendar = function() {
    //removes a calendar from current_active_calendar status. It will no
    //longer be stored in LocalStorage as the current_active_calendar
    var self = this;
    removeFromLocalStorage(current_active_calendar);
    
};
    
Calendar.prototype.saveCalendar = function() {
        //saves the calendar in localStorage, saves the allCalendarIds object
        
        var self = this;
        //store the state in localStorage
        storeInLocalStorage(self.state.uniqueId, self.state);
        
        //put calendar in allCalendarIdss and store it
        allCalendarIds[self.state.uniqueId] = self.state.title;
        storeInLocalStorage(allCalendarIdsKey, allCalendarIds);
        
};
    
Calendar.prototype.deleteCalendar = function() {
    //deletes the calendar from localStorage, deletes the calendar from the
    //allCalendarIds object
    
    var self = this;
    //delete the calendar from the allCalendarIds object
    delete allCalendarIds[self.state.uniqueId];
    //save that change in localstorage
    storeInLocalStorage(allCalendarIdsKey, allCalendarIds);
    
    //remove the calendarstate from localStorage
    removeFromLocalStorage(self.state.uniqueId);

}
    

//dictionary of savedCalendars, calendar title: unique ID

var allCalendarIds = {
};

//Make a storage manager
var LocalCalendarStorage = function(params) {
    var self = this;
    var prefix = params['storeId'] || "";
    
    //params.storeId
    
    var toKey = function(id) {
        //make a key out of a uniqueId
        
        return prefix + "_" + id;
        
    };
    
    self.getAllCalendarIds = function() {
        //gets the allCalendarIds object from storage
        
        return loadFromLocalStorage(toKey(allCalendarIdsKey));
    };
    
    self.save = function(appObj) {
        //save an App object (like a calendar object for example) in storage
        
        //store the state in localStorage
        storeInLocalStorage(toKey(appObj.state.uniqueId), appObj.state);
        
        //put calendar in allCalendarIdss and store it
        allCalendarIds[appObj.state.uniqueId] = appObj.state.title;
        storeInLocalStorage(toKey(allCalendarIdsKey), allCalendarIds);
    };
    
    self.remove = function(appObj) {
        //remove an app object (like a calendar) from storage
        
        //delete the calendar from the allCalendarIds object
        delete allCalendarIds[appObj.state.uniqueId];
        //save that change in localstorage
        storeInLocalStorage(toKey(allCalendarIdsKey), allCalendarIds);
        
        //remove the object's state from localStorage
        removeFromLocalStorage(toKey(appObj.state.uniqueId));
    };
    
    self.load = function(appObj) {
        //load an App object ( like a calendar object)
        
        return loadFromLocalStorage(toKey(appObj.uniqueId));
    };
    
    self.loadById = function(appObjId) {
        //load an App object using it's Id
        return loadFromLocalStorage(toKey(appObjId));
    };
    
    self.setActive = function(appObj) {
        //set an app object (calendar) as the current_active object/calendar
        storeInLocalStorage(toKey(current_active_calendar), appObj.state.uniqueId);
    };
    
    self.getActive = function() {
        //return the active_calendar id
        return loadFromLocalStorage(toKey(current_active_calendar));
    };
    
    self.setActiveById = function(appObjId) {
        //set the active calendar/object by using it's Id
        storeInLocalStorage(toKey(current_active_calendar), appObjId);
    };
    
    self.removeActiveStatus = function(appObj) {
        //remove the app object's status as the current_active object
        removeFromLocalStorage(toKey(current_active_calendar));
    }
    
};

var store = new LocalCalendarStorage({'storeId': 'Streaker'})

