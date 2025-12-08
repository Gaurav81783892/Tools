// ==========================================
// 1. AUTH & MENU SYSTEM (FIXED)
// ==========================================
let user = JSON.parse(localStorage.getItem('chronosUser')) || null;

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupSearch();
});

// --- MENU TOGGLE (FIXED) ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        overlay.classList.remove('open');
    } else {
        menu.classList.add('open');
        overlay.classList.add('open');
    }
}

// --- AUTH & UI ---
function updateUI() {
    const dAuth = document.getElementById('desktopAuth');
    const mAuth = document.getElementById('mobileAuth');
    
    if (user) {
        const badge = user.isPremium ? '👑' : '';
        const html = `<div class="font-bold text-slate-700">${user.name} ${badge}</div><button onclick="logout()" class="text-xs text-red-500">Logout</button>`;
        dAuth.innerHTML = `<button onclick="logout()" class="font-bold text-slate-700">${user.name} ${badge} (Logout)</button>`;
        if(mAuth) mAuth.innerHTML = html;
    } else {
        const btn = `<button onclick="openAuthModal()" class="bg-brand-500 text-white px-4 py-2 rounded font-bold">Login</button>`;
        dAuth.innerHTML = btn;
        if(mAuth) mAuth.innerHTML = btn;
    }
}

function openAuthModal() { document.getElementById('loginModal').classList.add('active'); toggleMobileMenu(); } // Auto close menu
function closeAuthModal() { document.getElementById('loginModal').classList.remove('active'); }
function performLogin() {
    const name = document.getElementById('uName').value;
    if(!name) return alert("Name Required");
    user = { name: name, isPremium: false };
    localStorage.setItem('chronosUser', JSON.stringify(user));
    updateUI(); closeAuthModal();
}
function logout() { localStorage.removeItem('chronosUser'); location.reload(); }

// --- PREMIUM ---
function openPremiumModal() { 
    if(!user) return openAuthModal();
    document.getElementById('premiumModal').classList.add('active'); 
    toggleMobileMenu(); // Close sidebar if open
}
function closePremium() { document.getElementById('premiumModal').classList.remove('active'); }
function verifyPayment() {
    if(confirm("Verify payment?")) {
        user.isPremium = true; localStorage.setItem('chronosUser', JSON.stringify(user));
        updateUI(); closePremium(); alert("Premium Unlocked!");
    }
}


// ==========================================
// 2. TOOL LOGIC (IDS MATCHED WITH HTML)
// ==========================================
const modal = document.getElementById('toolModal');
const mTitle = document.getElementById('modalTitle');
const mContent = document.getElementById('modalContent');
let mediaRecorder; 
let recordedChunks = [];

