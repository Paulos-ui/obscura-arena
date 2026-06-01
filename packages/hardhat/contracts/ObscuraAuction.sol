// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title ObscuraAuction
 * @notice Confidential sealed-bid auctions on Base, powered by Fhenix CoFHE.
 *
 *  The privacy story (this is the whole point):
 *   - Every bid is submitted ENCRYPTED. The contract never sees a plaintext bid.
 *   - The "currently winning" bid + winner are tracked on encrypted data using
 *     FHE.gt + FHE.select. The chain computes who is winning WITHOUT decrypting
 *     anyone's bid.
 *   - Losing bids are NEVER revealed, to anyone, ever.
 *   - A bidder can privately unseal ONLY their own bid (client-side, via permit).
 *   - At settlement the seller triggers a threshold decryption of just the
 *     winning amount + winner index. Everything else stays sealed forever.
 *
 *  This is exactly the "sealed-bid mechanic / confidential state" primitive that
 *  transparent EVM chains cannot do — and the reason MEV bots can't front-run it.
 */
contract ObscuraAuction {
    struct Auction {
        string title; // public: what's being auctioned
        address seller; // public
        uint64 endTime; // public: bidding closes here
        bool settled; // public: settlement requested
        bool revealReady; // public: decrypted result is finalized
        uint32 bidderCount; // public: how many sealed bids (count only, not values)
        uint256 revealedAmount; // set only after reveal
        address revealedWinner; // set only after reveal
        euint128 highestBid; // ENCRYPTED running maximum bid
        euint32 winnerIndex; // ENCRYPTED index (into bidders[]) of the leader
    }

    uint256 public auctionCount;
    mapping(uint256 => Auction) private auctions;

    // auctionId => bidder address => their ENCRYPTED bid
    mapping(uint256 => mapping(address => euint128)) private bids;
    // auctionId => ordered list of bidder addresses (index used as winner id)
    mapping(uint256 => address[]) private bidders;
    // auctionId => bidder => already-bid guard / index+1 (0 means "no bid")
    mapping(uint256 => mapping(address => uint32)) private bidderIndexPlus1;

    event AuctionCreated(uint256 indexed id, address indexed seller, string title, uint64 endTime);
    event BidSealed(uint256 indexed id, address indexed bidder, uint32 bidderCount);
    event SettlementRequested(uint256 indexed id);
    event AuctionRevealed(uint256 indexed id, address winner, uint256 amount);

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------
    function createAuction(string calldata title, uint64 durationSeconds) external returns (uint256 id) {
        require(durationSeconds > 0, "duration=0");
        id = auctionCount++;

        Auction storage a = auctions[id];
        a.title = title;
        a.seller = msg.sender;
        a.endTime = uint64(block.timestamp) + durationSeconds;

        // Initialize encrypted accumulators to 0 and let the contract use them.
        a.highestBid = FHE.asEuint128(0);
        a.winnerIndex = FHE.asEuint32(0);
        FHE.allowThis(a.highestBid);
        FHE.allowThis(a.winnerIndex);

        emit AuctionCreated(id, msg.sender, title, a.endTime);
    }

    // -------------------------------------------------------------------------
    // Bid (sealed)
    // -------------------------------------------------------------------------
    function placeBid(uint256 id, InEuint128 calldata encBid) external {
        Auction storage a = auctions[id];
        require(a.seller != address(0), "no auction");
        require(block.timestamp < a.endTime, "ended");
        require(!a.settled, "settled");

        euint128 bid = FHE.asEuint128(encBid);

        // Register a stable index for this bidder (first bid only).
        uint32 idx;
        if (bidderIndexPlus1[id][msg.sender] == 0) {
            idx = uint32(bidders[id].length);
            bidders[id].push(msg.sender);
            bidderIndexPlus1[id][msg.sender] = idx + 1;
            a.bidderCount += 1;
        } else {
            idx = bidderIndexPlus1[id][msg.sender] - 1;
        }

        // Store the bidder's own sealed bid and let ONLY them decrypt it later.
        bids[id][msg.sender] = bid;
        FHE.allowThis(bid);
        FHE.allow(bid, msg.sender);

        // ---- The FHE flex: update the leader entirely on ciphertext ----
        // isHigher = (bid > highestBid)  [encrypted boolean]
        ebool isHigher = FHE.gt(bid, a.highestBid);
        // highestBid = isHigher ? bid : highestBid   (no plaintext ever exposed)
        a.highestBid = FHE.select(isHigher, bid, a.highestBid);
        // winnerIndex = isHigher ? thisBidderIndex : winnerIndex
        a.winnerIndex = FHE.select(isHigher, FHE.asEuint32(idx), a.winnerIndex);

        FHE.allowThis(a.highestBid);
        FHE.allowThis(a.winnerIndex);

        emit BidSealed(id, msg.sender, a.bidderCount);
    }

    // -------------------------------------------------------------------------
    // Settle -> request threshold decryption of ONLY the winning result
    // -------------------------------------------------------------------------
    function settle(uint256 id) external {
        Auction storage a = auctions[id];
        require(a.seller != address(0), "no auction");
        require(block.timestamp >= a.endTime, "not ended");
        require(!a.settled, "already settled");

        a.settled = true;
        // Ask the CoFHE threshold network to decrypt just these two handles.
        FHE.decrypt(a.highestBid);
        FHE.decrypt(a.winnerIndex);

        emit SettlementRequested(id);
    }

    // -------------------------------------------------------------------------
    // Finalize reveal -> read decrypted result once ready (the "ceremony")
    // -------------------------------------------------------------------------
    function finalizeReveal(uint256 id) external {
        Auction storage a = auctions[id];
        require(a.settled, "not settled");
        require(!a.revealReady, "already revealed");

        (uint256 amount, bool amtReady) = FHE.getDecryptResultSafe(a.highestBid);
        (uint256 widx, bool idxReady) = FHE.getDecryptResultSafe(a.winnerIndex);
        require(amtReady && idxReady, "decryption not ready");

        a.revealedAmount = amount;
        if (bidders[id].length > 0) {
            a.revealedWinner = bidders[id][widx];
        }
        a.revealReady = true;

        emit AuctionRevealed(id, a.revealedWinner, amount);
    }

    // -------------------------------------------------------------------------
    // Views
    // -------------------------------------------------------------------------

    /// @notice Public, non-sensitive metadata for an auction.
    function getAuction(uint256 id)
        external
        view
        returns (
            string memory title,
            address seller,
            uint64 endTime,
            bool settled,
            bool revealReady,
            uint32 bidderCount,
            uint256 revealedAmount,
            address revealedWinner
        )
    {
        Auction storage a = auctions[id];
        return (
            a.title,
            a.seller,
            a.endTime,
            a.settled,
            a.revealReady,
            a.bidderCount,
            a.revealedAmount,
            a.revealedWinner
        );
    }

    /// @notice The ENCRYPTED highest-bid handle. Anyone can read it; nobody can
    ///         decrypt it until settlement. This is the "sealed" public view.
    function getSealedHighestBid(uint256 id) external view returns (euint128) {
        return auctions[id].highestBid;
    }

    /// @notice The caller's OWN encrypted bid handle, to unseal client-side via
    ///         their permit. Other users' bids are not accessible here.
    function getMyEncryptedBid(uint256 id) external view returns (euint128) {
        return bids[id][msg.sender];
    }

    function hasBid(uint256 id, address who) external view returns (bool) {
        return bidderIndexPlus1[id][who] != 0;
    }
}
