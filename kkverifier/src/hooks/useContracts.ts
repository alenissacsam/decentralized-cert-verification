import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACTS } from '@/contracts/config';
import { 
  CERTIFICATE_REGISTRY_ABI, 
  INSTITUTION_REGISTRY_ABI, 
  TEMPLATE_MANAGER_ABI,
  NAME_REGISTRY_ABI
} from '@/contracts/abis';

// ============================================
// CERTIFICATE REGISTRY HOOKS
// ============================================

/**
 * Hook to issue a single certificate
 */
export function useIssueCertificate() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'issueCertificate',
  });

  return {
    issueCertificate: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to issue a certificate with a template
 */
export function useIssueCertificateWithTemplate() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'issueCertificateWithTemplate',
  });


  return {
    issueCertificateWithTemplate: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to batch issue certificates
 */
export function useBatchIssueCertificates() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'batchIssueCertificates',
  });


  return {
    batchIssueCertificates: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to batch issue certificates with templates
 */
export function useBatchIssueCertificatesWithTemplates() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'batchIssueCertificatesWithTemplates',
  });


  return {
    batchIssueCertificatesWithTemplates: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to get a certificate by ID
 */
export function useCertificate(certificateId: bigint | undefined) {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'certificates',
    args: certificateId !== undefined ? [certificateId] : undefined,
    enabled: certificateId !== undefined,
  });

  return {
    certificate: data,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook to get certificates by recipient address
 */
export function useGetCertificatesByRecipient(recipient: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useContractRead({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'getCertificatesByRecipient',
    args: recipient ? [recipient as `0x${string}`] : undefined,
    enabled: !!recipient,
  });

  return {
    certificateIds: data as bigint[] | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook to get certificates issued by an institution
 */
export function useGetCertificatesByInstitution(institution: string | undefined) {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'getCertificatesByInstitution',
    args: institution ? [institution as `0x${string}`] : undefined,
    enabled: !!institution,
  });

  return {
    certificateIds: data as bigint[] | undefined,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook to revoke a certificate
 */
export function useRevokeCertificate() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'revokeCertificate',
  });


  return {
    revokeCertificate: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to check if an institution is authorized
 */
export function useIsAuthorizedInstitution(institution: string | undefined) {
  const { data, isLoading } = useContractRead({
    address: CONTRACTS.sepolia.CertificateRegistry as `0x${string}`,
    abi: CERTIFICATE_REGISTRY_ABI,
    functionName: 'authorizedInstitutions',
    args: institution ? [institution as `0x${string}`] : undefined,
    enabled: !!institution,
  });

  return {
    isAuthorized: data as boolean | undefined,
    isLoading,
  };
}

// ============================================
// INSTITUTION REGISTRY HOOKS
// ============================================

/**
 * Hook to register an institution
 */
export function useRegisterInstitution() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.InstitutionRegistry as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'registerInstitution',
  });


  return {
    registerInstitution: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to get institution details
 */
export function useGetInstitution(institutionAddress: string | undefined) {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACTS.sepolia.InstitutionRegistry as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'getInstitution',
    args: institutionAddress ? [institutionAddress as `0x${string}`] : undefined,
    enabled: !!institutionAddress,
  });

  return {
    institution: data as any,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook to check if institution exists
 */
export function useInstitutionExists(institutionAddress: string | undefined) {
  const { data, isLoading } = useContractRead({
    address: CONTRACTS.sepolia.InstitutionRegistry as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'institutionExists',
    args: institutionAddress ? [institutionAddress as `0x${string}`] : undefined,
    enabled: !!institutionAddress,
  });

  return {
    exists: data as boolean | undefined,
    isLoading,
  };
}

/**
 * Hook to check if institution is verified
 */
export function useIsVerifiedInstitution(institutionAddress: string | undefined) {
  const { data, isLoading } = useContractRead({
    address: CONTRACTS.sepolia.InstitutionRegistry as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'verifiedInstitutions',
    args: institutionAddress ? [institutionAddress as `0x${string}`] : undefined,
    enabled: !!institutionAddress,
  });

  return {
    isVerified: data as boolean | undefined,
    isLoading,
  };
}

/**
 * Hook to update institution info
 */
export function useUpdateInstitutionInfo() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.InstitutionRegistry as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'updateInstitutionInfo',
  });


  return {
    updateInstitutionInfo: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to get total institution count
 */
export function useInstitutionCount() {
  const { data, isLoading } = useContractRead({
    address: CONTRACTS.sepolia.InstitutionRegistry as `0x${string}`,
    abi: INSTITUTION_REGISTRY_ABI,
    functionName: 'institutionCount',
  });

  return {
    count: data as bigint | undefined,
    isLoading,
  };
}

// ============================================
// TEMPLATE MANAGER HOOKS
// ============================================

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.TemplateManager as `0x${string}`,
    abi: TEMPLATE_MANAGER_ABI,
    functionName: 'createTemplate',
  });


  return {
    createTemplate: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to get a template by ID
 */
export function useGetTemplate(templateId: bigint | undefined) {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACTS.sepolia.TemplateManager as `0x${string}`,
    abi: TEMPLATE_MANAGER_ABI,
    functionName: 'getTemplate',
    args: templateId !== undefined ? [templateId] : undefined,
    enabled: templateId !== undefined,
  });

  return {
    template: data as any,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook to list all public templates
 */
export function useListPublicTemplates() {
  const { data, isLoading, isError, error, refetch } = useContractRead({
    address: CONTRACTS.sepolia.TemplateManager as `0x${string}`,
    abi: TEMPLATE_MANAGER_ABI,
    functionName: 'listPublicTemplates',
  });

  return {
    templateIds: data as bigint[] | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook to get templates by institution
 */
export function useGetInstitutionTemplates(institutionAddress: string | undefined) {
  const { data, isLoading, isError, error } = useContractRead({
    address: CONTRACTS.sepolia.TemplateManager as `0x${string}`,
    abi: TEMPLATE_MANAGER_ABI,
    functionName: 'getInstitutionTemplates',
    args: institutionAddress ? [institutionAddress as `0x${string}`] : undefined,
    enabled: !!institutionAddress,
  });

  return {
    templateIds: data as bigint[] | undefined,
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook to get template counter (total templates created)
 */
export function useTemplateCounter() {
  const { data, isLoading } = useContractRead({
    address: CONTRACTS.sepolia.TemplateManager as `0x${string}`,
    abi: TEMPLATE_MANAGER_ABI,
    functionName: 'templateCounter',
  });

  return {
    count: data as bigint | undefined,
    isLoading,
  };
}

// ============================================
// NAME REGISTRY HOOKS
// ============================================

/**
 * Hook to set display name for connected wallet
 * @example
 * const { setName, isLoading, isSuccess } = useSetName();
 * await setName({ args: ['MIT University'] });
 */
export function useSetName() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.NameRegistry as `0x${string}`,
    abi: NAME_REGISTRY_ABI,
    functionName: 'setName',
  });


  return {
    setName: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to clear display name for connected wallet
 * @example
 * const { clearName, isLoading, isSuccess } = useClearName();
 * await clearName();
 */
export function useClearName() {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACTS.sepolia.NameRegistry as `0x${string}`,
    abi: NAME_REGISTRY_ABI,
    functionName: 'clearName',
  });


  return {
    clearName: write,
    data,
    isLoading,
    isSuccess,
    error,
  };
}

/**
 * Hook to get display name for an address
 * @param address - Ethereum address to get name for
 * @example
 * const { displayName, isLoading } = useGetName('0x1234...');
 * // displayName will be 'MIT University' or empty string if not set
 */
export function useGetName(address: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useContractRead({
    address: CONTRACTS.sepolia.NameRegistry as `0x${string}`,
    abi: NAME_REGISTRY_ABI,
    functionName: 'getName',
    args: address ? [address as `0x${string}`] : undefined,
    enabled: !!address,
    watch: true, // Watch for changes
  });

  return {
    displayName: data as string | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}
