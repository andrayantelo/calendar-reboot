// Make a Firebase storage manager.
var firebaseCalendarStorage = function(params) {
    var self = this;
    var prefix = params['storeId'] || "";
    // Get a reference to the database service
    self.database = firebase.database();
    // This tells you whether the storage is actively working.
    self.activeCalls = 0;
    self.activityChangeFunctions = [];
    
    self.user = params['user'];
    
    var jitter = function(func, arg) {
        var runFunc = function () {
            func(arg);
            self.endWork();
        };
        
        var randomNumber = Math.random() * 500;
        self.startWork();
        setTimeout(runFunc, randomNumber);
            
    };
    
    self.onActivityChanged = function(func) {
        // Will run checkit's onActivityChanged.
        
        //TODO extend this to support multiple callbacks
        self.activityChangeFunctions.push(func);
    };
    
        self.startWork = function() {
        // Will increment the counter and possibly fire an event.
        
        self.activeCalls += 1;
        // Will dispatch the event backgroundActivityChange 
        self.activityChangeFunctions.forEach(function(func) {
            func(self.activeCalls);
        });
        
    };
    
    self.endWork = function() {
        // Will decrement the counter and maybe fire an event.
        
        
        self.activeCalls -= 1;
        if (self.activeCalls < 0) {
            console.error("No work has been started");
        }
        
        // Dispatch the activityChanged listener
        self.activityChangeFunctions.forEach(function(func) {
            func(self.activeCalls);
        });
      
    };
    
    self.getAllCalendarIds = function() {
        // Returns a promise for the allCalendarIds object from storage
        
        var userId = self.user.uid;
        self.startWork();
        return new Promise(function(resolve, reject) {
            self.database.ref('/users/' + userId + '/allCalendarIds')
            .once('value')  
            .then(function(allCalendarIds) {
                self.endWork();
                if (allCalendarIds.val() === null) {
                    reject("allCalendarIds not found");
                }
                else {
                    return resolve(allCalendarIds.val());
                }
            })
            .catch(function(err) {
                self.endWork();
                console.error(err);
                return err;
            })
        })
    };
    
    self.save = function(calendarObj) {
        //save an App object (like a calendar object for example) in storage
        
        // Store the calendar state in the firebase database.
        
        var userId = self.user.uid;
        var calUniqueId = calendarObj.state.uniqueId;
        var calTitle = calendarObj.state.title;
        var calState = calendarObj.state;
        
        // Store the user's allCalendarIds and their calendarState .. setting the
        // active calendar has its own method.
        var updates = {};
        updates['users/' + userId + '/allCalendarIds/' + calUniqueId] = calTitle;
        updates['calendars/' + calUniqueId + '/calendarState'] = calState;
        updates['calendars/' + calUniqueId + '/read/' + userId] = true;
        updates['calendars/' + calUniqueId + '/write/' + userId] = true;
        
        self.startWork();
        return self.database.ref().update(updates)
        .then(function() {
            self.endWork();
        })
        .catch(function(err) {
            console.error("Error in save function : " + err);
            self.endWork();
            return err;
        })
    };
    
    self.setActiveById = function(calendarObjId) {
        // Set the active calendar/object by using its Id
        
        var userId = self.user.uid;
        var updates = {};
        updates['users/' + userId + '/currentActiveCalendar'] = calendarObjId;
        
        self.startWork();
        return self.database.ref().update(updates)
        .then(function() {
            self.endWork();
        })
        .catch(function(err) {
            console.error("Unable to set active Id: " + err);
            return err;
        })
    };
    
    self.remove = function(calendarObj) {
        // Remove an app object (like a calendar) from storage
        // TODO: Determine if this method is necessary
        
        var uniqueId = calendarObj.state.uniqueId;
        self.removeById(uniqueId);
    };
    
    self.removeById = function(uniqueId) {
        // Remove a calendar from storage by using its Id.
        // First deleting it from /user/uid/allCalendarIds
        // Second removing it from calendars/
        // removing currentActive status has its own method
        var userId = self.user.uid;
        
        self.startWork();
        return self.database.ref('users/' + userId + '/allCalendarIds/' + uniqueId).remove()
        .then(function() {
            self.database.ref('calendars/' + uniqueId).remove()
            .then(function() {
                self.endWork();
            })
            .catch(function(err) {
                console.error('Unable to remove calendar: ' + err);
                self.endWork();
            })
        })
        .catch(function(err) {
            console.error('Unable to remove calendar from user\'s allCalendarIds: ' + err);
            self.endWork();
            return err;
        })
    };
    
    self.removeActive = function() {
        // Return a promise, remove the active_calendar item from storage.
        var userId = self.user.uid;
        
        self.startWork();
        return self.database.ref('users/' + userId + '/currentActiveCalendar').remove()
        .then(function() {
            self.endWork();
        })
        .catch(function(err) {
            console.error("Unable to remove user's currentActiveCalendar: " + err);
            self.endWork();
            return err;
        })
    };
    
    self.getActive = function() {
        // Return a promise to the active_calendar id from storage
        
        var userId = self.user.uid;
        
        self.startWork();
        return new Promise(function(resolve, reject) {
            self.database.ref('users/' + userId + '/currentActiveCalendar')
            .once('value')  
            .then(function(currentActiveCalendar) {
                self.endWork();
                if (currentActiveCalendar.val() === null) {
                    reject("currentActiveCalendar not found");
                }
                else {
                    return resolve(currentActiveCalendar.val());
                }
            })
            .catch(function(err) {
                self.endWork();
                console.error(err);
                return err;
            })
        })
    };
    
    self.loadById = function(calendarObjId) {
    // Return a promise of a calendar state using its Id
    
        var userId = self.user.uid;
        
        self.startWork();
        return new Promise( function(resolve, reject) {
            self.database.ref('calendars/' + calendarObjId + '/calendarState')
            .once('value')
            .then(function(calState) {
                self.endWork();
                if (calState.val() !== null) {
                    return resolve(calState.val());
                }
                else {
                    reject("calendar not found");
                }
            })
            .catch(function(err) {
                self.endWork();
                console.error(err);
                return err;
            })
        })
    };

    
    
};




