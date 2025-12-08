// --- STATE MANAGEMENT ---
let user = JSON.parse(localStorage.getItem('chronosUser')) || { name: null, isPremium: false, loggedIn: false };
let gymData = JSON.parse(localStorage.getItem('gymData')) || [];
let bizData = JSON.parse(localStorage.getItem('bizData')) || [];
let studyTasks = JSON.parse(localStorage.getItem('studyData')) || [];

document.addEventListener('DOMContentLoaded', () => { updateUI(); setupSearch(); });

// --- AUTH & PREMIUM ---
function updateUI() {
    const dAuth = document.getElementById('desktopAuth');
    const mAuth = document.getElementById('mobileAuth');
    const btnHtml = user.loggedIn 
        ? `<button onclick="logout()" class="font-bold text-slate-700">${user.name} ${user.isPremium?'<i class="fa-solid fa-crown text-yellow-500"></i>':''} (Logout)</button>`
        : `<button onclick="openLoginModal()" class="bg-brand-600 text-white px-5 py-2 rounded-full font-bold shadow hover:bg-brand-700">Login</button>`;
    
    if(dAuth) dAuth.innerHTML = btnHtml;
    if(mAuth) mAuth.innerHTML = user.loggedIn ? `<div class="font-bold text-lg mb-2">${user.name}</div><button onclick="logout()" class="text-red-500 text-sm">Logout</button>` : `<button onclick="openLoginModal()" class="w-full bg-brand-600 text-white py-2 rounded-lg font-bold">Login</button>`;
    
    if(user.isPremium) document.querySelectorAll('[id^="adSpace"]').forEach(el => el.style.display = 'none');
}

function openLoginModal() { document.getElementById('loginModal').classList.add('active'); toggleSidebar(false); }
function closeLogin() { document.getElementById('loginModal').classList.remove('active'); }
function performLogin() {
    const name = document.getElementById('usernameInput').value;
    if(!name) return alert("Name required!");
    user = { name: name, isPremium: false, loggedIn: true };
    localStorage.setItem('chronosUser', JSON.stringify(user));
    updateUI(); closeLogin();
}
function logout() { localStorage.removeItem('chronosUser'); location.reload(); }

function openPremiumModal() { if(!user.loggedIn) return openLoginModal(); document.getElementById('premiumModal').classList.add('active'); toggleSidebar(false); }
function closePremium() { document.getElementById('premiumModal').classList.remove('active'); }
function verifyPayment() {
    if(confirm("Confirm you paid ₹199?")) {
        alert("Verifying...");
        setTimeout(() => {
            user.isPremium = true; localStorage.setItem('chronosUser', JSON.stringify(user));
            updateUI(); closePremium(); alert("Premium Unlocked! 🎉");
        }, 1500);
    }
}

function toggleSidebar(forceClose) {
    const sb = document.getElementById('sidebar');
    const ol = document.getElementById('sidebarOverlay');
    if (forceClose === false || sb.classList.contains('sidebar-open')) {
        sb.classList.remove('sidebar-open'); sb.classList.add('sidebar-closed'); ol.classList.add('hidden');
    } else {
        sb.classList.remove('sidebar-closed'); sb.classList.add('sidebar-open'); ol.classList.remove('hidden');
    }
}

// --- UNIVERSAL TOOL HANDLER ---
const modal = document.getElementById('toolModal');
const mTitle = document.getElementById('modalTitle');
const mContent = document.getElementById('modalContent');

