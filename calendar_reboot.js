$(document).ready(function() {
    
    //have the calendar show when you click in the input section of the date
    //timepicker
    $('#datetimepicker1 input').click(function(event){
        $('#datetimepicker1 ').data("DateTimePicker").show();
    });
    
    var validateForm = function(formGroupId) {
        //make sure all the fields of the form are filled out with 
        //valid information
        //for errors need to add has-error and has-feedback and have to add
        //the entire span for the glyphicon
        
        var id = formGroupId;
        var $id = $('#' + formGroupId);
        var inputValue = $id.find('input[type=text]').val();
        
        if (inputValue === "" || inputValue === null) 
        {
            if (id === 'dateFormGroup') {
                $id.addClass('has-error has-feedback');
                $('#inputError-' + id).removeClass('hidden');
            }
            else {
                $id.addClass('has-error has-feedback');
                $('#span-' +  id).removeClass('hidden');
                $('#inputError-' + id).removeClass('hidden');
            }
            return false;
        }
        else {
            if (id === 'dateFormGroup') {
                $id.removeClass('has-error has-feedback');
                $('#inputError-' + id).addClass('hidden');
            }
            else {
                $id.removeClass('has-error has-feedback');
                $('#span-' + id).addClass('hidden');
                $('#inputError-' + id).addClass('hidden');
            }
            return true;
        }
    };
    
    $('#setButton').click(function(){
        console.log("set Button clicked");
        //make a calendar object with information given in the form
        //required info are startDate and title. default to tracking 1 
        //year
        
        
        
        var calendarTitleId = 'titleFormGroup';
        var startDateId = 'dateFormGroup';
        
        var calendarTitle = $("#calendarTitle").val();
        var startDate = $("#startDate").val();
        var numberOfYears = $("#numberOfYears").val() || 1;
        var monthObjects;
        
        //if there is no valid startDate, prompt user for a valid startDate
        var validateTitle = validateForm(calendarTitleId);
        var validateDate = validateForm(startDateId);
        
        if (validateTitle && validateDate) {
            //clear the previously displayed calendar <-- or should i reload the page???
            clearPage();
            //collapse the build calendar form
            $('#collapseOne').collapse('toggle'); 
            //show the calendar function buttons
            $('#collapseTwo').collapse('toggle');
            
            calendar = new Calendar(startDate, numberOfYears, calendarTitle);
            calendar.initCalendarState();
            calendar.getYears();
            
            calendar.calendarState.monthStates = calendar.getMonthStates();
            monthObjects = calendar.generateMonthObjects();
            calendar.generateEmptyCalendar(monthObjects);
            calendar.fillCalendar(monthObjects);
            calendar.attachClickForCalendar(monthObjects);
            calendar.removeEmptyWeeksFromCalendar(monthObjects);
       }
    });
    
   
});

//UTILITY FUNCTIONS FOR THE MONTH, YEAR, ETC OBJECTS

var storeInLocalStorage = function(storageKey, storageItem) {
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
        return;   
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
            $( this ).children('.fa').toggleClass("hidden");
            $( this ).children('.daynumber').addClass("checkedDay");
            
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
            var dayOfMonth = indexOfTableTd - (self.monthState.firstDayIndex - 1);
            
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
                 dayOfMonth.toString() + '"></div><i class="fa fa-check hidden"></i></div>';
                 
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
                $(this).find('.cell').children().toggleClass("hidden");
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
        numberOfMonths: 12
    };
};

var Calendar = function(startDate, numberOfYears, title) {
    
    var self = this;
    //startDate is a "MM-DD-YYYY" string
    self.startDate = moment(startDate, "MM-DD-YYYY");
    self.calendarState = emptyCalendarState();
    //numberOfYears is a number given by user, how many years do they want
    //to track, we will default to 1 right now
    self.numberOfYears = numberOfYears;
    //number of months we will need to be able to cover all the years the
    //user wants to track
    self.numberOfMonths = self.numberOfYears * 12;
    self.title = title;
    
    self.initCalendarState = function() {
        self.calendarState.startDate = self.startDate.format();
        self.calendarState.years = self.getYears();
        self.calendarState.monthStates = self.getMonthStates();
        self.calendarState.calendarTitle = self.title;
        self.calendarState.numberOfYears = self.numberOfYears;
        self.calendarState.numberOfMonths = self.numberOfMonths;
    };
    
    self.getYears = function() {
        //get all the years user wants to track and store in calendarState
        var years = [];
        var startYear = self.startDate.year();
        years.push(startYear);
        
        for (i = 1; i <= self.numberOfYears; i++)
        {
            years.push(startYear + i);
        }
        return years;
    };
    
    
    self.getMonthStates = function() {
        
        //get the required monthStates for the calendar, filled in month
        //states not blank
        var monthStates = [];
        //how many years is the calendar going to cover
        var yearsLength = self.calendarState.years.length;
        var monthState = null;
        
        //iterating over the years
        for (i = 0; i < yearsLength; i++) 
        {
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
            continue;
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
                monthStates.push(monthState);
                
                }
            }
            
        }
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
            console.log("collecting check marks");
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
        //updates calendarState to most current version, and includes the
        //calendarTitle for the first time
        
        //update the individual monthState checkedDays object
        self.collectCalendarCheckmarks(monthObjectsArray);
        //update calendarStates monthStates object
        self.calendarState.monthStates = self.updateMonthStates(monthObjectsArray);
        
        self.calendarState.startDate = self.startDate.format();
        self.calendarState.years = self.getYears();
        self.calendarState.calendarTitle = $('#calendarTitle').val();
        self.calendarState.numberOfYears = self.numberOfYears;
        self.calendarState.numberOfMonths = self.numberOfMonths;
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
