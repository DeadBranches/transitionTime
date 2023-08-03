// brain of the whole thing. hard work is done here
const mapNumber = (number, in_min, in_max, out_min, out_max) => {
    var rangeCalculation =  (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    return Math.round(rangeCalculation);
};

// Create an empty array to store the messages
var messages = [];

// Loop through the rooms in msg.lightControl because we know only rooms and devices are children of lightcontrol
for (var room in msg.lightControl) {
    // Loop through the lights in each room
    for (var light in msg.lightControl[room]) {
        // Get the range array for each light
        var range = msg.lightControl[room][light].range;
        // Use a switch statement to assign different values based on the phase
        var startValue, endValue;
        switch (msg.transition.phase) {
            case "overnight":
                startValue = range[0];
                endValue = range[0] + 1;
                startTimestamp = msg.transition.afternoon_end_timestamp
                endTimestamp = msg.transition.afternoon_end_timestamp + 1
                break;
            case "morning_before_middle":
                startValue = range[0];
                endValue = range[1];
                startTimestamp = msg.transition.morning_start_timestamp
                endTimestamp = msg.transition.morning_middle_timestamp
                break;
            case "morning_after_middle":
                startValue = range[1];
                endValue = range[2];
                startTimestamp = msg.transition.morning_middle_timestamp
                endTimestamp = msg.transition.morning_end_timestamp
                break;
            case "noon":
                startValue = range[2];
                endValue = range[2] + 1;
                startTimestamp = msg.transition.morning_end_timestamp
                endTimestamp = msg.transition.afternoon_start_timestamp
                break;
            case "afternoon_before_middle":
                startValue = range[2];
                endValue = range[3];
                startTimestamp = msg.transition.afternoon_start_timestamp
                endTimestamp = msg.transition.afternoon_middle_timestamp
                break;
            case "afternoon_after_middle":
                startValue = range[3];
                endValue = range[0];
                startTimestamp = msg.transition.afternoon_middle_timestamp
                endTimestamp = msg.transition.afternoon_end_timestamp
                break;
            default:
                // Handle any unexpected phase value
                node.warn("Invalid phase: " + msg.transition.phase);
                return null; // Stop the function and do not send any message
        }

        // Create a new message object with the same structure as before
        var newMsg = {
            lightControl: {
                brightness: mapNumber(msg.ts,
                            startTimestamp,
                            endTimestamp,
                            startValue,
                            endValue),
                roomStateContextPath: "lightControl." + room + ".state",
                entityStateContextPath: "lightControl." + room + "." + light + ".state",
                desiredGlobalVar: "lightControl." + room + "." + light + ".brightness"
            },

                requestUpdate: msg.requestUpdate,
                transitionDuration: msg.transition.transitionDuration
        
        };
        // Push the new message to the array
        messages.push(newMsg);
    }
}

// Return the array of messages as the second output
return [messages];
