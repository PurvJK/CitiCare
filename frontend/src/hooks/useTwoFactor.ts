import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface TwoFactorState {
  isEnrolling: boolean;
  isVerifying: boolean;
  qrCode: string | null;
  secret: string | null;
  factorId: string | null;
}

/**
 * 2FA is not implemented in the MERN backend.
 * This hook provides no-op behavior so Settings page does not break.
 */
export function useTwoFactor() {
  const { toast } = useToast();
  const [state, setState] = useState<TwoFactorState>({
    isEnrolling: false,
    isVerifying: false,
    qrCode: null,
    secret: null,
    factorId: null,
  });

  const enrollTOTP = async () => {
    toast({
      title: 'Not available',
      description: 'Two-factor authentication is not implemented in this version.',
      variant: 'destructive',
    });
    return { success: false };
  };

  const verifyTOTP = async (_code: string) => {
    return { success: false };
  };

  const unenrollTOTP = async (_factorId: string) => {
    toast({
      title: 'Not available',
      description: 'Two-factor authentication is not implemented in this version.',
      variant: 'destructive',
    });
    return { success: false };
  };

  const getFactors = async () => {
    return { success: true, factors: [] };
  };

  const cancelEnrollment = () => {
    setState({
      isEnrolling: false,
      isVerifying: false,
      qrCode: null,
      secret: null,
      factorId: null,
    });
  };

  return {
    ...state,
    enrollTOTP,
    verifyTOTP,
    unenrollTOTP,
    getFactors,
    cancelEnrollment,
  };
}
