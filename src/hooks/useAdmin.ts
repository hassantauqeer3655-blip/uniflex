import { useAuth } from '../context/AuthContext';

export function useAdmin() {
  const { isAdmin, user } = useAuth();
  
  const ADMIN_EMAILS = [
    'hassantauqeer3655@gmail.com',
    'bss25000392@ue.edu.pk',
    'bss25000380@ue.edu.pk'
  ];

  const isAuthorized = !!user?.email && ADMIN_EMAILS.includes(user.email);

  return {
    isAdmin: isAdmin || isAuthorized,
    user
  };
}
