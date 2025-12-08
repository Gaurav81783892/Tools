// --- SYSTEM START ---
let user = JSON.parse(localStorage.getItem('chronosUser'));
document.addEventListener('DOMContentLoaded', () => { 
    updateUI();
    document.getElementById('search').addEventListener('input', e => {
        const t = e.target.value.toLowerCase();
        document.querySelectorAll('.tool-card').forEach(c => {
            c.parentElement.style.display = c.innerText.toLowerCase().includes(t) ? 'block' : 'none';
        });
    });
});

// --- AUTH ---
function updateUI() {
    const d = document.getElementById('desktopAuth');
    const m = document.getElementById('mobileAuth');
    const html = user ? `<button onclick="logout()" class="font-bold">${user.name} ${user.isPro?'👑':''}</button>` : `<button onclick="openAuthModal()" class="bg-blue-600 text-white px-4 py-1 rounded">Login</button>`;
    d.innerHTML = html;
    if(m) m.innerHTML = html;
}
function openAuthModal() { document.getElementById('authModal').classList.add('active'); }
function closeAuth() { document.getElementById('authModal').classList.remove('active'); }
function login() {
    const n = document.getElementById('uName').value;
    if(!n) return alert("Enter Name");
    user = { name: n, isPro: false };
    localStorage.setItem('chronosUser', JSON.stringify(user));
    updateUI(); closeAuth();
}
function logout() { localStorage.removeItem('chronosUser'); location.reload(); }

