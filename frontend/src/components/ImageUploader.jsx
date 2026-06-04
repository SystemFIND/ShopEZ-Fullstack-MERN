import React from "react";
import { Upload, X } from "lucide-react";
import { api, BACKEND_URL, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export function resolveImageUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/api/")) return `${BACKEND_URL}${url}`;
    return url;
}

export default function ImageUploader({ value, onChange, label = "Image", testid = "image-upload" }) {
    const [uploading, setUploading] = React.useState(false);
    const inputRef = React.useRef(null);

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const { data } = await api.post("/uploads/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onChange(data.url);
            toast.success("Image uploaded");
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function clear() {
        onChange("");
    }

    return (
        <div data-testid={testid}>
            <label className="ez-label">{label}</label>
            <div className="flex items-start gap-4">
                {value ? (
                    <div className="relative w-32 aspect-[3/4] bg-neutral-100 border border-neutral-200">
                        <img src={resolveImageUrl(value)} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={clear}
                            data-testid={`${testid}-clear`}
                            className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-white border border-neutral-300"
                            aria-label="Remove"
                        >
                            <X size={12} strokeWidth={1.5} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        data-testid={`${testid}-trigger`}
                        disabled={uploading}
                        className="w-32 aspect-[3/4] border border-dashed border-neutral-300 hover:border-black flex flex-col items-center justify-center gap-2 text-xs text-neutral-500 hover:text-black transition-colors"
                    >
                        <Upload size={20} strokeWidth={1.5} />
                        <span>{uploading ? "Uploading..." : "Upload"}</span>
                    </button>
                )}
                <div className="flex-1 space-y-2">
                    <p className="text-xs text-neutral-500">JPG, PNG, WEBP, GIF — under 5MB.</p>
                    <input
                        type="url"
                        placeholder="...or paste an image URL"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="ez-input"
                        data-testid={`${testid}-url-input`}
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="text-xs underline text-neutral-600 hover:text-black"
                            data-testid={`${testid}-replace`}
                        >
                            {uploading ? "Uploading..." : "Replace image"}
                        </button>
                    )}
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
                data-testid={`${testid}-input`}
            />
        </div>
    );
}
