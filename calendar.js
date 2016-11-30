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

//CODE FOR MONTH OBJECTS, CLASSES, ETC

var emptyMonthState = function() {
    //a dictionary of all the information you need for one month object
    return {
        //first day of the month index
        firstDayIndex : 0,
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
        monthId : 0,
        
        // object (dictionary) containing which days are checked index:daynumber
        checkedDays: {},
        // day and their indices pairs daynumber:index
        dayIndex: {},
    }
};

var Month = function(date) {
    //date will be a string of the format "MM-DD-YYYY"
    
    var self = this;
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
    };
    
     self.attachClickHandler = function() {
        //add functionality to the day squares, allowing it to be checked
        //with a checkmark when clicked
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
                 dayOfMonth.toString() + '"></div><i class="fa fa-check hidden"></i></div>'
                 
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
    
   
    
    
    
}
