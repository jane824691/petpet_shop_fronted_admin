import type { UploadFile } from 'ant-design-vue/es/upload/interface'
import type { ProductImages } from '../types/productTypes'

export type ProductUploadFile = UploadFile & { dbPhotoPath?: string }

export function getDbPhotoPath(file: UploadFile) {
  return (file as ProductUploadFile).dbPhotoPath ?? ''
}

export const DEFAULT_PRODUCT_IMG = '@public/images/product/638348807730300000 (1).jfif'

export function getImagePath(image?: string | null) {
  if (!image) return DEFAULT_PRODUCT_IMG
  if (image.startsWith('http')) return image
  return `/images/product/${image}`
}

export function getBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read failed'))
  })
}

export function keepFilename(p: string) {
  return p.includes('/') ? p.slice(p.lastIndexOf('/') + 1) : p
}

export function imagesToUploadFileList(images: ProductImages[] | undefined): UploadFile[] {
  if (!images?.length) return []
  return images
    .filter((img) => typeof img.photoPath === 'string' && img.photoPath.trim() !== '')
    .map((img, i) => {
      const path = (img.photoPath as string).trim()
      const name = path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path || `image-${i + 1}`
      // Ant Design Upload 常需: uid, name, status, url, dbPhotoPath
      // existing- 源自專案自訂慣例, 表示圖牆圖片已存在 DB
      return {
        uid: `existing-${img.sortOrder ?? i}-${i}`,
        name,
        status: 'done',
        url: getImagePath(path),
        dbPhotoPath: path,
      } as ProductUploadFile
    })
}

export function productImgToUploadFileList(productImg?: string): UploadFile[] {
  if (!productImg) return []
  return [
    {
      uid: 'main-existing', // 主圖未換
      name: productImg.includes('/') ? productImg.slice(productImg.lastIndexOf('/') + 1) : productImg,
      status: 'done',
      url: getImagePath(productImg),
      dbPhotoPath: productImg,
    } as ProductUploadFile,
  ]
}

export function dbImageToUploadFile(photoPath: string, sortOrder: number): ProductUploadFile {
  const path = photoPath.trim()
  const name = path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path || `image-${sortOrder}`
  // Ant Design Upload 常需: uid, name, status, url, dbPhotoPath
  return {
    uid: `existing-${sortOrder}`,
    name,
    status: 'done',
    url: getImagePath(path),
    dbPhotoPath: path, // 自製參數, 存源自 DB 的檔名或 url 字串
  }
}

export function attachUploadPreview(file: UploadFile): UploadFile {
  if (file.url || file.thumbUrl || typeof file.preview === 'string') return file
  const raw = file.originFileObj as File | undefined
  if (!raw) return file
  const objectUrl = URL.createObjectURL(raw)
  return { ...file, url: objectUrl, thumbUrl: objectUrl, preview: objectUrl }
}

export function attachUploadPreviews(files: UploadFile[]) {
  return files.map(attachUploadPreview)
}

export function revokeUploadPreview(file: UploadFile) {
  for (const src of [file.url, file.thumbUrl, file.preview]) {
    if (typeof src === 'string' && src.startsWith('blob:')) URL.revokeObjectURL(src)
  }
}

export async function getPreviewSrc(file: UploadFile): Promise<string> {
  if (file.url) return file.url
  if (typeof file.preview === 'string') return file.preview
  if (file.originFileObj) {
    const base64 = await getBase64(file.originFileObj as File)
    file.preview = base64
    if (!file.url) file.url = base64
    return base64
  }
  return ''
}

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url, { credentials: 'include' })
  const blob = await res.blob()
  const type =
    blob.type ||
    (filename.endsWith('.png') ? 'image/png' : filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg')
  return new File([blob], filename, { type })
}

export async function buildUploadFile(uid: string, filename: string): Promise<UploadFile> {
  const url = getImagePath(filename)
  const file = await urlToFile(url, filename)
  return {
    uid,
    name: filename,
    status: 'done',
    url,
    originFileObj: file as UploadFile['originFileObj'],
  }
}
