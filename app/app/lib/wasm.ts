type WasmSignature = {
  is_valid?: boolean;
  public_key?: string;
};

type WasmVerificationResult = {
  success?: boolean;
  error?: string;
  pages?: string[];
  substring_matches?: boolean;
  signature?: WasmSignature;
  is_valid?: boolean;
};

type WasmModule = {
  default: () => Promise<void>;
  wasm_extract_text: (bytes: Uint8Array) => string[];
  wasm_verify_text: (
    bytes: Uint8Array,
    page_number: number,
    sub_string: string,
    position: number
  ) => WasmVerificationResult;
  wasm_verify_and_extract: (bytes: Uint8Array) => WasmVerificationResult;
};

function getWasmModuleUrl() {
  if (typeof window === "undefined") {
    return "/pkg/wasm.js";
  }

  const basePath = document.body?.dataset.basePath?.replace(/\/$/, "") || "";
  return new URL(`${basePath}/pkg/wasm.js`, window.location.origin).toString();
}

let mod: WasmModule | null = null;
let modPromise: Promise<WasmModule> | null = null;

export async function loadWasm() {
  if (mod) {
    return mod;
  }

  if (!modPromise) {
    modPromise = (async () => {
      const loaded = (await import(
        /* webpackIgnore: true */ getWasmModuleUrl()
      )) as unknown as WasmModule;

      // Call the default-exported init() to initialize the Rust-generated WASM bindings
      await loaded.default();
      mod = loaded;

      return loaded;
    })().catch((error) => {
      modPromise = null;
      throw error;
    });
  }

  return modPromise;
}
