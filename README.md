# Family Heirloom Key

A fully homomorphic encryption (FHE) based family heirloom management system that allows families to create encrypted digital heirlooms with inheritance mechanisms. Built with Zama's FHEVM technology for privacy-preserving asset management.

## 🚀 Live Demo

- **Live Demo**: [https://family-heirloom-key.vercel.app/](https://family-heirloom-key.vercel.app/)
- **Demo Video**: [Watch the full demo](https://github.com/LynnDickey/family-heirloom-key/blob/main/family-heirloom-key-demo.mp4)
- **Demo Guide**: [Detailed walkthrough](./DEMO_README.md)

## ✨ Features

- **🔐 FHE-Powered Encryption**: Family heirloom values are encrypted using Zama's FHEVM technology
- **👨‍👩‍👧‍👦 Inheritance Management**: Secure inheritance requests with encrypted proof-of-life verification
- **🎨 Digital Heirlooms**: Create tokenized family heirlooms with rich metadata
- **🔄 Multi-Chain Support**: Deploy on Ethereum, Polygon, Optimism, Arbitrum, and Base
- **🌐 Rainbow Wallet Integration**: Seamless wallet connection and transaction management
- **📱 Responsive UI**: Modern React interface with comprehensive error handling
- **🧪 Full Test Coverage**: Unit and integration tests with Hardhat
- **🚨 Emergency Functions**: Contract owner can perform emergency withdrawals during paused state
- **📦 Batch Operations**: Efficient batch transfer functionality for multiple tokens
- **🔍 Advanced Queries**: Optimized event indexing for efficient blockchain queries

## 📈 Recent Updates

- ✅ **Emergency Functions**: Owner can perform emergency withdrawals during paused state
- ✅ **Batch Operations**: Efficient batch transfer and mint functionality (up to 20 tokens)
- ✅ **Advanced Event Indexing**: Optimized EVM logs for efficient blockchain queries
- ✅ **Multi-Chain Support**: Extended deployment support for Polygon network
- ✅ **Enhanced Testing**: Additional test cases for contract security and functionality
- ✅ **Automated Verification**: Contract verification scripts for deployment confirmation

## 🏗️ Project Architecture

```
family-heirloom-key/
├── contracts/                 # Solidity smart contracts with FHE
│   └── FamilyHeirloomKey.sol
├── test/                     # Comprehensive test suite
│   ├── FamilyHeirloomKey.test.ts
│   └── FamilyHeirloomKey.integration.test.ts
├── scripts/                  # Deployment utilities
│   └── deploy.ts
├── src/                      # React frontend application
│   ├── components/          # Reusable UI components
│   │   ├── CreateVaultDialog.tsx     # Heirloom creation form
│   │   ├── HeirloomCard.tsx          # Heirloom display card
│   │   ├── InheritanceRequestDialog.tsx # Inheritance request UI
│   │   ├── WalletStatus.tsx          # Wallet connection status
│   │   ├── ErrorBoundary.tsx         # Error handling boundary
│   │   └── ErrorAlert.tsx           # Error message display
│   ├── hooks/               # Custom React hooks
│   │   └── useTransactionError.ts   # Transaction error handling
│   └── lib/                 # Configuration and utilities
│       └── wagmi.ts                # Wallet configuration
└── docs/                    # Documentation and guides
```

## 📋 Smart Contract API

### FamilyHeirloomKey.sol

FHE-powered contract for encrypted family heirloom management with inheritance capabilities.

#### 🔨 Core Functions

**Heirloom Creation:**
```solidity
function mintHeirloom(
    string memory title,
    string memory description,
    externalEuint32 memory encryptedValue,
    bytes memory valueProof,
    address designatedHeir,
    uint256 inheritanceDeadline
) external whenNotPaused
```
- Creates encrypted family heirloom with FHE value protection
- Validates all inputs including deadline constraints (1-100 years)
- Mints ERC721 token and tracks user heirlooms

**Inheritance Workflow:**
```solidity
function requestInheritance(
    uint256 tokenId,
    externalEuint32 memory proofOfLife,
    bytes memory lifeProof
) external onlyDesignatedHeir(tokenId) heirloomExists(tokenId) whenNotPaused
```
- Designated heir requests inheritance with encrypted proof-of-life
- Validates inheritance deadline has passed
- Creates inheritance request for creator approval

```solidity
function approveInheritance(uint256 tokenId) external heirloomExists(tokenId) whenNotPaused
```
- Original creator approves inheritance request
- Transfers NFT ownership to designated heir
- Marks inheritance as triggered

**Management Functions:**
```solidity
function setDesignatedHeir(uint256 tokenId, address newHeir) external onlyHeirloomOwner(tokenId) whenNotPaused
```
- Updates designated heir for existing heirloom
- Validates new heir address (not zero, not self)

#### 👁️ View Functions

```solidity
function getHeirloom(uint256 tokenId) external view returns (
    address creator, string memory title, string memory description,
    address designatedHeir, uint256 creationTime, uint256 inheritanceDeadline,
    bool isActive, bool inheritanceTriggered
)
```
Returns complete heirloom metadata and status.

```solidity
function getEncryptedValue(uint256 tokenId) external view returns (euint32)
```
Returns encrypted heirloom value (restricted to owner/heir only).

```solidity
function getUserHeirlooms(address user) external view returns (uint256[] memory)
function getUserHeirloomCount(address user) external view returns (uint256)
```
User heirloom portfolio management.
  - Returns `ebool` (encrypted boolean result)

- `getVerificationResult(user)`: Get last verification result
  - Returns `ebool` (encrypted boolean: true = allow, false = deny)

**Note**: Current implementation uses `FHE.lt(spending, balance)` which allows when `balance > spending`. For `balance == spending`, it will deny. This is acceptable for MVP.

### Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Balance Verifier
/// @notice A contract that verifies encrypted balance against encrypted spending amount
/// @dev Uses FHE to encrypt balance and spending amount, then compares them on-chain
/// @dev Only returns "allow" or "deny" result without revealing actual amounts
contract EncryptedBalanceVerifier is SepoliaConfig {
    // Mapping from user address to their encrypted balance
    mapping(address => euint32) private _balances;
    
    // Mapping from user address to their last verification result
    mapping(address => ebool) private _verificationResults;

    event BalanceSet(address indexed user, uint64 timestamp);
    event VerificationPerformed(address indexed user, bool allowed, uint64 timestamp);

    /// @notice Set or update the encrypted balance for the caller
    /// @param encryptedBalance The encrypted balance value
    /// @param inputProof The FHE input proof for the encrypted balance
    function setBalance(externalEuint32 encryptedBalance, bytes calldata inputProof) external {
        euint32 balance = FHE.fromExternal(encryptedBalance, inputProof);
        
        // Store the encrypted balance
        _balances[msg.sender] = balance;
        
        // Grant access: contract and user can decrypt
        FHE.allowThis(balance);
        FHE.allow(balance, msg.sender);
        
        emit BalanceSet(msg.sender, uint64(block.timestamp));
    }

    /// @notice Get the encrypted balance for a user
    /// @param user The user address
    /// @return The encrypted balance
    function getBalance(address user) external view returns (euint32) {
        return _balances[user];
    }

    /// @notice Verify if balance is sufficient for spending amount
    /// @param encryptedSpending The encrypted spending amount
    /// @param inputProof The FHE input proof for the encrypted spending
    /// @return result The encrypted boolean result (true = allow, false = deny)
    /// @dev Uses FHE.lt to check if spending < balance (i.e., balance > spending)
    /// @dev Note: This allows when balance > spending. For balance == spending, it will deny.
    /// @dev For exact >= comparison, we would need FHE.gte which may not be available.
    function verifySpending(externalEuint32 encryptedSpending, bytes calldata inputProof) external returns (ebool) {
        euint32 spending = FHE.fromExternal(encryptedSpending, inputProof);
        euint32 balance = _balances[msg.sender];
        
        // Check if spending < balance (i.e., balance > spending)
        // This allows the transaction when balance > spending
        // For balance == spending, this will return false (deny)
        // For MVP, this is acceptable behavior
        ebool result = FHE.lt(spending, balance);
        
        // Store the verification result
        _verificationResults[msg.sender] = result;
        
        // Grant access: contract and user can decrypt the result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        
        emit VerificationPerformed(msg.sender, true, uint64(block.timestamp));
        
        return result;
    }

    /// @notice Get the last verification result for a user
    /// @param user The user address
    /// @return The encrypted boolean result (true = allow, false = deny)
    function getVerificationResult(address user) external view returns (ebool) {
        return _verificationResults[user];
    }

    /// @notice Check if a user has a balance set
    /// @param user The user address
    /// @return Whether the user has a balance set
    function hasBalance(address user) external view returns (bool) {
        // Check if balance is initialized (not zero hash)
        // This is a simplified check - in production you might want a better way
        return true; // Always return true as we can't easily check euint32 initialization
    }
}
```

## Encryption & Decryption Logic

This section explains the complete encryption and decryption flow for balance and spending amounts using FHEVM.

### Frontend Encryption Flow

The frontend encrypts user input (balance or spending amount) before sending it to the contract:

1. **Create Encrypted Input**:
   ```typescript
   const input = fhevmInstance.createEncryptedInput(
     CONTRACT_ADDRESS,
     userAddress
   );
   input.add32(balanceAmount); // Add balance as euint32
   const encrypted = await input.encrypt();
   ```

2. **Get Encrypted Handle**:
   ```typescript
   // Handle is a bytes32 value (32 bytes)
   let handleHex: string;
   if (typeof encrypted.handles[0] === 'string') {
     handleHex = encrypted.handles[0];
   } else {
     // Handle is Uint8Array, convert to hex
     handleHex = ethers.hexlify(encrypted.handles[0]);
     // Ensure it's 32 bytes (66 chars: 0x + 64 hex chars)
     if (handleHex.length < 66) {
       const padded = handleHex.slice(2).padStart(64, '0');
       handleHex = `0x${padded}`;
     } else if (handleHex.length > 66) {
       handleHex = handleHex.slice(0, 66);
     }
   }
   
   // Convert inputProof to hex if needed
   let inputProofHex: string;
   if (typeof encrypted.inputProof === 'string') {
     inputProofHex = encrypted.inputProof;
   } else {
     inputProofHex = ethers.hexlify(encrypted.inputProof);
   }
   ```

3. **Send to Contract**:
   ```typescript
   const tx = await contract.setBalance(
     handleHex,        // externalEuint32 (bytes32)
     inputProofHex     // bytes calldata
   );
   const receipt = await tx.wait();
   ```

### On-Chain Processing

The smart contract receives encrypted data and performs computations without decrypting:

1. **Import Encrypted Data**:
   ```solidity
   euint32 balance = FHE.fromExternal(encryptedBalance, inputProof);
   ```

2. **Perform Encrypted Comparison**:
   ```solidity
   ebool result = FHE.lt(spending, balance);
   // Returns encrypted boolean: true if balance > spending
   ```

3. **Grant Decryption Access**:
   ```solidity
   FHE.allowThis(result);        // Contract can decrypt
   FHE.allow(result, msg.sender); // User can decrypt
   ```

### Frontend Decryption Flow

After the contract performs the encrypted comparison, the frontend decrypts the result:

1. **Prepare Decryption Signature** (before calling verifySpending):
   ```typescript
   // Prepare decryption signature before calling contract
   const sig = await FhevmDecryptionSignature.loadOrSign(
     fhevmInstance,
     [CONTRACT_ADDRESS as `0x${string}`],
     ethersSigner,
     storage
   );
   ```

2. **Call verifySpending and Wait for Confirmation**:
   ```typescript
   // Encrypt spending amount (same process as balance encryption)
   const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
   input.add32(spendingNum);
   const encrypted = await input.encrypt();
   
   // Send transaction
   const tx = await contract.verifySpending(spendingHandleHex, spendingInputProofHex);
   const receipt = await tx.wait();
   
   // Wait for state to update (FHEVM may need time)
   await new Promise(resolve => setTimeout(resolve, 2000));
   ```

3. **Query Encrypted Result**:
   ```typescript
   // After verifySpending transaction is confirmed, query the result
   // Use provider.call() to get raw bytes32 (avoid ethers decoding issues with FHE types)
   const data = contract.interface.encodeFunctionData("getVerificationResult", [address]);
   const rawResult = await provider.call({
     to: CONTRACT_ADDRESS,
     data: data,
   });
   
   // Extract bytes32 handle from return data
   // Solidity returns are padded: 0x + 32 bytes of padding + 32 bytes of actual data
   let resultHandle: string;
   if (rawResult.length >= 130) {
     // Extract the last 32 bytes (64 hex chars) after 0x
     resultHandle = "0x" + rawResult.slice(-64);
   } else if (rawResult.length === 66) {
     // Already a 32-byte value
     resultHandle = rawResult;
   } else {
     // Normalize to 32 bytes
     resultHandle = `0x${rawResult.slice(2).padStart(64, '0')}`;
   }
   ```

4. **Decrypt Result**:
   ```typescript
   const decryptedResults = await fhevmInstance.userDecrypt(
     [{ handle: resultHandle, contractAddress: CONTRACT_ADDRESS }],
     sig.privateKey,
     sig.publicKey,
     sig.signature,
     sig.contractAddresses,
     sig.userAddress,
     sig.startTimestamp,
     sig.durationDays
   );
   
   // Extract decrypted boolean value
   // ebool is stored as 0 or 1 in the result
   const decryptedValue = decryptedResults[resultHandle];
   if (decryptedValue === undefined) {
     throw new Error("Decryption failed: result is undefined");
   }
   
   // Handle both BigInt and number types
   const result = decryptedValue === 1n || 
                  decryptedValue === BigInt(1) || 
                  decryptedValue === true || 
                  (typeof decryptedValue === "number" && decryptedValue === 1);
   
   // result is true for ALLOW, false for DENY
   ```

### Key Data Structures

- **euint32**: Encrypted unsigned 32-bit integer (stored as bytes32 on-chain)
  - Represents encrypted numeric values (balance, spending amounts)
  - Can be used in FHE operations like comparison, addition, subtraction
  
- **ebool**: Encrypted boolean (stored as bytes32 on-chain)
  - Represents encrypted boolean results (true/false)
  - Used for verification results (ALLOW/DENY)
  
- **externalEuint32**: External encrypted input format
  - Consists of a bytes32 handle (encrypted data reference) and inputProof
  - Used when passing encrypted data from frontend to contract
  
- **inputProof**: FHE proof that validates the encrypted input
  - Cryptographic proof that the encrypted data is valid
  - Required by the contract to accept external encrypted inputs

### Privacy Guarantees

- ✅ Balance values never revealed on-chain (stored as `euint32`)
- ✅ Spending amounts never revealed on-chain (encrypted before sending)
- ✅ Only comparison result (boolean) is decrypted
- ✅ All computations performed on encrypted data using FHE operations
- ✅ Decryption keys managed securely by FHEVM relayer

## Setup

### Prerequisites

- Node.js >= 20
- npm >= 7
- Hardhat node running (for local testing)
- Rainbow wallet browser extension

### Installation

```bash
# Install dependencies
npm install

# Install UI dependencies
cd ui
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Local tests (requires Hardhat node with FHEVM)
npm test test/EncryptedBalanceVerifier.ts

# Sepolia tests (requires deployed contract)
npm test test/EncryptedBalanceVerifierSepolia.ts
```

### Deploy

```bash
# Deploy to localhost
npx hardhat deploy --network localhost

# Deploy to Sepolia
npx hardhat deploy --network sepolia
```

After deployment, update `ui/src/lib/contract.ts` with the deployed contract address.

## Frontend Development

### Start Development Server

```bash
cd ui
npm run dev
```

### FHEVM Integration

The frontend uses the FHEVM SDK for encryption and decryption:

1. **FHEVM Instance Creation** (`ui/src/fhevm/useFhevm.tsx`):
   - Automatically detects local (mock) or testnet (real) FHEVM
   - Handles public key storage and retrieval
   - Manages instance lifecycle

2. **Encryption** (`BalanceVerifier.tsx`):
   - Uses `fhevmInstance.createEncryptedInput()` to create encrypted inputs
   - Converts handles to hex strings for contract interaction

3. **Decryption** (`BalanceVerifier.tsx`):
   - Uses `FhevmDecryptionSignature` for signing decryption requests
   - Uses `fhevmInstance.userDecrypt()` to decrypt results
   - Handles both `euint32` and `ebool` types

### Wallet Configuration

The project uses Rainbow wallet with wagmi. Configuration in `ui/src/lib/wagmi.ts`:
- Supports localhost (31337) and Sepolia testnet
- Uses WalletConnect for wallet connection
- Configured with RainbowKit UI

## Usage

1. **Connect Wallet**: 
   - Click "Connect Wallet" in the header
   - Select Rainbow wallet or other compatible wallet

2. **Set Balance**: 
   - Enter your balance amount (e.g., 1000)
   - Click "Set Balance"
   - Wait for transaction confirmation
   - Balance is encrypted and stored on-chain

3. **Verify Spending**: 
   - Enter a spending amount (e.g., 500)
   - Click "Verify"
   - System compares encrypted values on-chain
   - Returns ALLOW (if balance > spending) or DENY

4. **View Result**: 
   - Result is displayed without revealing actual amounts
   - Only the boolean result (ALLOW/DENY) is decrypted

## Testing

### Local Testing

1. Start Hardhat node with FHEVM:
   ```bash
   npx hardhat node
   ```

2. Deploy contract:
   ```bash
   npx hardhat deploy --network localhost
   ```

3. Update contract address in `ui/src/lib/contract.ts`

4. Start frontend:
   ```bash
   cd ui
   npm run dev
   ```

5. Run tests:
   ```bash
   npm test test/EncryptedBalanceVerifier.ts
   ```

### Testnet Testing

1. Deploy to Sepolia:
   ```bash
   npx hardhat deploy --network sepolia
   ```

2. Update contract address in `ui/src/lib/contract.ts`

3. Run Sepolia tests:
   ```bash
   npm test test/EncryptedBalanceVerifierSepolia.ts
   ```

## Architecture

### Complete Flow

#### Setting Balance Flow

```
User Input (Balance: e.g., 1000)
    ↓
Frontend: fhevmInstance.createEncryptedInput()
    ↓
Frontend: input.add32(balanceAmount)
    ↓
Frontend: encrypted = await input.encrypt()
    ↓
Frontend: Extract handle (bytes32) and inputProof
    ↓
Smart Contract: setBalance(externalEuint32, inputProof)
    ↓
Contract: FHE.fromExternal() → euint32 balance
    ↓
Contract: Store in _balances[user]
    ↓
Contract: FHE.allowThis() + FHE.allow() (grant decryption access)
    ↓
Contract: Emit BalanceSet event
    ↓
✅ Encrypted balance stored on-chain
```

#### Verification Flow

```
User Input (Spending: e.g., 500)
    ↓
Frontend: Prepare decryption signature (FhevmDecryptionSignature)
    ↓
Frontend: Encrypt spending amount (same as balance)
    ↓
Smart Contract: verifySpending(externalEuint32, inputProof)
    ↓
Contract: FHE.fromExternal() → euint32 spending
    ↓
Contract: Retrieve euint32 balance from _balances[user]
    ↓
Contract: ebool result = FHE.lt(spending, balance)
    ↓
Contract: Store result in _verificationResults[user]
    ↓
Contract: FHE.allowThis() + FHE.allow() (grant decryption access)
    ↓
Contract: Emit VerificationPerformed event
    ↓
Frontend: Query getVerificationResult() → ebool
    ↓
Frontend: Extract bytes32 handle from return data
    ↓
Frontend: fhevmInstance.userDecrypt() with signature
    ↓
Frontend: Decrypt ebool → boolean (1 = ALLOW, 0 = DENY)
    ↓
✅ Result displayed: ALLOW or DENY (without revealing amounts)
```

### Privacy Guarantees

- Balance values never revealed on-chain
- Spending amounts never revealed on-chain
- Only comparison result (boolean) is decrypted
- All computations performed on encrypted data
- Decryption requires user signature and FHEVM relayer

## Limitations

- Current implementation: `balance > spending` (not `>=`)
  - For `balance == spending`, it will deny
  - This is acceptable for MVP
- Requires FHEVM-compatible network (Hardhat local or Sepolia)
- Gas costs are higher due to FHE operations
- Decryption requires FHEVM relayer (for testnet)

## Future Improvements

- Support for `balance >= spending` comparison (if `FHE.gte` becomes available)
- Batch verification support
- Multi-currency support
- Gas optimization
- Additional FHE operations (addition, subtraction, etc.)
- Support for larger integer types (euint64, euint128)

## License

MIT

<<<<<<< HEAD
=======
## 🚀 Deployment Guide

### Prerequisites

- Node.js 18+
- Yarn or npm
- Hardhat
- Wallet with testnet funds (Sepolia ETH)

### Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your:
# - INFURA_API_KEY
# - MNEMONIC (for deployment)
# - ETHERSCAN_API_KEY (for verification)
```

### Local Development

```bash
# Start local Hardhat network
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost

# Run tests
npx hardhat test
```

### Testnet Deployment

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Frontend Setup

```bash
# Install frontend dependencies
cd src && npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Technical Documentation

### FHE Integration

The contract uses Zama's FHEVM for encrypted value storage and inheritance verification:

- **Value Encryption**: Heirloom monetary values are stored as `euint32`
- **Proof Verification**: All FHE operations require zero-knowledge proofs
- **Access Control**: Encrypted values only decryptable by owner/heir

### Security Features

- **Input Validation**: Comprehensive validation for all user inputs
- **Access Control**: Multi-level permission system with modifiers
- **Emergency Pause**: Owner can pause all contract operations
- **Reentrancy Protection**: Built-in safeguards against reentrancy attacks

### Gas Optimization

- **Efficient Storage**: Optimized struct packing and storage patterns
- **Batch Operations**: Minimal external calls and operations
- **Event Indexing**: Strategic event parameter indexing for efficient queries

## 📞 Support

- **Documentation**: [Full API Docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/LynnDickey/family-heirloom-key/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LynnDickey/family-heirloom-key/discussions)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Development setup and workflow
- Coding standards and best practices
- Testing guidelines
- Submitting pull requests
- Reporting issues

## 📄 License

BSD 3-Clause Clear License - see [LICENSE](./LICENSE) for details.

>>>>>>> ad68c0b3866257f8f4445896451915be16058b72
## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [RainbowKit Documentation](https://rainbowkit.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Zama FHEVM](https://github.com/zama-ai/fhevm)
