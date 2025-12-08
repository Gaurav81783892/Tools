// --- USER MANAGEMENT ---
let user = JSON.parse(localStorage.getItem('chronosUser')) || { name: null, isPremium: false, loggedIn: false };
let gymData = JSON.parse(localStorage.getItem('gymData')) || [];
let bizData = JSON.parse(localStorage.getItem('bizData')) || [];
let studyTasks = JSON.parse(localStorage.getItem('studyData')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupSearch();
});

// --- AUTH & UI ---
function updateUI() {
    const dAuth = document.getElementById('desktopAuth');
    const mAuth = document.getElementById('mobileAuth');
    
    if(user.loggedIn) {
        let badge = user.isPremium ? '<span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded ml-1">PRO</span>' : '';
        const html = `<div><span class="font-bold">${user.name}</span> ${badge}</div><button onclick="logout()" class="text-xs text-red-500">Logout</button>`;
        dAuth.innerHTML = `<button onclick="logout()" class="font-bold text-slate-700 hover:text-red-500">${user.name} ${badge}</button>`;
        if(mAuth) mAuth.innerHTML = html;
        
        // Hide Ads if Premium
        if(user.isPremium) {
            document.querySelectorAll('.container .w-full.h-20').forEach(ad => ad.style.display = 'none');
        }
    } else {
        dAuth.innerHTML = `<button onclick="openLoginModal()" class="bg-brand-600 text-white px-4 py-2 rounded-full font-bold">Login</button>`;
        if(mAuth) mAuth.innerHTML = `<button onclick="openLoginModal()" class="w-full bg-brand-600 text-white py-2 rounded-lg">Login</button>`;
    }
}

function openLoginModal() { document.getElementById('loginModal').classList.add('active'); toggleSidebar(false); }
function closeLogin() { document.getElementById('loginModal').classList.remove('active'); }
function performLogin() {
    const name = document.getElementById('usernameInput').value;
    if(!name) return;
    user = { name: name, isPremium: false, loggedIn: true };
    localStorage.setItem('chronosUser', JSON.stringify(user));
    updateUI(); closeLogin();
}
function logout() { localStorage.removeItem('chronosUser'); location.reload(); }

// --- PREMIUM PAYMENT SYSTEM ---
function openPremiumModal() { 
    if(!user.loggedIn) return openLoginModal();
    document.getElementById('premiumModal').classList.add('active'); 
    toggleSidebar(false);
}
function closePremium() { document.getElementById('premiumModal').classList.remove('active'); }

// Manual Verify Simulation
function verifyPayment() {
    if(confirm("Did you complete the payment of ₹199?")) {
        alert("Thanks! Verifying transaction...");
        setTimeout(() => {
            user.isPremium = true;
            localStorage.setItem('chronosUser', JSON.stringify(user));
            updateUI();
            closePremium();
            alert("Premium Activated Successfully! 🎉");
        }, 2000);
    }
}

function toggleSidebar(forceClose) {
    const sb = document.getElementById('sidebar');
    const ol = document.getElementById('sidebarOverlay');
    if (forceClose === false || sb.classList.contains('sidebar-open')) {
        sb.classList.remove('sidebar-open');
        sb.classList.add('sidebar-closed');
        ol.classList.add('hidden');
    } else {
        sb.classList.remove('sidebar-closed');
        sb.classList.add('sidebar-open');
        ol.classList.remove('hidden');
    }
}

// --- TOOLS LOGIC ---
const modal = document.getElementById('toolModal');
const mTitle = document.getElementById('modalTitle');
const mContent = document.getElementById('modalContent');

