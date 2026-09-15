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

type NextWindow = Window & {
  __NEXT_DATA__?: {
    assetPrefix?: string;
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
  const basePath = process.env.__NEXT_ROUTER_BASEPATH?.replace(/\/$/, "") || "";
  let pathPrefix = assetPrefixUrl.pathname.replace(/\/$/, "");

  if (basePath && !pathPrefix.endsWith(basePath)) {
    pathPrefix += basePath;
  }

  assetPrefixUrl.pathname = `${pathPrefix}/pkg/wasm.js`;

  return assetPrefixUrl.toString();
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
