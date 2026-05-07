/*
================================================================================
                    ESP32 SMART HOME DASHBOARD - JAVASCRIPT
================================================================================

This file contains all the JavaScript code that makes the dashboard work.
Think of JavaScript as the "brain" of the webpage - it handles all the
interactive stuff like connecting to Firebase, reading data, and updating
the screen.

================================================================================
*/


/*
--------------------------------------------------------------------------------
                          SECTION 1: FIREBASE CONFIGURATION
--------------------------------------------------------------------------------

What is Firebase?
- Firebase is a service from Google that provides a real-time database.
- Think of it like a shared online spreadsheet where:
    - The ESP32 (microcontroller) WRITES sensor data TO it
    - This webpage READS the data FROM it
- Both the ESP32 and this webpage look at the same data, so they stay in sync!

What is this config object?
- It's like a "key" that tells our webpage HOW to connect to our specific
  Firebase project (like a username/password combo)
- Each piece of info tells Firebase which project we want to use:
    * apiKey: A unique identifier for this app
    * authDomain: The web address of our Firebase project
    * databaseURL: Where our real-time data is stored
    * projectId: A short name for our project

IMPORTANT: This config is safe to use in a webpage because Firebase has
security rules that only allow specific operations (we'll set those up later).
*/

const firebaseConfig = {

  // This is our unique API key - think of it as a digital ID card
  apiKey: "AIzaSyA2vHVbqH6EoMuO-iXDzlh0uYL2fF1tPgw",

  // This is our project's web address on Firebase
  authDomain: "esp32-smart-home-switch-nh.firebaseapp.com",

  // This is the location of our database (it's in Asia Southeast)
  databaseURL: "https://esp32-smart-home-switch-nh-default-rtdb.asia-southeast1.firebasedatabase.app/",

  // This is our project's short name
  projectId: "esp32-smart-home-switch-nh"

};


/*
--------------------------------------------------------------------------------
                          SECTION 2: INITIALIZE FIREBASE
--------------------------------------------------------------------------------

What does "initialize" mean?
- It means "start up" or "turn on"
- Just like you need to turn on your TV before watching, we need to
  "turn on" Firebase before we can use it
- We pass our config (the key we made above) so Firebase knows which
  project to connect to

What happens after this line?
- Firebase sets up a connection to our database in the background
- Our webpage is now ready to read and write data!
*/

firebase.initializeApp(firebaseConfig);


/*
--------------------------------------------------------------------------------
                          SECTION 3: LOGIN TO FIREBASE
--------------------------------------------------------------------------------

Why do we need to login?
- Firebase has a feature called "Authentication" that prevents unauthorized
  people from reading or changing our data
- It's like needing a password to get into a secure building

What are we doing here?
- We're using email/password authentication
- We're logging in with: email = "msrcasc.project@gmail.com"
                         password = "050809"

How does .then() and .catch() work?
- These are "promises" - they handle what happens AFTER the login attempt
- .then() runs if the login SUCCEEDS - we'll see "Firebase Login Success"
  in the browser console (F12 -> Console)
- .catch() runs if the login FAILS - we'll see an error message and an alert

Note: In a real app, you'd want to hide the login form and let users create
their own accounts. For this simple dashboard, we auto-login with our account.
*/

firebase.auth().signInWithEmailAndPassword(
  "msrcasc.project@gmail.com",  // Our email
  "050809"                     // Our password
)

// If login works, this runs
.then(() => {
  console.log("Firebase Login Success");  // Shows in browser console
})

// If login fails, this runs
.catch((error) => {
  console.log(error.message);  // Show error in console
  alert(error.message);        // Show error as popup alert
});


/*
--------------------------------------------------------------------------------
                          SECTION 4: SETUP DATABASE CONNECTION
--------------------------------------------------------------------------------

What is "db" and "deviceRef"?

db (database):
- This is our connection to Firebase's Realtime Database
- Think of it as opening a channel to the online database
- We use this to read data FROM the database and write TO the database

deviceRef (device reference):
- This points to a SPECIFIC location in our database
- In Firebase, data is stored in a tree structure (like folders in folders)
- Our path is: devices/switchboard1/
- This means: in the "devices" folder, there's a device called "switchboard1"
- All our sensor data and relay states are stored under this location

Why "devices/switchboard1"?
- "devices" is like a main folder that holds all our smart home devices
- "switchboard1" is the name of our specific ESP32 board
- If we had multiple ESP32 boards, we'd have "switchboard2", "switchboard3", etc.
*/

const db = firebase.database();

