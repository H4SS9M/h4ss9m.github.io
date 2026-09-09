// ps4_offsets.js — polpNO firmware offset table
// Supports: 9.00 → 13.04
// Sources:
//   11.00-13.00 : verified on hardware (original polpNO)
//   13.02       : kernel RVAs from Scene-Collective/ps4-hen commit 7c16e84
//   13.04       : WebKit gadgets from zecoxao 1304 dump; kernel FIXME
//   9.00/10.xx  : community-verified kernel data; WebKit stubs (need dump)

export const REQUIRED_KEYS = [
    "fw_status",
    "wk_expm1_builtin", "wk_JSFunction_m_function",
    "wk_POP_RDI_RET", "wk_POP_RSI_RET", "wk_POP_RDX_RET", "wk_POP_RCX_RET",
    "wk_POP_RAX_RET", "wk_POP_R8_RET", "wk_POP_R9_RET", "wk_LEAVE_RET",
    "wk_MOV_QWORD_PTR_RDI_RAX_RET",
    "wk_MOV_RDI_RSI_30_CALL", "wk_POP_RAX_MOV_RAX_JMP_18",
    "wk_PUSH_RBP_MOV_RBP_RSP_10", "wk_MOV_RDI_RAX_8_CALL_20",
    "wk_MOV_RDX_RAX_18_CALL_10", "wk_PUSH_RDX_POP_RSP_RET",
    "pivot_view_sp", "wk_ArrayBuffer_m_impl", "wk_ArrayBuffer_m_contents_m_data",
    "wk___imp___error", "k__error",
    "k_scan_stage1", "k_scan_stage2",
    "k_evf_cv", "k_sysent_661", "k_jmp_rsi",
];
export const OPTIONAL_KEYS = [
    "k_stubs", "wk___imp_pthread_create", "k_pthread_create",
    "kpatch", "alias_of",
];

// ─── Helper: build a stub entry for unfinished firmware ──────────────────────
function _stub(ver, note) {
    return {
        fw_status: "state=INCOMPLETE " + note,
        wk_expm1_builtin:                 0xDEADBEEF,
        wk_JSFunction_m_function:         0x28,
        wk_POP_RDI_RET:                   0xDEAD0001,
        wk_POP_RSI_RET:                   0xDEAD0002,
        wk_POP_RDX_RET:                   0xDEAD0003,
        wk_POP_RCX_RET:                   0xDEAD0004,
        wk_POP_RAX_RET:                   0xDEAD0005,
        wk_POP_R8_RET:                    0xDEAD0006,
        wk_POP_R9_RET:                    0xDEAD0007,
        wk_LEAVE_RET:                     0xDEAD0008,
        wk_MOV_QWORD_PTR_RDI_RAX_RET:    0xDEAD0009,
        wk_PUSH_RDX_POP_RSP_RET:         0xDEAD000A,
        wk_MOV_RDI_RSI_30_CALL:          0xDEAD000B,
        wk_POP_RAX_MOV_RAX_JMP_18:       0xDEAD000C,
        wk_PUSH_RBP_MOV_RBP_RSP_10:      0xDEAD000D,
        wk_MOV_RDI_RAX_8_CALL_20:        0xDEAD000E,
        wk_MOV_RDX_RAX_18_CALL_10:       0xDEAD000F,
        pivot_view_sp:                    0x18,
        wk_ArrayBuffer_m_impl:            0x10,
        wk_ArrayBuffer_m_contents_m_data: 0x10,
        wk___imp___error:                 0xDEAD0010,
        k__error:                         0xDEAD0011,
        k_scan_stage1:                    0x40000,
        k_scan_stage2:                    0x60000,
        k_evf_cv:                         0x0,
        k_sysent_661:                     0xDEAD0200,
        k_jmp_rsi:                        0xDEAD0201,
    };
}

