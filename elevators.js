({
    init: function(elevators, floors) {
        // Floors that passengers have hit the "Up" button at
        var upPresses = {};
        // Floors that passengers have hit the "Down" button at
        var downPresses = {};
        $.each(floors, function(i, floor) {
            upPresses[i] = 0;
            downPresses[i] = 0;
        });

        var isEmpty = function(floorNum) {
            return !(upPresses[floorNum] || downPresses[floorNum]);
        };

        var getNonEmptyFloors = function() {
            var rv = [];
            for (var i = 0; i < floors.length; i++) {
                if (!isEmpty(i)) {
                    rv.push(i);
                }
            }
            return rv;
        };

         $.each(elevators, function(i, elevator) {
             // Floors that passengers wish to exit at
             var destinations = {};
             $.each(floors, function(i, floor) {
                 destinations[i] = false;
            });

            // If there are passengers, go to their floors, otherwise, go
            // to floors where passengers are waiting
            elevator.on("idle", function() {
                if (elevator.loadFactor() > 0) {
                    $.each(floors, function(i, floor) {
                        if (destinations[i]) {
                            elevator.goToFloor(i);
                        }
                    });
                } else {
                    elevator.goToFloor(getNonEmptyFloors()[0] || 0);
                }
                
            });

            // Mark a floor as one to stop at
            elevator.on("floor_button_pressed", function(floorNum) {
                destinations[floorNum] = true;
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                if (destinations[floorNum]) {
                    elevator.stop();
                    elevator.goToFloor(floorNum, true);
                } else if (elevator.loadFactor() < 0.5) {
                    if (upPresses[floorNum] || downPresses[floorNum]) {
                        elevator.stop();
                        elevator.goToFloor(floorNum, true);
                    }
                }
                
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                destinations[floorNum] = false;
                upPresses[floorNum] = 0;
                downPresses[floorNum] = 0;
            });

            // Record the number of presses
            $.each(floors, function(i, floor) {
                floor.on("up_button_pressed", function(event) {
                    upPresses[floor.floorNum()] += 1;
                });
                floor.on("down_button_pressed", function(event) {
                    downPresses[floor.floorNum()] += 1;
                });
            });
        });
    },
    update: function(dt, elevators, floors) {
    }
})
