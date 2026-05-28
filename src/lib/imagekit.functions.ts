import { createServerFn } from "@tanstack/react-start";

/**
 * Uploads any file (image, video, audio, pdf, doc, etc.) to ImageKit.
 * Returns the public URL + metadata. Private key stays on the server.
 */
export const uploadToImageKit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("FormData required");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("file is required");
    const folder = (data.get("folder")?.toString() || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "");
    return { file, folder };
  })
  .handler(async ({ data }) => {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");

    const { file, folder } = data;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || `file-${Date.now()}`;

    const form = new FormData();
    form.append("file", file, safeName);
    form.append("fileName", safeName);
    form.append("folder", `/${folder}`);
    form.append("useUniqueFileName", "true");

    const auth = "Basic " + btoa(`${privateKey}:`);
    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: auth },
      body: form,
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(`ImageKit upload failed [${res.status}]: ${json?.message || JSON.stringify(json)}`);
    }
    return {
      url: json.url as string,
      fileId: json.fileId as string,
      name: json.name as string,
      fileType: (json.fileType as string) || file.type,
      size: (json.size as number) || file.size,
    };
  });