export const PS4 = {

// ═══════════════════════════════════════════════════════════════════════
// 9.00 — kernel offsets from community dumps; WebKit needs sprx dump
// ═══════════════════════════════════════════════════════════════════════
"9.00": {
    fw_status: "state=PARTIAL kernel_rvas=community-verified webkit=NEEDS-DUMP bug=poops",

    wk_expm1_builtin:                 0xDEADBEEF,  // FIXME: run tools/addfw.js on 9.00 sprx
    wk_JSFunction_m_function:         0x28,

    wk_POP_RDI_RET:                   0xDEAD0001,  // FIXME
    wk_POP_RSI_RET:                   0xDEAD0002,  // FIXME
    wk_POP_RDX_RET:                   0xDEAD0003,  // FIXME
    wk_POP_RCX_RET:                   0xDEAD0004,  // FIXME
    wk_POP_RAX_RET:                   0xDEAD0005,  // FIXME
    wk_POP_R8_RET:                    0xDEAD0006,  // FIXME
    wk_POP_R9_RET:                    0xDEAD0007,  // FIXME
    wk_LEAVE_RET:                     0xDEAD0008,  // FIXME
    wk_MOV_QWORD_PTR_RDI_RAX_RET:    0xDEAD0009,  // FIXME
    wk_PUSH_RDX_POP_RSP_RET:         0xDEAD000A,  // FIXME
    wk_MOV_RDI_RSI_30_CALL:          0xDEAD000B,  // FIXME
    wk_POP_RAX_MOV_RAX_JMP_18:       0xDEAD000C,  // FIXME
    wk_PUSH_RBP_MOV_RBP_RSP_10:      0xDEAD000D,  // FIXME
    wk_MOV_RDI_RAX_8_CALL_20:        0xDEAD000E,  // FIXME
    wk_MOV_RDX_RAX_18_CALL_10:       0xDEAD000F,  // FIXME

    pivot_view_sp:                    0x18,
    wk_ArrayBuffer_m_impl:            0x10,
    wk_ArrayBuffer_m_contents_m_data: 0x10,

    wk___imp___error:                 0xDEAD0010,  // FIXME
    k__error:                         0xDEAD0011,  // FIXME

    // 9.00 libkernel stubs — scan fallback works if these are wrong
    k_stubs: {
        3: 0x2b580, 4: 0x2b2e0, 5: 0x2b380, 6: 0x2d030,
        20: 0x2c580, 23: 0x2b100, 24: 0x2cff0, 25: 0x2aee0,
        30: 0x2c3e0, 54: 0x2c9f0, 92: 0x2b060, 97: 0x2ca50,
        98: 0x2aff0, 104: 0x2cce0, 105: 0x2aea0, 106: 0x2cde0,
        118: 0x2ad00, 135: 0x2bc80, 240: 0x2cec0, 331: 0x2c0c0,
        432: 0x2af20, 466: 0x2c680, 487: 0x2b480, 488: 0x2b720,
        538: 0x2ae40, 539: 0x2aef0, 544: 0x2b8c0, 545: 0x2c440,
        632: 0x2ca90, 633: 0x2d1f0, 662: 0x2c6c0, 663: 0x2bdf0,
        664: 0x2d0f0, 666: 0x2cf50, 669: 0x2b850,
    },

    k_scan_stage1: 0x40000,
    k_scan_stage2: 0x60000,

    // 9.00 kernel RVAs — from GoldHEN/ps4-payload-sdk community data
    k_evf_cv:    0x0,
    k_sysent_661: 0xF52960,   // sysent[661] RVA in 9.00 kernel (community)
    k_jmp_rsi:   0x3E7B2,     // ff e6 gadget in 9.00 kernel text (community)
    k_kl_lock:   0xB62C0,     // kqueue lock offset for kernel base derivation
},

// ═══════════════════════════════════════════════════════════════════════
// 11.00
// ═══════════════════════════════════════════════════════════════════════
"11.00": {
    fw_status: "state=proven step4q=90/0 reboot=0 kernel_rvas=5/5-vs-dump",
    wk_expm1_builtin:      0x2193f30,
    wk_JSFunction_m_function: 0x28,
    wk_CSSFontFace_vtable: 0x3627aa8,
    wk___imp___error:      0x36e1c68,
    k__error:              0x3370,
    wk___imp_strerror:     0x36e1c98,
    c_strerror:            0x10d00,
    wk_POP_RDI_RET:        0x357a0,
    wk_POP_RAX_RET:        0x4e6a9,
    wk_MOV_RDI_RSI_30_CALL:      0x24dae58,
    wk_POP_RAX_MOV_RAX_JMP_18:   0x11d5d53,
    wk_PUSH_RBP_MOV_RBP_RSP_10:  0x2f1890,
    wk_MOV_RDI_RAX_8_CALL_20:    0x41a81,
    wk_MOV_RDX_RAX_18_CALL_10:   0x90ffe6,
    wk_PUSH_RDX_POP_RSP_RET:     0x1cc607a,
    wk_MOV_QWORD_PTR_RDI_RAX_RET: 0x97db,
    wk_LEAVE_RET:                 0x31f9d,
    wk_POP_RSI_RET:        0x249e2,
    wk_POP_RDX_RET:        0x10d11,
    wk_POP_RCX_RET:        0x71617,
    wk_POP_R8_RET:         0xe53a2,
    wk_POP_R9_RET:         0x6403a1,
    pivot_view_sp:                0x18,
    wk_ArrayBuffer_m_impl:        0x10,
    wk_ArrayBuffer_m_contents_m_data: 0x10,
    k_getpid:                     0x1b280,
    k_scan_stage1:                0x40000,
    k_scan_stage2:                0x60000,
    k_evf_cv:                     0x7fc26f,
    k_sysent_661:                 0x1109350,
    k_jmp_rsi:                    0x71a21,
},

// ═══════════════════════════════════════════════════════════════════════
// 11.50
// ═══════════════════════════════════════════════════════════════════════
"11.50": {
    fw_status: "state=proven step4q=90/0 reboot=0 webkit=step7-20/20-x2 kernel_rvas=untested-vs-dump kstr_residue=0x318",
    wk_expm1_builtin:                  0x2587bd0,
    wk_JSFunction_m_function:          0x28,
    wk_POP_RDI_RET:                    0x2445241,
    wk_POP_RSI_RET:                    0x2503c9e,
    wk_POP_RDX_RET:                    0x24cfa22,
    wk_POP_RCX_RET:                    0x24c7ebf,
    wk_POP_RAX_RET:                    0x2554e3f,
    wk_POP_R8_RET:                     0x23bb4bd,
    wk_POP_R9_RET:                     0x1c2cda1,
    wk_LEAVE_RET:                      0x23c3790,
    wk_MOV_QWORD_PTR_RDI_RAX_RET:     0x2445d1a,
    wk_MOV_RDI_RSI_30_CALL:           0x29609f8,
    wk_POP_RAX_MOV_RAX_JMP_18:        0x1c8bbc3,
    wk_PUSH_RBP_MOV_RBP_RSP_10:       0x1645270,
    wk_MOV_RDI_RAX_8_CALL_20:         0x1e3f795,
    wk_MOV_RDX_RAX_18_CALL_10:        0x1dea16a,
    wk_PUSH_RDX_POP_RSP_RET:          0x2abe00a,
    pivot_view_sp:                     0x38,
    wk_ArrayBuffer_m_impl:             0x10,
    wk_ArrayBuffer_m_contents_m_data:  0x10,
    wk___imp___error:                  0x3cbcc98,
    k__error:                          0x183c0,
    wk___imp_pthread_create:           0x3cbdbb8,
    k_pthread_create:                  0xa1d0,
    k_stubs: {
        3: 0x2c170, 4: 0x2b8d0, 5: 0x2b970, 6: 0x2d620,
        20: 0x2cb70, 23: 0x2b6f0, 24: 0x2d5e0, 25: 0x2b4d0,
        30: 0x2c9d0, 54: 0x2cff0, 92: 0x2b650, 97: 0x2d050,
        98: 0x2b5f0, 104: 0x2d380, 105: 0x2b490, 106: 0x2d480,
        118: 0x2b2f0, 135: 0x2c280, 240: 0x2d4c0, 331: 0x2c6b0,
        432: 0x2b510, 466: 0x2cc70, 487: 0x2ba80, 488: 0x2bd10,
        538: 0x2b430, 539: 0x2b4f0, 544: 0x2beb0, 545: 0x2ca30,
        632: 0x2d090, 633: 0x2d840, 662: 0x2ccb0, 663: 0x2c3e0,
        664: 0x2d740, 666: 0x2d540, 669: 0x2bdf0,
    },
    k_scan_stage1:                     0x40000,
    k_scan_stage2:                     0x60000,
    k_evf_cv:                          0x784318,
    k_sysent_661:                      0x110a760,
    k_jmp_rsi:                         0x704d5,
},

// ═══════════════════════════════════════════════════════════════════════
// 12.00
// ═══════════════════════════════════════════════════════════════════════
"12.00": {
    fw_status: "state=UNTESTED-on-hardware webkit=offline-from-sprx anchor=findcaller-validated-on-11.50 kernel_rvas=verified-vs-kernel_1202.elf kpatch=10/10-sites-verified",
    wk_expm1_builtin:                   0x2585090,
    wk_JSFunction_m_function:           0x28,
    wk_POP_RDI_RET:                     0x4902f,
    wk_POP_RSI_RET:                     0x10e37,
    wk_POP_RDX_RET:                     0xf7a,
    wk_POP_RCX_RET:                     0x53c0b,
    wk_POP_RAX_RET:                     0x22f53,
    wk_POP_R8_RET:                      0x22f52,
    wk_POP_R9_RET:                      0x60b6c1,
    wk_LEAVE_RET:                       0x11823,
    wk_MOV_QWORD_PTR_RDI_RAX_RET:      0x2b5cb,
    wk_PUSH_RDX_POP_RSP_RET:           0x2abb03a,
    wk_MOV_RDI_RSI_30_CALL:            0x295dcd8,
    wk_POP_RAX_MOV_RAX_JMP_18:         0x8e4873,
    wk_PUSH_RBP_MOV_RBP_RSP_10:        0x285e10,
    wk_MOV_RDI_RAX_8_CALL_20:          0x6c7b0d,
    wk_MOV_RDX_RAX_18_CALL_10:         0xd37cca,
    pivot_view_sp:                      0x38,
    wk_ArrayBuffer_m_impl:              0x10,
    wk_ArrayBuffer_m_contents_m_data:   0x10,
    wk___imp___error:                   0x3cbcc48,
    k__error:                           0x299c0,
    wk___imp_pthread_create:            0x3cbdb80,
    k_pthread_create:                   0x24e00,
    k_stubs: {
        3: 0x2c160, 4: 0x2b8c0, 5: 0x2b960, 6: 0x2d610,
        20: 0x2cb60, 23: 0x2b6e0, 24: 0x2d5d0, 25: 0x2b4c0,
        30: 0x2c9c0, 54: 0x2cfe0, 92: 0x2b640, 97: 0x2d040,
        98: 0x2b5e0, 104: 0x2d370, 105: 0x2b480, 106: 0x2d470,
        118: 0x2b2e0, 135: 0x2c270, 240: 0x2d4b0, 331: 0x2c6a0,
        432: 0x2b500, 466: 0x2cc60, 487: 0x2ba70, 488: 0x2bd00,
        538: 0x2b420, 539: 0x2b4e0, 544: 0x2bea0, 545: 0x2ca20,
        632: 0x2d080, 633: 0x2d830, 662: 0x2cca0, 663: 0x2c3d0,
        664: 0x2d730, 666: 0x2d530, 669: 0x2bde0,
    },
    k_scan_stage1:                      0x40000,
    k_scan_stage2:                      0x60000,
    k_evf_cv:                           0x784798,
    k_sysent_661:                       0x110a760,
    k_jmp_rsi:                          0x47b31,
},

// ═══════════════════════════════════════════════════════════════════════
// 12.50
// ═══════════════════════════════════════════════════════════════════════
"12.50": {
    fw_status: "state=UNTESTED-on-hardware webkit=addfw-from-decrypted-12.50-modules (15/15 gadgets) kernel_rvas=asserted-UNVERIFIED kpatch=1250.bin bug=poops",
    wk_expm1_builtin:                   0x2585110,
    wk_JSFunction_m_function:           0x28,
    wk_POP_RDI_RET:                     0x4902f,
    wk_POP_RSI_RET:                     0x10e37,
    wk_POP_RDX_RET:                     0x771ea,
    wk_POP_RCX_RET:                     0x5def9,
    wk_POP_RAX_RET:                     0x22f53,
    wk_POP_R8_RET:                      0x22f52,
    wk_POP_R9_RET:                      0x60b6c1,
    wk_LEAVE_RET:                       0x77caa,
    wk_MOV_QWORD_PTR_RDI_RAX_RET:      0x2b5cb,
    wk_PUSH_RDX_POP_RSP_RET:           0x2abb0ba,
    wk_MOV_RDI_RSI_30_CALL:            0x295dd58,
    wk_POP_RAX_MOV_RAX_JMP_18:         0x8e4873,
    wk_PUSH_RBP_MOV_RBP_RSP_10:        0x285e10,
    wk_MOV_RDI_RAX_8_CALL_20:          0x6c7b0d,
    wk_MOV_RDX_RAX_18_CALL_10:         0xd37cca,
    pivot_view_sp:                      0x38,
    wk_ArrayBuffer_m_impl:              0x10,
    wk_ArrayBuffer_m_contents_m_data:   0x10,
    wk___imp___error:                   0x3cb4c48,
    k__error:                           0xd9d0,
    wk___imp_pthread_create:            0x3cb5b80,
    k_pthread_create:                   0x23d20,
    k_stubs: {
        3: 0x2c160, 4: 0x2b8c0, 5: 0x2b960, 6: 0x2d610,
        20: 0x2cb60, 23: 0x2b6e0, 24: 0x2d5d0, 25: 0x2b4c0,
        30: 0x2c9c0, 54: 0x2cfe0, 92: 0x2b640, 97: 0x2d040,
        98: 0x2b5e0, 104: 0x2d370, 105: 0x2b480, 106: 0x2d470,
        118: 0x2b2e0, 135: 0x2c270, 240: 0x2d4b0, 331: 0x2c6a0,
        432: 0x2b500, 466: 0x2cc60, 487: 0x2ba70, 488: 0x2bd00,
        538: 0x2b420, 539: 0x2b4e0, 544: 0x2bea0, 545: 0x2ca20,
        632: 0x2d080, 633: 0x2d830, 662: 0x2cca0, 663: 0x2c3d0,
        664: 0x2d730, 666: 0x2d530, 669: 0x2bde0,
    },
    k_scan_stage1:                      0x40000,
    k_scan_stage2:                      0x60000,
    k_evf_cv:                           0x0,
    k_sysent_661:                       0x110a760,
    k_jmp_rsi:                          0x47b31,
    k_kl_lock:                          0xe6c20,
},

// ═══════════════════════════════════════════════════════════════════════
// 13.00 — fully verified
// ═══════════════════════════════════════════════════════════════════════
"13.00": {
    fw_status: "state=proven step10=32/0-x3 reboot=0 webkit=step7-20/20 anchor=findcaller kernel_rvas=verified-on-hardware kpatch=1300.bin-10-sites-verified bug=poops",
    wk_expm1_builtin:                   0x2586880,
    wk_JSFunction_m_function:           0x28,
    wk_POP_RDI_RET:                     0x5c480,
    wk_POP_RSI_RET:                     0x6e45e,
    wk_POP_RDX_RET:                     0x12c5ba,
    wk_POP_RCX_RET:                     0x1bade,
    wk_POP_RAX_RET:                     0x10504,
    wk_POP_R8_RET:                      0x9b311,
    wk_POP_R9_RET:                      0x1dcfb1,
    wk_LEAVE_RET:                       0x182f7,
    wk_MOV_QWORD_PTR_RDI_RAX_RET:      0x548b,
    wk_PUSH_RDX_POP_RSP_RET:           0x2abccaa,
    wk_MOV_RDI_RSI_30_CALL:            0x295f948,
    wk_POP_RAX_MOV_RAX_JMP_18:         0x1d989e3,
    wk_PUSH_RBP_MOV_RBP_RSP_10:        0x25bae0,
    wk_MOV_RDI_RAX_8_CALL_20:          0x4a0406,
    wk_MOV_RDX_RAX_18_CALL_10:         0x1ec3ada,
    pivot_view_sp:                      0x38,
    wk_ArrayBuffer_m_impl:              0x10,
    wk_ArrayBuffer_m_contents_m_data:   0x10,
    wk___imp___error:                   0x3cb8cc8,
    k__error:                           0x26420,
    wk___imp_pthread_create:            0x3cb9c00,
    k_pthread_create:                   0x10110,
    k_stubs: {
        3: 0x2c170, 4: 0x2b8d0, 5: 0x2b970, 6: 0x2d620,
        20: 0x2cb70, 23: 0x2b6f0, 24: 0x2d5e0, 25: 0x2b4d0,
        30: 0x2c9d0, 54: 0x2cff0, 92: 0x2b650, 97: 0x2d050,
        98: 0x2b5f0, 104: 0x2d380, 105: 0x2b490, 106: 0x2d480,
        118: 0x2b2f0, 135: 0x2c280, 240: 0x2d4c0, 331: 0x2c6b0,
        432: 0x2b510, 466: 0x2cc70, 487: 0x2ba80, 488: 0x2bd10,
        538: 0x2b430, 539: 0x2b4f0, 544: 0x2beb0, 545: 0x2ca30,
        632: 0x2d090, 633: 0x2d840, 662: 0x2ccb0, 663: 0x2c3e0,
        664: 0x2d740, 666: 0x2d540, 669: 0x2bdf0,
    },
    k_scan_stage1:                      0x40000,
    k_scan_stage2:                      0x60000,
    k_kl_lock:                          0xe6c20,
    k_evf_cv:                           0x0,
    k_sysent_661:                       0x110a760,
    k_jmp_rsi:                          0x47b31,
},

};  // end PS4 = { ... }

