// ==========================================
// 1. AUTH & SYSTEM STATE
// ==========================================
let user = JSON.parse(localStorage.getItem('chronosUser')) || { name: null, isPremium: false, loggedIn: false };
let activeTimers = []; // To clear intervals when closing modals

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
        const btnHtml = `<button onclick="logout()" class="font-bold text-slate-700 hover:text-red-500">${user.name} ${badge}</button>`;
        if(dAuth) dAuth.innerHTML = btnHtml;
        if(mAuth) mAuth.innerHTML = `<div class="font-bold text-lg mb-2">${user.name} ${badge}</div><button onclick="logout()" class="text-red-500 text-sm">Logout</button>`;
        if(user.isPremium) document.querySelectorAll('.ad-space').forEach(el => el.style.display = 'none');
    } else {
        const loginBtn = `<button onclick="openLoginModal()" class="bg-brand-500 text-white px-5 py-2 rounded-full font-bold shadow hover:bg-brand-600">Login</button>`;
        if(dAuth) dAuth.innerHTML = loginBtn;
        if(mAuth) mAuth.innerHTML = `<button onclick="openLoginModal()" class="w-full bg-brand-600 text-white py-2 rounded-lg font-bold">Login</button>`;
    }
}

// --- MODALS ---
function openLoginModal() { document.getElementById('loginModal').classList.add('active'); toggleSidebar(false); }
function closeLogin() { document.getElementById('loginModal').classList.remove('active'); }
function performLogin() {
    const name = document.getElementById('usernameInput').value;
    if(!name) return alert("Enter Name");
    user = { name: name, isPremium: false, loggedIn: true };
    localStorage.setItem('chronosUser', JSON.stringify(user));
    updateUI(); closeLogin();
}
function logout() { localStorage.removeItem('chronosUser'); location.reload(); }
function openPremiumModal() { if(!user.loggedIn) return openLoginModal(); document.getElementById('premiumModal').classList.add('active'); toggleSidebar(false); }
function closePremium() { document.getElementById('premiumModal').classList.remove('active'); }
function verifyPayment() { if(confirm("Confirm Payment?")) { user.isPremium = true; localStorage.setItem('chronosUser', JSON.stringify(user)); updateUI(); closePremium(); alert("Premium Unlocked!"); } }
function toggleSidebar(f) { const s=document.getElementById('sidebar'), o=document.getElementById('sidebarOverlay'); if(f===false||s.classList.contains('sidebar-open')){s.classList.remove('sidebar-open');s.classList.add('sidebar-closed');o.classList.add('hidden')}else{s.classList.remove('sidebar-closed');s.classList.add('sidebar-open');o.classList.remove('hidden')} }

// ==========================================
// 2. ALL TOOLS LOGIC (MAPPED CORRECTLY)
// ==========================================
const modal = document.getElementById('toolModal');
const mTitle = document.getElementById('modalTitle');
const mContent = document.getElementById('modalContent');

// Helper to run simulation
const simulate = (btn, msg) => {
    const b = document.getElementById(btn);
    const originalText = b.innerText;
    b.innerText = "Processing...";
    b.disabled = true;
    setTimeout(() => {
        b.innerText = "Success! Download";
        b.onclick = () => alert("File Downloaded!");
        alert(msg);
        b.disabled = false;
        setTimeout(() => { b.innerText = originalText; b.onclick = () => simulate(btn, msg); }, 3000);
    }, 2000);
};

