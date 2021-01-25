const {app, BrowserWindow, dialog} = require('electron')
const fs = require('fs')

let mainWindow;
app.on('ready', ()=> {
    console.log('electron is ready 准备了 !!!')

    // 1. 创建窗口，加载index.html
    mainWindow = new BrowserWindow({
        webPreferences: {

            /*首次创建窗口先隐藏*/
            show: false,
            /*添加对渲染进程的node框架支持*/
            // TODO 把这关闭，设置html的Content-Security-Policy看看有没有用
            nodeIntegration: true,
            // 允许使用remote中模块
            enableRemoteModule: true,
            // TODO 中文乱码
            defaultEncoding: 'UTF-8',
        }
    });
    // TODO 这个loadFile路径很奇怪
    mainWindow.loadFile('app/index.html')
        .catch(err => {
        console.log('loadFile index.html fail', err)
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.webContents.openDevTools();
    })

    mainWindow.on('closed', () => {
        mainWindow = null;
    })

    const getFileFromUser = () => {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                {name: 'Text Files',extensions:['txt']},
                // TODO 不支持md格式的文件啊 为啥
                {name: 'Markdown Files',extensions:['md']},
            ]
        }).then(files => {
            // console.log(files)
            const filePaths = files.filePaths;
            if(files.filePaths.length === 0) {
                return
            };
            return filePaths
        }).then(openFile)
    }

    const openFile = (filePaths) => {
        const file = filePaths[0];
        let content = fs.readFileSync(file).toString();
        console.log(content);
        mainWindow.webContents.send('file-opened', [{file, content}]);
    }

    exports.getFileFromUser = getFileFromUser;
})


