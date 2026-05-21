const UPLOAD_URL = "https://img.nodebits.xyz/api/index.php"
const UPLOAD_TOKEN = "1c17b11693cb5ec63859b091c5b9c1b2"

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("token", UPLOAD_TOKEN)
  form.append("image", file)

  const res = await fetch(UPLOAD_URL, { method: "POST", body: form })
  const data = await res.json()

  if (!data.url) {
    throw new Error("上传失败")
  }

  return data.url
}