const tools = {
    // 1. CLOCK & ALARM
    'clockTool': {
        title: 'World Clock & Alarm',
        html: `
            <div class="text-center mb-6">
                <div id="liveClock" class="text-5xl font-mono font-bold text-slate-800">00:00:00</div>
                <div id="liveDate" class="text-gray-500 text-sm">Date</div>
            </div>
            <div class="border-t pt-4">
                <label class="text-xs font-bold text-gray-500">SET ALARM</label>
                <div class="flex gap-2 mt-1">
                    <input type="time" id="alarmIn" class="flex-1 p-2 border rounded">
                    <button onclick="setAlarm()" class="bg-blue-600 text-white px-4 rounded font-bold">ON</button>
                </div>
                <p id="alarmStatus" class="text-xs text-green-600 mt-2 font-bold"></p>
            </div>`,
        func: () => {
            setInterval(() => {
                const now = new Date();
                if(document.getElementById('liveClock')) {
                    document.getElementById('liveClock').innerText = now.toLocaleTimeString();
                    document.getElementById('liveDate').innerText = now.toDateString();
                }
            }, 1000);
            window.setAlarm = () => {
                const t = document.getElementById('alarmIn').value;
                if(t) {
                    document.getElementById('alarmStatus').innerText = `Alarm: ${t}`;
                    setInterval(() => {
                        const n = new Date();
                        if(`${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}` === t && n.getSeconds() === 0) {
                            alert("⏰ WAKE UP!");
                        }
                    }, 1000);
                }
            }
        }
    },

    // 2. GYM SCHEDULE
    'gymSched': {
        title: 'Gym Schedule',
        html: `
            <div class="flex gap-2 mb-4">
                <input id="exName" placeholder="Exercise" class="flex-1 p-2 border rounded">
                <input id="exSets" placeholder="Sets" type="number" class="w-20 p-2 border rounded">
                <button onclick="addGym()" class="bg-blue-600 text-white px-3 rounded">+</button>
            </div>
            <ul id="gymList" class="space-y-2"></ul>`,
        func: () => {
            const render = () => {
                document.getElementById('gymList').innerHTML = gymData.map((x,i) => 
                    `<li class="flex justify-between bg-gray-50 p-2 rounded border"><span><b>${x.name}</b> (${x.sets} sets)</span><button onclick="delGym(${i})" class="text-red-500">×</button></li>`
                ).join('');
            };
            render();
            window.addGym = () => {
                const n = document.getElementById('exName').value, s = document.getElementById('exSets').value;
                if(n) { gymData.push({name:n, sets:s}); localStorage.setItem('gymData', JSON.stringify(gymData)); render(); document.getElementById('exName').value=''; }
            };
            window.delGym = (i) => { gymData.splice(i,1); localStorage.setItem('gymData', JSON.stringify(gymData)); render(); };
        }
    },

    // 3. BUSINESS SCHEDULE
    'bizSched': {
        title: 'Business Planner',
        html: `
            <div class="flex gap-2 mb-4">
                <input id="bizTask" placeholder="Meeting / Task" class="flex-1 p-2 border rounded">
                <input id="bizTime" type="time" class="p-2 border rounded">
                <button onclick="addBiz()" class="bg-blue-600 text-white px-3 rounded">+</button>
            </div>
            <ul id="bizList" class="space-y-2"></ul>`,
        func: () => {
            const render = () => {
                document.getElementById('bizList').innerHTML = bizData.map((x,i) => 
                    `<li class="flex justify-between bg-blue-50 p-2 rounded border border-blue-100"><div><b>${x.task}</b><br><span class="text-xs text-gray-500">${x.time}</span></div><button onclick="delBiz(${i})" class="text-blue-500">✓</button></li>`
                ).join('');
            };
            render();
            window.addBiz = () => {
                const t = document.getElementById('bizTask').value, tm = document.getElementById('bizTime').value;
                if(t) { bizData.push({task:t, time:tm}); localStorage.setItem('bizData', JSON.stringify(bizData)); render(); document.getElementById('bizTask').value=''; }
            };
            window.delBiz = (i) => { bizData.splice(i,1); localStorage.setItem('bizData', JSON.stringify(bizData)); render(); };
        }
    },

    // 4. STOPWATCH
    'stopWatch': {
        title: 'Stopwatch',
        html: `<div class="text-center text-5xl font-mono font-bold py-6 text-blue-600" id="swDisplay">00:00:00</div><div class="flex justify-center gap-4"><button onclick="swToggle()" class="bg-green-500 text-white px-6 py-2 rounded-full font-bold" id="swBtn">Start</button><button onclick="swReset()" class="bg-gray-500 text-white px-6 py-2 rounded-full font-bold">Reset</button></div>`,
        func: () => {
            let t, sec=0, run=false;
            const fmt = s => new Date(s * 1000).toISOString().substr(11, 8);
            window.swToggle = () => {
                if(!run) { run=true; document.getElementById('swBtn').innerText="Stop"; document.getElementById('swBtn').className="bg-red-500 text-white px-6 py-2 rounded-full font-bold"; t=setInterval(()=>{sec++; document.getElementById('swDisplay').innerText=fmt(sec)}, 1000); }
                else { run=false; clearInterval(t); document.getElementById('swBtn').innerText="Start"; document.getElementById('swBtn').className="bg-green-500 text-white px-6 py-2 rounded-full font-bold"; }
            };
            window.swReset = () => { run=false; clearInterval(t); sec=0; document.getElementById('swDisplay').innerText="00:00:00"; document.getElementById('swBtn').innerText="Start"; document.getElementById('swBtn').className="bg-green-500 text-white px-6 py-2 rounded-full font-bold"; };
        }
    },

    // 5. IMAGE CONVERTER
    'imgConvert': {
        title: 'Image Converter',
        html: `<input type="file" id="fIn" class="w-full mb-3 border p-2 rounded" accept="image/*"><button onclick="runImg()" class="w-full bg-blue-600 text-white py-2 rounded font-bold">Convert & Download PNG</button>`,
        func: () => {
            window.runImg = () => {
                const f = document.getElementById('fIn').files[0];
                if(!f) return alert("Select Image");
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                        const c = document.createElement('canvas');
                        c.width = img.width; c.height = img.height;
                        c.getContext('2d').drawImage(img,0,0);
                        const a = document.createElement('a');
                        a.href = c.toDataURL('image/png');
                        a.download = 'converted.png';
                        a.click();
                    }
                };
                reader.readAsDataURL(f);
            }
        }
    },
    // GENERIC HANDLER FOR OTHERS
    'qrGen': { title: 'QR Code', html: `<input id="q" class="w-full p-2 border mb-2"><button onclick="document.getElementById('r').innerHTML='<img src=\\'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+document.getElementById('q').value+'\\' class=\\'mx-auto\\'>'" class="w-full bg-orange-500 text-white py-2 rounded">Generate</button><div id="r" class="mt-4"></div>` },
    'passGen': { title: 'Password', html: `<div id="p" class="bg-gray-100 p-2 text-center mb-2 font-mono font-bold">...</div><button onclick="let c='abcdefghijklmnopqrstuvwxyz0123456789!@#$';let r='';for(let i=0;i<12;i++)r+=c[Math.floor(Math.random()*c.length)];document.getElementById('p').innerText=r" class="w-full bg-green-600 text-white py-2 rounded">Generate</button>` },
    'ageCalc': { title: 'Age Calculator', html: `<input type="date" id="d" class="w-full p-2 border mb-2"><button onclick="alert(new Date().getFullYear() - new Date(document.getElementById('d').value).getFullYear() + ' Years Old')" class="w-full bg-blue-600 text-white py-2 rounded">Calculate</button>` },
    'bmiCalc': { title: 'BMI Calculator', html: `<input id="w" placeholder="Kg" class="w-1/2 p-2 border"><input id="h" placeholder="Cm" class="w-1/2 p-2 border"><button onclick="alert('BMI: '+(document.getElementById('w').value/((document.getElementById('h').value/100)**2)).toFixed(1))" class="w-full bg-blue-600 text-white py-2 rounded mt-2">Check</button>` }
};

function openTool(key) {
    const t = tools[key];
    if(t) {
        mTitle.innerText = t.title; mContent.innerHTML = t.html; document.getElementById('toolModal').classList.add('active');
        if(t.func) t.func();
    } else { alert("Tool under construction"); }
}
function closeTool() { document.getElementById('toolModal').classList.remove('active'); }

function setupSearch() {
    document.getElementById('toolSearch').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.tool-card').forEach(c => c.style.display = c.innerText.toLowerCase().includes(term) ? 'block' : 'none');
    });
                                          }
