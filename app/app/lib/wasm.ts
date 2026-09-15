type WasmModule = typeof import("/pkg/wasm.js");
let mod: WasmModule | null = null;

export async function loadWasm() {
  if (!mod) {
    mod = (await import(
      /* webpackIgnore: true */ "/pkg/wasm.js"
    )) as WasmModule;
    // Call the default-exported init() to initialize the Rust-generated WASM bindings
    await mod.default();
  }
  return mod;
}
