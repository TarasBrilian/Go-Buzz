import { useState, useCallback } from 'react';

interface TaskCompletionState {
  completedTasks: Set<string>;
  isVerifying: boolean;
  activeRuleId: string | null;
}

export const useTaskCompletion = () => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

  // Mark task as completed in localStorage and state
  const completeTask = useCallback((campaignId: number, ruleId: string, address: string | undefined) => {
    if (!address) return;

    const storageKey = `completed-tasks-${campaignId}-${address}`;
    const stored = localStorage.getItem(storageKey);
    const completedTasksList = stored ? JSON.parse(stored) : [];
    
    if (!completedTasksList.includes(ruleId)) {
      completedTasksList.push(ruleId);
      localStorage.setItem(storageKey, JSON.stringify(completedTasksList));
    }

    setCompletedTasks(prev => new Set([...prev, ruleId]));
  }, []);

  // Load completed tasks from localStorage
  const loadCompletedTasks = useCallback((campaignId: number, address: string | undefined) => {
    if (!address) return;

    const storageKey = `completed-tasks-${campaignId}-${address}`;
    const stored = localStorage.getItem(storageKey);
    const completedTasksList = stored ? JSON.parse(stored) : [];
    setCompletedTasks(new Set(completedTasksList));
  }, []);

  return {
    completedTasks,
    isVerifying,
    setIsVerifying,
    activeRuleId,
    setActiveRuleId,
    completeTask,
    loadCompletedTasks,
  };
};
