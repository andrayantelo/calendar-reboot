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

//DO I ACTUALLY NEED THE FOLLOWING FIVE FUNCTIONS?
var getMonthIndex = function(date) {
    //get the index of the month of a given date
};

var getMonthName = function(index) {
    //given a month index, return the name of the month
};

var numberOfDays = function(date) {
    //given a date, get the number of days in the month of that date
};

var getYear = function(date) {
    //returns the full year of a given date
};

var getDayOfWeek = function(date) {
    //returns the index of the day of the week (0 is Sunday, 6 is Saturday)
};


//CODE FOR MONTH OBJECTS, CLASSES, ETC

var Month = function() {
    var self = this;
    
    self.storeMonth = function() {
        //save month data, whether on a database, localstorage, whatever 
        //ends up being used
    };
    
    self.loadMonth = function() {
        //load month data from database/localstorage, whatever is used
        //to store
    };
    
    self.generateEmptyMonthDiv = function() {
        //add a div to html code containing the table template for a month 
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
    };
    
   
    
    
    
}
