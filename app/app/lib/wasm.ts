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

type NextWindow = Window & {
  __NEXT_DATA__?: {
    assetPrefix?: string;
    basePath?: string;
  };
};

function getWasmModuleUrl() {
  if (typeof window === "undefined") {
    return "/pkg/wasm.js";
  }

  const nextWindow = window as NextWindow;
  const prefix =
    nextWindow.__NEXT_DATA__?.assetPrefix ??
    nextWindow.__NEXT_DATA__?.basePath ??
    "";
  const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

  return new URL(`${normalizedPrefix}/pkg/wasm.js`, window.location.origin).toString();
}

let mod: WasmModule | null = null;

export async function loadWasm() {
  if (!mod) {
    mod = (await import(
      /* webpackIgnore: true */ getWasmModuleUrl()
    )) as unknown as WasmModule;
    // Call the default-exported init() to initialize the Rust-generated WASM bindings
    await mod.default();
  }
  return mod;
}
