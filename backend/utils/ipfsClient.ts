import { create } from 'kubo-rpc-client';
import fs from 'fs';

const client = create({url: 'http://localhost:5001/api/v0'}); //TODO: create from a database of known nodes

export const uploadFilesToIPFS = async (files): Promise<string[]> => {
  const results: string[] = [];
  for (const file of files) {
    const stream = fs.createReadStream(file.path);
    const { cid } = await client.add(file);
    results.push(cid.toString());
  }
  return results;
};

export default client;