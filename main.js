// ═══════════════════════════════════════════════════════════
// Vulnerability Verifier – Compacto automático v2
// ═══════════════════════════════════════════════════════════
(function(){
    var out = document.getElementById('output');
    if (out) out.innerHTML = '<div class="log-entry success">[INIT] JavaScript cargado correctamente.</div>';
})();

function safeStr(v) {
    try { if (v === null) return 'null'; if (v === undefined) return 'undefined'; return String(v); } catch (e) { return '[no convertible]'; }
}

function remoteLog(level, message, extra) {
    extra = extra || {};
    var payload = { timestamp: new Date().toISOString(), level: level, message: message, extra: extra, userAgent: navigator.userAgent, url: location.href };
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/log', false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
    } catch(e) {}
    var out = document.getElementById('output');
    if (out) {
        var entry = document.createElement('div');
        entry.className = 'log-entry ' + level;
        entry.textContent = '[' + level.toUpperCase() + '] ' + message;
        out.appendChild(entry);
        window.scrollTo(0, document.body.scrollHeight);
    }
}

(function(){
    var origLog = console.log, origWarn = console.warn, origError = console.error;
    console.log = function(){ origLog.apply(console, arguments); remoteLog('info', Array.prototype.map.call(arguments, safeStr).join(' ')); };
    console.warn = function(){ origWarn.apply(console, arguments); remoteLog('warn', Array.prototype.map.call(arguments, safeStr).join(' ')); };
    console.error = function(){ origError.apply(console, arguments); remoteLog('error', Array.prototype.map.call(arguments, safeStr).join(' ')); };
})();

window.onerror = function(msg, url, line, col, err) {
    remoteLog('error', 'Unhandled: ' + msg + ' at line ' + line, {stack: err ? err.stack : ''});
    return true;
};

// ─── TestHarness sin impresiones internas ─────────────────
function TestHarness(testName) {
    this.testName = testName;
    this.results = { passed: 0, failed: 0, anomalies: [] };
    this.testDescriptions = [];
    this.startTime = Date.now();
}
TestHarness.prototype.assert = function(condition, description, isPositive) {
    if (isPositive === undefined) isPositive = true;
    this.testDescriptions.push(description);
    if (condition) {
        this.results.passed++;
    } else {
        this.results.failed++;
        this.results.anomalies.push(description);
    }
};
TestHarness.prototype.positiveCheck = function(cond, desc) { this.assert(cond, desc, true); };
TestHarness.prototype.negativeCheck = function(cond, desc) { this.assert(!cond, desc, false); };
TestHarness.prototype.logInfo = function(msg) { /* ya no imprime */ };
TestHarness.prototype.finish = function() {
    var elapsed = Date.now() - this.startTime;
    return { results: this.results, elapsed: elapsed, descriptions: this.testDescriptions };
};

// ─── Utilidades ──────────────────────────────────────────
function makeProgress(descriptions) {
    if (descriptions.length === 0) return 'Test 1 probando.';
    var nums = [];
    for (var i = 0; i < descriptions.length; i++) {
        nums.push('Test ' + (i+1));
    }
    return nums.join(', ') + ' probando.';
}

function printVulnResult(vulnLabel, vulnName, finishResult) {
    var status = (finishResult.results.failed === 0) ? 'OK' : 'FALLO';
    var errors = finishResult.results.anomalies.length > 0 ? finishResult.results.anomalies.join(', ') : 'NULL';
    var elapsed = finishResult.elapsed;
    console.log('Vulnerabilidad en ' + vulnLabel + ' - ' + vulnName + ': Fallo presente ' + status + '. Errores ' + errors + '. Tiempo: ' + elapsed + 'ms');
}

