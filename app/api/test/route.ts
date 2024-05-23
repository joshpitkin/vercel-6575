import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { create } from '@web3-storage/w3up-client';
import type { Client } from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import { importDAG } from '@ucanto/core/delegation';
import { CarReader } from '@ipld/car';
import * as Signer from '@ucanto/principal/ed25519';


export async function POST(req: NextRequest) {
  try {
    // BUG: see https://github.com/orgs/vercel/discussions/6575
    const w3client = await setupW3Client();
    try {
      return NextResponse.json({ status: 'success', data: 'demo' });
    } catch (e) {
      const estr = (e as Error)?.message;
      return NextResponse.json(
        { message: 'error ...', error: JSON.stringify(e) },
        { status: 400 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { message: 'Upload error processing form objects', error: e },
      { status: 500 }
    );
  }
}


/** @param {string} data Base64 encoded CAR file */
const parseProof = async function (data: string) {
  const blocks = [];
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
  for await (const block of reader.blocks()) {
    blocks.push(block);
  }
  return importDAG(blocks as any);
};
const setupW3Client = async () => {
  const principal = Signer.parse(`A FAKE KEY`);
  const w3client = await create({ principal, store: new StoreMemory() });
  const proof = await parseProof(`A FAKE PROOF`);
  const space = await w3client.addSpace(proof);
  await w3client.setCurrentSpace(space.did());
  return w3client;
};
