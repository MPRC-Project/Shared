#!/usr/bin/env node
/**
 * MPRC Admin Key Generator
 *
 * This script generates public/private key pairs for admin authentication.
 * The public key should be added to the server's MPRCServerConf.json,
 * and the private key should be kept secure on the client.
 *
 * Usage:
 *   node generate-admin-keys.js [keyName] [keyType]
 *
 * Arguments:
 *   keyName  - Name for the admin key (e.g., "primary-server", "backup-admin")
 *   keyType  - Key type: "rsa" or "ed25519" (default: "rsa")
 *
 * Examples:
 *   node generate-admin-keys.js primary-server
 *   node generate-admin-keys.js backup-admin ed25519
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Generates an RSA key pair.
 */
function generateRSAKeyPair(keySize = 2048) {
  console.log(`Generating RSA-${keySize} key pair...`);

  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: keySize,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { privateKey, publicKey };
}

/**
 * Generates an Ed25519 key pair.
 */
function generateEd25519KeyPair() {
  console.log("Generating Ed25519 key pair...");

  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { privateKey, publicKey };
}

/**
 * Main function.
 */
async function main() {
  const args = process.argv.slice(2);
  const keyName = args[0] || "admin-key";
  const keyType = (args[1] || "rsa").toLowerCase();

  console.log(`\n🔐 MPRC Admin Key Generator\n`);
  console.log(`Key name: ${keyName}`);
  console.log(`Key type: ${keyType}\n`);

  // Generate key pair
  let privateKey, publicKey;

  if (keyType === "ed25519") {
    ({ privateKey, publicKey } = generateEd25519KeyPair());
  } else if (keyType === "rsa") {
    ({ privateKey, publicKey } = generateRSAKeyPair(2048));
  } else {
    console.error(`Error: Unknown key type "${keyType}"`);
    console.error('Valid types: "rsa" or "ed25519"');
    process.exit(1);
  }

  // Create output directory
  const outputDir = path.join(process.cwd(), "admin-keys");
  await fs.mkdir(outputDir, { recursive: true });

  // Save private key
  const privateKeyPath = path.join(outputDir, `${keyName}.private.pem`);
  await fs.writeFile(privateKeyPath, privateKey, { mode: 0o600 });
  console.log(`✓ Private key saved: ${privateKeyPath}`);

  // Save public key
  const publicKeyPath = path.join(outputDir, `${keyName}.public.pem`);
  await fs.writeFile(publicKeyPath, publicKey);
  console.log(`✓ Public key saved: ${publicKeyPath}`);

  // Create JSON snippet for server config
  const configSnippet = {
    name: keyName,
    publicKey: publicKey,
  };

  const configPath = path.join(outputDir, `${keyName}.config.json`);
  await fs.writeFile(configPath, JSON.stringify(configSnippet, null, 2));
  console.log(`✓ Config snippet saved: ${configPath}`);

  console.log(`\n📋 Next steps:\n`);
  console.log(`1. Add the following to your server's MPRCServerConf.json adminKeys array:`);
  console.log(JSON.stringify(configSnippet, null, 2));
  console.log(`\n2. Keep the private key secure: ${privateKeyPath}`);
  console.log(`3. Use the private key when signing admin commands from your client`);
  console.log(`\n⚠️  SECURITY WARNING:`);
  console.log(`   - Never commit the private key to version control`);
  console.log(`   - Keep the private key file secure (permissions: 600)`);
  console.log(`   - Do not share the private key over insecure channels`);
  console.log(`   - Rotate keys periodically for better security\n`);
}

main().catch((error) => {
  console.error("Error generating keys:", error);
  process.exit(1);
});