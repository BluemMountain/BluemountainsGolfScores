import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileUri: string) => {
    try {
        const result = await cloudinary.uploader.upload(fileUri, {
            upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw error;
    }
};

export default cloudinary;
