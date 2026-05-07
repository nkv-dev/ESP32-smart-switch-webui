// ================= FIREBASE CONFIG =================

const firebaseConfig = {

  apiKey:
  "AIzaSyA2vHVbqH6EoMuO-iXDzlh0uYL2fF1tPgw",

  authDomain:
  "esp32-smart-home-switch-nh.firebaseapp.com",

  databaseURL:
  "https://esp32-smart-home-switch-nh-default-rtdb.asia-southeast1.firebasedatabase.app/",

  projectId:
  "esp32-smart-home-switch-nh"

};

// ================= INITIALIZE FIREBASE =================

firebase.initializeApp(firebaseConfig);

// ================= LOGIN =================

firebase.auth().signInWithEmailAndPassword(

  "msrcasc.project@gmail.com",
  "050809"

)

.then(() => {

  console.log("Firebase Login Success");

})

.catch((error) => {

  console.log(error.message);

  alert(error.message);

});

// ================= DATABASE =================

const db = firebase.database();

const deviceRef =
db.ref("devices/switchboard1");

// ================= LIVE DATA =================

deviceRef.on("value", (snapshot) => {

  const data = snapshot.val();

  if(data){

    // ================= WIFI STATUS =================

    document.getElementById("wifiStatus")
      .innerHTML = "🟢 Online";

    // ================= SENSOR DATA =================

    document.getElementById("temp")
      .innerHTML =
      data.temperature + " °C";

    document.getElementById("hum")
      .innerHTML =
      data.humidity + " %";

    document.getElementById("light")
      .innerHTML =
      data.light;

    document.getElementById("gas")
      .innerHTML =
      data.gas;

    document.getElementById("motion")
      .innerHTML =
      data.motion ? "YES" : "NO";

    // ================= RELAY STATUS =================

    updateRelayUI(1, data.relay1);

    updateRelayUI(2, data.relay2);

    updateRelayUI(3, data.relay3);

    updateRelayUI(4, data.relay4);

    // ================= GAS ALERT =================

    if(data.gas > 300){

      document.getElementById("alertBox")
        .innerHTML =
        "🚨 GAS LEAK DETECTED";

      document.getElementById("alertBox")
        .style.background =
        "#dc2626";

    }else{

      document.getElementById("alertBox")
        .innerHTML =
        "✅ System Normal";

      document.getElementById("alertBox")
        .style.background =
        "#334155";
    }
  }

});

// ================= RELAY UI =================

function updateRelayUI(relayNo, state){

  const relayStatus =
  document.getElementById(
    "relay" + relayNo + "Status"
  );

  if(state){

    relayStatus.innerHTML = "ON";

    relayStatus.style.color =
    "#22c55e";

  }else{

    relayStatus.innerHTML = "OFF";

    relayStatus.style.color =
    "#ef4444";
  }
}

// ================= TOGGLE RELAY =================

function toggleRelay(relayNo){

  // Only Relay3 & Relay4 manual

  if(relayNo < 3){

    alert(
      "Relay 1 & Relay 2 are automatic"
    );

    return;
  }

  const relayRef =
  db.ref(
    "devices/switchboard1/relay" + relayNo
  );

  relayRef.get().then((snapshot)=>{

    const currentState =
    snapshot.val();

    relayRef.set(!currentState);

  });

}