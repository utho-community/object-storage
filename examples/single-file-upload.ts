import { UthoObjectStorage } from '../dist/esm/index.js';

async function uploadToCleanFolder() {
    try {
        const client = new UthoObjectStorage({
            token: 'your-bearer-token' // Replace with your actual token
        });

        const dcslug = 'innoida';
        const bucketName = 'bucketname';
        const folderName = 'foldername'; // Clean folder name

        console.log('🚀 Uploading 1 file to foldername folder\n');
        console.log(`📁 Bucket: ${bucketName}`);
        console.log(`📂 Folder: ${folderName}\n`);

        let successCount = 0;

            const fileName = `file1.txt`;
            const content = `File 1 - Created at ${new Date().toISOString()}`;
            const fileBuffer = Buffer.from(content, 'utf-8');
            const filePath = `${folderName}/${fileName}`;

            console.log(`Uploading: ${fileName} to ${folderName}/`);

            try {
                await client.uploadFile(dcslug, bucketName, fileBuffer, filePath);
                console.log(`        ✅ Success\n`);
                successCount++;
            } catch (error: any) {
                console.log(`        ❌ Failed: ${error.message}\n`);
            }

        console.log('═'.repeat(50));
        console.log(`✅ Successfully uploaded: ${successCount}/10 files`);
        console.log(`📂 Location: ${bucketName}/${folderName}/`);
        console.log('═'.repeat(50));
        
        console.log('\n✨ Now check Utho console:');
        console.log('   https://console.utho.com');
        console.log('   → Object Storage → uthoplugintest → documents');
        console.log('\n💡 You should see 10 files WITHOUT nested folders!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

uploadToCleanFolder().catch(console.error);
