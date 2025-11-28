import { useRouter } from 'src/routes/hooks';

export function useLogout() {
  const router = useRouter();
  localStorage.clear();
  router.back();
}
