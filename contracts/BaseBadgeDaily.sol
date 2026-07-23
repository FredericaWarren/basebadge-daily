// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BaseBadgeDaily is ERC721Enumerable, Ownable {
    struct UserStats {
        uint256 badgeCount;
        uint256 rewardPoints;
        address referrer;
    }

    uint256 private _nextTokenId = 1;
    string private _badgeBaseURI;

    bool public claimingPaused;
    uint256 public pointsPerClaim = 10;
    uint256 public userReferralBonus = 25;
    uint256 public referrerReferralBonus = 50;

    mapping(address => UserStats) private _userStats;

    event BadgeClaimed(
        address indexed user,
        uint256 indexed tokenId,
        uint256 pointsAwarded,
        address indexed referrer
    );

    error ClaimingPaused();
    error SoulboundBadge();
    error InvalidSelfReferrer();

    constructor(string memory initialBaseURI) ERC721("BaseBadge Daily", "BBD") Ownable(msg.sender) {
        _badgeBaseURI = initialBaseURI;
    }

    function claimBadge(address referrer) external returns (uint256 tokenId) {
        if (claimingPaused) revert ClaimingPaused();
        if (referrer == msg.sender) revert InvalidSelfReferrer();

        UserStats storage stats = _userStats[msg.sender];
        address activeReferrer = stats.referrer;
        uint256 pointsAwarded = pointsPerClaim;

        if (stats.badgeCount == 0 && referrer != address(0)) {
            activeReferrer = referrer;
            stats.referrer = referrer;
            stats.rewardPoints += userReferralBonus;
            _userStats[referrer].rewardPoints += referrerReferralBonus;
            pointsAwarded += userReferralBonus;
        }

        tokenId = _nextTokenId++;
        stats.badgeCount += 1;
        stats.rewardPoints += pointsPerClaim;

        _safeMint(msg.sender, tokenId);

        emit BadgeClaimed(msg.sender, tokenId, pointsAwarded, activeReferrer);
    }

    function userStats(address user) external view returns (uint256 count, uint256 points, address referrer) {
        UserStats memory stats = _userStats[user];
        return (stats.badgeCount, stats.rewardPoints, stats.referrer);
    }

    function badgeCount(address user) external view returns (uint256) {
        return _userStats[user].badgeCount;
    }

    function rewardPoints(address user) external view returns (uint256) {
        return _userStats[user].rewardPoints;
    }

    function referrerOf(address user) external view returns (address) {
        return _userStats[user].referrer;
    }

    function totalBadges() external view returns (uint256) {
        return totalSupply();
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _badgeBaseURI = newBaseURI;
    }

    function setClaimingPaused(bool paused) external onlyOwner {
        claimingPaused = paused;
    }

    function setPointsPerClaim(uint256 newPointsPerClaim) external onlyOwner {
        pointsPerClaim = newPointsPerClaim;
    }

    function setReferralBonuses(uint256 newUserReferralBonus, uint256 newReferrerReferralBonus) external onlyOwner {
        userReferralBonus = newUserReferralBonus;
        referrerReferralBonus = newReferrerReferralBonus;
    }

    function _baseURI() internal view override returns (string memory) {
        return _badgeBaseURI;
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert SoulboundBadge();
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_badgeBaseURI, Strings.toString(tokenId), ".json");
    }

    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundBadge();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert SoulboundBadge();
    }
}
