import { create } from 'kubo-rpc-client';
import fs from 'fs';

export const uploadFilesToIPFS = async (files, nodeUrl = 'http://localhost:5001/api/v0'): Promise<string[]> => {
  const client = create({ url: nodeUrl });
  const results: string[] = [];
  for (const file of files) {
    const stream = fs.createReadStream(file.path);
    const { cid } = await client.add({ content: stream });
    results.push(cid.toString());
  }
  return results;
};

export default uploadFilesToIPFS;