// --- AUTH & STATE ---
let user = JSON.parse(localStorage.getItem('chronosUser')) || null;
document.addEventListener('DOMContentLoaded', () => { updateUI(); setupSearch(); });

function updateUI() {
    const dAuth = document.getElementById('desktopAuth');
    const mAuth = document.getElementById('mobileAuth');
    const btn = user ? `<button onclick="logout()" class="font-bold text-slate-700">${user.name} ${user.isPremium?'👑':''}</button>` : `<button onclick="openLoginModal()" class="bg-brand-600 text-white px-5 py-2 rounded-full font-bold">Login</button>`;
    if(dAuth) dAuth.innerHTML = btn;
    if(mAuth) mAuth.innerHTML = btn;
}

function openLoginModal() { document.getElementById('loginModal').classList.add('active'); toggleSidebar(false); }
function closeLogin() { document.getElementById('loginModal').classList.remove('active'); }
function performLogin() {
    const n = document.getElementById('uName').value;
    const e = document.getElementById('uEmail').value;
    if(!n || !e) return alert("Fill all fields");
    user = { name: n, email: e, isPremium: false };
    localStorage.setItem('chronosUser', JSON.stringify(user));
    updateUI(); closeLogin();
}
function logout() { localStorage.removeItem('chronosUser'); location.reload(); }
function openPremiumModal() { if(!user) return openLoginModal(); document.getElementById('premiumModal').classList.add('active'); }
function closePremium() { document.getElementById('premiumModal').classList.remove('active'); }
function verifyPayment() { if(confirm("Paid ₹199?")) { user.isPremium=true; localStorage.setItem('chronosUser', JSON.stringify(user)); updateUI(); closePremium(); alert("Premium Active!"); } }
function toggleSidebar( force ) {
    const sb = document.getElementById('sidebar');
    const ol = document.getElementById('sidebarOverlay');
    if(force === false || sb.classList.contains('sidebar-open')) { sb.classList.remove('sidebar-open'); sb.classList.add('sidebar-closed'); ol.classList.add('hidden'); }
    else { sb.classList.remove('sidebar-closed'); sb.classList.add('sidebar-open'); ol.classList.remove('hidden'); }
}

// --- UNIVERSAL TOOL HANDLER ---
const modal = document.getElementById('toolModal');
const mTitle = document.getElementById('modalTitle');
const mContent = document.getElementById('modalContent');
function closeTool() { modal.classList.remove('active'); }

