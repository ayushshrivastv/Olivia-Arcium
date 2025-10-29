/**
 * Initialize Arcium Computation Definitions
 * Run this after deploying the program to initialize the three computation definitions
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

async function initCompDef(name) {
  const baseSeedCompDefAcc = getArciumAccountBaseSeed("ComputationDefinitionAccount");
  const offset = getCompDefAccOffset(name);

  const compDefPDA = PublicKey.findProgramAddressSync(
    [baseSeedCompDefAcc, program.programId.toBuffer(), offset],
    getArciumProgAddress()
  )[0];

  console.log(`${name} CompDef PDA:`, compDefPDA.toBase58());

  try {
    const accountInfo = await connection.getAccountInfo(compDefPDA);
    if (accountInfo) {
      console.log(`${name} CompDef already exists and is initialized.`);
      return "Already Initialized";
    }
  } catch (e) {
    console.log(`Checking ${name} CompDef account...`);
  }

  console.log(`Initializing ${name} computation definition...`);
  const sig = await program.methods
    [`init${name.charAt(0).toUpperCase() + name.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}CompDef`]()
    .accounts({
      compDefAccount: compDefPDA,
      payer: ownerKp.publicKey,
      mxeAccount: getMXEAccAddress(program.programId),
    })
    .rpc({ commitment: "confirmed" });

  console.log(`${name} CompDef initialization signature:`, sig);
  return sig;
}

async function main() {
  console.log("Initializing computation definitions...");
  console.log("Program ID:", program.programId.toBase58());

  const results = await Promise.all([
    initCompDef("initialize_market").catch((e) => {
      console.error("Error initializing initialize_market:", e.message);
      return null;
    }),
    initCompDef("place_bet").catch((e) => {
      console.error("Error initializing place_bet:", e.message);
      return null;
    }),
    initCompDef("distribute_rewards").catch((e) => {
      console.error("Error initializing distribute_rewards:", e.message);
      return null;
    }),
  ]);

  console.log("\nAll computation definitions initialization results:", results);
}

main()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

