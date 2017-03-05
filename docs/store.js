// Firebase storage manager.
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
    
    self.addWriter = function(user, calObj) {
        // Add a user to the writers directory in the database.
        
        var updates = {};
        updates['calendars/' + calObj.state.uniqueId + '/writers/' + user.uid] = true;
        
        self.startWork();
        return self.database.ref().update(updates)
            .then(function() {
                self.endWork();
            })
            .catch(function(err) {
                console.error("error in save function : " + err);
                self.endWork();
                return err
             })
    };
    
    self.removeWriter = function(user, calObj) {
        // Remove a user form the writers directory in the database
        
        self.database.ref('calendars/' + calObj.state.uniqueId + '/writers/' + user.uid).remove()
            .then(function() {
                self.endWork();
            })
            .catch(function(err) {
                console.error('Unable to remove user: ' + err);
                self.endWork();
            })
    };
    
    self.addReader = function(user, calObj) {
        // Add a user to the readers directory in the database
        var updates = {};
        updates['calendars/' + calObj.state.uniqueId + '/readers/' + user.uid] = true;
        
        self.startWork();
        return self.database.ref().update(updates)
            .then(function() {
                self.endWork();
            })
            .catch(function(err) {
                console.error("error in save function : " + err);
                self.endWork();
                return err
            })
        
    };
    
    self.removeReader = function(user, calObj) {
        // Remove a user from the readers directory in the database
        
        self.database.ref('calendars/' + calObj.state.uniqueId + '/readers/' + user.uid).remove()
            .then(function() {
                self.endWork();
            })
            .catch(function(err) {
                console.error('Unable to remove user: ' + err);
                self.endWork();
            })
    };
    
    self.save = function(calendarObj) {
        //save an App object (like a calendar object for example) in storage
        
        // Store the calendar state in the firebase database.
        
        var userId = self.user.uid;
        var calUniqueId = calendarObj.state.uniqueId;
        var calTitle = calendarObj.state.title;
        var calState = calendarObj.state;
        
        // Store the calendar into allCalendarIds, store calState
        var updates = {};
       
        updates['users/' + userId + '/allCalendarIds/' + calUniqueId] = calTitle;
        updates['calendars/' + calUniqueId + '/calendarState'] = calState;
        
        self.startWork();
        return self.database.ref().update(updates)
            .then(function() {
                self.endWork();
            })
            .catch(function(err) {
                console.error("error in save function : " + err);
                self.endWork();
                return err
            })
        
    };
    
    self.updateUserEmail = function() {
        // Updates the user's email in the database.
        var userId = self.user.uid;
        var userEmail = self.user.email;
        
        var updates = {};
        updates['users/' + userId + '/email'] = userEmail;
        
        self.startWork();
        return self.database.ref().update(updates)
            .then(function() {
                self.endWork();
            })
            .catch(function(err) {
                console.error("Unable to update email: " + err);
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
                self.endWork();
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
        
        var updates = {};
        updates['users/' + userId + '/allCalendarIds/' + uniqueId] = null;
        updates['calendars/' + uniqueId + '/calendarState'] = null;
        updates['calendars/' + uniqueId + '/readers'] = null;
        updates['calendars/' + uniqueId + '/writers'] = null;
        
        self.startWork();
        return self.database.ref().update(updates)
            .then(function() {
                    self.endWork();
            })
            .catch(function(err) {
                console.error(`Problem removing calendar from database :` + err);
                self.endWork();
                return err;
            })
    };
    
    self.removeActive = function() {
        // Return a promise, remove the active_calendar item from storage.
        var userId = self.user.uid;
        var updates = {};
        updates['users/' + userId + '/currentActiveCalendar'] = null;
        
        self.startWork();
        return self.database.ref().update(updates)
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
    
    self.initializeCalendar = function(calendarObj) {
        // Initializes a calendar in the database. Adds the calendar creator
        // as a writer and a reader, sets the calendar as the currentActiveCalendar
        // and then runs the save method (store cal state and allCalendarIds
        
        self.startWork();
        var addWriterP = self.addWriter(self.user, calendarObj)
            .then(function() {
                var addReaderP = self.addReader(self.user, calendarObj);
                var setActiveP = self.setActiveById(calendarObj.state.uniqueId);
                var saveP = self.save(calendarObj);
                Promise.all([addReaderP, setActiveP, saveP])
                    .then(function() {
                        self.endWork();
                    })
                    .catch(function(err) {
                        console.error("Error initializing calendar " + err);
                        self.endWork();
                    })
                
            })
            .catch(function(err) {
                console.error("Problems initializing calendar " + err);
                self.endWork();
            });
        
    };
    
    
};



// LocalStorage storage manager
var LocalCalendarStorage = function(params) {
    var self = this;
    var prefix = params['storeId'] || "";
    var allCalendarIdsKey = 'allCalendarIdsKey';
    //the current_active_calendar is the key for localStorage that stores
    //the active calendar's Id
    var current_active_calendar = 'current_active_calendar';
    // This tells you whether the storage is actively working.
    self.activeCalls = 0;
    self.activityChangeFunctions = [];
    
    var toKey = function(id) {
        //make a key out of a uniqueId
        
        var key = prefix + "_" + id;
        return key;
    };
    
    setInStorage = function(key, val) {
        localStorage.setItem(toKey(key), JSON.stringify(val));
    };
    
    getFromStorage = function(key) {
        var storageItem = localStorage.getItem(toKey(key))
        if (storageItem !== null) {
            storageItem = JSON.parse(storageItem);
        }
        return storageItem;
    };
    
    removeFromStorage = function(key) {
        localStorage.removeItem(toKey(key));
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
    
    var jitter = function(func, arg) {
        var runFunc = function () {
            func(arg);
            self.endWork();
        };
        
        var randomNumber = Math.random() * 4000;
        self.startWork();
        setTimeout(runFunc, randomNumber);
        
    };
    
    self.getAllCalendarIds = function() {
        // Returns a promise for the allCalendarIds object from storage
        
        return new Promise( function(resolve, reject) {
            var allCalendarIds = getFromStorage(allCalendarIdsKey);
            
            if (allCalendarIds !== null ) {
                jitter(resolve, allCalendarIds);
            }
            else {
                jitter(reject, "Not found");
            }})
            .then( function(ids) {
                return ids;
            })
            .catch( function() {
                console.log("getAllCalendarIds catch function running.");
            });
    };
    
    self.save = function(calendarObj) {
        //save an App object (like a calendar object for example) in storage
        
        //store the state in localStorage
        var stateP = new Promise(function(resolve, reject) {
            setInStorage(calendarObj.state.uniqueId, calendarObj.state);
            jitter(resolve);
        });
        
        
        //put calendar in allCalendarIdss and store it
        var idsP = self.getAllCalendarIds()
            .then(function (allCalendarIds) {
                allCalendarIds[calendarObj.state.uniqueId] = calendarObj.state.title;
                setInStorage(allCalendarIdsKey, allCalendarIds);
            })
            .catch(function () {
                console.log("No previous calendars in storage");
                var allCalendarIds = {};
                allCalendarIds[calendarObj.state.uniqueId] = calendarObj.state.title;
                setInStorage(allCalendarIdsKey, allCalendarIds);
            })
            
        return Promise.all([stateP, idsP]);
    };
    
    self.remove = function(calendarObj) {
        //remove an app object (like a calendar) from storage
        var uniqueId = calendarObj.state.uniqueId;
        self.removeById(uniqueId);
    };
    
    self.removeById = function(uniqueId) {
        //remove a calendar from storage by using it's Id.
        
        //get the allCalendarIds object from storage
        return self.getAllCalendarIds()
            .then(function(allCalendarIds) {
                // Delete the calendar from allCalendarIds.
                delete allCalendarIds[uniqueId];
                // Save that change
                setInStorage(allCalendarIdsKey, allCalendarIds);
                // Remove the calendar from local storage
                removeFromStorage(uniqueId);
                // Remove active status from the calendar
                removeFromStorage(current_active_calendar);
            })
            .catch(function () {
                console.log("Unable to remove calendar");
            });
        
    };
    
    self.loadById = function(calendarObjId) {
        // Return a promise to a calendar object using its Id
        return new Promise( function(resolve, reject) {
            var calendar = getFromStorage(calendarObjId);
            
            if (calendar !== null) {
                jitter(resolve, calendar);
            }
            else {
                jitter(reject, "Calendar not found");
            }
        })
  
    };
    
    self.getActive = function() {
        // Return a promise to the active_calendar id from storage
        
        return new Promise( function(resolve, reject) {
            var activeCalendarId = getFromStorage(current_active_calendar);
            
            if (activeCalendarId !== null ) {
                // Signal that the promise succeeded and make the value ready to go. 
                jitter(resolve, activeCalendarId);
            }
            else {
                jitter(reject, "Not found");
            }
        })
        
    };
    
    self.removeActive = function() {
        // Return a promise, remove the active_calendar item from storage.
        
        return new Promise( function(resolve, reject) {
            removeFromStorage(current_active_calendar);
            jitter(resolve);
        })
    };
    
    self.setActiveById = function(calendarObjId) {
        // Set the active calendar/object by using its Id
        return new Promise( function(resolve, reject) {
            setInStorage(current_active_calendar, calendarObjId);
            jitter(resolve);
        })
    };
    
    self.initializeCalendar = function(calendarObj) {
        // Initializes a calendar in the database. Adds the calendar creator
        // as a writer and a reader, sets the calendar as the currentActiveCalendar
        // and then runs the save method (store cal state and allCalendarIds
        
        return new Promise( function(resolve, reject) {
            self.setActiveById(calendarObj.state.uniqueId);
            self.save(calendarObj);
            jitter(resolve);
        });
                
        
    };
    
    
};
