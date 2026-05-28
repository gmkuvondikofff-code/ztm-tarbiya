import { toast } from "sonner";
import { uploadToImageKit } from "./imagekit.functions";

/**
 * Uploads a file to ImageKit (any type: image, video, audio, pdf, doc, etc.).
 * `bucket` is kept for backward compatibility and used as the ImageKit folder name.
 */
export async function uploadFile(bucket: "media" | "files" | string, file: File): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", bucket);
    const res = await uploadToImageKit({ data: form });
    return res.url;
  } catch (e: any) {
    toast.error("Yuklashda xato: " + (e?.message || "noma'lum xato"));
    return null;
  }
}
