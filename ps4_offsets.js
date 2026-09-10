// ps4_offsets.js — Poops 13.02 / 13.04 only
// developed by H4SS9M

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

const SHARED_KERNEL_13 = {
    PRISON0_addr:  0x0111FA18,
    ROOTVNODE_addr:0x02136E90,
    SYSENT_addr:   0x01102B70,
    ALLPROC_addr:  0x01B28538,
    M_TEMP_addr:   0x01520D00,
};

export const PS4 = {

"13.02": {
    fw_status: "state=proven alias_of=13.00 webkit=shared-with-13.00 "
             + "kernel_rvas=scene-collective-1302 kpatch=1302.bin bug=poops",
    alias_of: "13.00",
    kpatch: "1302.bin",

    // WebKit (identico a 13.00)
    wk_expm1_builtin:                 0x2586880,
    wk_JSFunction_m_function:         0x28,
    wk_POP_RDI_RET:                   0x5c480,
    wk_POP_RSI_RET:                   0x6e45e,
    wk_POP_RDX_RET:                   0x12c5ba,
    wk_POP_RCX_RET:                   0x1bade,
    wk_POP_RAX_RET:                   0x10504,
    wk_POP_R8_RET:                    0x9b311,
    wk_POP_R9_RET:                    0x1dcfb1,
    wk_LEAVE_RET:                     0x182f7,
    wk_MOV_QWORD_PTR_RDI_RAX_RET:    0x548b,
    wk_PUSH_RDX_POP_RSP_RET:         0x2abccaa,
    wk_MOV_RDI_RSI_30_CALL:          0x295f948,
    wk_POP_RAX_MOV_RAX_JMP_18:       0x1d989e3,
    wk_PUSH_RBP_MOV_RBP_RSP_10:      0x25bae0,
    wk_MOV_RDI_RAX_8_CALL_20:        0x4a0406,
    wk_MOV_RDX_RAX_18_CALL_10:       0x1ec3ada,
    pivot_view_sp:                    0x38,
    wk_ArrayBuffer_m_impl:            0x10,
    wk_ArrayBuffer_m_contents_m_data: 0x10,
    wk___imp___error:                 0x3cb8cc8,
    k__error:                         0x26420,
    wk___imp_pthread_create:          0x3cb9c00,
    k_pthread_create:                 0x10110,
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
    k_kl_lock:     0xe6c20,
    k_evf_cv:      0x0,
    k_sysent_661:  0x110a760,
    k_jmp_rsi:     0x47b31,
},

"13.04": {
    fw_status: "state=partial webkit=1304-zecoxao-dump kernel_rvas=asserted-13.02 kpatch=1304.bin bug=poops",
    alias_of: "13.02",
    kpatch: "1304.bin",

    // WebKit (13.04 dump). Los offsets faltantes deben completarse con addfw.
    wk_expm1_builtin:                 0x2586880,   // placeholder, verificar
    wk_JSFunction_m_function:         0x28,
    wk_POP_RDI_RET:                   0x060480,
    wk_POP_RSI_RET:                   0x07245e,
    wk_POP_RDX_RET:                   0x1305ba,
    wk_POP_RCX_RET:                   0x01fade,
    wk_POP_RAX_RET:                   0x014504,
    wk_POP_R8_RET:                    0x230cbe1,
    wk_POP_R9_RET:                    0x9df883,
    wk_LEAVE_RET:                     0x01c2f7,
    wk_MOV_QWORD_PTR_RDI_RAX_RET:    0x548b,      // pendiente verificación
    wk_PUSH_RDX_POP_RSP_RET:         0x2abccaa,   // idem
    wk_MOV_RDI_RSI_30_CALL:          0x295f948,
    wk_POP_RAX_MOV_RAX_JMP_18:       0x1d989e3,
    wk_PUSH_RBP_MOV_RBP_RSP_10:      0x25bae0,
    wk_MOV_RDI_RAX_8_CALL_20:        0x4a0406,
    wk_MOV_RDX_RAX_18_CALL_10:       0x1ec3ada,
    pivot_view_sp:                    0x38,
    wk_ArrayBuffer_m_impl:            0x10,
    wk_ArrayBuffer_m_contents_m_data: 0x10,
    wk___imp___error:                 0x3cb8cc8,
    k__error:                         0x26420,
    wk___imp_pthread_create:          0x3cb9c00,
    k_pthread_create:                 0x10110,
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
    k_kl_lock:     0xe6c20,
    k_evf_cv:      0x0,
    k_sysent_661:  0x110a760,
    k_jmp_rsi:     0x47b31,
},

};

export function offsetsFor(uaString) {
    const m = (uaString || "").match(/PlayStation\s+4[\/ ](\d+)\.(\d+)/);
    if (!m) return { key: null, off: null };
    const minor = parseInt(m[2], 16);
    const key = m[1] + "." + (minor < 16 ? "0" : "") + minor.toString(16);
    return { key, off: PS4[key] || null };
}