// This points to: https://.../devices/switchboard1
const deviceRef = db.ref("devices/switchboard1");


/*
--------------------------------------------------------------------------------
                          SECTION 5: READ DATA IN REAL-TIME (LIVE UPDATES)
--------------------------------------------------------------------------------

What does "on('value', ...)" do?
- This is the most important part of the code!
- It sets up a "listener" that watches for changes in the database
- Whenever the ESP32 sends new data, this code automatically runs

How it works step by step:
1. "on('value', ...)" means "whenever the VALUE changes, run this function"
2. The function receives a "snapshot" - this is like a photo of the data
3. snapshot.val() extracts the actual data from that photo
4. We then update the webpage with this new data

What data are we reading?
- temperature: Temperature from DHT sensor (in Celsius)
- humidity: Humidity from DHT sensor (in percentage)
- light: Light level from LDR (Light Dependent Resistor) - higher = brighter
- gas: Gas level from MQ-2 sensor - higher = more gas detected
- motion: true/false from PIR sensor - true = motion detected
- relay1-4: The ON/OFF state of each relay

The flow:
ESP32 sends data -> Firebase stores it -> This code detects change -> Updates webpage
*/

deviceRef.on("value", (snapshot) => {

  // Get all the data from Firebase as a JavaScript object
  const data = snapshot.val();

  // Only run this code if data exists (not null/undefined)
  if(data){

    /*
    ------------------------------------------------------------------------
    STEP 5.1: UPDATE WIFI STATUS
    ------------------------------------------------------------------------
    If we can read data from Firebase, it means the ESP32 is connected!
    So we show "🟢 Online" to indicate the system is working.
    */
    document.getElementById("wifiStatus").innerHTML = "🟢 Online";


    /*
    ------------------------------------------------------------------------
    STEP 5.2: UPDATE SENSOR READINGS
    ------------------------------------------------------------------------
    We take each sensor value and display it on the screen.
    document.getElementById("xxx") finds the HTML element with that ID.
    .innerHTML changes what's written on the screen.

    Breaking it down:
    - document = the whole webpage
    - getElementById("temp") = find the element with id="temp"
    - .innerHTML = change what's written inside that element
    - data.temperature = get the temperature value from our data object
    */

    // Update temperature display (add " °C" after the number)
    document.getElementById("temp").innerHTML = data.temperature + " °C";

    // Update humidity display (add " %" after the number)
    document.getElementById("hum").innerHTML = data.humidity + " %";

    // Update light level display (just the number, no unit)
    document.getElementById("light").innerHTML = data.light;

    // Update gas level display (just the number, no unit)
    document.getElementById("gas").innerHTML = data.gas;

    // Update motion display (show "YES" if true, "NO" if false)
    // This uses a "ternary operator" - it's a quick if-else in one line
    // Syntax: condition ? value_if_true : value_if_false
    document.getElementById("motion").innerHTML = data.motion ? "YES" : "NO";


    /*
    ------------------------------------------------------------------------
    STEP 5.3: UPDATE RELAY STATUS DISPLAY
    ------------------------------------------------------------------------
    We call a helper function (defined below) to update each relay's display.
    This keeps our code clean and avoids repeating the same code 4 times.
    */
    updateRelayUI(1, data.relay1);  // Update Relay 1
    updateRelayUI(2, data.relay2);  // Update Relay 2
    updateRelayUI(3, data.relay3);  // Update Relay 3
    updateRelayUI(4, data.relay4);  // Update Relay 4


    /*
    ------------------------------------------------------------------------
    STEP 5.4: GAS LEAK DETECTION ALERT
    ------------------------------------------------------------------------
    We check if the gas sensor value is above 300.
    If it is, that probably means there's a gas leak (smoke, cooking gas, etc.)
    and we show a warning message!

    The gas sensor (MQ-2) detects:
    - LPG (cooking gas)
    - Propane
    - Methane
    - Hydrogen
    - Smoke

    Values typically:
    - 0-200: Normal (no gas detected)
    - 200-300: Slight gas present
    - 300+: Significant gas leak (ALERT!)
    */

    if(data.gas > 300){
      // GAS LEAK DETECTED! Show warning

      // Change the text to alert users
      document.getElementById("alertBox").innerHTML = "🚨 GAS LEAK DETECTED";

      // Change background to RED to make it more obvious
      document.getElementById("alertBox").style.background = "#dc2626";
    }
    else{
      // Everything is normal, no gas leak

      // Show "System Normal" message
      document.getElementById("alertBox").innerHTML = "✅ System Normal";

      // Reset background to normal gray
      document.getElementById("alertBox").style.background = "#334155";
    }

  } // End of "if(data)" check

}); // End of the "on('value')" listener


