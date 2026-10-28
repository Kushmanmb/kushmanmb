use sp1_sdk::{include_elf, HashableKey, Prover, ProvingKey, ProverClient};

/// The ELF (executable and linkable format) file for the Succinct RISC-V zkVM.
pub const ZKPDF_ELF: sp1_sdk::Elf = include_elf!("zkpdf-program");

#[tokio::main]
async fn main() {
    let prover = ProverClient::builder().cpu().build().await;
    let pk = prover.setup(ZKPDF_ELF).await.expect("SP1 setup failed");
    println!("{}", pk.verifying_key().bytes32());
}
