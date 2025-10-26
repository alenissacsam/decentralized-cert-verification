/**
 * Pinata IPFS Integration
 * Uploads certificate data to IPFS via Pinata API
 */

export interface CertificateMetadata {
  name: string;
  description: string;
  image?: string;
  certificateType: string;
  recipientName: string;
  recipientAddress: string;
  issuerName: string;
  issueDate: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadJSONToIPFS(
  metadata: CertificateMetadata
): Promise<{ ipfsHash: string; pinataUrl: string }> {
  const jwt = process.env.PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!jwt) {
    throw new Error('Pinata JWT not configured');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name} - ${metadata.recipientName}`,
        keyvalues: {
          certificateType: metadata.certificateType,
          recipient: metadata.recipientAddress,
        },
      },
      pinataOptions: {
        cidVersion: 1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload to IPFS: ${error}`);
  }

  const data = await response.json();
  const ipfsHash = data.IpfsHash;
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
  const pinataUrl = `https://${gateway}/ipfs/${ipfsHash}`;

  return { ipfsHash, pinataUrl };
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadFileToIPFS(
  file: File
): Promise<{ ipfsHash: string; pinataUrl: string }> {
  const jwt = process.env.PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!jwt) {
    throw new Error('Pinata JWT not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: file.name,
    })
  );
  formData.append(
    'pinataOptions',
    JSON.stringify({
      cidVersion: 1,
    })
  );

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file to IPFS: ${error}`);
  }

  const data = await response.json();
  const ipfsHash = data.IpfsHash;
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
  const pinataUrl = `https://${gateway}/ipfs/${ipfsHash}`;

  return { ipfsHash, pinataUrl };
}

/**
 * Retrieve JSON from IPFS
 */
export async function getJSONFromIPFS(ipfsHash: string): Promise<any> {
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
  const url = `https://${gateway}/ipfs/${ipfsHash}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
  }

  return response.json();
}
