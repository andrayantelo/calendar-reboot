/*jslint devel: true, es5: true, nomen: true*/
/*global
    browser:true, Promise, firebase
*/

// Firebase storage manager.
class FirebaseCalendarStorage {
    constructor(params) {
        "use strict";
        var self = this,
            prefix = params.storeId || "";
        
        // Get a reference to the database service
        self.database = firebase.database();
        // This tells you whether the storage is actively working.
        self.activeCalls = 0;
        self.activityChangeFunctions = [];
        
        self.user = params.user;
        
        self.onActivityChanged = function (func) {
            // Will run checkit's onActivityChanged.
            
            //TODO extend this to support multiple callbacks
            self.activityChangeFunctions.push(func);
        };
        
        self.startWork = function () {
            // Will increment the counter and possibly fire an event.
            
            self.activeCalls += 1;
            // Will dispatch the event backgroundActivityChange 
            self.activityChangeFunctions.forEach(function (func) {
                func(self.activeCalls);
            });
            
        };
        
        self.endWork = function () {
            // Will decrement the counter and maybe fire an event.
            
            
            self.activeCalls -= 1;
            if (self.activeCalls < 0) {
                console.error("No work has been started");
            }
            
            // Dispatch the activityChanged listener
            self.activityChangeFunctions.forEach(function (func) {
                func(self.activeCalls);
            });
          
        };
        
        self.getAllCalendarIds = function () {
            // Returns a promise for the allCalendarIds object from storage
            
            var userId = self.user.uid;
            self.startWork();
            return new Promise(function (resolve, reject) {
                self.database.ref('/users/' + userId + '/allCalendarIds')
                    .once('value')
                    .then(function (allCalendarIds) {
                        self.endWork();
                        if (allCalendarIds.val() === null) {
                            reject("allCalendarIds not found");
                        } else {
                            return resolve(allCalendarIds.val());
                        }
                    })
                    .catch(function (err) {
                        self.endWork();
                        console.error(err);
                        // return empty object for functions that need allCalendarIds
                        // like fillDropdown
                        return {};
                    });
            });
        };
        
        self.addWriter = function (user, calObj) {
            // Add a user to the writers directory in the database.
            
            var updates = {};
            updates['calendars/' + calObj.state.uniqueId + '/writers/' + user.uid] = true;
            
            self.startWork();
            return self.database.ref().update(updates)
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error("error in save function : " + err);
                    self.endWork();
                    return err;
                });
        };
        
        self.removeWriter = function (user, calObj) {
            // Remove a user form the writers directory in the database
            
            self.database.ref('calendars/' + calObj.state.uniqueId + '/writers/' + user.uid).remove()
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error('Unable to remove user: ' + err);
                    self.endWork();
                });
        };
        
        self.addReader = function (user, calObj) {
            // Add a user to the readers directory in the database
            var updates = {};
            updates['calendars/' + calObj.state.uniqueId + '/readers/' + user.uid] = true;
            
            self.startWork();
            return self.database.ref().update(updates)
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error("error in save function : " + err);
                    self.endWork();
                    return err;
                });
            
        };
        
        self.removeReader = function (user, calObj) {
            // Remove a user from the readers directory in the database
            
            self.database.ref('calendars/' + calObj.state.uniqueId + '/readers/' + user.uid).remove()
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error('Unable to remove user: ' + err);
                    self.endWork();
                });
        };
        
        self.save = function (calendarObj) {
            //save an App object (like a calendar object for example) in storage
            
            // Store the calendar state in the firebase database.
            
            var userId = self.user.uid,
                calUniqueId = calendarObj.state.uniqueId,
                calTitle = calendarObj.state.title,
                calState = calendarObj.state,
            
            // Store the calendar into allCalendarIds, store calState
                updates = {};
           
            updates['users/' + userId + '/allCalendarIds/' + calUniqueId] = calTitle;
            updates['calendars/' + calUniqueId + '/calendarState'] = calState;
            
            self.startWork();
            return self.database.ref().update(updates)
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error("error in save function : " + err);
                    self.endWork();
                    return err;
                });
            
        };
        
        self.updateUserEmail = function () {
            // Updates the user's email in the database.
            var userId = self.user.uid,
                userEmail = self.user.email,
            
                updates = {};
            updates['users/' + userId + '/email'] = userEmail;
            
            self.startWork();
            return self.database.ref().update(updates)
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error("Unable to update email: " + err);
                    self.endWork();
                    return err;
                });
        };
        
        self.setActiveById = function (calendarObjId) {
            // Set the active calendar/object by using its Id
            
            var userId = self.user.uid,
                updates = {};
            updates['users/' + userId + '/currentActiveCalendar'] = calendarObjId;
            
            self.startWork();
            return self.database.ref().update(updates)
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error("Unable to set active Id: " + err);
                    self.endWork();
                    return err;
                });
        };
        
        self.remove = function (calendarObj) {
            // Remove an app object (like a calendar) from storage
            // TODO: Determine if this method is necessary
            
            var uniqueId = calendarObj.state.uniqueId;
            self.removeById(uniqueId);
        };
        
        self.removeById = function (uniqueId) {
            // Remove a calendar from storage by using its Id.
            // First deleting it from /user/uid/allCalendarIds
            // Second removing it from calendars/
            // removing currentActive status has its own method
            var userId = self.user.uid,
            
                updates = {};
            updates['users/' + userId + '/allCalendarIds/' + uniqueId] = null;
            updates['calendars/' + uniqueId + '/calendarState'] = null;
            updates['calendars/' + uniqueId + '/readers'] = null;
            updates['calendars/' + uniqueId + '/writers'] = null;
            
            self.startWork();
            return self.database.ref().update(updates)
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error('Problem removing calendar from database :' + err);
                    self.endWork();
                    return err;
                });
        };
        
        self.removeActive = function () {
            // Return a promise, remove the active_calendar item from storage.
            var userId = self.user.uid,
                updates = {};
            updates['users/' + userId + '/currentActiveCalendar'] = null;
            
            self.startWork();
            return self.database.ref().update(updates)
                .then(function () {
                    self.endWork();
                })
                .catch(function (err) {
                    console.error("Unable to remove user's currentActiveCalendar: " + err);
                    self.endWork();
                    return err;
                });
        };
        
        self.getActive = function () {
            // Return a promise to the active_calendar id from storage
            
            var userId = self.user.uid;
            
            self.startWork();
            return new Promise(function (resolve, reject) {
                self.database.ref('users/' + userId + '/currentActiveCalendar')
                    .once('value')
                    .then(function (currentActiveCalendar) {
                        self.endWork();
                        if (currentActiveCalendar.val() === null) {
                            reject("currentActiveCalendar not found");
                        } else {
                            return resolve(currentActiveCalendar.val());
                        }
                    })
                    .catch(function (err) {
                        self.endWork();
                        console.error(err);
                        return Promise.reject(err);
                    });
            });
        };
        
        self.loadById = function (calendarObjId) {
        // Return a promise of a calendar state using its Id
        
            var userId = self.user.uid;
            self.startWork();
            return new Promise(function (resolve, reject) {
                self.database.ref('calendars/' + calendarObjId + '/calendarState')
                    .once('value')
                    .then(function (calState) {
                        self.endWork();
                        if (calState.val() !== null) {
                            return resolve(calState.val());
                        } else {
                            reject("calendar not found");
                        }
                    })
                    .catch(function (err) {
                        self.endWork();
                        console.error(err);
                        return err;
                    });
            });
        };
        
        self.initializeCalendar = function (calendarObj) {
            // Initializes a calendar in the database. Adds the calendar creator
            // as a writer and a reader, sets the calendar as the currentActiveCalendar
            // and then runs the save method (store cal state and allCalendarIds
            
            self.startWork();
            var addWriterP = self.addWriter(self.user, calendarObj)
                .then(function () {
                    var addReaderP = self.addReader(self.user, calendarObj),
                        setActiveP = self.setActiveById(calendarObj.state.uniqueId),
                        saveP = self.save(calendarObj);
                    Promise.all([addReaderP, setActiveP, saveP])
                        .then(function () {
                            self.endWork();
                        })
                        .catch(function (err) {
                            console.error("Error initializing calendar " + err);
                            self.endWork();
                        });
                    
                })
                .catch(function (err) {
                    console.error("Problems initializing calendar " + err);
                    self.endWork();
                });
            
        };
    
    
    }
};


