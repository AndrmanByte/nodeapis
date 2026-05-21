const UPLOAD_URL = "https://img.nodebits.xyz/api/index.php"
const UPLOAD_TOKEN = "1c17b11693cb5ec63859b091c5b9c1b2"

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()
    img.onload = () => {
      const maxW = 1200
      const ratio = Math.min(maxW / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.75
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file)
  const form = new FormData()
  form.append("token", UPLOAD_TOKEN)
  form.append("image", compressed)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(UPLOAD_URL, { method: "POST", body: form, signal: controller.signal })
    const data = await res.json()

    if (!data.url) {
      throw new Error("上传失败")
    }

    return data.url
  } finally {
    clearTimeout(timeout)
  }
}
