
        // Translations
        const translations = {
            ar: {
                appTitle: "حاسبة Grossing Up",
                employeeData: "بيانات الموظف",
                employeeName: "اسم الموظف",
                employeeType: "فئة الموظف",
                regularEmployee: "موظف عادي",
                pwsnEmployee: "موظف من ذوي الهمم",
                insuranceData: "البيانات التأمينية",
                insurance: "التأمينات",
                insured: "مؤمن عليه",
                notInsured: "غير مؤمن",
                insuranceType: "النوع",
                employee: "موظف",
                manager: "مدير",
                taxTreatment: "المعاملات الضريبية",
                type: "النوع",
                "Nesma First employer": "جهة العمل الأصلية",
                "Nesma Second employer": "يعمل لدى الغير (10% مقطوعة)",
                wage: "الأجر",
                targetNetUSD: "الصافي المستهدف (USD)",
                usdRate: "سعر الصرف (EGP/USD)",
                calculateBtn: "حساب النتائج",
                result: "النتيجة للموظف",
                emptyTable: 'أدخل البيانات واضغط "حساب النتائج"',
                salaryBreakdown: "تحليل الراتب",
                grossSalary: "الاجر الشامل",
                employeeSI: "حصه العامل في التأمينات",
                salaryTax: "ضريبية المرتبات",
                martyrsFund: "ضريبية الشهداء",
                netSalary: "صافي الاجر",
                usdTitle: "الدولار | USD",
                egpTitle: "الجنية المصري | EGP",
                chartNet: "صافي الراتب",
                chartIncomeTax: "ضريبة الدخل",
                chartSI: "تأمينات الموظف",
                chartMartyrs: "صندوق الشهداء",
                chartAllowances: "منح وبدلات",
                downloadPdf: "تحميل PDF",
                footerText: "مدعوم من شركة Iconic Technology بالتعاون مع مؤسّسة Nassef and Partners International"
            },
            en: {
                appTitle: "Grossing Up Calculator",
                employeeData: "Employee Data",
                employeeName: "Employee Name",
                employeeType: "Employee Type",
                regularEmployee: "Regular Employee",
                pwsnEmployee: "PWSN Employee",
                insuranceData: "Insurance Data",
                insurance: "Insurance",
                insured: "Insured",
                notInsured: "Not Insured",
                insuranceType: "Type",
                employee: "Employee",
                manager: "Manager",
                taxTreatment: "Tax Treatment",
                type: "Type",
                "Nesma First employer": "Original Employer",
                "Nesma Second employer": "Works for Others (10% Flat)",
                wage: "Wage",
                targetNetUSD: "Target Net (USD)",
                usdRate: "Exchange Rate (EGP/USD)",
                calculateBtn: "Calculate Results",
                result: "Result for",
                emptyTable: "Enter data and click Calculate",
                salaryBreakdown: "Salary Breakdown",
                grossSalary: "Gross Salary",
                employeeSI: "Employee SI",
                salaryTax: "Salary Tax",
                martyrsFund: "Martyrs Fund",
                netSalary: "Net Salary",
                usdTitle: "USD",
                egpTitle: "EGP",
                chartNet: "Net Pay",
                chartIncomeTax: "Income Tax",
                chartSI: "SI Employee",
                chartMartyrs: "Martyrs Fund",
                chartAllowances: "Allowances",
                downloadPdf: "Download PDF",
                footerText: "Powered by Iconic Technology Company with the Corporation of Nassef and Partners International"
            }
        };

        let currentLang = 'ar';
        const langToggleBtn = document.getElementById('langToggle');

        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            document.documentElement.lang = currentLang;
            document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
            document.getElementById('currentLangLabel').textContent = currentLang === 'ar' ? 'EN' : 'AR';
            
            // Re-render text on screen
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if(translations[currentLang][key]) {
                    el.textContent = translations[currentLang][key];
                }
            });

            // Update title of reset button if needed
            document.getElementById('resetBtn').title = currentLang === 'ar' ? 'تفريغ الحقول' : 'Reset Fields';

            // Trigger calc to update chart and table languages if they exist
            if (document.getElementById('targetNetUSD').value && document.getElementById('usdRate').value) {
                calculateGoalSeek();
            } else {
                resetForm(); // to update empty table text
            }
        });

        // Theme Toggle Logic
        const themeToggleBtn = document.getElementById('themeToggle');
        
        // Initial setup from localStorage or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
        });

        // Auto-calculate on input change
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                if (document.getElementById('targetNetUSD').value && document.getElementById('usdRate').value) {
                    calculateGoalSeek();
                }
            });
        });

        // Formatting helpers
        function fmt(num) {
            return num.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
        }
        function fmtC(num) {
            return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // The core calculation mapping exactly to what Excel does for row 3 (Saad)
        function calculateNetFromGross(O, inputs) {
            const F = inputs.F; // Insurance ("insured" / "Not Insured")
            const G = inputs.G; // Insurance Type ("Employee" / "Manager")
            const H = inputs.H; // Employee Type ("Regular Employee" / "PWSN Employee")
            const I = inputs.I; // Working Period by Month

            // P (Social Insurance Salary): =IF(F3="insured",IF(O3>16700,16700,O3),0)
            const P = (I >= 1 && F === "insured") ? (O > 16700 ? 16700 : O) : 0;
            
            // Q (Social Insurance Company): =IF(G3="Employee",P3*18.75%,IF(G3="Manager",0,0))
            const Q = (I >= 1 && G === "Employee") ? P * 0.1875 : 0;
            
            // R (Social Insurance Employee): =IF(G3="Employee",P3*11%,IF(G3="Manager",P3*21%,0))
            const R = (I >= 1) ? (G === "Employee" ? P * 0.11 : (G === "Manager" ? P * 0.21 : 0)) : 0;
            
            // S (Total Insurance): =R3+Q3
            const S = R + Q;
            
            // T (Tax Exemption): =IF(H3="Regular Employee",20000*I3/12,IF(H3="PWSN Employee",30000*I3/12,0))
            const T = H === "Regular Employee" ? (20000 * I / 12) : (H === "PWSN Employee" ? (30000 * I / 12) : 0);
            
            // U (Monthly Tax Pool): =O3-R3-T3
            const exactU = O - R - T;

            // V (Annual Tax Pool): =U3*12/I3
            const V = exactU * 12 / I;
            
            // W (Annual Salary Tax) - Exact IF tree from Excel OR 10% flat
            let W = 0;
            if (inputs.taxTreatment === "others") {
                W = V * 0.10; // 10% flat tax
            } else {
                if (V > 1200000) {
                    W = 300000 + ((V - 1200000) * 0.275);
                } else if (V > 900000) {
                    W = 90000 + ((V - 400000) * 0.25);
                } else if (V > 800000) {
                    W = 85000 + ((V - 400000) * 0.25);
                } else if (V > 700000) {
                    W = 81500 + ((V - 400000) * 0.25);
                } else if (V > 600000) {
                    W = 78750 + ((V - 400000) * 0.25);
                } else if (V > 400000) {
                    W = 74750 + ((V - 400000) * 0.25);
                } else if (V > 200000) {
                    W = 29750 + ((V - 200000) * 0.225);
                } else if (V > 70000) {
                    W = 3750 + ((V - 70000) * 0.20);
                } else if (V > 55000) {
                    W = 1500 + ((V - 55000) * 0.15);
                } else if (V > 40000) {
                    W = (V - 40000) * 0.10;
                } else {
                    W = 0;
                }
            }

            // X (Period Salary Tax): =W3*I3/12
            const X = W * I / 12;

            // Y (Martyrs fund): =O3*0.0005
            const Y = O * 0.0005;

            // Z (Net Salary EGP): =O3-R3-X3-Y3
            const Z = O - R - X - Y;

            return { O, P, Q, R, S, T, exactU, V, W, X, Y, Z };
        }

        function calculateGoalSeek() {
            // Get user inputs
            const name = document.getElementById('employeeName').value;
            const targetNetUSD = parseFloat(document.getElementById('targetNetUSD').value) || 0;
            const usdRate = parseFloat(document.getElementById('usdRate').value) || 0;
            const basicSalaryUSD = parseFloat(document.getElementById('basicSalaryUSD').value) || 0;
            const allowancesEGP = parseFloat(document.getElementById('allowancesEGP').value) || 0;
            
            const inputs = {
                F: document.getElementById('insuranceStatus').value,
                G: document.getElementById('roleType').value,
                H: document.getElementById('taxPersona').value,
                I: parseFloat(document.getElementById('workingPeriod').value) || 1,
                taxTreatment: document.getElementById('taxTreatment').value
            };

            // Calculate non-gross-dependent base sums
            const L = basicSalaryUSD * usdRate; // Basic (EGP Salary) = J * K
            const targetNetEGP = targetNetUSD * usdRate; // This is the goal Z

            // Binary Search Goal Seek for Gross (O)
            let low = targetNetEGP;
            let high = targetNetEGP * 5; // generous upper bound
            let currentGross = targetNetEGP;
            let result = null;
            let iterations = 0;

            const tolerance = 0.000001;
            
            for (let i = 0; i < 100; i++) {
                currentGross = (low + high) / 2;
                result = calculateNetFromGross(currentGross, inputs);
                iterations = i;
                
                if (Math.abs(result.Z - targetNetEGP) < tolerance) {
                    break;
                }
                
                if (result.Z > targetNetEGP) {
                    high = currentGross;
                } else {
                    low = currentGross;
                }
                
                if ((high - low) < 1e-10) break;
            }

            // Once O is found, we calculate Grossing Up Amount (N)
            const N = result.O - L - allowancesEGP;

            renderTable({
                name,
                J: basicSalaryUSD,
                K: usdRate,
                L: L,
                M: allowancesEGP,
                N: N,
                ...result,
                targetNetEGP,
                AB: result.Z / usdRate
            }, inputs, iterations);

            // Update Chart (In USD)
            updatePieChart(result.O/usdRate, result.Z/usdRate, result.X/usdRate, result.R/usdRate, result.Y/usdRate, allowancesEGP/usdRate);
        }

        let salaryChart = null;

        function updatePieChart(gross, net, incomeTax, siEmployee, martyrsFund, taxExemptAllowances) {
            const ctx = document.getElementById('salaryChart').getContext('2d');
            
            if (salaryChart) {
                salaryChart.destroy();
            }
            
            salaryChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: [
                        translations[currentLang].chartNet,
                        translations[currentLang].chartIncomeTax,
                        translations[currentLang].chartSI,
                        translations[currentLang].chartMartyrs,
                        translations[currentLang].chartAllowances
                    ],
                    datasets: [{
                        data: [net, incomeTax, siEmployee, martyrsFund, taxExemptAllowances],
                        backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',   // Green
                            'rgba(239, 68, 68, 0.8)',   // Red
                            'rgba(59, 130, 246, 0.8)',  // Blue
                            'rgba(168, 85, 247, 0.8)',  // Purple
                            'rgba(234, 179, 8, 0.8)'    // Yellow
                        ],
                        borderColor: [
                            'rgba(34, 197, 94, 1)',
                            'rgba(239, 68, 68, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(168, 85, 247, 1)',
                            'rgba(234, 179, 8, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: 'Cairo',
                                    size: 13,
                                    weight: '600'
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = fmtC(context.parsed);
                                    let percentage = 0;
                                    if(gross > 0) percentage = ((context.parsed / gross) * 100).toFixed(1);
                                    return `${label}: USD ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Keep chart colors updated if theme changes while running
        themeToggleBtn.addEventListener('click', () => {
            if(salaryChart) {
                salaryChart.options.color = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
                salaryChart.update();
            }
        });
        
        function resetForm() {
            document.getElementById('employeeName').value = '';
            document.getElementById('taxPersona').value = 'Regular Employee';
            document.getElementById('insuranceStatus').value = 'insured';
            document.getElementById('roleType').value = 'Employee';
            document.getElementById('taxTreatment').value = 'us';
            document.getElementById('targetNetUSD').value = '';
            document.getElementById('usdRate').value = '';
            
            // Hidden fields
            document.getElementById('basicSalaryUSD').value = '0';
            document.getElementById('allowancesEGP').value = '0';
            document.getElementById('workingPeriod').value = '1';
            
            // Clear Chart
            if (salaryChart) {
                salaryChart.destroy();
                salaryChart = null;
            }

            // Clear Table
            document.getElementById('resultsContainer').innerHTML = `
                <div class="text-center py-4 text-gray-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
                    <i class="ph-light ph-table text-4xl"></i>
                    <span data-i18n="emptyTable" class="text-sm">${translations[currentLang].emptyTable}</span>
                </div>
            `;
        }

        function renderTable(d, inputs, iterations) {
            const usdRate = d.K;
            const usdGross = d.O / usdRate;
            const usdSI = d.R / usdRate;
            const usdTax = d.X / usdRate;
            const usdMartyrs = d.Y / usdRate;
            const usdNet = d.AB; // d.Z / usdRate

            const rowClass = "flex justify-between items-center py-2 px-4 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors";

            const tableHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                    
                    <!-- USD Section -->
                    <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div class="bg-indigo-50 dark:bg-indigo-900/40 px-4 py-3 font-bold text-indigo-800 dark:text-indigo-300 border-b border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                            <i class="ph-bold ph-currency-dollar text-xl"></i> ${translations[currentLang].usdTitle}
                        </div>
                        <div class="flex flex-col text-sm">
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].grossSalary}</span>
                                <span class="font-mono font-bold text-gray-900 dark:text-white">${fmtC(usdGross)}</span>
                            </div>
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].employeeSI}</span>
                                <span class="font-mono text-red-600 dark:text-red-400">-${fmtC(usdSI)}</span>
                            </div>
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].salaryTax}</span>
                                <span class="font-mono text-red-600 dark:text-red-400">-${fmtC(usdTax)}</span>
                            </div>
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].martyrsFund}</span>
                                <span class="font-mono text-red-600 dark:text-red-400">-${fmtC(usdMartyrs)}</span>
                            </div>
                            <div class="${rowClass} bg-indigo-50/30 dark:bg-indigo-900/20 border-b-0">
                                <span class="font-bold text-indigo-700 dark:text-indigo-300">${translations[currentLang].netSalary}</span>
                                <span class="font-mono font-black text-indigo-700 dark:text-indigo-400">${fmtC(usdNet)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- EGP Section -->
                    <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div class="bg-emerald-50 dark:bg-emerald-900/40 px-4 py-3 font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                            <i class="ph-bold ph-coins text-xl"></i> ${translations[currentLang].egpTitle}
                        </div>
                        <div class="flex flex-col text-sm">
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].grossSalary}</span>
                                <span class="font-mono font-bold text-gray-900 dark:text-white">${fmtC(d.O)}</span>
                            </div>
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].employeeSI}</span>
                                <span class="font-mono text-red-600 dark:text-red-400">-${fmtC(d.R)}</span>
                            </div>
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].salaryTax}</span>
                                <span class="font-mono text-red-600 dark:text-red-400">-${fmtC(d.X)}</span>
                            </div>
                            <div class="${rowClass}">
                                <span class="font-semibold text-gray-700 dark:text-slate-300">${translations[currentLang].martyrsFund}</span>
                                <span class="font-mono text-red-600 dark:text-red-400">-${fmtC(d.Y)}</span>
                            </div>
                            <div class="${rowClass} bg-emerald-50/30 dark:bg-emerald-900/20 border-b-0">
                                <span class="font-bold text-emerald-700 dark:text-emerald-300">${translations[currentLang].netSalary}</span>
                                <span class="font-mono font-black text-emerald-700 dark:text-emerald-400">${fmtC(d.Z)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            `;

            document.getElementById('resultsContainer').innerHTML = tableHtml;
            document.getElementById('resultEmployeeName').textContent = d.name || '';
            document.getElementById('pdfBtn').classList.remove('hidden');
        }

        // Store last calculated data for PDF
        let lastCalcData = null;
        const origRenderTable = renderTable;
        renderTable = function(d, inputs, iterations) {
            lastCalcData = { d, inputs };
            origRenderTable(d, inputs, iterations);
        };

        // Preload logos as base64 on page load
        let preloadedLogoIconic = '';
        let preloadedLogoNpi = '';

        function preloadLogos() {
            function loadAsBase64(src) {
                return new Promise((resolve) => {
                    const img = new Image();
                    if (window.location.protocol.startsWith('http')) {
                        img.crossOrigin = 'anonymous';
                    }
                    img.onload = () => {
                        try {
                            const c = document.createElement('canvas');
                            c.width = img.naturalWidth;
                            c.height = img.naturalHeight;
                            c.getContext('2d').drawImage(img, 0, 0);
                            resolve(c.toDataURL('image/png'));
                        } catch(e) { resolve(''); }
                    };
                    img.onerror = () => resolve('');
                    img.src = src;
                });
            }
            loadAsBase64('iconic-logo.png').then(d => preloadedLogoIconic = d);
            loadAsBase64('npi-logo.png').then(d => preloadedLogoNpi = d);
        }

        function generatePDF() {
            if (!lastCalcData) return;
            const { d } = lastCalcData;
            const usdRate = d.K;
            const name = d.name || '';
            const t = translations[currentLang];
            const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
            const align = dir === 'rtl' ? 'left' : 'right';
            const dateStr = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { year:'numeric', month:'long', day:'numeric' });

            const usdGross = d.O / usdRate;
            const usdSI = d.R / usdRate;
            const usdTax = d.X / usdRate;
            const usdMartyrs = d.Y / usdRate;
            const usdNet = d.AB;

            // Chart image
            let chartImg = '';
            const canvas = document.getElementById('salaryChart');
            if (canvas) chartImg = canvas.toDataURL('image/png');

            // Logos
            const getAbsUrl = (path) => new URL(path, document.baseURI).href;
            const logo1Src = preloadedLogoIconic || getAbsUrl('iconic-logo.png');
            const logo2Src = preloadedLogoNpi || getAbsUrl('npi-logo.png');
            const logoLHtml = `<img src="${logo1Src}" style="height:50px; object-fit:contain;"/>`;
            const logoRHtml = `<img src="${logo2Src}" style="height:50px; object-fit:contain;"/>`;

            // Build row
            const row = (label, val, cur, isRed, isBold, bgColor) => `
                <tr style="background:${bgColor || '#fff'}">
                    <td style="padding:8px 14px;border-bottom:1px solid #eee;font-weight:${isBold?'800':'600'};color:#333;font-size:${isBold?'14px':'12px'}">${label}</td>
                    <td style="padding:8px 14px;border-bottom:1px solid #eee;text-align:${align};font-family:Consolas,monospace;color:${isRed?'#dc2626':(isBold?'#4338ca':'#333')};font-weight:${isBold?'900':'500'};font-size:${isBold?'14px':'12px'}">${isRed?'-':''}${fmtC(val)} ${cur}</td>
                </tr>`;

            // Build card
            const makeCard = (title, headerBg, titleColor, rows) => `
                <table style="width:100%;border:1px solid #ddd;border-collapse:collapse;margin-bottom:12px">
                    <tr><td colspan="2" style="background:${headerBg};padding:10px 14px;font-weight:800;font-size:13px;color:${titleColor};border-bottom:1px solid #ddd">${title}</td></tr>
                    ${rows}
                </table>`;

            const usdCard = makeCard(t.usdTitle, '#eef2ff', '#312e81', [
                row(t.grossSalary, usdGross, 'USD', false, false, null),
                row(t.employeeSI, usdSI, 'USD', true, false, null),
                row(t.salaryTax, usdTax, 'USD', true, false, null),
                row(t.martyrsFund, usdMartyrs, 'USD', true, false, null),
                row(t.netSalary, usdNet, 'USD', false, true, '#eef2ff'),
            ].join(''));

            const egpCard = makeCard(t.egpTitle, '#ecfdf5', '#064e3b', [
                row(t.grossSalary, d.O, 'EGP', false, false, null),
                row(t.employeeSI, d.R, 'EGP', true, false, null),
                row(t.salaryTax, d.X, 'EGP', true, false, null),
                row(t.martyrsFund, d.Y, 'EGP', true, false, null),
                row(t.netSalary, d.Z, 'EGP', false, true, '#ecfdf5'),
            ].join(''));

            const fullPage = `<!DOCTYPE html>
<html lang="${currentLang}" dir="${dir}">
<head>
    <meta charset="UTF-8">
    <title>GrossingUp_${name || 'Report'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', Arial, sans-serif; color: #333; background: #fff; padding: 30px 40px; direction: ${dir}; }
        @media print {
            body { padding: 20px 30px; }
            @page { size: A4; margin: 15mm; }
        }
    </style>
</head>
<body>
    <!-- Accent bar -->
    <div style="height:5px;background:#7c3aed;margin-bottom:20px"></div>

    <!-- Header -->
    <table style="width:100%;margin-bottom:18px">
        <tr>
            <td style="width:80px;text-align:center;vertical-align:middle">${logoLHtml}</td>
            <td style="text-align:center;vertical-align:middle">
                <div style="font-size:20px;font-weight:900;color:#6b21a8;margin-bottom:3px">Grossing Up Calculator</div>
                <div style="font-size:12px;color:#888">${t.result} <b style="color:#7c3aed">${name}</b></div>
                <div style="font-size:10px;color:#7c3aed;margin-top:3px">${dateStr}</div>
            </td>
            <td style="width:80px;text-align:center;vertical-align:middle">${logoRHtml}</td>
        </tr>
    </table>

    <hr style="border:none;border-top:1px solid #eee;margin-bottom:16px">

    <!-- Cards -->
    <table style="width:100%">
        <tr>
            <td style="width:50%;vertical-align:top;padding-${dir==='rtl'?'left':'right'}:6px">${usdCard}</td>
            <td style="width:50%;vertical-align:top;padding-${dir==='rtl'?'right':'left'}:6px">${egpCard}</td>
        </tr>
    </table>

    ${chartImg ? `
    <div style="text-align:center;margin:16px 0 8px">
        <div style="font-size:11px;color:#888;margin-bottom:6px">${t.salaryBreakdown}</div>
        <img src="${chartImg}" style="width:260px"/>
    </div>` : ''}

    <!-- Footer -->
    <div style="border-top:1px solid #eee;margin-top:14px;padding-top:10px;text-align:center">
        <div style="font-size:9px;color:#7c3aed;font-weight:600;margin-bottom:2px">${t.footerText}</div>
        <div style="font-size:8px;color:#aaa">${dateStr}</div>
    </div>
</body>
</html>`;

            // Open in new window and trigger print (Save as PDF)
            const printWindow = window.open('', '_blank', 'width=800,height=900');
            printWindow.document.write(fullPage);
            printWindow.document.close();
            
            // Wait for fonts and images to load then print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 800);
            };
        }

        // Run default values on startup
        window.addEventListener('load', () => {
            preloadLogos();
            resetForm();
        });
    