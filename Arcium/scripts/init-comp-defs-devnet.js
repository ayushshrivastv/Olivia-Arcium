/**
 * Initialize Arcium Computation Definitions on DEVNET
 * Run this after initializing the MXE account
 */

const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, Connection } = require("@solana/web3.js");
const fs = require("fs");
const os = require("os");
const {
  getCompDefAccOffset,
  getArciumProgAddress,
  getMXEAccAddress,
  getArciumAccountBaseSeed,
} = require("@arcium-hq/client");

const IDL = JSON.parse(
  fs.readFileSync("target/idl/prediction_market.json", "utf8")
);

const owner = JSON.parse(
  fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, "utf8")
);
const ownerKp = Keypair.fromSecretKey(Uint8Array.from(owner));

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = {
  publicKey: ownerKp.publicKey,
  signTransaction: async (tx) => {
    tx.sign(ownerKp);
    return tx;
  },
  signAllTransactions: async (txs) => {
    txs.forEach((tx) => tx.sign(ownerKp));
    return txs;
  },
};

const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);

const program = new anchor.Program(IDL, provider);

async function initCompDef(name) {
  const baseSeedCompDefAcc = getArciumAccountBaseSeed("ComputationDefinitionAccount");
  const offset = getCompDefAccOffset(name);

  const compDefPDA = PublicKey.findProgramAddressSync(
    [baseSeedCompDefAcc, program.programId.toBuffer(), offset],
    getArciumProgAddress()
  )[0];

  console.log(`\n${name} CompDef PDA:`, compDefPDA.toBase58());

  try {
    const accountInfo = await connection.getAccountInfo(compDefPDA);
    if (accountInfo) {
      console.log(`✅ ${name} CompDef already exists and is initialized.`);
      return { name, status: "Already Initialized", address: compDefPDA.toBase58() };
    }
  } catch (e) {
    console.log(`Checking ${name} CompDef account...`);
  }

  console.log(`Initializing ${name} computation definition on devnet...`);
  
  try {
    const sig = await program.methods
      [`init${name.charAt(0).toUpperCase() + name.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}CompDef`]()
      .accounts({
        compDefAccount: compDefPDA,
        payer: ownerKp.publicKey,
        mxeAccount: getMXEAccAddress(program.programId),
      })
      .rpc({ commitment: "confirmed" });

    console.log(`✅ ${name} CompDef initialized successfully!`);
    console.log(`   Signature:`, sig);
    console.log(`   View on Solscan: https://solscan.io/tx/${sig}?cluster=devnet`);
    
    return { name, status: "Initialized", signature: sig, address: compDefPDA.toBase58() };
  } catch (error) {
    console.error(`❌ Error initializing ${name}:`, error.message);
    return { name, status: "Failed", error: error.message };
  }
}

async function main() {
  console.log("=== Initializing Computation Definitions on DEVNET ===");
  console.log("Program ID:", program.programId.toBase58());
  console.log("Signer:", ownerKp.publicKey.toBase58());
  
  // Check wallet balance
  const balance = await connection.getBalance(ownerKp.publicKey);
  console.log("Wallet balance:", balance / 1e9, "SOL");
  
  if (balance < 0.1 * 1e9) {
    console.error("❌ Insufficient balance. Need at least 0.1 SOL.");
    console.error("Run: solana airdrop 1", ownerKp.publicKey.toBase58(), "--url devnet");
    process.exit(1);
  }

  // Verify MXE exists first
  const mxeAddress = getMXEAccAddress(program.programId);
  console.log("\nVerifying MXE account exists...");
  console.log("MXE Address:", mxeAddress.toBase58());
  
  try {
    const mxeAccountInfo = await connection.getAccountInfo(mxeAddress);
    if (!mxeAccountInfo) {
      console.error("\n❌ ERROR: MXE account does not exist!");
      console.error("Please run 'node init-mxe-devnet.js' first to initialize the MXE account.");
      process.exit(1);
    }
    console.log("✅ MXE account exists");
  } catch (error) {
    console.error("\n❌ ERROR: Cannot verify MXE account:", error.message);
    console.error("Please run 'node init-mxe-devnet.js' first.");
    process.exit(1);
  }

  console.log("\n--- Initializing Computation Definitions ---");

  const results = [];
  
  // Initialize one at a time to see progress
  for (const compDefName of ["initialize_market", "place_bet", "distribute_rewards"]) {
    const result = await initCompDef(compDefName);
    results.push(result);
  }

  console.log("\n=== Summary ===");
  console.log("Program ID:", program.programId.toBase58());
  console.log("MXE Address:", mxeAddress.toBase58());
  console.log("\nComputation Definitions:");
  results.forEach(r => {
    console.log(`  ${r.name}:`);
    console.log(`    Status: ${r.status}`);
    console.log(`    Address: ${r.address}`);
    if (r.signature) {
      console.log(`    Tx: https://solscan.io/tx/${r.signature}?cluster=devnet`);
    }
  });

  const allSuccessful = results.every(r => r.status === "Initialized" || r.status === "Already Initialized");
  
  if (allSuccessful) {
    console.log("\n✅ All computation definitions initialized successfully!");
    console.log("\nYour Arcium setup is complete and ready for encrypted predictions on devnet.");
  } else {
    console.log("\n⚠️  Some computation definitions failed to initialize.");
  }
}

main()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

