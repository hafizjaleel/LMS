// src/services/mux.service.ts
import Mux from '@mux/mux-node';
import { env } from '../config/env';

export const mux = new Mux({
  tokenId: env.MUX_TOKEN_ID!,
  tokenSecret: env.MUX_TOKEN_SECRET!,
   webhookSecret: env.MUX_WEBHOOK_SECRET!,
});

export interface CreateDirectUploadResponse {
  uploadId: string;
  uploadUrl: string;
}

export interface MuxAssetData {
  assetId: string;
  playbackId: string;
  status: string;
  duration?: number;
}

/**
 * Create a direct upload URL for video upload
 */
export const createDirectUpload = async (
  corsOrigin: string = "*"
): Promise<CreateDirectUploadResponse> => {
  try {
    const upload = await mux.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
      },
    });

    return {
      uploadId: upload.id,
      uploadUrl: upload.url,
    };
  } catch (error) {
    throw new Error(`Failed to create video upload URL ${error}`);
  }
};

/**
 * Get asset details from Mux
 */
export const getAssetDetails = async (assetId: string): Promise<MuxAssetData> => {
  try {
    const asset = await mux.video.assets.retrieve(assetId);
    
    return {
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id || '',
      status: asset.status || 'preparing',
      duration: asset.duration,
    };
  } catch (error) {
    throw new Error(`Failed to retrieve video details ${error}`);
  }
};

/**
 * Delete a Mux asset
 */
export const deleteAsset = async (assetId: string): Promise<void> => {
  try {
    await mux.video.assets.delete(assetId);
  } catch (error) {
    throw new Error(`Failed to delete video asset ${error}`);
  }
};

/**
 * Get upload details
 */
export const getUploadDetails = async (uploadId: string) => {
  try {
    const upload = await mux.video.uploads.retrieve(uploadId);
    return upload;
  } catch (error) {
    throw new Error(`Failed to retrieve upload details ${error}`);
  }
};