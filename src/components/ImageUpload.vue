<script setup lang='ts'>
import { kbToM, Type } from '@/utils';
import { ElMessage, genFileId, UploadFile, UploadFiles, UploadInstance, UploadRawFile } from 'element-plus';
type Props = {
  fileUrls: any[]
  listType?: string
  limit?: { count?: number, size?: number, type?: MIME.Image[], wh?: [number, number, number?] }
  circle?: boolean
  border?: boolean
  tips?: string
}
const props = withDefaults(defineProps<Props>(), {
  fileUrls: () => [''],
  listType: 'picture',
  limit: () => ({}),
  circle: false,
  border: true,
  tips: ''
})
const emit = defineEmits(['upload', 'remove'])
const fileList = ref<UploadFiles>(props.fileUrls.map(item => ({ name: item.replace(/\S+name=(\w+)\S+/, '$1'), url: item, status: 'success', uid: genFileId() })))
const currentFileIdx = ref()
const uploadRef = ref<UploadInstance>()
const selectFileRef = ref()
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const imgStyle = `relative w80px h80px mr8px flex-center shrink-0 ${props.circle && 'rd-50%'}`
const limit = computed(() => ({ count: 1, size: 2 * 1024, type: ['image/jpeg', 'image/png'], wh: [1920, 780, 0.5], ...props.limit }))
const { VITE_BASE_URL, VITE_BASE_PORT } = import.meta.env
/**
 * 下载图片
 * @param url 
 */
function handleDownload(url: string) {
  let image = new Image();
  image.setAttribute("crossOrigin", "anonymous");
  image.src = url;
  image.onload = () => {
    let canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext("2d");
    ctx!.drawImage(image, 0, 0, image.width, image.height);
    canvas.toBlob(blob => {
      let url = URL.createObjectURL(blob!);
      let a = document.createElement("a");
      a.download = url.replace(/\S+name=(\w+)\S+/, '$1') || new Date().getTime().toString();
      a.href = url;
      a.click();
      a.remove();
      // 用完释放URL对象
      URL.revokeObjectURL(url);
    });
  };
}
/**
 * 文件状态改变的回调
 * @param uploadFile 
 */
function handleChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
  if (Type.isNumber(currentFileIdx.value) && uploadFile.status != 'success') {
    uploadFiles.pop()
    uploadFiles.splice(currentFileIdx.value, 1, uploadFile)
  }
  uploadRef.value?.submit() // 手动提交
  console.log(uploadFiles)
}
/**
 * 文件上传成功的回调
 * @param res 
 * @param uploadFile 
 * @param uploadFiles 
 */
function handleSuccess(res: any, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  if (res.code) ElMessage.error(res.msg)
  else {
    console.log(uploadFiles)
    fileList.value = uploadFiles
    emit('upload', res.data)
  }
}
/**
 * 超出上传数量限制
 * @param files 
 */
function handleExceed(files: File[]) {
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}
/**
 * 上传前的钩子函数
 * @param rawFile 
 */
function handleBeforeUpload(rawFile: UploadRawFile) {
  const { type, size, wh } = limit.value
  console.log(rawFile.size / 1024, size)
  const isSize = rawFile.size / 1024 < size || !ElMessage.error(`Picture size can not exceed ${kbToM(size)}!`)
  const isType = type!.includes(rawFile.type as MIME.Image) || !ElMessage.error(`Picture must be ${type!.join('/')} format!`)
  const isWH = new Promise(function (resolve, reject) {
    let _URL = window.URL || window.webkitURL;
    let image = new Image();
    image.onload = function () {
      // 宽高相对误差默认在50%以内有效
      console.log(Math.abs(wh![0] - image.width) / image.width, Math.abs(wh[1] - image.height) / image.height)
      let valid = Math.abs(wh![0] - image.width) / image.width < wh[2]! && Math.abs(wh[1] - image.height) / image.height < wh[2]!;
      valid ? resolve(rawFile) : reject(ElMessage.error(`上传图片尺寸不符，建议${wh[0]}*${wh[1]}大小左右`));
    };
    image.src = _URL.createObjectURL(rawFile); // 更改Promise状态
  })
  return isSize && isType && isWH
}
</script>

<template>
  <el-upload ref="uploadRef" :action="`${VITE_BASE_URL}:${VITE_BASE_PORT}/fileUploadAndDownload/image`" :show-file-list="false" :list-type="(listType as any)" :limit="limit.count"
    class="flex min-w-0" :accept="limit.type?.join(',')" :on-change="handleChange" :on-exceed="handleExceed" :on-success="handleSuccess" :before-upload="handleBeforeUpload"
    :auto-upload="false">
    <template v-if="fileList.length">
      <div v-for="(item, idx) in fileList" :key="item.uid" ref="selectFileRef" :class="imgStyle" :border="`${border && '1 dashed #dcdfe6'}`">
        <img v-if="item.url" :class="`w100% h100% ${circle && 'rd-50%'}`" :src="item.url" alt="">
        <span class="mask">
          <span class="i-ep-zoom-in" @click.stop="dialogImageUrl = item.url!, dialogVisible = true"></span>
          <span class="i-ep-edit" @click.stop="selectFileRef[idx].click(), currentFileIdx = idx"></span>
          <span class="i-ep-delete" @click.stop="emit('remove')"></span>
        </span>
      </div>
    </template>
    <span v-show="fileList.length < limit.count" :class="imgStyle" border="1 dashed #dcdfe6">
      <i class="i-ep-plus"></i>
    </span>
    <el-dialog v-model="dialogVisible" width="30%">
      <template #header>
        <span class="i-ep-download c-#fff" @click="handleDownload(dialogImageUrl)"></span>
      </template>
      <img class="w100%" :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
    <el-tooltip v-if="tips" :content="tips" placement="right">tips：{{ tips }}</el-tooltip>
  </el-upload>

</template>

<style lang='scss' scoped>
:deep(.el-dialog__body) {
  padding: 0;
  line-height: 0;
}


:deep(.el-tooltip__trigger) {
  margin-top: auto;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-upload) {
  min-width: 0;

  .el-upload-list {
    display: flex;
    margin: 0;

    .el-upload-list__item {
      margin: 0;
      margin-right: 8px;
      border: 0;
      padding: 0;
      width: 80px;
      height: 80px;

      &:hover {
        .i-ep-delete {
          opacity: 1;
        }
      }
    }
  }
}

span[class^='i-'] {
  width: 16px;
  height: 16px;
  margin: 2px;
}
</style>
