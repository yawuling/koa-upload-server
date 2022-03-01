const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const body = require('koa-body');
const cors = require('koa-cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();
const router = new Router();

app.use(body({
  multipart: true,
}));
app.use(cors({
  origin: true,
}));

router.post('/api/upload', async (ctx) => {
  const { file } = ctx.request.files;

  // 文件不存在的话，直接放行
  if (!file) {
    ctx.body = {};
    return;
  }
  const reader = fs.createReadStream(file.path);
  const extname = path.extname(file.name);
  const uuid = uuidv4();
  const filePath = path.join(__dirname, `./files/${uuid}${extname}`);
  const writer = fs.createWriteStream(filePath);
  await new Promise((resolve) => {
    writer.on('finish', () => {
      resolve();
    });
    reader.pipe(writer);
  });
  const url = `http://localhost:3010/${uuid}${extname}`;
  console.log(`Upload finished, file's(${file.name}) url is ${url}`);
  ctx.body = {
    url: `http://localhost:3010/${uuid}${extname}`,
  };
});

app.use(router.routes()).use(router.allowedMethods());
app.use(serve('files'));

app.listen(3010, () => {
  console.log('server is running, http://localhost:3010');
});