// ══════════════════════════════════════════════════════════════════════
// ALIASES & DERIVED ENTRIES
// ══════════════════════════════════════════════════════════════════════

// ── 9.03 / 9.04 ── same as 9.00 (same kernel, same WebKit)
PS4["9.03"] = Object.assign({}, PS4["9.00"], {
    alias_of: "9.00",
    fw_status: "state=PARTIAL alias_of=9.00 kernel=shared webkit=shared kpatch=900.bin",
    kpatch: "900.bin",
});
PS4["9.04"] = Object.assign({}, PS4["9.00"], {
    alias_of: "9.00",
    fw_status: "state=PARTIAL alias_of=9.00 kernel=shared webkit=shared kpatch=900.bin",
    kpatch: "900.bin",
});

// ── 9.50 / 9.51 / 9.60 ── different WebKit (stub until sprx dumped)
PS4["9.50"] = _stub("9.50", "webkit=NEEDS-DUMP kernel_rvas=UNVERIFIED");
PS4["9.51"] = Object.assign({}, PS4["9.50"], { alias_of: "9.50", fw_status: "state=INCOMPLETE alias_of=9.50" });
PS4["9.60"] = Object.assign({}, PS4["9.50"], { alias_of: "9.50", fw_status: "state=INCOMPLETE alias_of=9.50" });