// ─── Detección de plataforma ────────────────────────────
function detectPlatform() {
    var ua = navigator.userAgent;
    var platform = 'PC (unknown)';
    var firmware = 'N/A';
    var browser = 'Unknown';
    var webkit = 'Unknown';
    var lang = navigator.language || 'en-US';

    var isPS4 = /PlayStation 4/i.test(ua);
    var isPS5 = /PlayStation 5/i.test(ua);
    var isPSPlatform = navigator.platform === 'PlayStation 4' || navigator.platform === 'PlayStation 5';
    var hasSce = typeof window.sce !== 'undefined';

    if (isPS4 && (isPSPlatform || hasSce)) {
        platform = 'PS4';
        var fwMatch = ua.match(/PlayStation 4[\/ ]([0-9]+\.[0-9]+)/);
        firmware = fwMatch ? fwMatch[1] : '?';
        browser = 'Sony WebKit';
        var wkMatch = ua.match(/AppleWebKit\/([0-9]+(?:\.[0-9]+)+)/);
        webkit = wkMatch ? 'WK ' + wkMatch[1] : 'WK ?';
    } else if (isPS5 && (isPSPlatform || hasSce)) {
        platform = 'PS5';
        var fwMatch5 = ua.match(/PlayStation 5[\/ ]([0-9]+\.[0-9]+)/);
        firmware = fwMatch5 ? fwMatch5[1] : '?';
        browser = 'Sony WebKit';
        var wkMatch5 = ua.match(/AppleWebKit\/([0-9]+(?:\.[0-9]+)+)/);
        webkit = wkMatch5 ? 'WK ' + wkMatch5[1] : 'WK ?';
    } else {
        if (/Windows NT/.test(ua)) platform = 'Win';
        else if (/Macintosh/.test(ua)) platform = 'Mac';
        else if (/Linux/.test(ua) && !/Android/.test(ua)) platform = 'Linux';
        else platform = 'PC';

        if (/Edg\//.test(ua)) browser = 'Edge';
        else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'Chrome';
        else if (/Firefox\//.test(ua)) browser = 'Firefox';
        else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';
        else browser = 'Other';

        var wkMatch2 = ua.match(/AppleWebKit\/([0-9]+(?:\.[0-9]+)+)/);
        webkit = wkMatch2 ? 'WK ' + wkMatch2[1] : '-';
        firmware = 'N/A';
    }

    document.getElementById('dtPlat').textContent = platform;
    document.getElementById('dtFW').textContent = firmware;
    document.getElementById('dtBrowser').textContent = browser;
    document.getElementById('dtWebKit').textContent = webkit;
    document.getElementById('dtLang').textContent = lang;

    console.log('[DETECTION] ' + platform + ' | FW: ' + firmware + ' | ' + browser + ' | ' + webkit + ' | ' + lang);
    return { platform: platform, firmware: firmware, browser: browser, webkit: webkit, lang: lang };
}

// ─── Componentes (resumido) ─────────────────────────────
function runComponentCheck() {
    var total = 0, ok = 0;
    function check(cond) { total++; if (cond) ok++; }

    check(typeof Worker !== 'undefined');
    check(typeof MessageChannel !== 'undefined');
    check(typeof Blob !== 'undefined');
    check(typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function');
    check(typeof Float64Array !== 'undefined');
    check(typeof Uint32Array !== 'undefined');
    check(typeof ArrayBuffer !== 'undefined');
    check(typeof MutationObserver !== 'undefined');

    var gcOk = false;
    try { for (var i = 0; i < 1000; i++) new ArrayBuffer(1024 * 1024); gcOk = true; } catch(e) {}
    check(gcOk);

    var pmOk = false;
    try {
        var testIframe = document.createElement('iframe');
        testIframe.src = 'about:blank';
        document.body.appendChild(testIframe);
        testIframe.contentWindow.postMessage({test:1}, '*');
        document.body.removeChild(testIframe);
        pmOk = true;
    } catch(e) {}
    check(pmOk);

    var getterOk = true;
    try {
        var obj = { get x() { return 1; } };
        if (obj.x !== 1) getterOk = false;
    } catch(e) { getterOk = false; }
    check(getterOk);

    if (ok === total) {
        console.log('[COMP] ' + ok + '/' + total + ' componentes OK');
    } else {
        console.error('[COMP] ' + ok + '/' + total + ' componentes – Faltan ' + (total - ok));
    }
    return ok === total;
}

// ─── Pruebas de vulnerabilidad ──────────────────────────

// DOM1
function testVulnDOM1(callback) {
    var h = new TestHarness('DOM1');
    var iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    var circ = { a: 1, b: { c: 2 } };
    circ.b.self = circ;

    var threw = false;
    try { iframe.contentWindow.postMessage(circ, '*'); } catch(e) { threw = true; }
    h.positiveCheck(!threw, 'No lanza excepción (anomalía)');

    var received = null;
    iframe.contentWindow.addEventListener('message', function(e) { received = e.data; });
    iframe.contentWindow.postMessage(circ, '*');

    setTimeout(function() {
        if (received) {
            h.positiveCheck(true, 'Recibido en destino');
            var isCirc = (received.b && received.b.self === received);
            if (isCirc) {
                h.positiveCheck(true, 'Ciclo intacto en destino');
            } else {
                h.positiveCheck(false, 'Ciclo perdido en destino');
            }
        } else {
            h.positiveCheck(false, 'No recibido');
        }
        document.body.removeChild(iframe);
        var finishResult = h.finish();
        console.log(makeProgress(finishResult.descriptions));
        printVulnResult('DOM', 'Mantenimiento de referencias circulares (postMessage)', finishResult);
        callback(finishResult);
    }, 1500);
}

// DOM2
function testVulnDOM2(callback) {
    var h = new TestHarness('DOM2');
    var iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    var divId = 'getter_vuln_test_' + Date.now();
    var obj = { get x() { var d = document.createElement('div'); d.id = divId; document.body.appendChild(d); return 1; } };

    var threw = false;
    try { iframe.contentWindow.postMessage(obj, '*'); } catch(e) { threw = true; }
    h.positiveCheck(!threw, 'No lanza excepción');
    h.positiveCheck(document.getElementById(divId) !== null, 'DOM modificado');

    var el = document.getElementById(divId);
    if (el) el.parentNode.removeChild(el);
    document.body.removeChild(iframe);

    var finishResult = h.finish();
    console.log(makeProgress(finishResult.descriptions));
    printVulnResult('DOM', 'Ejecución de getters durante clonado', finishResult);
    callback(finishResult);
}

// LLInt
function testVulnLLInt(callback) {
    var h = new TestHarness('LLINT');
    var arr = [1.1, 2.2, 3.3, 4.4];

    try {
        arr.length = 0xFFFFFFFF;
        h.positiveCheck(arr.length === 0xFFFFFFFF, 'Longitud inflada');
    } catch(e) {
        h.positiveCheck(false, 'Fallo al inflar');
        var finishResult1 = h.finish();
        console.log(makeProgress(finishResult1.descriptions));
        printVulnResult('LLInt', 'Escritura/Lectura OOB en array inflado', finishResult1);
        callback(finishResult1);
        return;
    }

    var testValue = 1337.1337;
    var testIndex = 0xFFFF0000;
    try { arr[testIndex] = testValue; h.positiveCheck(true, 'Escritura OOB'); } catch(e) { h.positiveCheck(false, 'Fallo escritura'); }
    try {
        var readValue = arr[testIndex];
        h.positiveCheck(readValue === testValue, 'Lectura OOB correcta (anomalía)');
    } catch(e) { h.positiveCheck(false, 'Fallo lectura'); }

    h.positiveCheck(arr[0] === 1.1, 'Array intacto');
    h.positiveCheck(arr.length === 0xFFFFFFFF, 'Longitud preservada');

    var finishResult = h.finish();
    console.log(makeProgress(finishResult.descriptions));
    printVulnResult('LLInt', 'Escritura/Lectura OOB en array inflado', finishResult);
    callback(finishResult);
}

// ─── Resumen final ─────────────────────────────────────
function showSummary(results) {
    var summaryDiv = document.getElementById('summary');
    var contentDiv = document.getElementById('summaryContent');
    if (!summaryDiv || !contentDiv) return;
    summaryDiv.style.display = 'block';
    var html = '';
    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        html += '<div class="log-entry ' + (r.failed ? 'warn' : 'success') + '">' + r.line + '</div>';
    }
    contentDiv.innerHTML = html;
}

// ─── Orquestador ────────────────────────────────────────
function runAll() {
    console.log('[INIT] Secuencia automática...');
    detectPlatform();
    var compOk = runComponentCheck();
    if (!compOk) {
        console.error('[FATAL] Componentes faltantes. Abortando.');
        return;
    }

    var summaryLines = [];
    var vulns = [
        { name: 'Mantenimiento de referencias circulares (postMessage)', fn: testVulnDOM1, label: 'DOM' },
        { name: 'Ejecución de getters durante clonado', fn: testVulnDOM2, label: 'DOM' },
        { name: 'Escritura/Lectura OOB en array inflado', fn: testVulnLLInt, label: 'LLInt' }
    ];
    var idx = 0;

    function next() {
        if (idx >= vulns.length) {
            console.log('[DONE] Pruebas completadas.');
            showSummary(summaryLines);
            return;
        }
        var vuln = vulns[idx];
        console.log('\n=== INICIANDO ' + vuln.name + ' ===');
        vuln.fn(function(finishResult) {
            // La línea de resultado ya se ha impreso en la consola; la guardamos para el panel de resumen
            var status = (finishResult.results.failed === 0) ? 'OK' : 'FALLO';
            var errors = finishResult.results.anomalies.length > 0 ? finishResult.results.anomalies.join(', ') : 'NULL';
            var line = 'Vulnerabilidad en ' + vuln.label + ' - ' + vuln.name + ': Fallo presente ' + status + '. Errores ' + errors + '. Tiempo: ' + finishResult.elapsed + 'ms';
            summaryLines.push({ line: line, failed: finishResult.results.failed > 0 });
            idx++;
            setTimeout(next, 1000);
        });
    }
    next();
}

window.addEventListener('load', function() {
    console.log('[INIT] Verificador listo');
    setTimeout(runAll, 500);
});