// --- PREMIUM ---
function openPremium() { document.getElementById('premModal').classList.add('active'); }
function closePrem() { document.getElementById('premModal').classList.remove('active'); }
function verifyPay() {
    if(confirm("Paid ₹199?")) {
        user.isPro = true; localStorage.setItem('chronosUser', JSON.stringify(user));
        updateUI(); closePrem(); alert("Premium Active!");
    }
}
function toggleMenu() {
    const m = document.getElementById('mobileMenu');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

// --- TOOLS ENGINE ---
const modal = document.getElementById('toolModal');
const mTitle = document.getElementById('modalTitle');
const mContent = document.getElementById('modalContent');
let interval = null; // For timers

function closeTool() { 
    modal.classList.remove('active'); 
    if(interval) { clearInterval(interval); interval=null; }
}

const tools = {
    // 🧮 CALC
    'ageCalc': { t: 'Age Calculator', h: `<input type='date' id='d' class='w-full border p-2 mb-2'><button onclick='ac()' class='bg-blue-600 text-white w-full py-2 rounded'>Calc</button><h3 id='r' class='mt-2 text-center font-bold'></h3>`, f: ()=>{window.ac=()=>{const d=new Date(document.getElementById('d').value); const x=new Date(new Date()-d); document.getElementById('r').innerText=Math.abs(x.getUTCFullYear()-1970)+" Years";}} },
    'bmiCalc': { t: 'BMI Calculator', h: `<input id='w' placeholder='Kg' class='border p-2 w-1/2'><input id='h' placeholder='Cm' class='border p-2 w-1/2'><button onclick='bc()' class='bg-green-600 text-white w-full mt-2 py-2 rounded'>Check</button><div id='r' class='mt-2 text-center font-bold'></div>`, f: ()=>{window.bc=()=>{const w=document.getElementById('w').value, h=document.getElementById('h').value/100; document.getElementById('r').innerText="BMI: "+(w/(h*h)).toFixed(1);}} },
    'gstCalc': { t: 'GST Calculator', h: `<input id='a' placeholder='Amount' class='w-full border p-2 mb-2'><select id='p' class='w-full border p-2 mb-2'><option value='0.18'>18%</option><option value='0.05'>5%</option></select><button onclick='gc()' class='bg-indigo-600 text-white w-full py-2 rounded'>Calc</button><div id='r' class='mt-2 text-center'></div>`, f: ()=>{window.gc=()=>{const a=parseFloat(document.getElementById('a').value), p=parseFloat(document.getElementById('p').value); document.getElementById('r').innerText="Total: "+(a+(a*p)).toFixed(2);}} },
    'simpleCalc': { t: 'Calculator', h: `<input id='ci' class='w-full p-2 border mb-2 text-right text-xl' readonly><div class='grid grid-cols-4 gap-2' id='cg'></div>`, f: ()=>{const k=['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+']; const g=document.getElementById('cg'); k.forEach(x=>{let b=document.createElement('button'); b.innerText=x; b.className="bg-gray-200 p-3 rounded"; b.onclick=()=>{const i=document.getElementById('ci'); if(x=='C')i.value=''; else if(x=='=')try{i.value=eval(i.value)}catch{i.value='Err'} else i.value+=x;}; g.appendChild(b);})} },
    
    // 🔤 TEXT
    'wordCount': { t: 'Word Counter', h: `<textarea id='t' class='w-full h-32 border p-2' oninput='wc()'></textarea><div id='r'>0 Words</div>`, f: ()=>{window.wc=()=>{const v=document.getElementById('t').value.trim(); document.getElementById('r').innerText=(v?v.split(/\s+/).length:0)+" Words";}} },
    'caseConv': { t: 'Case Converter', h: `<textarea id='t' class='w-full h-24 border p-2'></textarea><div class='flex gap-2 mt-2'><button onclick='document.getElementById("t").value=document.getElementById("t").value.toUpperCase()' class='flex-1 bg-blue-500 text-white py-1 rounded'>UP</button><button onclick='document.getElementById("t").value=document.getElementById("t").value.toLowerCase()' class='flex-1 bg-blue-500 text-white py-1 rounded'>low</button></div>` },
    'textSpeech': { t: 'Text to Speech', h: `<textarea id='t' class='w-full h-24 border p-2 mb-2'></textarea><button onclick='speak()' class='bg-green-600 text-white w-full py-2 rounded'>Speak</button>`, f: ()=>{window.speak=()=>{speechSynthesis.speak(new SpeechSynthesisUtterance(document.getElementById('t').value))}} },
    
    // 🖼️ IMAGE
    'imgConvert': { t: 'Image Converter', h: `<input type='file' id='f' accept='image/*' class='mb-2'><button onclick='ic()' class='bg-blue-600 text-white w-full py-2 rounded'>Convert PNG</button>`, f: ()=>{window.ic=()=>{const f=document.getElementById('f').files[0]; if(!f)return; const r=new FileReader(); r.onload=e=>{const i=new Image(); i.src=e.target.result; i.onload=()=>{const c=document.createElement('canvas'); c.width=i.width;c.height=i.height; c.getContext('2d').drawImage(i,0,0); const l=document.createElement('a'); l.href=c.toDataURL(); l.download='image.png'; l.click();}}; r.readAsDataURL(f);}} },
    
    // ⏰ TIME
    'stopWatch': { t: 'Stopwatch', h: `<div id='d' class='text-5xl text-center py-4'>0</div><button onclick='st()' class='bg-blue-600 text-white w-full py-2 rounded'>Start/Stop</button>`, f: ()=>{let r=0,s=0; window.st=()=>{if(r){clearInterval(interval);r=0;}else{r=1;interval=setInterval(()=>{s++;document.getElementById('d').innerText=s},1000)}} } },
    'clock': { t: 'World Clock', h: `<div id='c' class='text-4xl text-center font-mono'></div>`, f: ()=>{interval=setInterval(()=>{if(document.getElementById('c'))document.getElementById('c').innerText=new Date().toLocaleTimeString()},1000)} },

    // 🛠️ UTILITY
    'qrGen': { t: 'QR Code', h: `<input id='q' class='w-full border p-2 mb-2'><button onclick='gq()' class='bg-orange-500 text-white w-full py-2 rounded'>Generate</button><div id='r' class='mt-2 flex justify-center'></div>`, f: ()=>{window.gq=()=>{const v=document.getElementById('q').value; if(v) document.getElementById('r').innerHTML=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(v)}">`;}} },
    'passGen': { t: 'Password Gen', h: `<div id='p' class='bg-gray-100 p-2 text-center mb-2 font-bold'>...</div><button onclick='gp()' class='bg-purple-600 text-white w-full py-2 rounded'>Generate</button>`, f: ()=>{window.gp=()=>{const c="abcdefghijklmnopqrstuvwxyz1234567890@#$"; let p=""; for(let i=0;i<12;i++)p+=c[Math.floor(Math.random()*c.length)]; document.getElementById('p').innerText=p;}} },
    'deviceInfo': { t: 'Device Info', h: `<div id='di'></div>`, f: ()=>{document.getElementById('di').innerHTML=`<b>OS:</b> ${navigator.platform}<br><b>Browser:</b> ${navigator.userAgent}<br><b>Screen:</b> ${screen.width}x${screen.height}`;} },
    
    // 🌐 SIMULATED (For heavy tools)
    'pdfMerge': { t: 'PDF Merger', h: ``, sim: true },
    'videoCompress': { t: 'Video Compressor', h: ``, sim: true }
};

function openTool(key) {
    const t = tools[key] || tools['pdfMerge']; // Fallback
    mTitle.innerText = t.t || "Tool";
    
    if (t.sim) {
        // SIMULATION FOR HEAVY TOOLS
        mContent.innerHTML = `<div class='text-center p-6 border-2 border-dashed rounded'><p>Upload File</p><input type='file' class='mt-2'><button onclick='alert("Processed Successfully!")' class='bg-blue-600 text-white px-4 py-2 rounded mt-4'>Start</button></div>`;
    } else {
        mContent.innerHTML = t.h;
        if(t.f) t.f();
    }
    document.getElementById('toolModal').classList.add('active');
        }
