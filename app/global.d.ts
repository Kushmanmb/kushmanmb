// global.d.ts
/// <reference types="vite/client" />

declare module "/pkg/wasm.js" {
  export type WasmSignature = {
    is_valid?: boolean;
    public_key?: string;
  };

  export type WasmVerificationResult = {
    success?: boolean;
    error?: string;
    pages?: string[];
    substring_matches?: boolean;
    signature?: WasmSignature;
    is_valid?: boolean;
  };

  // `init()` is the default export that bootstraps the WASM module
  export default function init(): Promise<void>;

  // named exports exposed by wasm-bindgen
  export function wasm_extract_text(bytes: Uint8Array): string[];
  export function wasm_verify_text(
    bytes: Uint8Array,
    page_number: number,
    sub_string: string,
    position: number
  ): WasmVerificationResult;
  export function wasm_verify_and_extract(
    bytes: Uint8Array
  ): WasmVerificationResult;
}
