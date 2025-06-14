import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint: string;
}

async function getS3ConfigFromUserPreferences(supabaseClient: any, userId: string): Promise<S3Config | null> {
  console.log('Fetching S3 config for user:', userId);
  
  try {
    const { data: userPrefs, error } = await supabaseClient
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    if (error || !userPrefs?.preferences?.s3Config) {
      console.error('No S3 config found in user preferences:', error);
      return null;
    }

    const s3Config = userPrefs.preferences.s3Config;
    
    if (!s3Config.enabled) {
      console.error('S3 config is disabled');
      return null;
    }

    // Ensure endpoint has proper protocol
    let endpoint = s3Config.endpoint || '';
    if (endpoint && !endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    const config = {
      accessKeyId: s3Config.access_key_id,
      secretAccessKey: s3Config.secret_access_key,
      region: s3Config.region || 'us-east-1',
      bucketName: s3Config.bucket_name,
      endpoint: endpoint
    };

    // Validate required fields
    if (!config.accessKeyId || !config.secretAccessKey || !config.bucketName || !config.endpoint) {
      console.error('Missing required S3 configuration fields');
      return null;
    }

    console.log('S3 config loaded successfully:', {
      endpoint: config.endpoint,
      bucket: config.bucketName,
      region: config.region
    });
    
    return config;
  } catch (error) {
    console.error('Error fetching S3 config:', error);
    return null;
  }
}

function normalizeEndpoint(endpoint: string): string {
  try {
    const url = new URL(endpoint);
    return url.host;
  } catch (error) {
    console.error('Invalid endpoint URL:', endpoint);
    // Fallback: remove protocol if present
    return endpoint.replace(/^https?:\/\//, '');
  }
}

// Simplified iDrive E2 compatible authentication
async function createiDriveE2Request(
  method: string,
  key: string,
  config: S3Config,
  contentType?: string,
  body?: any
): Promise<{ url: string; headers: Record<string, string> }> {
  console.log('Creating iDrive E2 request for:', { method, key, endpoint: config.endpoint });
  
  try {
    const host = normalizeEndpoint(config.endpoint);
    const url = `${config.endpoint}/${config.bucketName}/${key}`;
    
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Use the configured region or default
    const region = config.region;
    const service = 's3';
    const algorithm = 'AWS4-HMAC-SHA256';
    const credential = `${config.accessKeyId}/${dateString}/${region}/${service}/aws4_request`;
    
    // Build canonical headers - keep it simple for iDrive E2
    const canonicalHeaders = [
      `host:${host}`,
      `x-amz-date:${timestamp}`
    ];
    const signedHeaders = 'host;x-amz-date';
    
    // Create canonical request
    const canonicalRequest = [
      method,
      `/${config.bucketName}/${key}`,
      '', // query string
      canonicalHeaders.join('\n') + '\n',
      '',
      signedHeaders,
      'UNSIGNED-PAYLOAD'
    ].join('\n');
    
    console.log('Canonical Request:', canonicalRequest);
    
    // Create string to sign
    const encoder = new TextEncoder();
    const canonicalRequestHash = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
    const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    const stringToSign = [
      algorithm,
      timestamp,
      `${dateString}/${region}/${service}/aws4_request`,
      canonicalRequestHashHex
    ].join('\n');
    
    console.log('String to Sign:', stringToSign);
    
    // Create signing key
    const kDate = await crypto.subtle.importKey(
      'raw',
      encoder.encode(`AWS4${config.secretAccessKey}`),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const dateKey = new Uint8Array(await crypto.subtle.sign('HMAC', kDate, encoder.encode(dateString)));
    const kRegion = await crypto.subtle.importKey('raw', dateKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const regionKey = new Uint8Array(await crypto.subtle.sign('HMAC', kRegion, encoder.encode(region)));
    const kService = await crypto.subtle.importKey('raw', regionKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const serviceKey = new Uint8Array(await crypto.subtle.sign('HMAC', kService, encoder.encode(service)));
    const kSigning = await crypto.subtle.importKey('raw', serviceKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signingKey = new Uint8Array(await crypto.subtle.sign('HMAC', kSigning, encoder.encode('aws4_request')));
    const kFinal = await crypto.subtle.importKey('raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = new Uint8Array(await crypto.subtle.sign('HMAC', kFinal, encoder.encode(stringToSign)));
    const signatureHex = Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const authorization = `${algorithm} Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
    
    const headers: Record<string, string> = {
      'Authorization': authorization,
      'x-amz-date': timestamp,
    };
    
    if (method === 'PUT' && contentType) {
      headers['Content-Type'] = contentType;
    }
    
    console.log('Generated headers:', Object.keys(headers));
    
    return { url, headers };
  } catch (error) {
    console.error('Error creating iDrive E2 request:', error);
    throw new Error(`Failed to create iDrive E2 request: ${error.message}`);
  }
}

async function uploadToS3(file: File, key: string, config: S3Config): Promise<string> {
  console.log('Starting iDrive E2 upload:', { 
    fileName: file.name, 
    fileSize: file.size, 
    fileType: file.type, 
    key, 
    bucket: config.bucketName, 
    endpoint: config.endpoint 
  });
  
  try {
    const { url, headers } = await createiDriveE2Request('PUT', key, config, file.type);
    
    console.log('Upload URL:', url);
    console.log('Upload headers:', Object.keys(headers));
    
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
    
    console.log('Upload successful');
    return key;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

async function deleteFromS3(key: string, config: S3Config): Promise<void> {
  console.log('Starting iDrive E2 delete:', { key, bucket: config.bucketName });
  
  try {
    const { url, headers } = await createiDriveE2Request('DELETE', key, config);
    
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
    console.error('Delete error:', error);
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

    // Get S3 config from user preferences
    const s3Config = await getS3ConfigFromUserPreferences(supabaseClient, user.id);
    if (!s3Config) {
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
      const s3Key = `notes/${user.id}/${noteId}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading to iDrive E2 with key:', s3Key);
      
      try {
        // Upload to iDrive E2
        const uploadedKey = await uploadToS3(file, s3Key, s3Config);
        
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
          await deleteFromS3(attachment.file_path, s3Config);
          console.log('iDrive E2 delete successful');
        } catch (s3Error) {
          console.error('iDrive E2 delete error (continuing with database delete):', s3Error);
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