// LocalStorage storage manager
class LocalCalendarStorage {
    constructor(params) {
        "use strict";
        
        var self = this,
            prefix = params.storeId || "",
            allCalendarIdsKey = 'allCalendarIdsKey',
            //the current_active_calendar is the key for localStorage that stores
            //the active calendar's Id
            current_active_calendar = 'current_active_calendar',
            jitter = function (func, arg) {
                var runFunc = function () {
                    func(arg);
                    self.endWork();
                },
    
                    randomNumber = Math.random() * self.jitterTime;
                self.startWork();
                setTimeout(runFunc, randomNumber);
    
            };
        // This tells you whether the storage is actively working.
        self.activeCalls = 0;
        self.activityChangeFunctions = [];
        self.jitterTime = params.jitterTime;
        
        self._toKey = function (id) {
            //make a key out of a uniqueId
            
            var key = prefix ? prefix + "_" + id : id;
            return key;
        };
        
        self.setInStorage_ = function (key, val) {
            // Check if key does not already exists in localStorage
            localStorage.setItem(self._toKey(key), JSON.stringify(val));
        };
        
        self.getFromStorage_ = function (key) {
            var storageItem = localStorage.getItem(self._toKey(key));
            if (storageItem !== null) {
                storageItem = JSON.parse(storageItem);
            }
            return storageItem;
        };
        
        self.removeFromStorage_ = function (key) {
            localStorage.removeItem(self._toKey(key));
        };
    
        
        self.onActivityChanged = function (func) {
            // Adds functions to activityChangeFunctions.
            
            //TODO extend this to support multiple callbacks
            self.activityChangeFunctions.push(func);
        };
        
        self.startWork = function () {
            // Will increment the counter and possibly fire an event.
            
            self.activeCalls += 1;
            
            // Will dispatch the event backgroundActivityChange 
            self.activityChangeFunctions.forEach(function (func) {
                func(self.activeCalls, 'loadingWheel');
            });
            
        };
        
        self.endWork = function () {
            // Will decrement the counter and maybe fire an event.
    
            self.activeCalls -= 1;
            
            if (self.activeCalls < 0) {
                console.error("Number of active calls is negative");
                self.activeCalls = 0;
                return;
            }
            
            // Dispatch the activityChanged listener
            self.activityChangeFunctions.forEach(function (func) {
                func(self.activeCalls, 'loadingWheel');
            });
          
        };
        
        self.getAllCalendarIds = function () {
            // Returns a promise for the allCalendarIds object from storage
            
            return new Promise(function (resolve, reject) {
                var allCalendarIds = self.getFromStorage_(allCalendarIdsKey);
                
                if (allCalendarIds !== null) {
                    jitter(resolve, allCalendarIds);
                } else {
                    jitter(reject, "Not found");
                }
            })
                .then(function (ids) {
                    return ids;
                })
                .catch(function (reason) {
                    console.log("allCalendarIds " + reason);
                    // return empty object to be used in functions like 
                    // fillDropdown. Empty because there was nothing store in storage
                    // for allCalendarIds
                    return {};
                });
        };
        
        self.save = function (calendarObj) {
            //save an App object (like a calendar object for example) in storage
            
            //store the state in localStorage
            var stateP = new Promise(function (resolve, reject) {
                self.setInStorage_(calendarObj.state.uniqueId, calendarObj.state);
                jitter(resolve);
            }),
            
            //put calendar in allCalendarIdss and store it
                idsP = self.getAllCalendarIds()
                .then(function (allCalendarIds) {
                    allCalendarIds[calendarObj.state.uniqueId] = calendarObj.state.title;
                    self.setInStorage_(allCalendarIdsKey, allCalendarIds);
                })
                .catch(function () {
                    console.log("No previous calendars in storage");
                    var allCalendarIds = {};
                    allCalendarIds[calendarObj.state.uniqueId] = calendarObj.state.title;
                    self.setInStorage_(allCalendarIdsKey, allCalendarIds);
                });
                
            return Promise.all([stateP, idsP]);
        };
        
        self.remove = function (calendarObj) {
            //remove an app object (like a calendar) from storage
            var uniqueId = calendarObj.state.uniqueId;
            self.removeById(uniqueId);
        };
        
        self.removeById = function (uniqueId) {
            //remove a calendar from storage by using it's Id.
            
            //get the allCalendarIds object from storage
            return self.getAllCalendarIds()
                .then(function (allCalendarIds) {
                    // Delete the calendar from allCalendarIds.
                    delete allCalendarIds[uniqueId];
                    // Save that change
                    self.setInStorage_(allCalendarIdsKey, allCalendarIds);
                    // Remove the calendar from local storage
                    self.removeFromStorage_(uniqueId);
                    // Remove active status from the calendar
                    self.removeFromStorage_(current_active_calendar);
                })
                .catch(function (reason) {
                    console.log("Unable to remove calendar" + reason);
                });
            
        };
        
        self.loadById = function (calendarObjId) {
            // Return a promise to a calendar state using its Id
            return new Promise(function (resolve, reject) {
                var calendar = self.getFromStorage_(calendarObjId);
                
                if (calendar !== null) {
                    jitter(resolve, calendar);
                } else {
                    jitter(reject, "Calendar not found");
                }
            });
      
        };
        
        self.getActive = function () {
            // Return a promise to the active_calendar id from storage
            
            return new Promise(function (resolve, reject) {
                var activeCalendarId = self.getFromStorage_(current_active_calendar);
                
                if (activeCalendarId !== null) {
                    // Signal that the promise succeeded and make the value ready to go. 
                    jitter(resolve, activeCalendarId);
                } else {
                    jitter(reject, "Not found");
                }
            });
            
        };
        
        self.removeActive = function () {
            // Return a promise, remove the active_calendar item from storage.
            
            return new Promise(function (resolve, reject) {
                self.removeFromStorage_(current_active_calendar);
                jitter(resolve);
            });
        };
        
        self.setActiveById = function (calendarObjId) {
            // Set the active calendar/object by using its Id
            return new Promise(function (resolve, reject) {
                self.setInStorage_(current_active_calendar, calendarObjId);
                jitter(resolve);
            });
        };
        
        self.initializeCalendar = function (calendarObj) {
            // Initializes a calendar in the database. Adds the calendar creator
            // as a writer and a reader, sets the calendar as the currentActiveCalendar
            // and then runs the save method (store cal state and allCalendarIds
    
            var setActiveP = self.setActiveById(calendarObj.state.uniqueId),
                saveP = self.save(calendarObj);
                
            return Promise.all([setActiveP, saveP]);
        };
    
// TODO addWriter and addReader for localStorage? Don't have user.uid though
    
    }
};