// ── 10.00 / 10.01 ── stub
PS4["10.00"] = _stub("10.00", "webkit=NEEDS-DUMP kernel_rvas=UNVERIFIED");
PS4["10.01"] = Object.assign({}, PS4["10.00"], { alias_of: "10.00", fw_status: "state=INCOMPLETE alias_of=10.00" });

// ── 10.50 / 10.70 / 10.71 ── stub
PS4["10.50"] = _stub("10.50", "webkit=NEEDS-DUMP kernel_rvas=UNVERIFIED");
PS4["10.70"] = Object.assign({}, PS4["10.50"], { alias_of: "10.50", fw_status: "state=INCOMPLETE alias_of=10.50" });
PS4["10.71"] = Object.assign({}, PS4["10.50"], { alias_of: "10.50", fw_status: "state=INCOMPLETE alias_of=10.50" });

// ── 11.52 ── alias of 11.50
PS4["11.52"] = Object.assign({}, PS4["11.50"], {
    alias_of: "11.50",
    fw_status: "state=assumed-same-as-11.50 alias_of=11.50 webkit=shared-with-11.50 kernel_rvas=shared-with-11.50 kpatch=1150.bin bug=lapse",
    kpatch: "1150.bin",
});

// ── 12.02 ── alias of 12.00
PS4["12.02"] = Object.assign({}, PS4["12.00"], {
    alias_of: "12.00",
    fw_status: "state=UNTESTED-on-hardware shares=12.00 kernel_rvas=verified-vs-kernel_1202.elf kpatch=1200.bin-10-sites-verified bug=lapse",
    kpatch: "1200.bin",
});

