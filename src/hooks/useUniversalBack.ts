import { useNavigation } from '../context/NavigationContext';

export function useUniversalBack() {
  const { handleBack } = useNavigation();
  return handleBack;
}
