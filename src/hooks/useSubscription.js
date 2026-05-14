import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '../services/api';

export default function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus()
      .then(({ data }) => {
        setIsPremium(data?.status === 'active');
        setIsTrial(data?.status === 'trial');
      })
      .catch(() => {
        setIsPremium(false);
        setIsTrial(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return { isPremium, isTrial, loading };
}
