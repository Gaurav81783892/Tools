// ==========================================
// 1. SYSTEM STATE & AUTHENTICATION
// ==========================================
let user = JSON.parse(localStorage.getItem('chronosUser')) || { name: null, isPremium: false, loggedIn: false };
let activeInterval = null; // To stop clocks/timers when modal closes

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupSearch();
});

// --- UI UPDATES ---
function updateUI() {
    const dAuth = document.getElementById('desktopAuth');
    const mAuth = document.getElementById('mobileAuth');
    
    if (user.loggedIn) {
        const badge = user.isPremium ? '<i class="fa-solid fa-crown text-yellow-500 ml-1"></i>' : '';
        const btnHtml = `<button onclick="logout()" class="font-bold text-slate-700 hover:text-red-500 transition">${user.name} ${badge} (Logout)</button>`;
        if(dAuth) dAuth.innerHTML = btnHtml;
        if(mAuth) mAuth.innerHTML = `<div class="font-bold text-lg mb-2">${user.name} ${badge}</div><button onclick="logout()" class="text-red-500 text-sm">Logout</button>`;
        
        // Hide Ads if Premium
        if(user.isPremium) document.querySelectorAll('[id^="adSpace"]').forEach(el => el.style.display = 'none');
    } else {
        const loginBtn = `<button onclick="openLoginModal()" class="bg-brand-600 text-white px-5 py-2 rounded-full font-bold shadow hover:bg-brand-700 transition">Login</button>`;
        if(dAuth) dAuth.innerHTML = loginBtn;
        if(mAuth) mAuth.innerHTML = `<button onclick="openLoginModal()" class="w-full bg-brand-600 text-white py-2 rounded-lg font-bold">Login / Sign Up</button>`;
    }
}

// --- AUTH MODALS ---
function openLoginModal() { document.getElementById('loginModal').classList.add('active'); toggleSidebar(false); }
function closeLogin() { document.getElementById('loginModal').classList.remove('active'); }

function performLogin() {
    const name = document.getElementById('usernameInput').value;
    if(!name) return alert("Please enter your name!");
    user = { name: name, isPremium: false, loggedIn: true };
    localStorage.setItem('chronosUser', JSON.stringify(user));
    updateUI(); closeLogin();
    alert(`Welcome, ${name}!`);
}

function logout() { localStorage.removeItem('chronosUser'); location.reload(); }

// --- PREMIUM SYSTEM ---
function openPremiumModal() { 
    if(!user.loggedIn) return openLoginModal();
    document.getElementById('premiumModal').classList.add('active'); 
    toggleSidebar(false);
}
function closePremium() { document.getElementById('premiumModal').classList.remove('active'); }

function verifyPayment() {
    if(confirm("Confirm that you have paid ₹199 via UPI?")) {
        // Simulate Verification
        const btn = event.target;
        btn.innerText = "Verifying...";
        setTimeout(() => {
            user.isPremium = true;
            localStorage.setItem('chronosUser', JSON.stringify(user));
            updateUI();
            closePremium();
            alert("Payment Verified! Premium Features Unlocked. 👑");
        }, 2000);
    }
}

// --- SIDEBAR ---
function toggleSidebar(forceClose) {
    const sb = document.getElementById('sidebar');
    const ol = document.getElementById('sidebarOverlay');
    if (forceClose === false || sb.classList.contains('sidebar-open')) {
        sb.classList.remove('sidebar-open'); sb.classList.add('sidebar-closed'); ol.classList.add('hidden');
    } else {
        sb.classList.remove('sidebar-closed'); sb.classList.add('sidebar-open'); ol.classList.remove('hidden');
    }
}

// ==========================================
// 2. TOOLS LOGIC (FIXED & OPTIMIZED)
// ==========================================
const modal = document.getElementById('toolModal');
const mTitle = document.getElementById('modalTitle');
const mContent = document.getElementById('modalContent');

