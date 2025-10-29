/**
 * Initialize Arcium MXE Account
 * Run this before initializing computation definitions
 * The MXE account must exist before computation definitions can be created
 */

const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, Connection, SystemProgram } = require("@solana/web3.js");
const BN = anchor.BN;
const fs = require("fs");
const os = require("os");
const {
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getArciumProgram,
  getArciumProgAddress,
  getClusterAccAddress,
  getCompDefAccAddress,
  getComputationAccAddress,
} = require("@arcium-hq/client");

const IDL = JSON.parse(
  fs.readFileSync("target/idl/prediction_market.json", "utf8")
);

const owner = JSON.parse(
  fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, "utf8")
);
const ownerKp = Keypair.fromSecretKey(Uint8Array.from(owner));

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
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
const arciumProgram = getArciumProgram(provider);

async function initMXE() {
  const programId = program.programId;
  const arciumProgramId = getArciumProgAddress();
  const mxeAddress = getMXEAccAddress(programId);
  
  console.log("MXE Initialization");
  console.log("Program ID:", programId.toBase58());
  console.log("Arcium Program ID:", arciumProgramId.toBase58());
  console.log("MXE Address:", mxeAddress.toBase58());

  // Check if Arcium program is deployed
  try {
    const arciumProgramInfo = await connection.getAccountInfo(arciumProgramId);
    if (!arciumProgramInfo) {
      console.error("\n❌ ERROR: Arcium program is not deployed!");
      console.error("Arcium program ID:", arciumProgramId.toBase58());
      console.error("\nThe Arcium program must be deployed before initializing MXE accounts.");
      console.error("Please ensure Arcium localnet is properly set up.");
      console.error("\nTry running: arcium localnet");
      throw new Error("Arcium program not deployed. Please deploy Arcium program first.");
    }
    console.log("✅ Arcium program is deployed");
  } catch (error) {
    if (error.message && error.message.includes("Arcium program not deployed")) {
      throw error;
    }
    console.error("⚠️  Warning: Could not verify Arcium program deployment:", error.message);
  }

  // Check if MXE account already exists
  try {
    const accountInfo = await connection.getAccountInfo(mxeAddress);
    if (accountInfo) {
      console.log("✅ MXE account already exists and is initialized.");
      return "Already Initialized";
    }
  } catch (e) {
    console.log("MXE account does not exist, initializing...");
  }

  // Get all required account addresses
  const mempoolAddress = getMempoolAccAddress(programId);
  const execpoolAddress = getExecutingPoolAccAddress(programId);
  const clusterAddress = getClusterAccAddress(0); // Use cluster 0 for localnet
  
  // Get MXE keygen computation definition address (offset 1 = 0x01000000)
  const mxeKeygenCompDefOffset = Buffer.alloc(4);
  mxeKeygenCompDefOffset.writeUInt32LE(1, 0);
  const mxeKeygenCompDefAddress = getCompDefAccAddress(programId, mxeKeygenCompDefOffset.readUInt32LE());
  
  // Get MXE keygen computation account (computation offset 0)
  const mxeKeygenComputationAddress = getComputationAccAddress(programId, new BN(0));

  console.log("Required accounts:");
  console.log("  Mempool:", mempoolAddress.toBase58());
  console.log("  ExecPool:", execpoolAddress.toBase58());
  console.log("  Cluster:", clusterAddress.toBase58());
  console.log("  MXE Keygen CompDef:", mxeKeygenCompDefAddress.toBase58());
  console.log("  MXE Keygen Computation:", mxeKeygenComputationAddress.toBase58());

  try {
    console.log("\nInitializing MXE account...");
    // Note: All accounts from IDL must be provided
    // mxeAuthority is optional, so we can set it to null
    const accountsObj = {
      signer: provider.wallet.publicKey,
      mxe: mxeAddress,
      mempool: mempoolAddress,
      execpool: execpoolAddress,
      cluster: clusterAddress,
      mxeKeygenComputationDefinition: mxeKeygenCompDefAddress,
      mxeKeygenComputation: mxeKeygenComputationAddress,
      mxeAuthority: provider.wallet.publicKey, // Set authority to payer wallet for computation definition initialization
      mxeProgram: programId,
      systemProgram: SystemProgram.programId,
    };
    
    console.log("Using provider wallet as signer:", provider.wallet.publicKey.toBase58());
    console.log("Using mempoolSize: tiny (for localnet)");
    
    // initMxe requires: clusterOffset (u32) and mempoolSize (enum: tiny, small, medium, large)
    const sig = await arciumProgram.methods
      .initMxe(0, { tiny: {} }) // clusterOffset = 0, mempoolSize = tiny
      .accounts(accountsObj)
      .rpc({ commitment: "confirmed" });

    console.log("✅ MXE account initialized successfully!");
    console.log("Transaction signature:", sig);
    return sig;
  } catch (error) {
    console.error("❌ Error initializing MXE account:", error.message);
    
    if (error.message && error.message.includes("already in use")) {
      console.log("ℹ️  MXE account may already be initialized. Checking again...");
      const accountInfo = await connection.getAccountInfo(mxeAddress);
      if (accountInfo) {
        console.log("✅ MXE account exists and appears to be initialized.");
        return "Already Initialized";
      }
    }
    
    throw error;
  }
}

async function main() {
  console.log("=== Arcium MXE Account Initialization ===\n");
  
  try {
    const result = await initMXE();
    console.log("\n✅ MXE initialization complete!");
    
    // Verify the account exists
    console.log("\nVerifying MXE account...");
    const mxeAddress = getMXEAccAddress(program.programId);
    const accountInfo = await connection.getAccountInfo(mxeAddress);
    if (accountInfo) {
      console.log("✅ Verification successful! MXE account exists on-chain.");
    } else {
      console.log("⚠️  Warning: MXE account not found after initialization.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ MXE initialization failed:", error);
    process.exit(1);
  }
}

main();