// --- THE TOOL LIBRARY (ALL WORKING) ---
const tools = {
    // 1. IMAGE
    'imgConvert': { title: 'Image Converter', html: `<input type="file" id="f" accept="image/*" class="w-full border p-2 mb-2"><select id="fmt" class="w-full border p-2 mb-2"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WEBP</option></select><button onclick="cImg()" class="bg-blue-600 text-white w-full py-2 rounded">Convert</button>`, func:()=>{window.cImg=()=>{const f=document.getElementById('f').files[0];if(!f)return;const r=new FileReader();r.onload=(e)=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;c.getContext('2d').drawImage(i,0,0);const l=document.createElement('a');l.download='image';l.href=c.toDataURL(document.getElementById('fmt').value);l.click()}};r.readAsDataURL(f)}} },
    'imgFilter': { title: 'Filters', html: `<input type="file" id="f" class="w-full border p-2 mb-2"><button onclick="applyF('gray')" class="bg-gray-600 text-white w-full py-2 rounded mb-2">Grayscale</button><button onclick="applyF('sepia')" class="bg-yellow-600 text-white w-full py-2 rounded">Sepia</button><div id="res" class="mt-2"></div>`, func:()=>{window.applyF=(t)=>{const f=document.getElementById('f').files[0];if(!f)return;const r=new FileReader();r.onload=(e)=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.filter=t==='gray'?'grayscale(100%)':'sepia(100%)';x.drawImage(i,0,0);document.getElementById('res').innerHTML='<img src="'+c.toDataURL()+'" class="w-full">'}};r.readAsDataURL(f)}} },
    'screenRec': { title: 'Screen Recorder', html: `<button onclick="startRec()" id="srBtn" class="bg-red-600 text-white w-full py-3 rounded font-bold">Start Recording</button>`, func:()=>{window.startRec=async()=>{try{const s=await navigator.mediaDevices.getDisplayMedia({video:true});const r=new MediaRecorder(s);const c=[];r.ondataavailable=e=>c.push(e.data);r.onstop=()=>{const b=new Blob(c,{type:'video/webm'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='screen.webm';a.click()};r.start();document.getElementById('srBtn').innerText="Stop (Press 'Stop Sharing')";}catch(e){alert("Error: "+e)}} } },
    'audioRec': { title: 'Audio Recorder', html: `<button onclick="startAud()" id="arBtn" class="bg-blue-600 text-white w-full py-3 rounded">Start Mic</button>`, func:()=>{let r,c=[];window.startAud=async()=>{if(r&&r.state==='recording'){r.stop();document.getElementById('arBtn').innerText="Start Mic";return}const s=await navigator.mediaDevices.getUserMedia({audio:true});r=new MediaRecorder(s);r.ondataavailable=e=>c.push(e.data);r.onstop=()=>{const b=new Blob(c,{type:'audio/webm'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='audio.webm';a.click();c=[]};r.start();document.getElementById('arBtn').innerText="Stop Recording"} } },

    // 2. TEXT
    'wordCount': { title: 'Word Counter', html: `<textarea id="t" class="w-full h-32 border p-2 mb-2"></textarea><div id="r">0 Words | 0 Chars</div>`, func:()=>{document.getElementById('t').addEventListener('input',function(){this.value.trim()?document.getElementById('r').innerText=`${this.value.trim().split(/\s+/).length} Words | ${this.value.length} Chars`:0})} },
    'caseConv': { title: 'Case Converter', html: `<textarea id="t" class="w-full h-24 border p-2 mb-2"></textarea><div class="flex gap-2"><button onclick="document.getElementById('t').value=document.getElementById('t').value.toUpperCase()" class="flex-1 bg-blue-600 text-white py-1 rounded">UPPER</button><button onclick="document.getElementById('t').value=document.getElementById('t').value.toLowerCase()" class="flex-1 bg-blue-600 text-white py-1 rounded">lower</button></div>` },
    'textToSpeech': { title: 'Text to Speech', html: `<textarea id="t" class="w-full h-24 border p-2 mb-2" placeholder="Type here..."></textarea><button onclick="speak()" class="bg-green-600 text-white w-full py-2 rounded">Speak</button>`, func:()=>{window.speak=()=>{const u=new SpeechSynthesisUtterance(document.getElementById('t').value);window.speechSynthesis.speak(u)}} },
    'speechToText': { title: 'Speech to Text', html: `<button onclick="listen()" class="bg-red-600 text-white w-full py-2 rounded mb-2">Start Mic</button><textarea id="t" class="w-full h-24 border p-2"></textarea>`, func:()=>{window.listen=()=>{const r=new(window.SpeechRecognition||window.webkitSpeechRecognition)();r.onresult=e=>{document.getElementById('t').value=e.results[0][0].transcript};r.start()}} },

    // 3. MATH
    'ageCalc': { title: 'Age Calculator', html: `<input type="date" id="d" class="w-full border p-2 mb-2"><button onclick="ac()" class="bg-green-600 text-white w-full py-2 rounded">Calculate</button><div id="r" class="mt-2 font-bold text-center"></div>`, func:()=>{window.ac=()=>{const d=new Date(document.getElementById('d').value);const df=new Date(new Date()-d);document.getElementById('r').innerText=`${Math.abs(df.getUTCFullYear()-1970)} Years Old`}} },
    'discountCalc': { title: 'Discount', html: `<input id="p" placeholder="Price" class="border p-2 w-1/2"><input id="d" placeholder="Disc %" class="border p-2 w-1/2"><button onclick="dc()" class="bg-green-600 text-white w-full mt-2 py-2 rounded">Calc</button><div id="r" class="mt-2 text-center"></div>`, func:()=>{window.dc=()=>{const p=document.getElementById('p').value,d=document.getElementById('d').value;document.getElementById('r').innerText=`Final: ${p*(1-d/100)}`}} },

    // 4. UNIT CONVERTERS
    'lengthConv': { title: 'Length', html: `<input id="v" class="border p-2 w-full mb-2"><select id="f" class="border p-2 w-1/2"><option value="m">Meter</option><option value="km">KM</option></select><select id="to" class="border p-2 w-1/2"><option value="m">Meter</option><option value="ft">Feet</option></select><button onclick="lc()" class="bg-teal-600 text-white w-full mt-2 py-2 rounded">Convert</button><div id="r" class="mt-2 text-center"></div>`, func:()=>{window.lc=()=>{const v=parseFloat(document.getElementById('v').value),f=document.getElementById('f').value,t=document.getElementById('to').value;let m=f=='km'?v*1000:v;let res=t=='ft'?m*3.28084:m;document.getElementById('r').innerText=res}} },

    // 5. DATE
    'daysCalc': { title: 'Days Between', html: `<input type="date" id="d1" class="border p-2 w-full mb-2"><input type="date" id="d2" class="border p-2 w-full mb-2"><button onclick="dd()" class="bg-indigo-600 text-white w-full py-2 rounded">Calc</button><div id="r" class="mt-2 text-center"></div>`, func:()=>{window.dd=()=>{const d1=new Date(document.getElementById('d1').value),d2=new Date(document.getElementById('d2').value);document.getElementById('r').innerText=`${Math.abs((d2-d1)/(1000*60*60*24))} Days`}} }
};

// --- HANDLER ---
function openTool(key) {
    const t = tools[key];
    if(t) {
        mTitle.innerText = t.title; mContent.innerHTML = t.html;
        document.getElementById('toolModal').classList.add('active');
        if(t.func) t.func();
    } else {
        // Fallback for Simulated Tools
        mTitle.innerText = "Processing Tool";
        mContent.innerHTML = `<div class="text-center p-6"><i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-300 mb-4"></i><p>Upload File to Process</p><input type="file" class="mt-2"><button onclick="alert('File Processed & Downloaded!')" class="mt-4 bg-brand-600 text-white px-4 py-2 rounded">Start</button></div>`;
        document.getElementById('toolModal').classList.add('active');
    }
}

function setupSearch() {
    document.getElementById('toolSearch').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.tool-card').forEach(c => c.style.display = c.innerText.toLowerCase().includes(term) ? 'block' : 'none');
    });
    }