// ── 12.52 ── alias of 12.50
PS4["12.52"] = Object.assign({}, PS4["12.50"], {
    alias_of: "12.50",
    fw_status: "state=UNTESTED-on-hardware shares=12.50 webkit=assumed-identical-to-12.50 kernel_rvas=asserted-UNVERIFIED kpatch=1250.bin bug=poops",
    kpatch: "1250.bin",
});

// ══════════════════════════════════════════════════════════════════════
// 13.02 — CORRECTED from Scene-Collective/ps4-hen commit 7c16e84
// Kernel data (SYSENT) verified at 0x01102B70; sysent[661]=0x0110A760
// Kernel text patches shifted +0x10 after 0x2BD727 vs 13.00
// WebKit: confirmed same as 13.00 (Sony did not update WebKit in 13.x)
// ══════════════════════════════════════════════════════════════════════
PS4["13.02"] = Object.assign({}, PS4["13.00"], {
    alias_of:  "13.00",
    fw_status: "state=partial-verified alias_of=13.00 "
        + "webkit=shared-with-13.00 "
        + "kernel_rvas=corrected-from-scene-collective-1302.c "
        + "kpatch=1302.bin bug=poops",
    kpatch: "1302.bin",

    // ── Corrected kernel RVAs for 13.02 (from Scene-Collective/ps4-hen) ──
    // SYSENT_addr[13.02] = 0x01102B70 (same as 13.00 — sysent[661] unchanged)
    // COPYIN/COPYOUT text patches shifted +0x10 after 0x2BD727
    // k_jmp_rsi at 0x47B31 (before insertion point 0x2BD727 → unchanged)
    // k_kl_lock at 0xE6C20 verified unchanged (same kqueue structure offset)
    k_kl_lock:    0xe6c20,     // same as 13.00 (kqueue spinlock, pre-insertion)
    k_evf_cv:     0x0,
    k_sysent_661: 0x110a760,   // sysent[661]: 0x01102B70 + 661*0x30 = 0x110A760
    k_jmp_rsi:    0x47b31,     // before text insertion point → unchanged

    // Scene-Collective verified data offsets for 13.02 kernel:
    // XFAST_SYSCALL = 0x000001C0, PRISON0 = 0x0111FA18
    // ROOTVNODE = 0x02136E90,  ALLPROC = 0x01B28538
    // SYSENT = 0x01102B70,  M_TEMP = 0x01520D00
});

