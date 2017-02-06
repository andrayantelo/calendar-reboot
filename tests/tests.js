// Tests for checkit app

// the test method gets passed a string as the first argument (naming the
// test), and a function as the second (which will run the code for this test)
// div #qunit-fixture contains an extract of the markup from our app, enough to 
// write useful tests against. By putting it in this div, we don't have to worry
// about DOM changes from one test affecting other tests because qunit will 
// automatically reset the markup after each test.

QUnit.test( "a basic test example", function( assert ) {
  var value = "hello";
  assert.equal( value, "hello", "We expect value to be hello" );
});



// Tests for checkit.js
// Testing utility functions

QUnit.module("Storage Utility Functions");
var myCar = {
    type: "toyota",
    color: "white",
    year: 1988
}
var carKey = "carKey";
QUnit.test("storeInLocalStorage test", function(assert) {
    storeInLocalStorage(carKey, myCar);
    var retrievedCar = JSON.parse(localStorage.getItem(carKey));
    assert.deepEqual(myCar, retrievedCar);
    assert.notEqual(retrievedCar, null);
    assert.notEqual(retrievedCar, undefined);
});

