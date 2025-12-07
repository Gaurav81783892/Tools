// --- MODAL ELEMENTS ---
const modal = document.getElementById('toolModal');
const modalBox = document.getElementById('modalBox');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');

// --- TOOL CONFIGURATION ---
const tools = {
    // 1. AGE CALCULATOR
    'ageCalc': {
        title: 'Age Calculator',
        html: `
            <label class="block text-sm text-gray-600 mb-1 font-semibold">Date of Birth</label>
            <input type="date" id="dob" class="w-full p-3 border rounded-lg mb-4 bg-gray-50 outline-none focus:border-blue-500">
            <button onclick="calculateAge()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">Calculate Age</button>
            <div id="result" class="mt-4 text-center font-bold text-xl text-gray-800"></div>
        `,
        action: () => {
            window.calculateAge = () => {
                const dob = new Date(document.getElementById('dob').value);
                const now = new Date();
                if(!document.getElementById('dob').value) return;
                const diff = now - dob;
                const ageDate = new Date(diff); 
                const years = Math.abs(ageDate.getUTCFullYear() - 1970);
                document.getElementById('result').innerHTML = `You are <span class="text-blue-600">${years}</span> years old.`;
            }
        }
    },

    // 2. BMI CALCULATOR
    'bmiCalc': {
        title: 'BMI Calculator',
        html: `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div><label class="text-xs font-bold text-gray-500">Weight (kg)</label><input type="number" id="weight" class="w-full p-2 border rounded" placeholder="70"></div>
                <div><label class="text-xs font-bold text-gray-500">Height (cm)</label><input type="number" id="height" class="w-full p-2 border rounded" placeholder="175"></div>
            </div>
            <button onclick="calculateBMI()" class="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition">Check BMI</button>
            <div id="result" class="mt-4 p-3 bg-gray-100 rounded text-center text-sm">Result will appear here</div>
        `,
        action: () => {
            window.calculateBMI = () => {
                const w = parseFloat(document.getElementById('weight').value);
                const h = parseFloat(document.getElementById('height').value) / 100;
                if(!w || !h) return;
                const bmi = (w / (h * h)).toFixed(1);
                let text = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
                let color = bmi < 18.5 ? "text-yellow-600" : bmi < 25 ? "text-green-600" : "text-red-600";
                document.getElementById('result').innerHTML = `BMI: <b>${bmi}</b> <br> Status: <span class="${color} font-bold">${text}</span>`;
            }
        }
    },

    // 3. WORD COUNTER
    'wordCount': {
        title: 'Word Counter',
        html: `
            <textarea id="TextInput" class="w-full h-32 p-3 border rounded-lg resize-none mb-2 focus:border-blue-500 outline-none" placeholder="Type here..."></textarea>
            <div class="flex justify-between text-sm font-bold text-gray-600 bg-gray-100 p-3 rounded">
                <span>Words: <span id="wCount" class="text-blue-600">0</span></span>
                <span>Chars: <span id="cCount" class="text-blue-600">0</span></span>
            </div>
        `,
        action: () => {
            document.getElementById('TextInput').addEventListener('input', function() {
                const text = this.value.trim();
                document.getElementById('cCount').innerText = text.length;
                document.getElementById('wCount').innerText = text ? text.split(/\s+/).length : 0;
            });
        }
    },

    // 4. CASE CONVERTER
    'caseConv': {
        title: 'Case Converter',
        html: `
            <textarea id="caseInput" class="w-full h-24 p-3 border rounded-lg mb-3 resize-none" placeholder="Type text..."></textarea>
            <div class="grid grid-cols-2 gap-2">
                <button onclick="toUpper()" class="bg-indigo-600 text-white py-2 rounded">UPPERCASE</button>
                <button onclick="toLower()" class="bg-indigo-600 text-white py-2 rounded">lowercase</button>
            </div>
        `,
        action: () => {
            window.toUpper = () => document.getElementById('caseInput').value = document.getElementById('caseInput').value.toUpperCase();
            window.toLower = () => document.getElementById('caseInput').value = document.getElementById('caseInput').value.toLowerCase();
        }
    },

    // 5. PASSWORD GENERATOR
    'passGen': {
        title: 'Password Generator',
        html: `
            <div class="bg-gray-100 p-4 rounded text-center text-xl font-mono font-bold tracking-wider mb-4 border border-gray-200 break-all" id="passDisplay">CLICK GENERATE</div>
            <div class="flex gap-2">
                <input type="number" id="length" value="12" min="4" max="24" class="w-20 p-2 border rounded text-center">
                <button onclick="genPass()" class="flex-1 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition">Generate New</button>
            </div>
        `,
        action: () => {
            window.genPass = () => {
                const len = document.getElementById('length').value;
                const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                let pass = "";
                for(let i=0; i<len; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                document.getElementById('passDisplay').innerText = pass;
            }
        }
    },
    
    // 6. IMAGE CONVERTER (Placeholder for now)
    'imgConvert': {
        title: 'Image Converter',
        html: `
            <div class="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl">
                <i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-2"></i>
                <p class="text-sm text-gray-500">Upload Image (JPG/PNG)</p>
                <input type="file" class="mt-4 text-sm text-gray-500">
            </div>
            <button class="w-full bg-blue-600 text-white font-bold py-3 mt-4 rounded-lg opacity-50 cursor-not-allowed">Convert (Demo)</button>
        `
    }
};

// --- FUNCTIONS ---

function openTool(key) {
    const tool = tools[key];
    if(tool) {
        modalTitle.innerText = tool.title;
        modalContent.innerHTML = tool.html;
        
        // Show Modal
        modal.style.opacity = "1";
        modal.style.pointerEvents = "auto";
        modalBox.style.transform = "scale(1)";
        
        if(tool.action) tool.action();
    } else {
        // Fallback for tools not yet implemented
        modalTitle.innerText = "Coming Soon";
        modalContent.innerHTML = `<div class='text-center py-8 text-gray-500'><i class='fa-solid fa-person-digging text-4xl mb-3'></i><br>This tool is under development.</div>`;
        modal.style.opacity = "1";
        modal.style.pointerEvents = "auto";
        modalBox.style.transform = "scale(1)";
    }
}

function closeModal() {
    modal.style.opacity = "0";
    modal.style.pointerEvents = "none";
    modalBox.style.transform = "scale(0.95)";
}

// Close on Background Click
modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
});

// Search Logic
document.getElementById('toolSearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.tool-card');
    const categories = document.querySelectorAll('.tool-category');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? "block" : "none";
    });

    // Hide empty categories
    categories.forEach(cat => {
        const visibleCards = cat.querySelectorAll('.tool-card[style="display: block;"]');
        cat.style.display = (visibleCards.length > 0 || term === "") ? "block" : "none";
    });
});