const tools = {
    
    // --- ⏱️ STOPWATCH (FIXED) ---
    'stopWatch': {
        title: 'Stopwatch',
        html: `
            <div class="text-center py-8">
                <div id="swDisplay" class="text-6xl font-mono font-bold text-brand-600 tracking-wider">00:00:00</div>
                <div id="swMs" class="text-xl text-gray-400 font-mono mt-2">00</div>
            </div>
            <div class="flex justify-center gap-4">
                <button onclick="swStart()" id="swBtn" class="bg-green-500 text-white w-20 h-20 rounded-full font-bold shadow-lg hover:scale-105 transition">Start</button>
                <button onclick="swReset()" class="bg-slate-200 text-slate-700 w-16 h-16 rounded-full font-bold shadow hover:bg-slate-300 transition">Reset</button>
            </div>
            <div id="laps" class="mt-6 max-h-40 overflow-y-auto text-sm text-gray-500 space-y-1 text-center"></div>
        `,
        func: () => {
            let startTime = 0;
            let elapsedTime = 0;
            let timerInterval;
            let running = false;

            const format = (time) => {
                let date = new Date(time);
                let m = date.getUTCHours() * 60 + date.getUTCMinutes();
                let s = date.getUTCSeconds();
                let ms = Math.floor(date.getUTCMilliseconds() / 10);
                return {
                    main: `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`,
                    sub: ms.toString().padStart(2,'0')
                };
            };

            window.swStart = () => {
                if (!running) {
                    startTime = Date.now() - elapsedTime;
                    timerInterval = setInterval(() => {
                        elapsedTime = Date.now() - startTime;
                        const t = format(elapsedTime);
                        document.getElementById('swDisplay').innerText = t.main;
                        document.getElementById('swMs').innerText = t.sub;
                    }, 10);
                    running = true;
                    document.getElementById('swBtn').innerText = "Pause";
                    document.getElementById('swBtn').className = "bg-red-500 text-white w-20 h-20 rounded-full font-bold shadow-lg hover:scale-105 transition";
                    activeInterval = timerInterval;
                } else {
                    clearInterval(timerInterval);
                    running = false;
                    document.getElementById('swBtn').innerText = "Resume";
                    document.getElementById('swBtn').className = "bg-blue-500 text-white w-20 h-20 rounded-full font-bold shadow-lg hover:scale-105 transition";
                }
            };

            window.swReset = () => {
                clearInterval(timerInterval);
                running = false;
                elapsedTime = 0;
                document.getElementById('swDisplay').innerText = "00:00:00";
                document.getElementById('swMs').innerText = "00";
                document.getElementById('swBtn').innerText = "Start";
                document.getElementById('swBtn').className = "bg-green-500 text-white w-20 h-20 rounded-full font-bold shadow-lg hover:scale-105 transition";
            };
        }
    },

    // --- ⏰ CLOCK & ALARM (FIXED) ---
    'clockTool': {
        title: 'World Clock & Alarm',
        html: `
            <div class="text-center mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div id="liveClock" class="text-5xl font-mono font-bold text-slate-800 tracking-widest">00:00:00</div>
                <div id="liveDate" class="text-brand-600 font-bold text-sm mt-2 uppercase tracking-widest">Loading...</div>
            </div>
            <div class="border-t pt-4">
                <label class="text-xs font-bold text-gray-500 uppercase">Set Alarm</label>
                <div class="flex gap-2 mt-2">
                    <input type="time" id="alarmIn" class="flex-1 p-3 border rounded-lg outline-none focus:border-brand-500">
                    <button onclick="setAlarm()" id="almBtn" class="bg-brand-600 text-white px-6 rounded-lg font-bold">Set</button>
                </div>
                <p id="alarmStatus" class="text-sm text-green-600 mt-3 font-bold text-center"></p>
            </div>
        `,
        func: () => {
            const updateClock = () => {
                const now = new Date();
                if(document.getElementById('liveClock')) {
                    document.getElementById('liveClock').innerText = now.toLocaleTimeString();
                    document.getElementById('liveDate').innerText = now.toDateString();
                }
            };
            activeInterval = setInterval(updateClock, 1000);
            updateClock();

            let alarmTime = null;
            let alarmInterval = null;

            window.setAlarm = () => {
                const inp = document.getElementById('alarmIn').value;
                if(!inp) return alert("Select time!");
                alarmTime = inp;
                document.getElementById('alarmStatus').innerText = `🔔 Alarm set for ${tConvert(inp)}`;
                document.getElementById('almBtn').innerText = "Reset";
                document.getElementById('almBtn').onclick = () => {
                    alarmTime = null; 
                    document.getElementById('alarmStatus').innerText = "Alarm Cancelled";
                    document.getElementById('almBtn').innerText = "Set";
                    document.getElementById('almBtn').onclick = window.setAlarm;
                };

                // Background Check
                if(alarmInterval) clearInterval(alarmInterval);
                alarmInterval = setInterval(() => {
                    const now = new Date();
                    const current = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
                    if(current === alarmTime && now.getSeconds() === 0) {
                        alert("⏰ WAKE UP! It's " + tConvert(alarmTime));
                        alarmTime = null;
                        document.getElementById('alarmStatus').innerText = "Alarm Ringing!";
                        clearInterval(alarmInterval);
                    }
                }, 1000);
            }
            
            function tConvert (time) {
                time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
                if (time.length > 1) { 
                    time = time.slice (1);  
                    time[5] = +time[0] < 12 ? ' AM' : ' PM'; 
                    time[0] = +time[0] % 12 || 12; 
                }
                return time.join (''); 
            }
        }
    },

    // --- 📹 SCREEN RECORDER (REAL) ---
    'screenRec': {
        title: 'Screen Recorder',
        html: `
            <div class="text-center py-6">
                <i class="fa-solid fa-video text-5xl text-red-500 mb-4 animate-pulse"></i>
                <p class="text-gray-600 mb-6">Record your screen instantly. No Watermark.</p>
                <button onclick="startScreenRec()" id="recBtn" class="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition">Start Recording</button>
            </div>
        `,
        func: () => {
            window.startScreenRec = async () => {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    const mediaRecorder = new MediaRecorder(stream);
                    const chunks = [];
                    
                    document.getElementById('recBtn').innerText = "Recording... (Stop Sharing to Save)";
                    document.getElementById('recBtn').classList.add('animate-pulse');

                    mediaRecorder.ondataavailable = e => chunks.push(e.data);
                    mediaRecorder.onstop = () => {
                        const blob = new Blob(chunks, { type: 'video/webm' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `recording_${Date.now()}.webm`;
                        a.click();
                        document.getElementById('recBtn').innerText = "Start Recording";
                        document.getElementById('recBtn').classList.remove('animate-pulse');
                        alert("Recording Saved!");
                    };
                    mediaRecorder.start();
                } catch (err) {
                    alert("Permission Denied or Cancelled.");
                }
            }
        }
    },

    // --- 🎙️ AUDIO RECORDER (REAL) ---
    'audioRec': {
        title: 'Voice Recorder',
        html: `
            <div class="text-center py-6">
                <div id="micIcon" class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <i class="fa-solid fa-microphone text-3xl"></i>
                </div>
                <p id="micStatus" class="text-gray-500 mb-6">Click to start recording</p>
                <button onclick="toggleMic()" id="micBtn" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">Start Recording</button>
            </div>
        `,
        func: () => {
            let mediaRecorder;
            let audioChunks = [];
            let isRecording = false;

            window.toggleMic = async () => {
                const btn = document.getElementById('micBtn');
                const status = document.getElementById('micStatus');
                const icon = document.getElementById('micIcon');

                if (!isRecording) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        mediaRecorder.start();
                        isRecording = true;
                        
                        btn.innerText = "Stop & Save";
                        btn.className = "w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg";
                        status.innerText = "Recording... Speak now.";
                        icon.className = "w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 animate-pulse";
                        
                        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
                        mediaRecorder.onstop = () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const a = document.createElement('a');
                            a.href = audioUrl;
                            a.download = `audio_${Date.now()}.mp3`;
                            a.click();
                            audioChunks = [];
                        };
                    } catch(e) { alert("Microphone access denied."); }
                } else {
                    mediaRecorder.stop();
                    isRecording = false;
                    btn.innerText = "Start Recording";
                    btn.className = "w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg";
                    status.innerText = "Recording saved!";
                    icon.className = "w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600";
                }
            }
        }
    },

    // --- 🖼️ IMAGE CONVERTER ---
    'imgConvert': {
        title: 'Image Converter',
        html: `<input type="file" id="f" accept="image/*" class="w-full border p-3 rounded-lg mb-3 bg-gray-50"><select id="fmt" class="w-full border p-3 rounded-lg mb-4 bg-gray-50"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WEBP</option></select><button onclick="conv()" class="w-full bg-brand-600 text-white py-3 rounded-lg font-bold">Convert & Download</button>`,
        func: () => { window.conv=()=>{ const f=document.getElementById('f').files[0]; if(!f)return alert("Upload Image first"); const r=new FileReader(); r.onload=(e)=>{const i=new Image(); i.src=e.target.result; i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;c.getContext('2d').drawImage(i,0,0);const l=document.createElement('a');l.download='converted_image';l.href=c.toDataURL(document.getElementById('fmt').value);l.click();}}; r.readAsDataURL(f); }}
    },

    // --- 🧮 CALCULATORS ---
    'ageCalc': {
        title: 'Age Calculator',
        html: `<label class="font-bold text-gray-600">Date of Birth</label><input type="date" id="d" class="w-full p-3 border rounded-lg mb-4 mt-1"><button onclick="ca()" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold">Calculate</button><div id="r" class="mt-4 text-center text-xl font-bold text-slate-800"></div>`,
        func: () => { window.ca=()=>{ const d=new Date(document.getElementById('d').value); if(isNaN(d))return; const df=new Date(new Date()-d); document.getElementById('r').innerText=`${Math.abs(df.getUTCFullYear()-1970)} Years Old`; } }
    },
    'bmiCalc': {
        title: 'BMI Calculator',
        html: `<div class="grid grid-cols-2 gap-3 mb-4"><input id="w" placeholder="Weight (kg)" class="p-3 border rounded-lg"><input id="h" placeholder="Height (cm)" class="p-3 border rounded-lg"></div><button onclick="cb()" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold">Calculate BMI</button><div id="r" class="mt-4 text-center font-bold text-lg"></div>`,
        func: () => { window.cb=()=>{ const w=parseFloat(document.getElementById('w').value), h=parseFloat(document.getElementById('h').value)/100; if(w&&h) { const b=(w/(h*h
