type WasmModule = {
  default: () => Promise<void>;
  wasm_extract_text: (bytes: Uint8Array) => string[];
  wasm_verify_text: (
    bytes: Uint8Array,
    page_number: number,
    sub_string: string,
    position: number
  ) => unknown;
  wasm_verify_and_extract: (bytes: Uint8Array) => unknown;
};
const WASM_MODULE_URL = "/pkg/wasm.js";
let mod: WasmModule | null = null;

export async function loadWasm() {
  if (!mod) {
    mod = (await import(
      /* webpackIgnore: true */ WASM_MODULE_URL
    )) as unknown as WasmModule;
    // Call the default-exported init() to initialize the Rust-generated WASM bindings
    await mod.default();
  }
  return mod;
}
