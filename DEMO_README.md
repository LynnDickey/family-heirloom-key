# Family Heirloom Key - Demo Video Guide

## 🎬 Demo Video: Family Heirloom Key in Action

**Video Link**: [Watch the full demo on GitHub](https://github.com/LynnDickey/family-heirloom-key/blob/main/family-heirloom-key-demo.mp4)

**Duration**: 4:32 minutes
**Resolution**: 1920x1080 (Full HD)
**Format**: MP4

## 📋 Demo Script & Timestamps

### 0:00 - 0:45 | Introduction
- Welcome to Family Heirloom Key
- Overview of FHE-powered family heirloom management
- Key features: Privacy, Inheritance, Multi-chain support

### 0:45 - 1:30 | Wallet Connection & Setup
- Connecting MetaMask wallet
- Network selection (Sepolia testnet)
- Account balance and permissions

### 1:30 - 2:45 | Creating Your First Heirloom
- Accessing the creation interface
- Filling out heirloom details:
  - Title: "Grandfather's Gold Pocket Watch"
  - Description: Detailed family history
  - Heir selection: Family member's address
  - Inheritance deadline: 10 years from now
  - Encrypted value: 0.5 ETH
- Form validation and security checks
- Transaction submission and confirmation

### 2:45 - 3:30 | Managing Heirlooms
- Dashboard overview of created heirlooms
- Viewing heirloom details with encrypted values
- Changing designated heir
- Tracking inheritance deadlines
- Real-time status updates

### 3:30 - 4:15 | Inheritance Process Demonstration
- Switching to heir's wallet
- Requesting inheritance when deadline reached
- Encrypted proof-of-life verification
- Original creator approval workflow
- Successful inheritance transfer

### 4:15 - 4:32 | Advanced Features & Closing
- Multi-chain deployment options
- Security features overview
- Future roadmap highlights
- Call to action for testing

## 🔧 Demo Environment Setup

The demo was recorded using:
- **Browser**: Google Chrome 119.0
- **Wallet**: MetaMask Extension v11.5.2
- **Network**: Sepolia Testnet
- **Test Accounts**: Pre-funded with test ETH
- **Screen Recording**: OBS Studio with 60 FPS

## 🎯 Demo Highlights

### Privacy-Preserving Technology
- Live demonstration of FHE encryption
- Zero-knowledge proof verification
- Encrypted value handling without decryption

### User Experience
- Intuitive React interface
- Real-time transaction feedback
- Comprehensive error handling
- Mobile-responsive design

### Security Features
- Input validation and sanitization
- Rate limiting protection
- Reentrancy guards
- Access control enforcement

## 📊 Technical Specifications

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React hooks + wagmi
- **Error Handling**: Custom hooks with user-friendly messages

### Blockchain Integration
- **Networks**: Ethereum, Polygon, Arbitrum, Optimism, Base
- **FHE Provider**: Zama FHEVM Sepolia
- **Wallet Support**: MetaMask, Rainbow, Coinbase Wallet
- **Transaction Monitoring**: Real-time status updates

### Smart Contract Features
- **FHE Operations**: Encrypted value storage and verification
- **Access Control**: Role-based permissions with modifiers
- **Emergency Controls**: Contract pausing and emergency functions
- **Gas Optimization**: Efficient storage and computation patterns

## 🚀 Getting Started with Demo

1. **Clone the repository**
   ```bash
   git clone https://github.com/LynnDickey/family-heirloom-key.git
   cd family-heirloom-key
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your wallet and API keys
   ```

4. **Run local development**
   ```bash
   npm run dev
   ```

5. **Deploy contracts (optional)**
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

## 📞 Support & Feedback

- **Issues**: [GitHub Issues](https://github.com/LynnDickey/family-heirloom-key/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LynnDickey/family-heirloom-key/discussions)
- **Email**: demo@family-heirloom-key.com

---

*Demo recorded: November 19, 2025*
*Version: 1.0.0-final*
