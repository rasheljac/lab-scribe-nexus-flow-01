
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
  // In a real implementation, these would come from Supabase secrets or environment variables
  // For now, we'll use placeholder values - these should be set in your system settings
  return {
    accessKeyId: Deno.env.get('S3_ACCESS_KEY_ID') || '',
    secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY') || '',
    region: Deno.env.get('S3_REGION') || 'us-east-1',
    bucketName: Deno.env.get('S3_BUCKET_NAME') || 'experiment-attachments'
  };
}

async function uploadToS3(file: File, key: string, config: S3Config): Promise<string> {
  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  
  // Create AWS Signature Version 4
  const service = 's3';
  const algorithm = 'AWS4-HMAC-SHA256';
  const credential = `${config.accessKeyId}/${dateString}/${config.region}/${service}/aws4_request`;
  
  const canonicalRequest = [
    'PUT',
    `/${key}`,
    '',
    `host:${config.bucketName}.s3.${config.region}.amazonaws.com`,
    `x-amz-content-sha256:UNSIGNED-PAYLOAD`,
    `x-amz-date:${timestamp}`,
    '',
    'host;x-amz-content-sha256;x-amz-date',
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
  
  const authorization = `${algorithm} Credential=${credential}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signatureHex}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': authorization,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'x-amz-date': timestamp,
      'Content-Type': file.type
    },
    body: file
  });
  
  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`);
  }
  
  return key;
}

async function deleteFromS3(key: string, config: S3Config): Promise<void> {
  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  
  // Similar signing process for DELETE request
  const service = 's3';
  const algorithm = 'AWS4-HMAC-SHA256';
  const credential = `${config.accessKeyId}/${dateString}/${config.region}/${service}/aws4_request`;
  
  const canonicalRequest = [
    'DELETE',
    `/${key}`,
    '',
    `host:${config.bucketName}.s3.${config.region}.amazonaws.com`,
    `x-amz-content-sha256:UNSIGNED-PAYLOAD`,
    `x-amz-date:${timestamp}`,
    '',
    'host;x-amz-content-sha256;x-amz-date',
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
  
  // Create signing key (same process as upload)
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
  
  const authorization = `${algorithm} Credential=${credential}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signatureHex}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': authorization,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'x-amz-date': timestamp
    }
  });
  
  if (!response.ok) {
    throw new Error(`S3 delete failed: ${response.statusText}`);
  }
}

Deno.serve(async (req) => {
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const operation = url.searchParams.get('operation');

    if (operation === 'upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const noteId = formData.get('noteId') as string;

      if (!file || !noteId) {
        return new Response(JSON.stringify({ error: 'Missing file or noteId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const config = await getS3Config();
      const fileExt = file.name.split('.').pop();
      const s3Key = `notes/${user.id}/${noteId}/${Date.now()}.${fileExt}`;
      
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

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (operation === 'delete') {
      const { attachmentId } = await req.json();
      
      // Get attachment details
      const { data: attachment, error: fetchError } = await supabaseClient
        .from('experiment_note_attachments')
        .select('*')
        .eq('id', attachmentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !attachment) {
        return new Response(JSON.stringify({ error: 'Attachment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const config = await getS3Config();
      
      // Delete from S3
      await deleteFromS3(attachment.file_path, config);
      
      // Delete record from database
      const { error: deleteError } = await supabaseClient
        .from('experiment_note_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (operation === 'download') {
      const attachmentId = url.searchParams.get('attachmentId');
      
      // Get attachment details
      const { data: attachment, error: fetchError } = await supabaseClient
        .from('experiment_note_attachments')
        .select('*')
        .eq('id', attachmentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !attachment) {
        return new Response(JSON.stringify({ error: 'Attachment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const config = await getS3Config();
      const downloadUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${attachment.file_path}`;
      
      return new Response(JSON.stringify({ 
        downloadUrl,
        filename: attachment.filename,
        contentType: attachment.file_type 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid operation' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('S3 operation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
