import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * 2FA is not implemented in the MERN backend.
 * This hook provides no-op behavior so Settings page does not break.
 */
export function useTwoFactor() {
  const { toast } = useToast();
  const [state, setState] = useState({
    isEnrolling: false,
    isVerifying: false,
    qrCode: null,
    secret: null,
    factorId: null,
  });

  const enrollTOTP = useCallback(async () => {
    toast({
      title: 'Not available',
      description: 'Two-factor authentication is not implemented in this version.',
      variant: 'destructive',
    });
    return { success: false };
  }, [toast]);

  const verifyTOTP = useCallback(async (_code) => {
    return { success: false };
  }, []);

  const unenrollTOTP = useCallback(async (_factorId) => {
    toast({
      title: 'Not available',
      description: 'Two-factor authentication is not implemented in this version.',
      variant: 'destructive',
    });
    return { success: false };
  }, [toast]);

  const getFactors = useCallback(async () => {
    return { success: true, factors: [] };
  }, []);

  const cancelEnrollment = useCallback(() => {
    setState({
      isEnrolling: false,
      isVerifying: false,
      qrCode: null,
      secret: null,
      factorId: null,
    });
  }, []);

  return {
    ...state,
    enrollTOTP,
    verifyTOTP,
    unenrollTOTP,
    getFactors,
    cancelEnrollment,
  };
}
