# Frequently Asked Questions (FAQ)

## 🔐 About Privacy & Security

### Q: How does FHE protect my heirloom values?
**A:** Fully Homomorphic Encryption (FHE) allows computations on encrypted data without decryption. Your heirloom values remain encrypted on-chain and can only be decrypted by authorized parties (you or your designated heir) with the proper keys.

### Q: Can anyone see my heirloom's monetary value?
**A:** No. The values are stored as encrypted data (`euint32`) on the blockchain. Only you and your designated heir can decrypt and view the actual values using FHE decryption keys.

### Q: What happens if I lose my wallet?
**A:** If you lose access to your wallet, you lose access to your encrypted heirlooms. We strongly recommend:
- Using hardware wallets for long-term storage
- Keeping multiple backups of your seed phrase
- Setting up inheritance with trusted family members

## 💰 Gas Fees & Costs

### Q: How much does it cost to create an heirloom?
**A:** Gas fees vary by network congestion:
- **Sepolia Testnet**: Free (test ETH)
- **Ethereum Mainnet**: ~$5-20 USD
- **Polygon/Arbitrum**: ~$0.10-1 USD

### Q: Are there any platform fees?
**A:** No platform fees. You only pay standard blockchain gas fees for transactions.

## 🏠 Creating & Managing Heirlooms

### Q: Can I change my designated heir after creation?
**A:** Yes! As the original creator, you can update the designated heir at any time using the "Set Designated Heir" function. This allows you to adapt to changing life circumstances.

### Q: What's the minimum inheritance deadline?
**A:** Inheritance deadlines must be at least 1 year (365 days) from creation to ensure proper estate planning and prevent premature claims.

### Q: Can I have multiple heirs for one heirloom?
**A:** Currently, each heirloom supports one designated heir. However, you can create multiple heirlooms with different heirs to distribute your digital legacy.

### Q: What happens if my heir doesn't claim the inheritance?
**A:** The inheritance remains available indefinitely. The designated heir can request inheritance any time after the deadline passes, and you can approve it when ready.

## 🔄 Inheritance Process

### Q: How do I prove I'm alive for inheritance?
**A:** The system uses encrypted proof-of-life verification through FHE. When requesting inheritance, you provide encrypted proof that demonstrates you're the legitimate designated heir and meet the inheritance criteria.

### Q: Can the original creator reject an inheritance request?
**A:** No. Once the inheritance deadline passes and a valid request is made, the original creator can approve the transfer, but cannot prevent it if all conditions are met.

### Q: What happens to the heirloom after inheritance?
**A:** The NFT ownership transfers to the designated heir, and the inheritance is marked as "triggered." The heirloom becomes fully owned by the new owner.

## 🌐 Technical Questions

### Q: Which blockchains are supported?
**A:** Family Heirloom Key supports:
- Ethereum (Mainnet & Sepolia testnet)
- Polygon
- Arbitrum
- Optimism
- Base

### Q: Do I need special software?
**A:** No special software beyond a Web3-compatible wallet. The dApp works in any modern web browser.

### Q: Is my data stored permanently?
**A:** Yes, all heirloom data is stored permanently on the blockchain. The smart contract ensures data immutability and availability.

### Q: Can the contract be upgraded?
**A:** The contract is designed for security and backward compatibility. Any upgrades would maintain access to existing heirlooms while adding new features.

## 🆘 Troubleshooting

### Q: My transaction is stuck. What should I do?
**A:** Check your wallet's transaction history. If it's pending:
1. Wait for network confirmation (can take 1-30 minutes)
2. Check gas price - you may need to speed up the transaction
3. Contact support if it remains stuck for >1 hour

### Q: I entered the wrong heir address. Can I fix it?
**A:** Yes! As the creator, you can update the designated heir address at any time before inheritance occurs.

### Q: The dApp isn't loading. What can I do?
**A:**
1. Clear your browser cache and cookies
2. Disable browser extensions temporarily
3. Try a different browser
4. Check if you're using a VPN that blocks Web3 sites

### Q: I can't connect my wallet.
**A:**
1. Ensure your wallet is unlocked
2. Check that you're on the correct network
3. Try refreshing the page
4. Restart your wallet application

## 📞 Support & Contact

### Q: How do I get help?
**A:**
- **Live Chat**: Available 9 AM - 6 PM PST, Monday-Friday
- **Email**: support@family-heirloom-key.com
- **GitHub Issues**: For technical bugs and feature requests
- **Discord Community**: Join for peer support and discussions

### Q: Is customer support 24/7?
**A:** Live chat is available during business hours (9 AM - 6 PM PST). For urgent security issues, email security@family-heirloom-key.com anytime.

### Q: Do you offer phone support?
**A:** Currently, we provide email and live chat support. For complex inheritance planning questions, we recommend consulting with estate planning professionals.

## 🔮 Future Features

### Q: Will you support multiple heirs per heirloom?
**A:** This is on our roadmap. We're exploring FHE-based multi-sig inheritance schemes.

### Q: Are there plans for cross-chain heirlooms?
**A:** We're researching cross-chain inheritance mechanisms that would work across different blockchains while maintaining privacy.

### Q: Will you add automated inheritance triggers?
**A:** We're considering oracle-based automation for inheritance triggers, such as time-locked releases or event-based conditions.

---

*Last updated: November 2025*

If your question isn't answered here, please reach out to our support team!
