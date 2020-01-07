"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const goWasm = require('./wasm_exec');
const goWasmExec = (goHook, args) => goWasm.exec(goHook, args);
exports.default = goWasmExec;
//# sourceMappingURL=wasm_exec_wrapper.js.map