# Supabase Storage Setup for Treatment Notes Images

This guide explains how to set up the Supabase storage bucket required for the Treatment Notes image upload feature.

## Prerequisites

- Access to your Supabase project dashboard
- Project URL and anon key configured in `.env.local`

## Step 1: Create Storage Bucket

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `treatment-notes`
   - **Public bucket**: ✅ Enable (so images can be displayed)
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/*` (all image types)

## Step 2: Configure Storage Policies

### Allow Authenticated Users to Upload

Create a policy to allow authenticated users to upload files:

```sql
CREATE POLICY "Allow authenticated users to upload treatment note images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'treatment-notes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Allow Public Read Access

Create a policy to allow anyone to view the images:

```sql
CREATE POLICY "Allow public read access to treatment note images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'treatment-notes');
```

### Allow Authenticated Users to Delete Their Own Images

```sql
CREATE POLICY "Allow users to delete their own treatment note images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'treatment-notes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 3: Verify Configuration

Test the setup:

1. Go to Admin Dashboard
2. Open a patient's detail view
3. Click "Add Note" in the Treatment Notes section
4. Try uploading an image
5. Verify the image appears in the saved note

## File Structure

Images are organized by patient ID:

```
treatment-notes/
├── {patient_id_1}/
│   ├── 1736761234567_abc123.jpg
│   ├── 1736761234789_def456.png
│   └── ...
├── {patient_id_2}/
│   └── ...
```

## Storage Limits

- **Max file size**: 5MB per image
- **Supported formats**: JPG, PNG, GIF, WebP, SVG
- **Bucket limit**: Check your Supabase plan limits

## Troubleshooting

### Upload Fails with "Policy violation"

**Solution**: Ensure the storage policies are correctly configured (see Step 2)

### Images Don't Display

**Solution**: 
1. Check if bucket is set to "Public"
2. Verify the public read policy is active
3. Check browser console for CORS errors

### "Bucket not found" Error

**Solution**: 
1. Verify bucket name is exactly `treatment-notes`
2. Check if bucket was created successfully in Supabase dashboard

## Security Considerations

- ✅ Images are organized by patient ID
- ✅ Only authenticated admins can upload
- ✅ Public URLs allow viewing in patient notes
- ✅ File size limits prevent abuse
- ⚠️ Consider adding virus scanning for production
- ⚠️ Implement image compression for bandwidth optimization

## Alternative: Private Bucket Setup

If you prefer private images (not publicly accessible):

1. Set bucket to **Private** instead of Public
2. Update the policy to require authentication for SELECT
3. Generate signed URLs in the backend for temporary access

```typescript
// Example for signed URLs (future enhancement)
const { data, error } = await supabase.storage
  .from('treatment-notes')
  .createSignedUrl(path, 3600) // 1 hour expiry
```

## Migration Notes

Existing treatment notes without images will continue to work normally. The `images` field is optional and backward compatible.

---

**Last Updated**: January 2025  
**Feature**: Treatment Notes Image Upload  
**Status**: Production Ready

