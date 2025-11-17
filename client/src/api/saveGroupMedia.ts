export interface SaveGroupMediaPayload {
    groupId: string;
    file: File;
    caption?: string;
  }
  
  export interface SaveGroupMediaResponse {
    success: boolean;
    data?: {
      mediaId: string;
      groupId: string;
      mediaUrl: string;
      mediaKey: string;
      caption?: string;
      isActive: boolean;
      isDeleted: boolean;
      createdAt: string;
      updatedAt: string;
    };
    message?: string;
  }
  
  /**
   * Uploads a media file for a given group.
   *
   * @throws Error when the request fails or the response isn’t OK.
   */
  export async function saveGroupMedia({
    groupId,
    file,
    caption,
  }: SaveGroupMediaPayload): Promise<SaveGroupMediaResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('Missing NEXT_PUBLIC_API_BASE_URL env variable');
    }
  
    const formData = new FormData();
    formData.append('groupId', groupId);
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
  
    const response = await fetch(`${baseUrl}/api/groups/media/save/${groupId}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
  
    if (!response.ok) {
      const errorMessage = await response.text().catch(() => 'Upload failed');
      throw new Error(errorMessage);
    }
  
    const json: SaveGroupMediaResponse = await response.json();
    return json;
  }


  export async function loadGroupMediaApi(groupId: string){
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('Missing NEXT_PUBLIC_API_BASE_URL env variable');
    }
    const response = await fetch(`${baseUrl}/api/groups/media/load/${groupId}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorMessage = await response.text().catch(() => 'Failed to load group media');
      throw new Error(errorMessage);
    }
       return response.json();
  }