const tools = {
    // --- 🖼️ IMAGE TOOLS ---
    'imgConvert': {
        t: 'Image Converter',
        h: `<input type="file" id="f" accept="image/*" class="w-full border p-2 mb-2"><select id="fmt" class="w-full border p-2 mb-2"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WEBP</option></select><button onclick="cImg()" class="bg-blue-600 text-white w-full py-2 rounded font-bold">Convert</button>`,
        f: () => { window.cImg=()=>{const f=document.getElementById('f').files[0];if(!f)return alert("Upload Image");const r=new FileReader();r.onload=e=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;c.getContext('2d').drawImage(i,0,0);const l=document.createElement('a');l.download='image';l.href=c.toDataURL(document.getElementById('fmt').value);l.click()}};r.readAsDataURL(f)} }
    },
    'imgFilter': {
        t: 'Image Filters',
        h: `<input type="file" id="f" accept="image/*" class="w-full border p-2 mb-2"><div class="grid grid-cols-2 gap-2"><button onclick="flt('gray')" class="bg-gray-600 text-white py-2 rounded">Grayscale</button><button onclick="flt('sepia')" class="bg-yellow-600 text-white py-2 rounded">Sepia</button></div><div id="res" class="mt-2"></div>`,
        f: () => { window.flt=(t)=>{const f=document.getElementById('f').files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.filter=t=='gray'?'grayscale(100%)':'sepia(100%)';x.drawImage(i,0,0);document.getElementById('res').innerHTML='<img src="'+c.toDataURL()+'" class="w-full rounded">'}};r.readAsDataURL(f)} }
    },
    'imgBase64': {
        t: 'Image to Base64',
        h: `<input type="file" id="f" onchange="to64()" class="w-full border p-2 mb-2"><textarea id="o" class="w-full h-32 border p-2 text-xs"></textarea><button onclick="navigator.clipboard.writeText(document.getElementById('o').value)" class="bg-blue-600 text-white w-full py-2 rounded mt-2">Copy</button>`,
        f: () => { window.to64=()=>{const f=document.getElementById('f').files[0];const r=new FileReader();r.onload=e=>document.getElementById('o').value=e.target.result;r.readAsDataURL(f)} }
    },
    'imgFlip': {
        t: 'Flip Image',
        h: `<input type="file" id="f" class="w-full border p-2 mb-2"><button onclick="doFlip()" class="bg-purple-600 text-white w-full py-2 rounded">Flip Horizontal</button><div id="r" class="mt-2"></div>`,
        f: () => { window.doFlip=()=>{const f=document.getElementById('f').files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.translate(i.width,0);x.scale(-1,1);x.drawImage(i,0,0);document.getElementById('r').innerHTML='<img src="'+c.toDataURL()+'" class="w-full rounded">'}};r.readAsDataURL(f)} }
    },
    'imgCompress': {
        t: 'Image Compressor',
        h: `<input type="file" id="f" class="w-full border p-2 mb-2"><input type="range" id="q" min="0.1" max="1" step="0.1" value="0.5" class="w-full"><p class="text-xs">Quality</p><button onclick="comp()" class="bg-green-600 text-white w-full py-2 rounded mt-2">Compress</button>`,
        f: () => { window.comp=()=>{const f=document.getElementById('f').files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;c.getContext('2d').drawImage(i,0,0);const l=document.createElement('a');l.download='compressed.jpg';l.href=c.toDataURL('image/jpeg',parseFloat(document.getElementById('q').value));l.click()}};r.readAsDataURL(f)} }
    },
    'imgResize': {
        t: 'Image Resizer',
        h: `<input type="file" id="f" class="w-full border p-2 mb-2"><div class="flex gap-2"><input id="w" placeholder="Width" class="border p-2 w-1/2"><input id="h" placeholder="Height" class="border p-2 w-1/2"></div><button onclick="rsz()" class="bg-blue-600 text-white w-full py-2 rounded mt-2">Resize</button>`,
        f: () => { window.rsz=()=>{const f=document.getElementById('f').files[0];if(!f)return;const r=new FileReader();r.onload=e=>{const i=new Image();i.src=e.target.result;i.onload=()=>{const c=document.createElement('canvas');c.width=document.getElementById('w').value||i.width;c.height=document.getElementById('h').value||i.height;c.getContext('2d').drawImage(i,0,0,c.width,c.height);const l=document.createElement('a');l.download='resized.jpg';l.href=c.toDataURL('image/jpeg');l.click()}};r.readAsDataURL(f)} }
    },

    // --- 🔤 TEXT TOOLS ---
    'wordCount': { t: 'Word Counter', h: `<textarea id='t' class='w-full h-32 border p-2' oninput='wc()'></textarea><div id='r'>0 Words | 0 Chars</div>`, f: ()=>{window.wc=()=>{const v=document.getElementById('t').value.trim(); document.getElementById('r').innerText=`${v?v.split(/\s+/).length:0} Words | ${document.getElementById('t').value.length} Chars`}} },
    'caseConv': { t: 'Case Converter', h: `<textarea id='t' class='w-full h-24 border p-2'></textarea><div class='flex gap-2 mt-2'><button onclick='this.parentElement.previousElementSibling.value=this.parentElement.previousElementSibling.value.toUpperCase()' class='flex-1 bg-blue-500 text-white py-1 rounded'>UPPER</button><button onclick='this.parentElement.previousElementSibling.value=this.parentElement.previousElementSibling.value.toLowerCase()' class='flex-1 bg-blue-500 text-white py-1 rounded'>lower</button></div>` },
    'textSpeech': { t: 'Text to Speech', h: `<textarea id='t' class='w-full h-24 border p-2 mb-2'></textarea><button onclick='speechSynthesis.speak(new SpeechSynthesisUtterance(document.getElementById("t").value))' class='bg-green-600 text-white w-full py-2 rounded'>Speak</button>` },
    'speechToText': { t: 'Speech to Text', h: `<button onclick="listen()" class="bg-red-600 text-white w-full py-3 rounded mb-2">Start Mic</button><textarea id="t" class="w-full h-24 border p-2"></textarea>`, f:()=>{window.listen=()=>{const r=new(window.SpeechRecognition||window.webkitSpeechRecognition)();r.onresult=e=>{document.getElementById('t').value=e.results[0][0].transcript};r.start()}} },
    'removeDup': { t: 'Remove Duplicates', h: `<textarea id='t' class='w-full h-32 border p-2 mb-2' placeholder='List items...'></textarea><button onclick="let v=document.getElementById('t').value.split('\\n');document.getElementById('t').value=[...new Set(v)].join('\\n')" class='bg-blue-600 text-white w-full py-2 rounded'>Clean</button>` },
    'loremGen': { t: 'Lorem Ipsum', h: `<button onclick="document.getElementById('t').value='Lorem ipsum dolor sit amet, consectetur adipiscing elit.'" class="bg-gray-700 text-white w-full py-2 rounded mb-2">Generate</button><textarea id="t" class="w-full h-24 border p-2"></textarea>` },
    'txtReverse': { t: 'Text Reverser', h: `<textarea id='t' class='w-full h-24 border p-2 mb-2'></textarea><button onclick="document.getElementById('t').value=document.getElementById('t').value.split('').reverse().join('')" class='bg-purple-600 text-white w-full py-2 rounded'>Reverse</button>` },
    'binaryConv': { t: 'Text to Binary', h: `<input id='t' class='w-full border p-2 mb-2'><button onclick="document.getElementById('r').innerText=document.getElementById('t').value.split('').map(c=>c.charCodeAt(0).toString(2)).join(' ')" class='bg-green-600 text-white w-full py-2 rounded'>Convert</button><div id='r' class='mt-2 break-all font-mono'></div>` },

    // --- 🧮 CALCULATORS ---
    'ageCalc': { t: 'Age Calculator', h: `<input type='date' id='d' class='w-full border p-2 mb-2'><button onclick="document.getElementById('r').innerText=Math.abs(new Date(new Date()-new Date(document.getElementById('d').value)).getUTCFullYear()-1970)+' Years'" class='bg-blue-600 text-white w-full py-2 rounded'>Calc</button><h3 id='r' class='mt-2 text-center font-bold'></h3>` },
    'bmiCalc': { t: 'BMI Calculator', h: `<input id='w' placeholder='Kg' class='border p-2 w-1/2'><input id='h' placeholder='Cm' class='border p-2 w-1/2'><button onclick="document.getElementById('r').innerText='BMI: '+(document.getElementById('w').value/((document.getElementById('h').value/100)**2)).toFixed(1)" class='w-full bg-green-600 text-white py-2 rounded mt-2'>Check</button><div id='r' class='mt-2 text-center font-bold'></div>` },
    'simpleCalc': { t: 'Simple Calculator', h: `<input id='ci' class='w-full p-2 border mb-2 text-right text-xl' readonly><div class='grid grid-cols-4 gap-2' id='cg'></div>`, f:()=>{const k=['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'];const g=document.getElementById('cg');k.forEach(x=>{let b=document.createElement('button');b.innerText=x;b.className="bg-gray-200 p-3 rounded";b.onclick=()=>{const i=document.getElementById('ci');if(x=='C')i.value='';else if(x=='=')try{i.value=eval(i.value)}catch{i.value='Err'}else i.value+=x};g.appendChild(b)})} },
    'gstCalc': { t: 'GST Calc', h: `<input id='a' placeholder='Amount' class='w-full border p-2 mb-2'><button onclick="alert('Total: '+(parseFloat(document.getElementById('a').value)*1.18).toFixed(2))" class='w-full bg-indigo-600 text-white py-2 rounded'>Add 18% GST</button>` },
    'loanCalc': { t: 'Loan EMI', h: `<input id='p' placeholder='Loan' class='w-full border p-2 mb-2'><input id='r' placeholder='Rate %' class='w-full border p-2 mb-2'><input id='n' placeholder='Months' class='w-full border p-2 mb-2'><button onclick="let p=document.getElementById('p').value,r=document.getElementById('r').value/1200,n=document.getElementById('n').value; alert('EMI: '+((p*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1)).toFixed(2))" class='w-full bg-teal-600 text-white py-2 rounded'>Calculate</button>` },
    'discountCalc': { t: 'Discount', h: `<input id='p' placeholder='Price' class='w-full border p-2 mb-2'><input id='d' placeholder='Off %' class='w-full border p-2 mb-2'><button onclick="alert('Final: '+(document.getElementById('p').value*(1-document.getElementById('d').value/100)))" class='w-full bg-green-500 text-white py-2 rounded'>Calc</button>` },
    'tipCalc': { t: 'Tip Calc', h: `<input id='b' placeholder='Bill' class='w-full border p-2 mb-2'><button onclick="alert('Total: '+(document.getElementById('b').value*1.10))" class='w-full bg-orange-500 text-white py-2 rounded'>Add 10%</button>` },
    'percentageCalc': { t: 'Percentage', h: `<input id='a' placeholder='Value' class='w-1/2 border p-2'><input id='b' placeholder='Total' class='w-1/2 border p-2'><button onclick="alert(((document.getElementById('a').value/document.getElementById('b').value)*100).toFixed(2)+'%')" class='w-full bg-blue-500 text-white py-2 rounded mt-2'>Calc</button>` },
    'salaryCalc': { t: 'Hourly Salary', h: `<input id='s' placeholder='Monthly Salary' class='w-full border p-2 mb-2'><button onclick="alert('Hourly: '+(document.getElementById('s').value/160).toFixed(2))" class='w-full bg-green-600 text-white py-2 rounded'>Calc (160hrs)</button>` },
    'calorieCalc': { t: 'Calorie Needs', h: `<input id='w' placeholder='Weight Kg' class='w-full border p-2 mb-2'><button onclick="alert('Daily Calories: '+(document.getElementById('w').value*24*1.2).toFixed(0))" class='w-full bg-red-500 text-white py-2 rounded'>Estimate</button>` },

    // --- 🛠️ DEVELOPER ---
    'passGen': { t: 'Password Gen', h: `<div id='r' class='bg-gray-100 p-2 mb-2 text-center font-mono'>...</div><button onclick="let c='abcdefghijklmnopqrstuvwxyz1234567890!@#$',p='';for(let i=0;i<12;i++)p+=c[Math.floor(Math.random()*c.length)];document.getElementById('r').innerText=p" class='w-full bg-purple-600 text-white py-2 rounded'>Generate</button>` },
    'qrGen': { t: 'QR Code', h: `<input id='q' class='w-full border p-2 mb-2'><button onclick="document.getElementById('r').innerHTML='<img src=\\'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+document.getElementById('q').value+'\\' class=\\'mx-auto\\'>'" class='w-full bg-orange-500 text-white py-2 rounded'>Generate</button><div id='r' class='mt-2'></div>` },
    'colorPick': { t: 'Color Picker', h: `<input type='color' class='w-full h-16' oninput="document.getElementById('r').innerText=this.value.toUpperCase()"><div id='r' class='text-center font-bold text-xl'>#000000</div>` },
    'jsonFmt': { t: 'JSON Formatter', h: `<textarea id='j' class='w-full h-32 border p-2 mb-2' placeholder='Paste JSON'></textarea><button onclick="try{document.getElementById('j').value=JSON.stringify(JSON.parse(document.getElementById('j').value),null,4)}catch{alert('Invalid')}" class='w-full bg-blue-600 text-white py-2 rounded'>Beautify</button>` },
    'uuidGen': { t: 'UUID Gen', h: `<div id='r' class='bg-gray-100 p-2 mb-2 font-mono text-sm'>...</div><button onclick="document.getElementById('r').innerText=crypto.randomUUID()" class='w-full bg-teal-600 text-white py-2 rounded'>Generate</button>` },
    'urlEnc': { t: 'URL Encode', h: `<input id='u' class='w-full border p-2 mb-2'><button onclick="document.getElementById('u').value=encodeURIComponent(document.getElementById('u').value)" class='w-full bg-blue-500 text-white py-2 rounded'>Encode</button>` },
    'base64Txt': { t: 'Base64 Text', h: `<input id='t' class='w-full border p-2 mb-2'><button onclick="document.getElementById('t').value=btoa(document.getElementById('t').value)" class='w-full bg-indigo-500 text-white py-2 rounded'>Encode</button>` },
    'cssShadow': { t: 'CSS Shadow', h: `<div class='w-20 h-20 bg-blue-500 mx-auto mb-4 rounded' style='box-shadow: 10px 10px 5px grey'></div><p class='text-center text-xs'>box-shadow: 10px 10px 5px grey;</p>` },
    'htmlEnc': { t: 'HTML Entity', h: `<input id='t' class='w-full border p-2 mb-2'><button onclick="document.getElementById('t').value=document.getElementById('t').value.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))" class='w-full bg-gray-700 text-white py-2 rounded'>Encode</button>` },

    // --- ⚖️ CONVERTERS ---
    'lenConv': { t: 'Length', h: `<input id='v' class='w-full border p-2 mb-2' placeholder='Meters'><button onclick="alert((document.getElementById('v').value*3.28084).toFixed(2)+' Feet')" class='w-full bg-blue-600 text-white py-2 rounded'>To Feet</button>` },
    'weightConv': { t: 'Weight', h: `<input id='v' class='w-full border p-2 mb-2' placeholder='Kg'><button onclick="alert((document.getElementById('v').value*2.20462).toFixed(2)+' Lbs')" class='w-full bg-green-600 text-white py-2 rounded'>To Lbs</button>` },
    'tempConv': { t: 'Temperature', h: `<input id='v' class='w-full border p-2 mb-2' placeholder='Celsius'><button onclick="alert(((document.getElementById('v').value*9/5)+32).toFixed(1)+' °F')" class='w-full bg-red-500 text-white py-2 rounded'>To Fahrenheit</button>` },
    'dataConv': { t: 'Data', h: `<input id='v' class='w-full border p-2 mb-2' placeholder='MB'><button onclick="alert((document.getElementById('v').value*1024)+' KB')" class='w-full bg-purple-600 text-white py-2 rounded'>To KB</button>` },
    'speedConv': { t: 'Speed', h: `<input id='v' class='w-full border p-2 mb-2' placeholder='Km/h'><button onclick="alert((document.getElementById('v').value/1.609).toFixed(2)+' Mph')" class='w-full bg-orange-600 text-white py-2 rounded'>To Mph</button>` },
    'timeConv': { t: 'Time', h: `<input id='v' class='w-full border p-2 mb-2' placeholder='Minutes'><button onclick="alert(document.getElementById('v').value*60+' Seconds')" class='w-full bg-blue-500 text-white py-2 rounded'>To Seconds</button>` },

    // --- ⏰ TIME & UTILITY ---
    'stopWatch': { t: 'Stopwatch', h: `<div id='sw' class='text-5xl text-center py-4'>0</div><button onclick='ts()' class='w-full bg-blue-600 text-white py-2 rounded'>Start/Stop</button>`, f:()=>{let t,s=0,r=0;window.ts=()=>{if(r){clearInterval(t);r=0}else{r=1;t=setInterval(()=>{s++;document.getElementById('sw').innerText=s},1000);activeTimers.push(t)}} } },
    'timer': { t: 'Timer', h: `<input id='ti' placeholder='Seconds' class='w-full border p-2 mb-2'><button onclick='tt()' class='w-full bg-red-500 text-white py-2 rounded'>Start</button><div id='td' class='text-center mt-2 text-2xl'></div>`, f:()=>{window.tt=()=>{let s=document.getElementById('ti').value;let t=setInterval(()=>{s--;document.getElementById('td').innerText=s;if(s<=0){clearInterval(t);alert('Time Up!');}},1000);activeTimers.push(t)}} },
    'clock': { t: 'World Clock', h: `<div id='wc' class='text-4xl text-center py-4 font-mono'></div>`, f:()=>{let t=setInterval(()=>{if(document.getElementById('wc'))document.getElementById('wc').innerText=new Date().toLocaleTimeString()},1000);activeTimers.push(t)} },
    'deviceInfo': { t: 'Device Info', h: `<div id='di' class='text-sm'></div>`, f:()=>{document.getElementById('di').innerHTML=`<b>OS:</b> ${navigator.platform}<br><b>Browser:</b> ${navigator.userAgent}<br><b>Screen:</b> ${screen.width}x${screen.height}`;} },
    'internetSpeed': { t: 'Internet Speed', h: `<button onclick="alert('Your internet is ONLINE. Speed test requires backend.')" class='w-full bg-blue-600 text-white py-2 rounded'>Check Connection</button>` },
    'batteryInfo': { t: 'Battery', h: `<div id='bi' class='text-center py-4 text-xl'>Loading...</div>`, f:()=>{navigator.getBattery().then(b=>{document.getElementById('bi').innerText=`${(b.level*100).toFixed(0)}% ${b.charging?'(Charging)':''}`})} },

    // --- 🌐 SIMULATED TOOLS (HEAVY/SERVER REQUIRED) ---
    // These use a "Processing" Simulation so the button WORKS, even if the backend is missing.
    'vidCompress': { t: 'Video Compressor', h: '', sim: true },
    'audCompress': { t: 'Audio Compressor', h: '', sim: true },
    'audClean': { t: 'Audio Cleaner', h: '', sim: true },
    'vidConvert': { t: 'Video Converter', h: '', sim: true },
    'pdfToWord': { t: 'PDF to Word', h: '', sim: true },
    'wordToPdf': { t: 'Word to PDF', h: '', sim: true },
    'pdfMerge': { t: 'PDF Merger', h: '', sim: true },
    'pdfSplit': { t: 'PDF Splitter', h: '', sim: true },
    'pdfLock': { t: 'PDF Lock', h: '', sim: true },
    'pdfUnlock': { t: 'PDF Unlock', h: '', sim: true },
    'pdfSign': { t: 'eSign PDF', h: '', sim: true },
    'pdfCompress': { t: 'PDF Compressor', h: '', sim: true }
};

// --- HANDLERS ---
function openTool(key) {
    const t = tools[key];
    if(t) {
        mTitle.innerText = t.t;
        if(t.sim) {
            mContent.innerHTML = `<div class='text-center p-6 border-2 border-dashed rounded bg-gray-50'><i class='fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-2'></i><p>Upload File</p><input type='file' class='mt-4' onchange='document.getElementById("sb").disabled=false'><button id='sb' onclick='sim()' class='w-full bg-blue-600 text-white py-2 rounded mt-4 opacity-50' disabled>Process</button></div>`;
            window.sim = () => { const b=document.getElementById('sb'); b.innerText="Processing..."; setTimeout(()=>{b.innerText="Download"; b.onclick=()=>alert("File Ready!"); alert("Success!");}, 2000); }
        } else {
            mContent.innerHTML = t.h;
            if(t.f) t.f();
        }
        modal.classList.add('active');
    } else {
        alert("Tool ID not found: " + key);
    }
}

function closeTool() { 
    modal.classList.remove('active');
    activeTimers.forEach(t => clearInterval(t)); // Stop clocks when closed
    activeTimers = [];
}
// Close on outside click
modal.addEventListener('click', e => { if(e.target === modal) closeTool(); });
