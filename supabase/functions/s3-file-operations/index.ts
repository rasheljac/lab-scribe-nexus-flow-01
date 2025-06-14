
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
}

async function getS3Config(): Promise<S3Config> {
  return {
    accessKeyId: Deno.env.get('S3_ACCESS_KEY_ID') || '',
    secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY') || '',
    region: Deno.env.get('S3_REGION') || 'us-east-1',
    bucketName: Deno.env.get('S3_BUCKET_NAME') || 'experiment-attachments'
  };
}

async function createSignature(
  method: string,
  key: string,
  config: S3Config,
  contentType?: string
): Promise<{ url: string; headers: Record<string, string> }> {
  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  
  const service = 's3';
  const algorithm = 'AWS4-HMAC-SHA256';
  const credential = `${config.accessKeyId}/${dateString}/${config.region}/${service}/aws4_request`;
  
  const canonicalHeaders = [
    `host:${config.bucketName}.s3.${config.region}.amazonaws.com`,
    `x-amz-content-sha256:UNSIGNED-PAYLOAD`,
    `x-amz-date:${timestamp}`
  ];
  
  if (contentType) {
    canonicalHeaders.push(`content-type:${contentType}`);
  }
  
  const canonicalRequest = [
    method,
    `/${key}`,
    '',
    canonicalHeaders.join('\n'),
    '',
    contentType ? 'content-type;host;x-amz-content-sha256;x-amz-date' : 'host;x-amz-content-sha256;x-amz-date',
    'UNSIGNED-PAYLOAD'
  ].join('\n');
  
  const encoder = new TextEncoder();
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  
  const stringToSign = [
    algorithm,
    timestamp,
    `${dateString}/${config.region}/${service}/aws4_request`,
    canonicalRequestHashHex
  ].join('\n');
  
  // Create signing key
  const kDate = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`AWS4${config.secretAccessKey}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const dateKey = await crypto.subtle.sign('HMAC', kDate, encoder.encode(dateString));
  const regionKey = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', dateKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), encoder.encode(config.region));
  const serviceKey = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', regionKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), encoder.encode(service));
  const signingKey = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', serviceKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), encoder.encode('aws4_request'));
  
  const signature = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), encoder.encode(stringToSign));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  
  const authorization = `${algorithm} Credential=${credential}, SignedHeaders=${contentType ? 'content-type;host;x-amz-content-sha256;x-amz-date' : 'host;x-amz-content-sha256;x-amz-date'}, Signature=${signatureHex}`;
  
  const headers: Record<string, string> = {
    'Authorization': authorization,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    'x-amz-date': timestamp
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return { url, headers };
}

async function uploadToS3(file: File, key: string, config: S3Config): Promise<string> {
  const { url, headers } = await createSignature('PUT', key, config, file.type);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: file
  });
  
  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`);
  }
  
  return key;
}

async function deleteFromS3(key: string, config: S3Config): Promise<void> {
  const { url, headers } = await createSignature('DELETE', key, config);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers
  });
  
  if (!response.ok && response.status !== 404) {
    throw new Error(`S3 delete failed: ${response.statusText}`);
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

      const config = await getS3Config();
      const fileExt = file.name.split('.').pop();
      const s3Key = `notes/${user.id}/${noteId}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading to S3 with key:', s3Key);
      
      // Upload to S3
      const uploadedKey = await uploadToS3(file, s3Key, config);
      
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
        throw error;
      }

      console.log('Upload successful:', data);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Handle JSON requests (delete and download)
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

        const config = await getS3Config();
        
        console.log('Deleting from S3:', attachment.file_path);
        
        // Delete from S3
        try {
          await deleteFromS3(attachment.file_path, config);
          console.log('S3 delete successful');
        } catch (s3Error) {
          console.error('S3 delete error:', s3Error);
          // Continue with database deletion even if S3 delete fails
        }
        
        // Delete record from database
        const { error: deleteError } = await supabaseClient
          .from('experiment_note_attachments')
          .delete()
          .eq('id', body.attachmentId);

        if (deleteError) {
          console.error('Database delete error:', deleteError);
          throw deleteError;
        }

        console.log('Delete operation completed');
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } else {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('S3 operation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