// ══════════════════════════════════════════════════════════════════════
// 13.04 — WebKit gadgets from zecoxao dump; kernel offsets PARTIAL
// 27.79% kernel bytes different from 13.00 (same size, code reordered)
// wk_expm1_builtin and complex gadgets still need tools/addfw.js run
// ══════════════════════════════════════════════════════════════════════
PS4["13.04"] = {
    fw_status: "state=PARTIAL "
        + "webkit=partial-from-1304-zecoxao-dump-MISSING-ANCHOR "
        + "kernel_rvas=UNVERIFIED-27pct-diff-from-1300 "
        + "kpatch=1304.bin-NEEDS-GENERATION bug=poops",

    // ── WebKit — from 1304_libSceNKWebKit.sprx.decrypted (zecoxao) ────
    // CRITICAL: wk_expm1_builtin is the ASLR anchor.
    // Without it the exploit fails at stage 1 (read primitive).
    // To find it: run tools/addfw.js on the 13.04 WebKit sprx, or
    // search for bytes: 66 0F 14 D8 F2 0F 5E C3 near "expm1" xrefs.
    wk_expm1_builtin:                 0xDEADBEEF,  // ← FIXME: run addfw.js

    wk_JSFunction_m_function:         0x28,         // constant on all PS4

    // These 8 gadgets are CONFIRMED from 13.04 WebKit dump:
    wk_POP_RDI_RET:                   0x060480,    // 5f c3
    wk_POP_RSI_RET:                   0x07245e,    // 5e c3
    wk_POP_RDX_RET:                   0x1305ba,    // 5a c3
    wk_POP_RCX_RET:                   0x01fade,    // 59 c3
    wk_POP_RAX_RET:                   0x014504,    // 58 c3
    wk_POP_R8_RET:                    0x230cbe1,   // 41 58 c3 (in 68MB binary)
    wk_POP_R9_RET:                    0x9df883,    // 41 59 c3
    wk_LEAVE_RET:                     0x01c2f7,    // c9 c3

    // These need to be found in the 13.04 WebKit binary:
    wk_MOV_QWORD_PTR_RDI_RAX_RET:    0xDEAD0009,  // FIXME: 48 89 07 c3
    wk_PUSH_RDX_POP_RSP_RET:         0xDEAD000A,  // FIXME: 52 5c c3
    wk_MOV_RDI_RSI_30_CALL:          0xDEAD000B,  // FIXME: 48 8b 7e 30 ...
    wk_POP_RAX_MOV_RAX_JMP_18:       0xDEAD000C,  // FIXME: 58 48 8b 07 ff 60 18
    wk_PUSH_RBP_MOV_RBP_RSP_10:      0xDEAD000D,  // FIXME: 55 48 89 e5 ...
    wk_MOV_RDI_RAX_8_CALL_20:        0xDEAD000E,  // FIXME: 48 8b 78 08 ...
    wk_MOV_RDX_RAX_18_CALL_10:       0xDEAD000F,  // FIXME: 48 8b 50 38 ...

    pivot_view_sp:                    0x38,         // same as 13.00
    wk_ArrayBuffer_m_impl:            0x10,
    wk_ArrayBuffer_m_contents_m_data: 0x10,

    wk___imp___error:                 0xDEAD0010,  // FIXME
    k__error:                         0xDEAD0011,  // FIXME
    wk___imp_pthread_create:          0xDEAD0012,  // FIXME
    k_pthread_create:                 0xDEAD0013,  // FIXME

    // 13.04 libkernel stubs — likely same as 13.00/13.02 (scan fallback used)
    k_stubs: {
        3: 0x2c170, 4: 0x2b8d0, 5: 0x2b970, 6: 0x2d620,
        20: 0x2cb70, 23: 0x2b6f0, 24: 0x2d5e0, 25: 0x2b4d0,
        30: 0x2c9d0, 54: 0x2cff0, 92: 0x2b650, 97: 0x2d050,
        98: 0x2b5f0, 104: 0x2d380, 105: 0x2b490, 106: 0x2d480,
        118: 0x2b2f0, 135: 0x2c280, 240: 0x2d4c0, 331: 0x2c6b0,
        432: 0x2b510, 466: 0x2cc70, 487: 0x2ba80, 488: 0x2bd10,
        538: 0x2b430, 539: 0x2b4f0, 544: 0x2beb0, 545: 0x2ca30,
        632: 0x2d090, 633: 0x2d840, 662: 0x2ccb0, 663: 0x2c3e0,
        664: 0x2d740, 666: 0x2d540, 669: 0x2bdf0,
    },

    k_scan_stage1: 0x40000,
    k_scan_stage2: 0x60000,

    // 13.04 kernel is 27.79% different from 13.00 (same binary size).
    // Code was reorganized in-place (not simple shift).
    // These offsets are UNVERIFIED — need 13.04 kernel dump to confirm.
    // Celsius (ffs_mountfs) confirmed at same offset 0x7D021F as 13.00.
    k_evf_cv:    0x0,
    k_sysent_661: 0x110a760,   // UNVERIFIED — likely differs for 13.04
    k_jmp_rsi:   0x47b31,      // UNVERIFIED
    k_kl_lock:   0xe6c20,      // UNVERIFIED

    kpatch: "1302.bin",        // reuse 1302 as best approximation; ideally generate 1304.bin
};

// ══════════════════════════════════════════════════════════════════════
// offsetsFor — parse PS4 User-Agent → firmware key → offset table
// UA format: "PlayStation 4/X.YY" (Y is hex minor)
// ══════════════════════════════════════════════════════════════════════
export function offsetsFor(uaString) {
    const m = (uaString || "").match(/PlayStation\s+4[\/ ](\d+)\.(\d+)/);
    if (!m) return { key: null, off: null };
    const key = m[1] + "." + parseInt(m[2], 16).toString(16).padStart(2, "0");
    return { key, off: PS4[key] || null };
}