/*
--------------------------------------------------------------------------------
                          SECTION 6: HELPER FUNCTION - UPDATE RELAY DISPLAY
--------------------------------------------------------------------------------

Why do we need a function?
- We have 4 relays, and we want to update each one the same way
- Instead of writing the same code 4 times, we write it once and "call" it
- This is called "DRY" - Don't Repeat Yourself

What does this function do?
- Input: relayNo (which relay: 1, 2, 3, or 4) and state (true or false)
- Output: Changes the text and color on the screen

How it works:
- "document.getElementById('relay' + relayNo + 'Status')"
  This builds the ID dynamically:
    - If relayNo = 1, it looks for "relay1Status"
    - If relayNo = 2, it looks for "relay2Status"
    - etc.

- If state is TRUE (relay is ON):
    - Show text "ON"
    - Make it GREEN (#22c55e)

- If state is FALSE (relay is OFF):
    - Show text "OFF"
    - Make it RED (#ef4444)
*/

function updateRelayUI(relayNo, state){

  // Build the ID dynamically: "relay1Status", "relay2Status", etc.
  const relayStatus = document.getElementById("relay" + relayNo + "Status");

  // Check if the relay is ON (true) or OFF (false)
  if(state){
    // Relay is ON - show "ON" in green
    relayStatus.innerHTML = "ON";
    relayStatus.style.color = "#22c55e";  // Green color
  }
  else{
    // Relay is OFF - show "OFF" in red
    relayStatus.innerHTML = "OFF";
    relayStatus.style.color = "#ef4444";  // Red color
  }
}


/*
--------------------------------------------------------------------------------
                          SECTION 7: TOGGLE RELAY (MANUAL CONTROL)
--------------------------------------------------------------------------------

What is this function for?
- This lets the user manually turn Relay 3 and Relay 4 ON or OFF
- When someone clicks the "Toggle Relay 3" or "Toggle Relay 4" button,
  this function runs

Why can we only toggle Relay 3 and 4?
- Relay 1 and Relay 2 are controlled AUTOMATICALLY by the ESP32
- Relay 1: Automatically turns on when it's dark (LDR sensor)
- Relay 2: Automatically turns on when motion is detected (PIR sensor)
- Trying to manually control them would interfere with the automation!
- So we show an alert if someone tries to toggle them

How does toggling work?
1. First, we check which relay they're trying to toggle
2. If it's relay 1 or 2, we show an alert saying "automatic only"
3. If it's relay 3 or 4, we:
   a. Get the CURRENT state of the relay from Firebase
   b. Set it to the OPPOSITE (if ON, make OFF; if OFF, make ON)
   c. This change is sent to Firebase, which the ESP32 reads

The flow when you click the button:
User clicks toggle -> Send to Firebase -> ESP32 sees the change -> turns relay on/off
*/

function toggleRelay(relayNo){

  // Only allow manual control for Relay 3 and Relay 4
  if(relayNo < 3){
    // Someone tried to toggle Relay 1 or 2 - show warning
    alert("Relay 1 & Relay 2 are automatic - controlled by sensors!");
    return;  // Stop here, don't do anything else
  }

  // Create a reference to the specific relay in Firebase
  // e.g., "devices/switchboard1/relay3"
  const relayRef = db.ref("devices/switchboard1/relay" + relayNo);

  // Get the current state, then toggle it
  relayRef.get().then((snapshot) => {

    // Get the current value (true = ON, false = OFF)
    const currentState = snapshot.val();

    // Set the relay to the OPPOSITE of what it currently is
    // !currentState means "NOT currentState"
    // So if it's ON (true), it becomes OFF (false), and vice versa
    relayRef.set(!currentState);

  });
}


/*
================================================================================
                              END OF JAVASCRIPT FILE
================================================================================

WHAT HAVE WE LEARNED?
---------------------
1. Firebase connects our webpage to the ESP32 through the cloud
2. We use "on('value')" to automatically read data whenever it changes
3. We use "db.ref().set()" to write data (toggle relays)
4. Functions help us avoid repeating code
5. Real-time updates happen automatically - no need to refresh the page!

NEXT STEPS (if you want to learn more):
- Add Firebase Security Rules to protect your database
- Add more sensors (soil moisture, sound, etc.)
- Add scheduling (turn lights on at sunset automatically)
- Add a history/log of sensor data
- Add multiple users with different permissions
================================================================================
*/