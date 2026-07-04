// ═══════════════════════════════════════════════════════════
// Vulnerability Verifier – Ejecucion automatica
// ═══════════════════════════════════════════════════════════
(function(){
    var out = document.getElementById('output');
    if (out) out.innerHTML = '<div class="log-entry success">[INIT] JavaScript cargado correctamente.</div>';
})();

// ─── Utilidades ──────────────────────────────────────────
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
        out.scrollTop = out.scrollHeight;
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

// ─── TestHarness ─────────────────────────────────────────
function TestHarness(testName) {
    this.testName = testName;
    this.results = { passed: 0, failed: 0, anomalies: [] };
    this.startTime = Date.now();
}
TestHarness.prototype.assert = function(condition, description, isPositive) {
    if (isPositive === undefined) isPositive = true;
    if (condition) {
        this.results.passed++;
        console.log('[' + this.testName + '] \u2713 ' + description);
    } else {
        this.results.failed++;
        var msg = '[' + this.testName + '] \u2717 ' + description + (isPositive ? ' (esperado positivo)' : ' (esperado negativo)');
        console.warn(msg);
        this.results.anomalies.push(description);
    }
};
TestHarness.prototype.positiveCheck = function(cond, desc) { this.assert(cond, desc, true); };
TestHarness.prototype.negativeCheck = function(cond, desc) { this.assert(!cond, desc, false); };
TestHarness.prototype.logInfo = function(msg) { console.log('[' + this.testName + '] \u2139 ' + msg); };
TestHarness.prototype.finish = function() {
    var elapsed = Date.now() - this.startTime;
    console.log('[' + this.testName + '] === Resultado: ' + this.results.passed + ' pasaron, ' + this.results.failed + ' fallaron. Tiempo: ' + elapsed + 'ms ===');
    if (this.results.anomalies.length > 0) {
        console.warn('[' + this.testName + '] Fallos detectados:');
        for (var i = 0; i < this.results.anomalies.length; i++) console.warn('[' + this.testName + ']   - ' + this.results.anomalies[i]);
    } else {
        console.log('[' + this.testName + '] Todos los controles pasaron correctamente.');
    }
    console.log('****************************************');
    return this.results;
};

