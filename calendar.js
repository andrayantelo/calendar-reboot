$(document).ready(function() {
    
    //have the input textbox be same size as placeholder
    function sizePlaceholder() {
        $(this).attr('size', $(this).attr('placeholder').length);
        console.log($(this).prop("id") + " this is the id of this");
    };
    
 
    //have title resize when page is loaded, and when keys are pressed and released
    $('#calendarTitle')
        // event handler
        .keyup(sizePlaceholder)
        // resize on page load
        .each(sizePlaceholder);
    
    //take focus off calender title input form after enter is pressed and onto 
    //next input[type=text] form
    $('input[type=text]').keydown(function(e) {
        //get the next index of text input element
        var next_index = $('input[type=text]').index(this) + 1;
        
        //get number of text input element in an html document
        var total_index = $('body').find('input[type=text]').length;
        
        //enter button in ASCII code
        if (e.keyCode == 13) {
            if (total_index == next_index) {
                //go to the first text element if focused on the last
                $('input[type=text]:eq(0)').focus();
            }
            else {
             //go to the next text input element
             $('input[type=text]:eq(' + next_index + ')').focus();
         }
        }
    });
   
   
});

//UTILITY FUNCTIONS FOR THE MONTH, YEAR, ETC OBJECTS

var storeInLocalStorage = function() {
    //store information in database/ might start with localstorage though
};

var loadFromLocalStorage = function() {
    //load information from localstorage
};

var removeFromLocalStorage = function() {
    //remove item from localstorage
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

var generateMonthObj = function(mState) {
    // Returns a month object with the given state as it's monthState.
    
    // Parameters:
    // mState: dictionary
    //     contains month information (numberOfDays, firstIndex, etc)
    var monthIndex = mState.monthIndex + 1;
    monthIndex = monthIndex.toString();
    var month = new Month(monthIndex + '-' + mState.startDay.toString() + '-' + mState.monthYear.toString(),  'MM-DD-YYYY');
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


//CODE FOR MONTH OBJECTS, CLASSES, ETC

var emptyMonthState = function() {
    //a dictionary of all the information you need for one month object
    return {
        //first day of the month index
        firstDayIndex : 0,
        //number many days in a month
        numberOfDays : 30,
        // month year
        monthYear : "",
        // index of month
        monthIndex : 0,
        // month name
        monthName : "",
        //the day someone wants to start in this month, doesn't necessarily 
        // have to be the first of the month
        startDay : 1,
        //use month index and year as the month Div Id
        monthId : 0,
        
        // object (dictionary) containing which days are checked index:daynumber
        checkedDays : {},
        // day and their indices pairs daynumber:index
        dayIndex : {},
    }
};

var Month = function(date) {
    
    var self = this;
    //date will be of the format moment("MM-DD-YYYY")
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
        
        
    };
    
    self.generateEmptyMonthDiv = function(div) {
        //add a div to html code containing the table template for a month 
        
        //Parameters: 
        //    div: string
        
        //    the id of the div where you want to place your month div, this
        //    will probably end up being hardcoded in
        
        //HARDCODED FOR NOW
        var $div = $('#calendarDiv');
        
        //the div ID is the monthID
        $div.append('<div class="monthframe" id=' + self.monthState.monthId + '></div>');
        $('.monthframe').append($('#template').html());
    };
    
    self.collectCheckedDays = function() {
        //go through table and store which days the user checked
        // Stores index: daynumber pairs in monthState.checkedDays. These
        // pertain to the days which have the daynumber div hidden.
        
        //HARDCODED FOR NOW
        var $div = $('#calendarDiv');
        var $monthId = $('#'+ self.monthState.monthId);
        //retrieves the daynumber attribute of the checked days and stores it in monthState.checkedDays
        $monthId.find('.month').find('.daynumber.hidden').each(function () {
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
            console.log(event);  // prints so you can look at the event object in the console
            $( this ).children().toggleClass("hidden");
            
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
            if (dayOfMonth >= self.monthState.startDay && dayOfMonth <= self.monthState.numberOfDays) { 
                //store the day of months with their indices in dayIndex object (dictionary)
                //in month state
                 self.monthState.dayIndex[dayOfMonth] = indexOfTableTd;
                 
                 //this refers to the td
                 $(this).empty();  //ensure it's empty
                 
                 //inside each td there will be the following html 
                 var toAdd = '<div class="cell"><div class="daynumber"' + ' daynumber="' + 
                 dayOfMonth.toString() + '"></div><i class="fa fa-check fa-2x hidden"></i></div>'
                 
                 //add html inside td element
                 $(this).append(toAdd);
                 
                 //this ensures that the css changes for an actual day in the month
                 $(this).addClass('actualDay');
                 
                 //add the daynumber into the div with class .daynumber, which is 
                 //inside of the td
                 $(this).find('.cell').children('.daynumber').append(dayOfMonth);
            }
        })
    };
    
    self.generateCheckMarks = function() {
        // Toggles the hidden class between the children of the div class="cell" 
        // of the cells whose indices are in the monthState.checkedDays
        // object.
        
        var $div = $('#calendarDiv');
        var monthId = '#'+ self.monthState.monthId;
        $div.find(monthId).find('.month').find('td').each( function(index) {
            
            if (self.monthState.checkedDays[index]) {
                $(this).find('.cell').children().toggleClass("hidden");
            }
         })
    };
    
}


//generate a year/multiple years

var generateCalendarObj = function(state) {
    // Returns a calendar object with the given state as it's calendarState.
    
    // Parameters:
    // state: dictionary
    //     contains calendar information (numberOfYears, startDate, etc)
    var startDate = state.startDate;
    var numberOfYears = state.numberOfYears
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
        startDate : undefined,
        //list of years
        years : [],
        //dictionary of monthId: monthState
        monthStates : [],
        //list name under which it will be saved
        listName : '',
        //self.numberOfYears
        numberOfYears : 1,
        //self.numberOfMonths
        numberOfMonths : 12
    }
};

var Calendar = function(startDate, numberOfYears) {
    
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
    
    self.initCalendarState = function() {
        self.calendarState.startDate = self.startDate.format();
        self.calendarState.years = self.getYears();
        //workin on 
        //self.monthStates
        //self.listName
        self.calendarState.numberOfYears = self.numberOfYears;
        self.calendarState.numberOfMonths = self.numberOfMonths;
    };
    
    self.getYears = function() {
        //get all the years user wants to track and store in calendarState
        var years = []
        var startYear = self.startDate.year();
        years.push(startYear);
        
        for (i=1; i <= self.numberOfYears; i++)
        {
            years.push(startYear + i);
        }
        return years;
    };
    
    self.getMonthStates = function(numberOfMonths) {
        //get the required monthStates
        
        var monthStates = [];
        
        for (i = self.startDate.month(); i< self.startDate.month() + self.numberOfMonths; i++) {
            monthIndex = i%12;
            if (monthIndex == self.startDateMoment.month() && desiredYear == self.startDateMoment.year()) {
                console.log("inside first conditional if statement");
                console.log(self.monthListState.startDate);
                var month = new Month(self.calendarState.startDate);
            }
            else {
                monthIndex += 1;
                var dateEpoch = moment(desiredYear.toString() + '-' + monthIndex.toString() + '-01', "YYYY-MM-DD");
                
                var month = new Month(dateEpoch);
            }
            month.initCurrentMonthState();
            monthStates.push(month.monthState);
            if (i == 11) {
                desiredYear += 1;
                self.monthListState.years.push(desiredYear);
            }
            //if (desiredYear == 2017) {
            //    console.log("breaking");
            //    break;
            //}
        }
        return monthStates;
    };
};
