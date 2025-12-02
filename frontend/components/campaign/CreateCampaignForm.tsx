import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, usePublicClient } from 'wagmi';
import { parseUnits, Address, decodeEventLog } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { goBuzzFactoryAbi } from '@/abis/goBuzzFactoryAbi';
import { tokenAbi } from '@/abis/tokensAbi';
import Button from '@/components/ui/Button';
import { CampaignEstimator } from '@/components/campaign/CampaignEstimator';
import CampaignRulesForm from './CampaignRulesForm';
import { CampaignRule } from './types';

export default function CreateCampaignForm() {
    const { address, chain } = useAccount();
    const { switchChain } = useSwitchChain();
    const publicClient = usePublicClient();

    const [formData, setFormData] = useState({
        campaignName: '',
        description: '',
        duration: '604800', // 1 week in seconds
        initialReward: '',
        rewardPerClaim: '',
    });

    const [rules, setRules] = useState<CampaignRule[]>([]);
    const [step, setStep] = useState<'form' | 'approving' | 'creating' | 'success'>('form');

    // Contract addresses
    const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;
    const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address;

    // Hook for approve token
    const {
        data: approveHash,
        writeContract: approve,
        isPending: isApprovePending
    } = useWriteContract();

    // Hook for create campaign
    const {
        data: createHash,
        writeContract: createCampaign,
        isPending: isCreatePending
    } = useWriteContract();

    // Wait for approve transaction
    const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } =
        useWaitForTransactionReceipt({ hash: approveHash });

    // Wait for create transaction
    const { isLoading: isCreateLoading, isSuccess: isCreateSuccess } =
        useWaitForTransactionReceipt({ hash: createHash });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddRule = (rule: CampaignRule) => {
        setRules([...rules, rule]);
    };

    const handleRemoveRule = (id: string) => {
        setRules(rules.filter(rule => rule.id !== id));
    };

    const handleApprove = async () => {
        if (!formData.initialReward) {
            alert('Please enter the initial reward amount first');
            return;
        }

        if (chain?.id !== baseSepolia.id) {
            try {
                await switchChain({ chainId: baseSepolia.id });
            } catch (error) {
                console.error('Error switching chain:', error);
                alert('Please switch to Base Sepolia network');
                return;
            }
        }

        try {
            setStep('approving');
            const amount = parseUnits(formData.initialReward, 18);

            approve({
                address: TOKEN_ADDRESS,
                abi: tokenAbi,
                functionName: 'approve',
                args: [FACTORY_ADDRESS, amount],
                chainId: baseSepolia.id,
            });
        } catch (error) {
            console.error('Error approving:', error);
            setStep('form');
            alert('Failed to approve token');
        }
    };

    const handleCreateCampaign = async () => {
        if (!formData.campaignName || !formData.initialReward || !formData.rewardPerClaim) {
            alert('Please fill in all fields first');
            return;
        }

        if (chain?.id !== baseSepolia.id) {
            try {
                await switchChain({ chainId: baseSepolia.id });
            } catch (error) {
                console.error('Error switching chain:', error);
                alert('Please switch to Base Sepolia network');
                return;
            }
        }

        try {
            setStep('creating');
            const initialReward = parseUnits(formData.initialReward, 18);
            const rewardPerClaim = parseUnits(formData.rewardPerClaim, 18);

            createCampaign({
                address: FACTORY_ADDRESS,
                abi: goBuzzFactoryAbi,
                functionName: 'createCampaign',
                args: [
                    formData.campaignName,
                    BigInt(formData.duration),
                    initialReward,
                    rewardPerClaim,
                    TOKEN_ADDRESS,
                ],
                chainId: baseSepolia.id,
            });
        } catch (error) {
            console.error('Error creating campaign:', error);
            setStep('form');
            alert('Failed to create campaign');
        }
    };

    // Auto transition from approving to form
    if (isApproveSuccess && step === 'approving') {
        setStep('form');
        alert('Token successfully approved! Please click Create Campaign.');
    }

    // Save campaign to database after successful creation
    useEffect(() => {
        const saveCampaignToDatabase = async () => {
            if (isCreateSuccess && createHash && step === 'creating' && publicClient) {
                try {
                    console.log('🔍 Extracting campaign address from transaction receipt...');

                    // Wait for transaction receipt
                    const receipt = await publicClient.waitForTransactionReceipt({
                        hash: createHash
                    });

                    // Find CampaignCreated event in logs
                    const campaignCreatedLog = receipt.logs.find(log => {
                        try {
                            const decoded = decodeEventLog({
                                abi: goBuzzFactoryAbi,
                                data: log.data,
                                topics: log.topics,
                            });
                            return decoded.eventName === 'CampaignCreated';
                        } catch {
                            return false;
                        }
                    });

                    if (!campaignCreatedLog) {
                        console.error('❌ CampaignCreated event not found in transaction receipt');
                        alert('Failed to extract campaign address from transaction. Please check transaction on block explorer.');
                        setStep('form');
                        return;
                    }

                    // Decode the event to get campaignAddress
                    const decoded = decodeEventLog({
                        abi: goBuzzFactoryAbi,
                        data: campaignCreatedLog.data,
                        topics: campaignCreatedLog.topics,
                    });

                    // Type guard to ensure it's CampaignCreated event
                    if (decoded.eventName !== 'CampaignCreated') {
                        console.error('❌ Unexpected event:', decoded.eventName);
                        setStep('form');
                        return;
                    }

                    const campaignAddress = decoded.args.campaignAddress as Address;
                    console.log('✅ Campaign contract address:', campaignAddress);

                    // Get campaign count from factory contract to determine campaign ID (index)
                    // The new campaign will be at index = current count - 1 (since it was just added)
                    const campaignCountResult = await publicClient.readContract({
                        address: FACTORY_ADDRESS,
                        abi: goBuzzFactoryAbi,
                        functionName: 'getCampaignCount',
                    });

                    const campaignCount = Number(campaignCountResult);
                    const campaignId = (campaignCount - 1).toString(); // Index is count - 1
                    console.log('✅ Campaign ID (index):', campaignId);

                    const response = await fetch('/api/campaign/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            campaignId: campaignId,
                            name: formData.campaignName,
                            description: formData.description || null,
                            contractAddress: campaignAddress,
                            rewardAmount: formData.rewardPerClaim,
                            duration: formData.duration,
                            creatorAddress: address,
                            rules: rules.map((rule, index) => ({
                                ruleType: rule.ruleType,
                                ruleValue: rule.ruleValue,
                                description: rule.description,
                                isRequired: rule.isRequired,
                                order: index,
                            })),
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Campaign saved to database:', data);
                    } else {
                        const error = await response.json();
                        console.error('Failed to save campaign to database:', error);
                    }
                } catch (error) {
                    console.error('Error saving campaign to database:', error);
                }

                // Transition to success
                setStep('success');
                setTimeout(() => {
                    setStep('form');
                    setFormData({
                        campaignName: '',
                        description: '',
                        duration: '604800',
                        initialReward: '',
                        rewardPerClaim: '',
                    });
                    setRules([]);
                }, 3000);
            }
        };

        saveCampaignToDatabase();
    }, [isCreateSuccess, createHash, step, formData, address, rules, publicClient, FACTORY_ADDRESS]);

    if (step === 'success') {
        return (
            <div className="text-center py-12">
                <div className="mb-6">
                    <svg
                        className="w-16 h-16 text-[#3AE8FF] mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Campaign Successfully Created!</h2>
                <p className="text-[#B8C2CC] mb-6">
                    Your campaign has been successfully created and is ready to use. Redirecting to Explore...
                </p>
                {createHash && (
                    <div className="mb-6">
                        <p className="text-sm text-[#B8C2CC] mb-2">Transaction Hash:</p>
                        <a
                            href={`https://sepolia.basescan.org/tx/${createHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#3AE8FF] hover:text-[#7CD2FF] underline break-all"
                        >
                            {createHash}
                        </a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Form Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create New Campaign</h2>
                <p className="text-[#B8C2CC] text-sm font-mono">
                    Fill in the details below to launch your campaign on Base Sepolia
                </p>
            </div>

            {/* Network Warning */}
            {chain && chain.id !== baseSepolia.id && (
                <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-yellow-200 text-sm">
                                You are connected to <span className="font-medium">{chain.name}</span>. Campaigns can only be created on <span className="font-medium">Base Sepolia</span>.
                                <button
                                    onClick={() => switchChain({ chainId: baseSepolia.id })}
                                    className="ml-2 underline font-medium hover:text-yellow-100"
                                >
                                    Switch Network
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Network Info */}
            {chain && chain.id === baseSepolia.id && (
                <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-green-200 text-sm">
                            Connected to <span className="font-medium">Base Sepolia</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Campaign Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Campaign Name */}
                <div>
                    <label htmlFor="campaignName" className="block text-white font-medium mb-2">
                        Campaign Name
                    </label>
                    <input
                        type="text"
                        id="campaignName"
                        name="campaignName"
                        value={formData.campaignName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors"
                        placeholder="Enter campaign name"
                        required
                    />
                </div>

                {/* Campaign Description */}
                <div>
                    <label htmlFor="description" className="block text-white font-medium mb-2">
                        Campaign Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors resize-none"
                        placeholder="Describe your campaign goals and what participants need to do..."
                    />
                    <p className="text-xs text-[#B8C2CC] mt-1">
                        This description will be stored in database only (not sent to smart contract)
                    </p>
                </div>

                {/* Duration */}
                <div>
                    <label htmlFor="duration" className="block text-white font-medium mb-2">
                        Duration
                    </label>
                    <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white focus:outline-none focus:border-[#00D9FF] transition-colors"
                    >
                        <option value="3600">1 Hour</option>
                        <option value="86400">1 Day</option>
                        <option value="259200">3 Days</option>
                        <option value="604800">1 Week</option>
                        <option value="1209600">2 Weeks</option>
                        <option value="2592000">1 Month (30 days)</option>
                    </select>
                </div>

                {/* Initial Reward */}
                <div>
                    <label htmlFor="initialReward" className="block text-white font-medium mb-2">
                        Initial Reward (token amount)
                    </label>
                    <input
                        type="number"
                        id="initialReward"
                        name="initialReward"
                        value={formData.initialReward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors"
                        placeholder="Example: 1000"
                        step="0.000001"
                        required
                    />
                    <p className="text-xs text-[#B8C2CC] mt-1">
                        Total tokens to be allocated for this campaign
                    </p>
                </div>

                {/* Reward Per Claim */}
                <div>
                    <label htmlFor="rewardPerClaim" className="block text-white font-medium mb-2">
                        Reward Per Claim (token amount)
                    </label>
                    <input
                        type="number"
                        id="rewardPerClaim"
                        name="rewardPerClaim"
                        value={formData.rewardPerClaim}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors"
                        placeholder="Example: 10"
                        step="0.000001"
                        required
                    />
                    <p className="text-xs text-[#B8C2CC] mt-1">
                        Token amount each user will receive per claim
                    </p>
                </div>

                {/* Campaign Rules Section */}
                <CampaignRulesForm
                    rules={rules}
                    onAddRule={handleAddRule}
                    onRemoveRule={handleRemoveRule}
                />

                {/* Campaign Estimator */}
                {formData.initialReward && formData.rewardPerClaim && (
                    <CampaignEstimator
                        initialReward={formData.initialReward}
                        rewardPerClaim={formData.rewardPerClaim}
                        duration={formData.duration}
                    />
                )}

                {/* Token Address Info */}
                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-4">
                    <p className="text-sm text-[#B8C2CC]">
                        <span className="font-medium text-white">Token Address:</span>
                        <br />
                        <span className="text-xs break-all font-mono">{TOKEN_ADDRESS}</span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        onClick={handleApprove}
                        disabled={
                            isApprovePending ||
                            isApproveLoading ||
                            step === 'approving' ||
                            !formData.initialReward
                        }
                        className="flex-1"
                    >
                        {isApprovePending || isApproveLoading || step === 'approving'
                            ? 'Approving...'
                            : 'Approve Token'}
                    </Button>

                    <Button
                        type="button"
                        onClick={handleCreateCampaign}
                        disabled={
                            isCreatePending ||
                            isCreateLoading ||
                            step === 'creating' ||
                            !formData.campaignName ||
                            !formData.initialReward ||
                            !formData.rewardPerClaim
                        }
                        className="flex-1"
                    >
                        {isCreatePending || isCreateLoading || step === 'creating'
                            ? 'Creating...'
                            : 'Create Campaign'}
                    </Button>
                </div>

                {/* Info */}
                <div className="bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded-lg p-4">
                    <p className="text-sm text-[#B8C2CC]">
                        <strong className="text-white">Note:</strong> You need to complete 2 transactions:
                        <br />
                        1. Approve tokens so the Factory contract can use your tokens
                        <br />
                        2. Create campaign to create a new campaign
                    </p>
                </div>

                {/* Transaction Status */}
                {(approveHash || createHash) && (
                    <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-4 space-y-2">
                        {approveHash && (
                            <div>
                                <p className="text-sm text-[#B8C2CC] mb-1">Approve TX:</p>
                                <a
                                    href={`https://sepolia.basescan.org/tx/${approveHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#3AE8FF] hover:text-[#7CD2FF] underline break-all font-mono"
                                >
                                    {approveHash}
                                </a>
                            </div>
                        )}
                        {createHash && (
                            <div>
                                <p className="text-sm text-[#B8C2CC] mb-1">Create TX:</p>
                                <a
                                    href={`https://sepolia.basescan.org/tx/${createHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#3AE8FF] hover:text-[#7CD2FF] underline break-all font-mono"
                                >
                                    {createHash}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}
