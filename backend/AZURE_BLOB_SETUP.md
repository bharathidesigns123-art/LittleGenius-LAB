Azure Blob Storage setup — LittleGenius LAB backend

This file documents how the backend integrates with Azure Blob Storage for uploads.

Configuration (do NOT commit secrets):
- AzureBlob:ConnectionString - Full storage account connection string. Recommended to set as environment variable on the host.
- AzureBlob:ContainerName - Container name to use for uploads (default: uploads).
- AzureBlob:ContainerPublic - "true" to make container blobs public (anonymous read). "false" to keep private and return temporary SAS URLs (recommended).
- AzureBlob:SasExpiryHours - Lifetime in hours for generated SAS tokens (default: 24).
- AzureBlob:CorsAllowedOrigins - Comma-separated browser origins allowed to upload directly to Blob Storage. The backend also adds localhost and the production Vercel origin by default.

Environment variable example (Windows PowerShell):
$env:Azure__Blob__ConnectionString = "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"

Linux / macOS example (bash):
export Azure__Blob__ConnectionString="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"

Notes:
- The backend will upload images to the configured container. If ContainerPublic is true, the blob URL is returned and is publicly accessible.
- If ContainerPublic is false (recommended), the backend will generate a time-limited SAS URL so clients can download the file for the SAS expiry duration.
- For direct browser uploads, the backend ensures an Azure Blob Storage CORS rule that allows `OPTIONS`, `PUT`, `GET`, and `HEAD` from the configured frontend origins with the `content-type` and `x-ms-blob-type` request headers.
- For production, store the connection string in a secure secrets store (Azure Key Vault, environment variables in the host, or CI/CD secrets). Do not commit the connection string into source control.

Testing locally:
1. Set the Azure__Blob__ConnectionString environment variable with a connection string that contains AccountName and AccountKey.
2. Start the backend: dotnet run
3. POST JSON to `/api/store/uploads/sas` with `fileName` and `contentType`. Upload the file directly to the returned `uploadUrl` with `PUT`, `x-ms-blob-type: BlockBlob`, and the original content type.

Azure Blob Storage is required for uploads. The old local filesystem upload path has been removed.
