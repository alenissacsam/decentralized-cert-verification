// Import all four smart contract ABIs
import CertificateRegistryABI from './abi/CertificateRegistry.json';
import InstitutionRegistryABI from './abi/InstitutionRegistry.json';
import TemplateManagerABI from './abi/TemplateManager.json';
import NameRegistryABI from './abi/NameRegistry.json';

// Export all ABIs for use in hooks and components
export const CERTIFICATE_REGISTRY_ABI = CertificateRegistryABI;
export const INSTITUTION_REGISTRY_ABI = InstitutionRegistryABI;
export const TEMPLATE_MANAGER_ABI = TemplateManagerABI;
export const NAME_REGISTRY_ABI = NameRegistryABI;

// Named exports for backward compatibility
export { CertificateRegistryABI, InstitutionRegistryABI, TemplateManagerABI, NameRegistryABI };
