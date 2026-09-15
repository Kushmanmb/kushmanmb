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
  const assetPrefixUrl = new URL(
    nextWindow.__NEXT_DATA__?.assetPrefix || "/",
    window.location.origin
  );
  const basePath = nextWindow.__NEXT_DATA__?.basePath?.replace(/\/$/, "") || "";
  let pathPrefix = assetPrefixUrl.pathname.replace(/\/$/, "");

  if (basePath && !pathPrefix.endsWith(basePath)) {
    pathPrefix += basePath;
  }

  return new URL(`${pathPrefix}/pkg/wasm.js`, assetPrefixUrl.origin).toString();
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
