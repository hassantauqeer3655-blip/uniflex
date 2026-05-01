import { supabase } from './supabase';
import { supabaseService } from '../services/supabaseService';
import { Creator } from '../types';

/**
 * Uploads a profile image to Supabase Storage and returns the public URL.
 * @param file The image file to upload.
 * @param creatorId The ID of the creator.
 * @returns Promise<string> The public URL of the uploaded image.
 */
export async function uploadCreatorImage(file: File, creatorId: string): Promise<string> {
  const filePath = `creators/${creatorId}/${Date.now()}_${file.name}`;
  return await supabaseService.uploadFile('posters', filePath, file);
}

/**
 * Updates a creator's profile metadata in Supabase.
 * @param creatorId The ID of the creator.
 * @param data Partial creator data to update.
 */
export async function updateCreatorProfile(creatorId: string, data: Partial<Creator>): Promise<void> {
  const { error } = await supabase
    .from('creators')
    .update(data)
    .eq('id', creatorId);

  if (error) throw error;
}
