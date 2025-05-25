import { create } from 'kubo-rpc-client';

const client = create({url: 'http://localhost:5001/api/v0'}); //TODO: create from a database of known nodes

export const uploadFiles = async (files: File[]): Promise<string[]> => {
  const results: string[] = [];
  for (const file of files) {
    const { cid } = await client.add(file);
    results.push(cid.toString());
  }
  return results;
};

export default client;