// Define logic for specific tools
const specificTools = {
    'ageCalc': {
        title: 'Age Calculator',
        html: `<label class="block mb-2 font-bold text-gray-600">Date of Birth</label><input type="date" id="dob" class="w-full p-3 border rounded-lg mb-4 bg-gray-50"><button onclick="calcAge()" class="w-full bg-brand-600 text-white font-bold py-3 rounded-lg">Calculate</button><div id="res" class="mt-4 text-center text-xl font-bold text-slate-800"></div>`,
        func: () => { window.calcAge = () => { const d = new Date(document.getElementById('dob').value); if(!d.getTime()) return; const diff = new Date(new Date() - d); document.getElementById('res').innerText = `${Math.abs(diff.getUTCFullYear() - 1970)} Years Old`; }}
    },
    'bmiCalc': {
        title: 'BMI Calculator',
        html: `<div class="grid grid-cols-2 gap-3 mb-4"><input id="w" placeholder="Weight (kg)" class="p-3 border rounded"><input id="h" placeholder="Height (cm)" class="p-3 border rounded"></div><button onclick="calcBMI()" class="w-full bg-green-600 text-white font-bold py-3 rounded-lg">Check BMI</button><div id="res" class="mt-4 text-center"></div>`,
        func: () => { window.calcBMI = () => { const w=parseFloat(document.getElementById('w').value), h=parseFloat(document.getElementById('h').value)/100; if(w&&h) document.getElementById('res').innerHTML=`BMI: <b>${(w/(h*h)).toFixed(1)}</b>`; }}
    },
    'qrGen': {
        title: 'QR Generator',
        html: `<input id="qrIn" placeholder="Enter Text/Link" class="w-full p-3 border rounded-lg mb-4"><button onclick="genQR()" class="w-full bg-orange-500 text-white font-bold py-3 rounded-lg">Generate</button><div id="qrRes" class="mt-4 flex justify-center"></div>`,
        func: () => { window.genQR = () => { const v=document.getElementById('qrIn').value; if(v) document.getElementById('qrRes').innerHTML=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(v)}" class="border p-2 rounded">`; }}
    },
    'passGen': {
        title: 'Password Generator',
        html: `<div id="pRes" class="bg-gray-100 p-4 rounded-lg text-center font-mono font-bold mb-4 break-all">...</div><button onclick="genP()" class="w-full bg-purple-600 text-white font-bold py-3 rounded-lg">Generate New</button>`,
        func: () => { window.genP = () => { const c="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"; let p=""; for(let i=0;i<12;i++)p+=c.charAt(Math.floor(Math.random()*c.length)); document.getElementById('pRes').innerText=p; }}
    },
    'imgConvert': {
        title: 'Image Converter',
        html: `<div class="p-6 border-2 border-dashed rounded-xl text-center bg-gray-50 mb-4"><input type="file" id="fIn" accept="image/*" class="hidden" onchange="prev(this)"><label for="fIn" class="cursor-pointer block"><i class="fa-solid fa-cloud-arrow-up text-3xl text-blue-400"></i><p class="text-sm mt-2 text-gray-500" id="fName">Tap to Upload</p></label></div><img id="prevImg" class="hidden max-h-40 mx-auto rounded mb-4"><button onclick="conv()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Convert to PNG & Download</button>`,
        func: () => {
            window.prev = (el) => { if(el.files[0]) { document.getElementById('fName').innerText=el.files[0].name; const r=new FileReader(); r.onload=(e)=>{document.getElementById('prevImg').src=e.target.result; document.getElementById('prevImg').classList.remove('hidden');}; r.readAsDataURL(el.files[0]); }};
            window.conv = () => { const img=document.getElementById('prevImg'); if(!img.src)return; const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; c.getContext('2d').drawImage(img,0,0); const a=document.createElement('a'); a.download='converted.png'; a.href=c.toDataURL('image/png'); a.click(); }
        }
    },
    'wordCount': {
        title: 'Word Counter',
        html: `<textarea id="txt" class="w-full h-32 p-3 border rounded-lg mb-2 focus:border-brand-500 outline-none" placeholder="Type here..."></textarea><div id="res" class="text-sm font-bold text-slate-600">Words: 0 | Chars: 0</div>`,
        func: () => { document.getElementById('txt').addEventListener('input', function(){ document.getElementById('res').innerText=`Words: ${this.value.trim()?this.value.trim().split(/\s+/).length:0} | Chars: ${this.value.length}`; }); }
    },
    'clockTool': { title: 'Clock', html: `<div id="clk" class="text-5xl font-mono text-center font-bold py-10 text-slate-800">00:00:00</div>`, func: () => { setInterval(() => { if(document.getElementById('clk')) document.getElementById('clk').innerText = new Date().toLocaleTimeString(); }, 1000); } },
    'gymSched': { title: 'Gym Schedule', html: `<div class="flex gap-2 mb-3"><input id="gn" placeholder="Exercise" class="flex-1 border p-2 rounded"><button onclick="addG()" class="bg-blue-600 text-white px-4 rounded">+</button></div><ul id="gl" class="space-y-2"></ul>`, func: () => { const ren=()=>{document.getElementById('gl').innerHTML=gymData.map((x,i)=>`<li class="flex justify-between bg-gray-50 p-2 rounded">${x.name} <span onclick="delG(${i})" class="text-red-500 cursor-pointer">×</span></li>`).join('')}; ren(); window.addG=()=>{const n=document.getElementById('gn').value; if(n){gymData.push({name:n}); localStorage.setItem('gymData',JSON.stringify(gymData)); ren(); document.getElementById('gn').value='';}}; window.delG=(i)=>{gymData.splice(i,1); localStorage.setItem('gymData',JSON.stringify(gymData)); ren();} } },
    'bizSched': { title: 'Business Planner', html: `<div class="flex gap-2 mb-3"><input id="bn" placeholder="Task" class="flex-1 border p-2 rounded"><button onclick="addB()" class="bg-blue-600 text-white px-4 rounded">+</button></div><ul id="bl" class="space-y-2"></ul>`, func: () => { const ren=()=>{document.getElementById('bl').innerHTML=bizData.map((x,i)=>`<li class="flex justify-between bg-gray-50 p-2 rounded">${x.task} <span onclick="delB(${i})" class="text-red-500 cursor-pointer">×</span></li>`).join('')}; ren(); window.addB=()=>{const n=document.getElementById('bn').value; if(n){bizData.push({task:n}); localStorage.setItem('bizData',JSON.stringify(bizData)); ren(); document.getElementById('bn').value='';}}; window.delB=(i)=>{bizData.splice(i,1); localStorage.setItem('bizData',JSON.stringify(bizData)); ren();} } },
    'studySched': { title: 'Study Timer', html: `<div class="text-center py-6"><div id="tmr" class="text-6xl font-bold text-purple-600">25:00</div><button onclick="startT()" class="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full font-bold">Start Focus</button></div>`, func: () => { window.startT=()=>{ let t=25*60; setInterval(()=>{ t--; let m=Math.floor(t/60).toString().padStart(2,'0'), s=(t%60).toString().padStart(2,'0'); if(document.getElementById('tmr')) document.getElementById('tmr').innerText=`${m}:${s}`; },1000); } } }
};

// --- GENERIC HANDLER (For buttons without specific logic) ---
function openTool(key) {
    const t = specificTools[key];
    
    // 1. If specific logic exists, use it
    if(t) {
        mTitle.innerText = t.title;
        mContent.innerHTML = t.html;
        if(t.func) t.func();
    } 
    // 2. If no logic, use SIMULATION (Fake Upload -> Process -> Success)
    else {
        // Humanize key (e.g. 'pdfMerge' -> 'Pdf Merge')
        const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        mTitle.innerText = title;
        mContent.innerHTML = `
            <div class="text-center p-6">
                <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 bg-gray-50">
                    <i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-2"></i>
                    <p class="text-sm text-gray-500">Upload File to Process</p>
                    <input type="file" class="mt-4 text-sm mx-auto" onchange="document.getElementById('procBtn').disabled=false">
                </div>
                <button id="procBtn" onclick="simulateProcess()" class="w-full bg-brand-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed" disabled>Start Processing</button>
                <div id="simStatus" class="mt-4 text-sm font-bold text-green-600 hidden"></div>
            </div>
        `;
        window.simulateProcess = () => {
            const btn = document.getElementById('procBtn');
            btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Processing...";
            setTimeout(() => {
                btn.innerHTML = "Download Result";
                btn.className = "w-full bg-green-600 text-white font-bold py-3 rounded-xl";
                btn.onclick = () => alert("File Downloaded! (Simulation)");
                document.getElementById('simStatus').innerText = "Success! Your file is ready.";
                document.getElementById('simStatus').classList.remove('hidden');
            }, 2000);
        }
    }
    
    document.getElementById('toolModal').classList.add('active');
}

function closeTool() { document.getElementById('toolModal').classList.remove('active'); }

// Search
function setupSearch() {
    document.getElementById('toolSearch').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.tool-card').forEach(c => {
            c.style.display = c.innerText.toLowerCase().includes(term) ? 'block' : 'none';
        });
    });
        }
