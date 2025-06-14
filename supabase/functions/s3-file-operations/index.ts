
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface iDriveE2Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint: string;
}

async function getE2ConfigFromUserPreferences(supabaseClient: any, userId: string): Promise<iDriveE2Config | null> {
  console.log('Fetching iDrive E2 config for user:', userId);
  
  try {
    const { data: userPrefs, error } = await supabaseClient
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    if (error || !userPrefs?.preferences?.s3Config) {
      console.error('No iDrive E2 config found in user preferences:', error);
      return null;
    }

    const config = userPrefs.preferences.s3Config;
    
    if (!config.enabled) {
      console.error('iDrive E2 config is disabled');
      return null;
    }

    // Normalize endpoint - iDrive E2 endpoints should include protocol
    let endpoint = config.endpoint || '';
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    const e2Config: iDriveE2Config = {
      accessKeyId: config.access_key_id,
      secretAccessKey: config.secret_access_key,
      region: config.region || 'us-east-1',
      bucketName: config.bucket_name,
      endpoint: endpoint
    };

    // Validate required fields
    if (!e2Config.accessKeyId || !e2Config.secretAccessKey || !e2Config.bucketName || !e2Config.endpoint) {
      console.error('Missing required iDrive E2 configuration fields');
      return null;
    }

    console.log('iDrive E2 config loaded successfully:', {
      endpoint: e2Config.endpoint,
      bucket: e2Config.bucketName,
      region: e2Config.region,
      hasAccessKey: !!e2Config.accessKeyId,
      hasSecretKey: !!e2Config.secretAccessKey
    });
    
    return e2Config;
  } catch (error) {
    console.error('Error fetching iDrive E2 config:', error);
    return null;
  }
}

// Simple HMAC-SHA256 implementation for iDrive E2
async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = new Uint8Array(signature);
  return btoa(String.fromCharCode(...signatureArray));
}

// Create iDrive E2 compatible request with simplified authentication
async function createE2Request(
  method: string,
  objectKey: string,
  config: iDriveE2Config,
  contentType?: string
): Promise<{ url: string; headers: Record<string, string> }> {
  console.log('Creating iDrive E2 request:', { method, objectKey, endpoint: config.endpoint });
  
  try {
    // Build the full URL for iDrive E2
    const url = new URL(config.endpoint);
    const fullUrl = `${url.protocol}//${url.host}/${config.bucketName}/${objectKey}`;
    
    // Create timestamp
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    
    // Build string to sign for iDrive E2 (simplified approach)
    const stringToSign = `${method}\n\n${contentType || ''}\n${timestamp}\n/${config.bucketName}/${objectKey}`;
    
    console.log('String to sign:', stringToSign);
    
    // Create signature
    const signature = await hmacSha256(config.secretAccessKey, stringToSign);
    
    // Build authorization header
    const authorization = `AWS ${config.accessKeyId}:${signature}`;
    
    const headers: Record<string, string> = {
      'Authorization': authorization,
      'Date': now.toUTCString(),
      'Host': url.host,
    };
    
    if (method === 'PUT' && contentType) {
      headers['Content-Type'] = contentType;
    }
    
    console.log('Generated request:', {
      url: fullUrl,
      headers: Object.keys(headers),
      method
    });
    
    return { url: fullUrl, headers };
  } catch (error) {
    console.error('Error creating iDrive E2 request:', error);
    throw new Error(`Failed to create iDrive E2 request: ${error.message}`);
  }
}

async function uploadToE2(file: File, key: string, config: iDriveE2Config): Promise<string> {
  console.log('Starting iDrive E2 upload:', { 
    fileName: file.name, 
    fileSize: file.size, 
    fileType: file.type, 
    key, 
    bucket: config.bucketName,
    endpoint: config.endpoint
  });
  
  try {
    const { url, headers } = await createE2Request('PUT', key, config, file.type);
    
    console.log('Uploading to URL:', url);
    console.log('Upload headers:', headers);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: file
    });
    
    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        url
      });
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${responseText}`);
    }
    
    console.log('Upload successful to iDrive E2');
    return key;
  } catch (error) {
    console.error('iDrive E2 upload error:', error);
    throw error;
  }
}

async function deleteFromE2(key: string, config: iDriveE2Config): Promise<void> {
  console.log('Starting iDrive E2 delete:', { key, bucket: config.bucketName });
  
  try {
    const { url, headers } = await createE2Request('DELETE', key, config);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    console.log('Delete response status:', response.status);
    
    if (!response.ok && response.status !== 404) {
      const responseText = await response.text();
      console.error('Delete failed:', {
        status: response.status,
        statusText: response.statusText,
        responseText
      });
      throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
    }
    
    console.log('Delete successful or file not found');
  } catch (error) {
    console.error('iDrive E2 delete error:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Get iDrive E2 config from user preferences
    const e2Config = await getE2ConfigFromUserPreferences(supabaseClient, user.id);
    if (!e2Config) {
      console.error('iDrive E2 configuration not found or invalid');
      return new Response(JSON.stringify({ 
        error: 'iDrive E2 configuration not found or invalid. Please check your settings and ensure all required fields are filled.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const noteId = formData.get('noteId') as string;

      console.log('Upload request - File:', file?.name, 'Note ID:', noteId);

      if (!file || !noteId) {
        return new Response(JSON.stringify({ error: 'Missing file or noteId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File size exceeds 50MB limit' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fileExt = file.name.split('.').pop();
      const objectKey = `notes/${user.id}/${noteId}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading to iDrive E2 with key:', objectKey);
      
      try {
        // Upload to iDrive E2
        const uploadedKey = await uploadToE2(file, objectKey, e2Config);
        
        // Save attachment record to database
        const { data, error } = await supabaseClient
          .from('experiment_note_attachments')
          .insert([{
            note_id: noteId,
            user_id: user.id,
            filename: file.name,
            file_path: uploadedKey,
            file_type: file.type,
            file_size: file.size,
          }])
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        console.log('Upload and database insert successful:', data);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (uploadError) {
        console.error('Upload process failed:', uploadError);
        return new Response(JSON.stringify({ 
          error: `Upload failed: ${uploadError.message}`,
          details: uploadError.toString()
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

    } else {
      // Handle JSON requests (delete)
      const body = await req.json();
      console.log('JSON request body:', body);
      
      if (body.attachmentId) {
        // Delete operation
        console.log('Delete request for attachment:', body.attachmentId);
        
        // Get attachment details
        const { data: attachment, error: fetchError } = await supabaseClient
          .from('experiment_note_attachments')
          .select('*')
          .eq('id', body.attachmentId)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !attachment) {
          console.error('Attachment not found:', fetchError);
          return new Response(JSON.stringify({ error: 'Attachment not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Deleting from iDrive E2:', attachment.file_path);
        
        try {
          // Delete from iDrive E2
          await deleteFromE2(attachment.file_path, e2Config);
          console.log('iDrive E2 delete successful');
        } catch (e2Error) {
          console.error('iDrive E2 delete error (continuing with database delete):', e2Error);
          // Continue with database deletion even if iDrive E2 delete fails
        }
        
        // Delete record from database
        const { error: deleteError } = await supabaseClient
          .from('experiment_note_attachments')
          .delete()
          .eq('id', body.attachmentId);

        if (deleteError) {
          console.error('Database delete error:', deleteError);
          throw new Error(`Database delete error: ${deleteError.message}`);
        }

        console.log('Delete operation completed successfully');
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } else {
        return new Response(JSON.stringify({ error: 'Invalid request body. Expected attachmentId for delete operation.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