// ═══════════════════════════════════════════════════════════
// DETECCION DE PLATAFORMA
// ═══════════════════════════════════════════════════════════
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
        platform = 'PlayStation 4';
        var fwMatch = ua.match(/PlayStation 4[\/ ]([0-9]+\.[0-9]+)/);
        firmware = fwMatch ? fwMatch[1] : 'Desconocido';
        browser = 'Sony WebKit Browser';
        var wkMatch = ua.match(/AppleWebKit\/([0-9]+(?:\.[0-9]+)+)/);
        webkit = wkMatch ? 'WebKit ' + wkMatch[1] : 'WebKit (PS4)';
    } else if (isPS5 && (isPSPlatform || hasSce)) {
        platform = 'PlayStation 5';
        var fwMatch5 = ua.match(/PlayStation 5[\/ ]([0-9]+\.[0-9]+)/);
        firmware = fwMatch5 ? fwMatch5[1] : 'Desconocido';
        browser = 'Sony WebKit Browser';
        var wkMatch5 = ua.match(/AppleWebKit\/([0-9]+(?:\.[0-9]+)+)/);
        webkit = wkMatch5 ? 'WebKit ' + wkMatch5[1] : 'WebKit (PS5)';
    } else {
        if (/Windows NT/.test(ua)) platform = 'Windows PC';
        else if (/Macintosh/.test(ua)) platform = 'macOS';
        else if (/Linux/.test(ua) && !/Android/.test(ua)) platform = 'Linux PC';
        else platform = 'Desktop (unknown)';

        if (/Edg\//.test(ua)) browser = 'Edge';
        else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'Chrome';
        else if (/Firefox\//.test(ua)) browser = 'Firefox';
        else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';
        else browser = 'Other';

        var wkMatch2 = ua.match(/AppleWebKit\/([0-9]+(?:\.[0-9]+)+)/);
        webkit = wkMatch2 ? 'WebKit ' + wkMatch2[1] : 'No detectado';
        firmware = 'N/A (PC)';
    }

    document.getElementById('dtPlat').textContent = platform;
    document.getElementById('dtFW').textContent = firmware;
    document.getElementById('dtBrowser').textContent = browser;
    document.getElementById('dtWebKit').textContent = webkit;
    document.getElementById('dtLang').textContent = lang;

    console.log('[DETECTION] Platform: ' + platform + ', Firmware: ' + firmware + ', Browser: ' + browser + ', WebKit: ' + webkit + ', Lang: ' + lang);
    return { platform: platform, firmware: firmware, browser: browser, webkit: webkit, lang: lang };
}

// ═══════════════════════════════════════════════════════════
// VERIFICACION DE COMPONENTES
// ═══════════════════════════════════════════════════════════
function runComponentCheck() {
    console.log('\n=== VERIFICACION DE COMPONENTES ===');
    var allOk = true;

    function check(name, cond) {
        if (cond) {
            console.log('[COMP] \u2713 ' + name + ': OK');
        } else {
            console.warn('[COMP] \u2717 ' + name + ': FALLO');
            allOk = false;
        }
    }

    check('Worker', typeof Worker !== 'undefined');
    check('MessageChannel', typeof MessageChannel !== 'undefined');
    check('Blob', typeof Blob !== 'undefined');
    check('URL.createObjectURL', typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function');
    check('Float64Array', typeof Float64Array !== 'undefined');
    check('Uint32Array', typeof Uint32Array !== 'undefined');
    check('ArrayBuffer', typeof ArrayBuffer !== 'undefined');
    check('MutationObserver', typeof MutationObserver !== 'undefined');

    // GC87 test
    var gcOk = false;
    try {
        for (var i = 0; i < 1000; i++) new ArrayBuffer(1024 * 1024);
        gcOk = true;
    } catch(e) {}
    check('GC87% (1000 x 1MB)', gcOk);

    // postMessage basico
    var pmOk = false;
    try {
        var testIframe = document.createElement('iframe');
        testIframe.src = 'about:blank';
        document.body.appendChild(testIframe);
        testIframe.contentWindow.postMessage({test:1}, '*');
        document.body.removeChild(testIframe);
        pmOk = true;
    } catch(e) {}
    check('postMessage basico', pmOk);

    // getter en objeto
    var getterOk = true;
    try {
        var obj = { get x() { return 1; } };
        if (obj.x !== 1) getterOk = false;
    } catch(e) { getterOk = false; }
    check('Getters', getterOk);

    if (allOk) {
        console.log('[COMP] Todos los componentes estan listos.');
    } else {
        console.error('[COMP] Faltan componentes necesarios. Pruebas abortadas.');
    }
    console.log('=== FIN VERIFICACION DE COMPONENTES ===\n');
    return allOk;
}

// ═══════════════════════════════════════════════════════════
// VULNERABILIDAD DOM 1: Ciclos en postMessage
// ═══════════════════════════════════════════════════════════
function testVulnDOM1(callback) {
    var h = new TestHarness('VULN_DOM1');
    console.log('[VULN_DOM1] Vulnerabilidad DOM: Mantenimiento de referencias circulares a traves de postMessage');

    var iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    var circ = { a: 1, b: { c: 2 } };
    circ.b.self = circ;

    var threw = false;
    try {
        iframe.contentWindow.postMessage(circ, '*');
    } catch(e) { threw = true; }

    h.positiveCheck(!threw, 'postMessage con objeto circular no lanza excepcion (anomalia)');

    var received = null;
    iframe.contentWindow.addEventListener('message', function(e) { received = e.data; });
    iframe.contentWindow.postMessage(circ, '*');

    setTimeout(function() {
        if (received) {
            h.positiveCheck(true, 'El objeto circular fue recibido en el destino');
            var isCirc = (received.b && received.b.self === received);
            if (isCirc) {
                h.positiveCheck(true, 'La referencia circular se mantiene intacta en el destino (confirmacion)');
            } else {
                h.positiveCheck(false, 'La referencia circular se perdio en el destino');
            }
        } else {
            h.positiveCheck(false, 'No se recibio el mensaje en el destino');
        }
        document.body.removeChild(iframe);
        callback(h.finish());
    }, 1500);
}

// ═══════════════════════════════════════════════════════════
// VULNERABILIDAD DOM 2: Ejecucion de codigo via getter en clonado
// ═══════════════════════════════════════════════════════════
function testVulnDOM2(callback) {
    var h = new TestHarness('VULN_DOM2');
    console.log('[VULN_DOM2] Vulnerabilidad DOM: Ejecucion de codigo mediante getters durante el clonado');

    var iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    var divId = 'getter_vuln_test_' + Date.now();
    var obj = {
        get x() {
            var d = document.createElement('div');
            d.id = divId;
            document.body.appendChild(d);
            return 1;
        }
    };

    var threw = false;
    try {
        iframe.contentWindow.postMessage(obj, '*');
    } catch(e) { threw = true; }

    h.positiveCheck(!threw, 'postMessage con getter no lanza excepcion (el getter se ejecuta)');

    var addedDiv = document.getElementById(divId);
    h.positiveCheck(addedDiv !== null, 'El getter modifico el DOM (elemento creado)');

    if (addedDiv) addedDiv.parentNode.removeChild(addedDiv);
    document.body.removeChild(iframe);

    callback(h.finish());
}

// ═══════════════════════════════════════════════════════════
// VULNERABILIDAD LLInt: OOB en array con longitud inflada
// ═══════════════════════════════════════════════════════════
function testVulnLLInt(callback) {
    var h = new TestHarness('VULN_LLINT');
    console.log('[VULN_LLINT] Vulnerabilidad LLInt: Escritura/Lectura fuera de limites en arrays');

    var arr = [1.1, 2.2, 3.3, 4.4];

    try {
        arr.length = 0xFFFFFFFF;
        h.positiveCheck(arr.length === 0xFFFFFFFF, 'Longitud del array inflada a 0xFFFFFFFF');
    } catch(e) {
        h.positiveCheck(false, 'Fallo al inflar longitud del array: ' + e.message);
        callback(h.finish());
        return;
    }

    var testValue = 1337.1337;
    var testIndex = 0xFFFF0000;
    try {
        arr[testIndex] = testValue;
        h.positiveCheck(true, 'Escritura OOB en indice 0xFFFF0000 sin excepcion');
    } catch(e) {
        h.positiveCheck(false, 'Fallo en escritura OOB: ' + e.message);
    }

    try {
        var readValue = arr[testIndex];
        if (readValue === testValue) {
            h.positiveCheck(true, 'Lectura OOB exitosa: el valor escrito se recupera correctamente (anomalia confirmada)');
        } else {
            h.positiveCheck(false, 'Lectura OOB incorrecta: se esperaba ' + testValue + ' pero se obtuvo ' + readValue);
        }
    } catch(e) {
        h.positiveCheck(false, 'Fallo en lectura OOB: ' + e.message);
    }

    h.positiveCheck(arr[0] === 1.1, 'El primer elemento del array sigue intacto');
    h.positiveCheck(arr.length === 0xFFFFFFFF, 'La longitud inflada se mantiene');

    callback(h.finish());
}

// ═══════════════════════════════════════════════════════════
// ORQUESTADOR AUTOMATICO
// ═══════════════════════════════════════════════════════════
function showSummary(results) {
    var summaryDiv = document.getElementById('summary');
    var contentDiv = document.getElementById('summaryContent');
    if (!summaryDiv || !contentDiv) return;
    summaryDiv.style.display = 'block';
    var html = '';
    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var status = (r.failed === 0) ? 'PASO' : 'FALLO';
        html += '<div class="log-entry ' + (r.failed === 0 ? 'success' : 'warn') + '">' +
                r.testName + ': ' + r.passed + ' pasaron, ' + r.failed + ' fallaron. ' +
                (r.anomalies.length > 0 ? ' Anomalias: ' + r.anomalies.join(', ') : '') +
                '</div>';
    }
    contentDiv.innerHTML = html;
}

function runAll() {
    console.log('[INIT] Iniciando secuencia automatica de verificacion...');

    // 1. Detectar plataforma
    detectPlatform();

    // 2. Verificar componentes
    var compOk = runComponentCheck();
    if (!compOk) {
        console.error('[FATAL] Componentes insuficientes. Pruebas abortadas.');
        return;
    }

    // 3. Ejecutar pruebas de vulnerabilidad en secuencia
    var results = [];
    var vulnOrder = [
        { name: 'VULN_DOM1', fn: testVulnDOM1 },
        { name: 'VULN_DOM2', fn: testVulnDOM2 },
        { name: 'VULN_LLINT', fn: testVulnLLInt }
    ];
    var idx = 0;

    function next() {
        if (idx >= vulnOrder.length) {
            console.log('[DONE] Todas las pruebas de vulnerabilidad completadas.');
            showSummary(results);
            return;
        }
        var vuln = vulnOrder[idx];
        console.log('\n=== INICIANDO TEST: ' + vuln.name + ' ===');
        vuln.fn(function(res) {
            results.push({ testName: vuln.name, passed: res.passed, failed: res.failed, anomalies: res.anomalies });
            console.log('=== FIN TEST: ' + vuln.name + ' ===\n');
            idx++;
            setTimeout(next, 1000);
        });
    }
    next();
}

// Arranque automatico al cargar la pagina
window.addEventListener('load', function() {
    console.log('[INIT] Vulnerability Verifier listo');
    setTimeout(runAll, 500);
});
