import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '../services/api';

export default function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus()
      .then(({ data }) => setIsPremium(data?.isValid === true))
      .catch(() => setIsPremium(false))
      .finally(() => setLoading(false));
  }, []);

  return { isPremium, loading };
}
