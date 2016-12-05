
steps usually taken when generating just one month div that
has the click handler (but not the checkmarks that the user had previously put in
not doing the save/load thing yet:
make month object
initialize it's month state
generate an empty  month div
fill the month div
attach the clickhandler
loading would occur in place of initializing a month state, since
loading would give you the month's month state.
then after attaching the clickhandler, you would generate checkmarks

What should be happening when a user visits this page for the first time?
it loads, user picks a calendar title, then picks a start date, picks
how many years he/she wants to track  and clicks on
a button that says "set". then the page generates a calendar starting at
the start date provided and going on for the amount of years that the user
gave. The user can then put a checkmark on each day, making sure to click on
"save progess" by clicking on a button that says save, 
the calendar's calendarState gets saved
and the title appears in the Saved Calendars dropdown menu

What happens when a user visits the page again after having saved one or
more calendars.
the page loads like normal, the user goes to the dropdown menu, clicks on
the calendar they want to view, it loads with the checkmarks they have
already inputted. they do whatever they want, save it, click on another calendar
it loads, they click back to the first calendar it loads with the new changes 
made. 
 