function closeTool() { 
    modal.classList.remove('active');
    // Stop recording if active
    if(mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

const tools = {

    // --- 📹 VIDEO RECORDER ---
    'screenRec': {
        title: 'Screen Recorder',
        html: `
            <div class="text-center py-6">
                <i class="fa-solid fa-video text-5xl text-red-500 mb-4"></i>
                <p class="text-gray-500 mb-4">Record your screen instantly.</p>
                <button onclick="startScreen()" id="srcBtn" class="w-full bg-red-600 text-white py-3 rounded-xl font-bold">Start Recording</button>
            </div>
        `,
        func: () => {
            window.startScreen = async () => {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    recordedChunks = [];
                    
                    const btn = document.getElementById('srcBtn');
                    btn.innerText = "Recording... (Stop Sharing to Save)";
                    btn.classList.add('animate-pulse');

                    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
                    mediaRecorder.onstop = () => {
                        const blob = new Blob(recordedChunks, { type: 'video/webm' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `recording_${Date.now()}.webm`;
                        a.click();
                        btn.innerText = "Start Recording";
                        btn.classList.remove('animate-pulse');
                    };
                    mediaRecorder.start();
                } catch (err) { alert("Permission Denied: " + err); }
            }
        }
    },

    // --- 🎙️ AUDIO RECORDER ---
    'audioRec': {
        title: 'Voice Recorder',
        html: `
            <div class="text-center py-6">
                <div id="micIcon" class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <i class="fa-solid fa-microphone text-3xl"></i>
                </div>
                <button onclick="toggleAudio()" id="arcBtn" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Start Recording</button>
            </div>
        `,
        func: () => {
            let isRec = false;
            window.toggleAudio = async () => {
                const btn = document.getElementById('arcBtn');
                if (!isRec) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        recordedChunks = [];
                        mediaRecorder.start();
                        isRec = true;
                        
                        btn.innerText = "Stop & Save";
                        btn.className = "w-full bg-red-600 text-white py-3 rounded-xl font-bold";
                        document.getElementById('micIcon').classList.add('animate-pulse', 'text-red-600');
                        
                        mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
                        mediaRecorder.onstop = () => {
                            const blob = new Blob(recordedChunks, { type: 'audio/mp3' });
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const a = document.createElement('a');
                            a.href = audioUrl;
                            a.download = `audio_${Date.now()}.mp3`;
                            a.click();
                        };
                    } catch(e) { alert("Mic Permission Denied"); }
                } else {
                    mediaRecorder.stop();
                    isRec = false;
                    btn.innerText = "Start Recording";
                    btn.className = "w-full bg-blue-600 text-white py-3 rounded-xl font-bold";
                    document.getElementById('micIcon').classList.remove('animate-pulse', 'text-red-600');
                }
            }
        }
    },

    // --- 🗣️ SPEECH TO TEXT (ID FIXED) ---
    'speechToText': {
        title: 'Speech to Text',
        html: `
            <button onclick="runStt()" id="sttBtn" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mb-3">Tap to Speak</button>
            <textarea id="sttOut" class="w-full h-40 border p-3 rounded" placeholder="Your text will appear here..."></textarea>
        `,
        func: () => {
            window.runStt = () => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) return alert("Browser not supported (Try Chrome)");
                
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-US'; // Default
                const btn = document.getElementById('sttBtn');
                
                recognition.onstart = () => { btn.innerText = "Listening..."; btn.classList.add('bg-red-500'); };
                recognition.onend = () => { btn.innerText = "Tap to Speak"; btn.classList.remove('bg-red-500'); };
                
                recognition.onresult = (event) => {
                    const txt = event.results[0][0].transcript;
                    document.getElementById('sttOut').value += txt + " ";
                };
                recognition.start();
            }
        }
    },

    // --- 🔊 TEXT TO SPEECH ---
    'textToSpeech': { 
        title: 'Text to Speech', 
        html: `<textarea id='ts' class='w-full h-32 border p-2 mb-2' placeholder="Type text here..."></textarea><button onclick="speechSynthesis.speak(new SpeechSynthesisUtterance(document.getElementById('ts').value))" class='w-full bg-purple-600 text-white py-3 rounded font-bold'>Speak</button>` 
    },

    // --- ⚖️ WEIGHT CONVERTER (ID FIXED) ---
    'weightConv': {
        title: 'Weight Converter',
        html: `
            <div class="flex gap-2 mb-4">
                <input id="wv" type="number" class="w-full border p-2 rounded" placeholder="Value">
                <select id="wu" class="border p-2 rounded">
                    <option value="kg">Kg</option>
                    <option value="lbs">Lbs</option>
                </select>
            </div>
            <button onclick="convW()" class="w-full bg-green-600 text-white py-2 rounded font-bold">Convert</button>
            <div id="wr" class="mt-4 text-center font-bold text-xl"></div>
        `,
        func: () => {
            window.convW = () => {
                const v = parseFloat(document.getElementById('wv').value);
                const u = document.getElementById('wu').value;
                if (!v) return;
                const r = (u === 'kg') ? `${(v * 2.20462).toFixed(2)} Lbs` : `${(v / 2.20462).toFixed(2)} Kg`;
                document.getElementById('wr').innerText = r;
            }
        }
    },

    // --- OTHER TOOLS ---
    'ageCalc': { title: 'Age Calculator', html: `<input type='date' id='d' class='w-full border p-2 mb-2'><button onclick="document.getElementById('r').innerText=Math.abs(new Date(new Date()-new Date(document.getElementById('d').value)).getUTCFullYear()-1970)+' Years'" class='w-full bg-blue-600 text-white py-2 rounded'>Calculate</button><h3 id='r' class='mt-2 text-center font-bold'></h3>` },
    'bmiCalc': { title: 'BMI Calculator', html: `<input id='w' placeholder='Kg' class='w-1/2 border p-2'><input id='h' placeholder='Cm' class='w-1/2 border p-2'><button onclick="let b=(document.getElementById('w').value/((document.getElementById('h').value/100)**2)).toFixed(1);document.getElementById('r').innerText='BMI: '+b" class='w-full bg-green-600 text-white py-2 rounded mt-2'>Check</button><h3 id='r' class='mt-2 text-center'></h3>` },
    'qrGen': { title: 'QR Code', html: `<input id='q' class='w-full border p-2 mb-2'><button onclick="document.getElementById('r').innerHTML='<img src=\\'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+encodeURIComponent(document.getElementById('q').value)+'\\' class=\\'mx-auto\\'>'" class='w-full bg-orange-500 text-white py-2 rounded'>Generate</button><div id='r' class='mt-2'></div>` },
    'wordCount': { title: 'Word Counter', html: `<textarea id='t' class='w-full h-32 border p-2' oninput='wc()'></textarea><div id='r'>0 Words | 0 Chars</div>`, func:()=>{document.getElementById('t').addEventListener('input',function(){document.getElementById('r').innerText=`${this.value.trim()?this.value.trim().split(/\s+/).length:0} Words | ${this.value.length} Chars`})} },
    'passGen': { title: 'Password Gen', html: `<div id='p' class='bg-gray-100 p-2 text-center mb-2 font-bold'>...</div><button onclick='gp()' class='bg-purple-600 text-white w-full py-2 rounded'>Generate</button>`, func:()=>{window.gp=()=>{const c="abcdefghijklmnopqrstuvwxyz1234567890@#$"; let p=""; for(let i=0;i<12;i++)p+=c[Math.floor(Math.random()*c.length)]; document.getElementById('p').innerText=p;}} }
};

// --- HANDLERS ---
function openTool(key) {
    const t = tools[key];
    if(t) {
        mTitle.innerText = t.title;
        mContent.innerHTML = t.html;
        if(t.func) t.func();
        document.getElementById('toolModal').classList.add('active');
    } else {
        // FALLBACK (If ID not found in JS)
        mTitle.innerText = "Tool Coming Soon";
        mContent.innerHTML = `<div class='text-center py-6 text-gray-500'>Features are being added...</div>`;
        document.getElementById('toolModal').classList.add('active');
    }
}

function setupSearch() {
    document.getElementById('searchBar').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.tool-card').forEach(c => c.parentElement.style.display = c.innerText.toLowerCase().includes(term) ? 'block' : 'none');
    });
}
